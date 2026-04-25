import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'db.json');

// Initial Data
const initialDB = {
  settings: {
    storeName: "KasirKu Pro",
    address: "Jl. Teknologi No. 404, Jakarta",
    phone: "0812-3456-7890",
    currency: "IDR",
    taxRate: 11,
    dateFormat: "id-ID",
    minSpendForDiscount: 100000,
    autoDiscountValue: 5000,
    autoDiscountType: 'fixed',
    pointsPer1000: 1
  },
  users: [
    { id: "1", username: "admin", password: "admin123", role: "admin", name: "Administrator", permissions: ["dashboard", "pos", "inventory", "history", "reports", "returns", "opname", "purchases", "customers", "suppliers", "users", "settings"] },
    { id: "2", username: "kasir", password: "kasir123", role: "kasir", name: "Kasir Toko", permissions: ["pos", "history"] }
  ],
  products: [
    { id: "P001", sku: "899123456001", barcode: "899123456001", name: "Beras Premium 5kg", category: "Sembako", buyPrice: 65000, sellPrice: 75000, priceEcer: 75000, priceAgen: 72000, priceDistributor: 70000, stock: 50, minStock: 10, unit: "Pcs", supplierId: "S001" },
    { id: "P002", sku: "899123456002", barcode: "899123456002", name: "Minyak Goreng 2L", category: "Sembako", buyPrice: 28000, sellPrice: 32000, priceEcer: 32000, priceAgen: 31000, priceDistributor: 30000, stock: 40, minStock: 10, unit: "Pcs", supplierId: "S001" },
    { id: "P003", sku: "899123456003", barcode: "899123456003", name: "Gula Pasir 1kg", category: "Sembako", buyPrice: 14000, sellPrice: 16000, priceEcer: 16000, priceAgen: 15500, priceDistributor: 15000, stock: 100, minStock: 20, unit: "Pcs", supplierId: "S002" },
    { id: "P004", sku: "899123456004", barcode: "899123456004", name: "Telur Ayam 1kg", category: "Sembako", buyPrice: 24000, sellPrice: 28000, priceEcer: 28000, priceAgen: 27000, priceDistributor: 26000, stock: 30, minStock: 10, unit: "kg", supplierId: "S002" },
    { id: "P005", sku: "899123456005", barcode: "899123456005", name: "Susu UHT Full Cream", category: "Minuman", buyPrice: 15000, sellPrice: 18500, priceEcer: 18500, priceAgen: 17500, priceDistributor: 17000, stock: 60, minStock: 15, unit: "Pcs", supplierId: "S003" }
  ],
  categories: ["Sembako", "Minuman", "Kebutuhan Mandi", "Kebersihan", "Makanan"],
  suppliers: [
    { id: "S001", name: "PT. Distribusi Nasional", contact: "Andi", phone: "0811223344" },
    { id: "S002", name: "CV. Makmur Jaya", contact: "Budi", phone: "0812334455" },
    { id: "S003", name: "Agen Susu & Kopi", contact: "Citra", phone: "0813445566" }
  ],
  customers: [
    { id: "C001", name: "Pelanggan Umum", phone: "-", address: "-", level: "priceEcer", points: 0 },
    { id: "C002", name: "Rudi Hermawan", phone: "0855112233", address: "Kuningan, Jakarta", level: "priceAgen", points: 150 },
    { id: "C003", name: "Siti Aminah", phone: "0855223344", address: "Tebet, Jakarta", level: "priceDistributor", points: 420 }
  ],
  sales: [],
  purchases: [],
  saleReturns: [],
  purchaseReturns: [],
  stockOpnames: [],
  stockHistory: [],
  cashFlow: [],
  shifts: [],
  activityLog: []
};

// Database Helper
const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  // Migration for new collections
  if (!db.saleReturns) db.saleReturns = [];
  if (!db.purchaseReturns) db.purchaseReturns = [];
  if (!db.stockOpnames) db.stockOpnames = [];
  if (!db.settings.pointsPer1000) db.settings.pointsPer1000 = 1;
  return db;
};

const writeDB = (data: any) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints
  app.get('/api/data', (req, res) => {
    res.json(readDB());
  });

  app.post('/api/action', (req, res) => {
    const { action, payload } = req.body;
    const db = readDB();

    switch (action) {
      case 'LOGIN':
        const user = db.users.find((u: any) => u.username === payload.username && u.password === payload.password);
        if (user) {
          res.json({ 
            success: true, 
            user: { 
              id: user.id, 
              username: user.username, 
              role: user.role, 
              name: user.name,
              shift: user.shift,
              permissions: user.permissions
            } 
          });
        } else {
          res.status(401).json({ success: false, message: "Username atau password salah" });
        }
        return;

      case 'UPSERT_PRODUCT':
        const prodIndex = db.products.findIndex((p: any) => p.id === payload.id);
        if (prodIndex > -1) {
          db.products[prodIndex] = { ...db.products[prodIndex], ...payload };
        } else {
          db.products.push({ ...payload, id: payload.id || `P${Date.now()}` });
        }
        break;

      case 'DELETE_PRODUCT':
        db.products = db.products.filter((p: any) => p.id !== payload.id);
        break;

      case 'IMPORT_PRODUCTS':
        if (Array.isArray(payload.products)) {
          payload.products.forEach((newProd: any) => {
            const idx = db.products.findIndex((p: any) => p.id === newProd.id || (newProd.sku && p.sku === newProd.sku));
            if (idx > -1) {
              db.products[idx] = { ...db.products[idx], ...newProd };
            } else {
              db.products.push({ ...newProd, id: newProd.id || `P${Date.now()}-${Math.random().toString(36).substr(2, 5)}` });
            }
          });
        }
        break;

      case 'CREATE_SALE':
        const sale = {
          ...payload,
          id: `TRX-${Date.now()}`,
          date: new Date().toISOString()
        };
        db.sales.push(sale);
        
        // Update Stock and History
        payload.items.forEach((item: any) => {
          const pIndex = db.products.findIndex((p: any) => p.id === item.id);
          if (pIndex > -1) {
            db.products[pIndex].stock -= item.quantity;
            db.stockHistory.push({
              id: `SH-${Date.now()}-${item.id}`,
              productId: item.id,
              type: 'SALE',
              change: -item.quantity,
              balanceAfter: db.products[pIndex].stock,
              referenceId: sale.id,
              date: new Date().toISOString()
            });
          }
        });

        // Update Customer Points
        if (sale.customerId && sale.customerId !== 'C001') {
          const cIndex = db.customers.findIndex((c: any) => c.id === sale.customerId);
          if (cIndex > -1) {
            const pointsEarned = Math.floor(sale.total / 1000) * (db.settings.pointsPer1000 || 1);
            db.customers[cIndex].points = (db.customers[cIndex].points || 0) + pointsEarned;
          }
        }

        // Add to Cash Flow
        db.cashFlow.push({
          id: `CF-${Date.now()}`,
          type: 'IN',
          amount: sale.total,
          category: 'Sales',
          reference: sale.id,
          date: new Date().toISOString()
        });
        break;

      case 'CREATE_SALE_RETURN':
        const saleReturn = {
          ...payload,
          id: `SR-${Date.now()}`,
          date: new Date().toISOString()
        };
        db.saleReturns.push(saleReturn);

        // Restore Stock
        payload.items.forEach((item: any) => {
          const pIndex = db.products.findIndex((p: any) => p.id === item.id);
          if (pIndex > -1) {
            db.products[pIndex].stock += item.quantity;
            db.stockHistory.push({
              id: `SH-${Date.now()}-${item.id}`,
              productId: item.id,
              type: 'SALE_RETURN',
              change: item.quantity,
              balanceAfter: db.products[pIndex].stock,
              referenceId: saleReturn.id,
              date: new Date().toISOString()
            });
          }
        });

        // Deduct points if applicable
        const originalSale = db.sales.find((s: any) => s.id === payload.saleId);
        if (originalSale && originalSale.customerId !== 'C001') {
          const cIndex = db.customers.findIndex((c: any) => c.id === originalSale.customerId);
          if (cIndex > -1) {
            const pointsDeducted = Math.floor(saleReturn.total / 1000) * (db.settings.pointsPer1000 || 1);
            db.customers[cIndex].points = Math.max(0, (db.customers[cIndex].points || 0) - pointsDeducted);
          }
        }

        // Cash Flow Out
        db.cashFlow.push({
          id: `CF-${Date.now()}`,
          type: 'OUT',
          amount: saleReturn.total,
          category: 'Sale Return',
          reference: saleReturn.id,
          date: new Date().toISOString()
        });
        break;

      case 'CREATE_PURCHASE':
        const purchase = {
          ...payload,
          id: `PUR-${Date.now()}`,
          date: new Date().toISOString()
        };
        // Resolve Supplier Name
        const suppObj = db.suppliers.find((s: any) => s.id === payload.supplierId);
        purchase.supplierName = suppObj ? suppObj.name : "Unknown";
        
        db.purchases.push(purchase);

        // Update Stock
        payload.items.forEach((item: any) => {
          const pIndex = db.products.findIndex((p: any) => p.id === item.id);
          if (pIndex > -1) {
            db.products[pIndex].stock += item.quantity;
            db.products[pIndex].buyPrice = item.price; // Update last buy price
            db.stockHistory.push({
              id: `SH-${Date.now()}-${item.id}`,
              productId: item.id,
              type: 'PURCHASE',
              change: item.quantity,
              balanceAfter: db.products[pIndex].stock,
              referenceId: purchase.id,
              date: new Date().toISOString()
            });
          }
        });

        // Add to Cash Flow
        db.cashFlow.push({
          id: `CF-${Date.now()}`,
          type: 'OUT',
          amount: purchase.total,
          category: 'Purchase',
          reference: purchase.id,
          date: new Date().toISOString()
        });
        break;

      case 'CREATE_PURCHASE_RETURN':
        const purchaseReturn = {
          ...payload,
          id: `PR-${Date.now()}`,
          date: new Date().toISOString()
        };
        db.purchaseReturns.push(purchaseReturn);

        // Deduct Stock
        payload.items.forEach((item: any) => {
          const pIndex = db.products.findIndex((p: any) => p.id === item.id);
          if (pIndex > -1) {
            db.products[pIndex].stock -= item.quantity;
            db.stockHistory.push({
              id: `SH-${Date.now()}-${item.id}`,
              productId: item.id,
              type: 'PURCHASE_RETURN',
              change: -item.quantity,
              balanceAfter: db.products[pIndex].stock,
              referenceId: purchaseReturn.id,
              date: new Date().toISOString()
            });
          }
        });

        // Cash Flow In
        db.cashFlow.push({
          id: `CF-${Date.now()}`,
          type: 'IN',
          amount: purchaseReturn.total,
          category: 'Purchase Return',
          reference: purchaseReturn.id,
          date: new Date().toISOString()
        });
        break;

      case 'CREATE_STOCK_OPNAME':
        const opname = {
          ...payload,
          id: `SO-${Date.now()}`,
          date: new Date().toISOString()
        };
        db.stockOpnames.push(opname);

        // Update Stock
        const pIdx = db.products.findIndex((p: any) => p.id === opname.productId);
        if (pIdx > -1) {
          db.products[pIdx].stock = opname.actualStock;
          db.stockHistory.push({
            id: `SH-${Date.now()}-${opname.productId}`,
            productId: opname.productId,
            type: 'OPNAME',
            change: opname.difference,
            balanceAfter: opname.actualStock,
            referenceId: opname.id,
            date: new Date().toISOString(),
            notes: opname.notes
          });
        }
        break;

      case 'UPSERT_SUPPLIER':
        const supIndex = db.suppliers.findIndex((s: any) => s.id === payload.id);
        if (supIndex > -1) db.suppliers[supIndex] = payload;
        else db.suppliers.push({ ...payload, id: payload.id || `S${Date.now()}` });
        break;

      case 'UPSERT_CUSTOMER':
        const custIndex = db.customers.findIndex((c: any) => c.id === payload.id);
        if (custIndex > -1) db.customers[custIndex] = payload;
        else db.customers.push({ ...payload, id: payload.id || `C${Date.now()}` });
        break;

      case 'UPDATE_SETTINGS':
        db.settings = { ...db.settings, ...payload };
        break;

      case 'UPSERT_USER':
        const userIdx = db.users.findIndex((u: any) => u.id === payload.id);
        if (userIdx > -1) db.users[userIdx] = payload;
        else db.users.push({ ...payload, id: payload.id || `U${Date.now()}` });
        break;

      case 'DELETE_USER':
        db.users = db.users.filter((u: any) => u.id !== payload.id);
        break;

      case 'SYNC_ALL':
      case 'RESTORE_DATABASE':
        // Overwrite the entire DB with the provided payload
        writeDB(payload);
        res.json({ success: true, data: payload });
        return;

      case 'RESET_DATABASE':
        // Reset stocks to 0 for all products
        db.products = (db.products || []).map((p: any) => ({ ...p, stock: 0 }));
        
        // Clear all transaction and log data
        db.sales = [];
        db.purchases = [];
        db.saleReturns = [];
        db.purchaseReturns = [];
        db.stockOpnames = [];
        db.stockHistory = [];
        db.cashFlow = [];
        db.shifts = [];
        db.activityLog = [];
        
        writeDB(db);
        res.json({ success: true, data: db });
        return;

      default:
        res.status(400).json({ success: false, message: "Action not recognized" });
        return;
    }

    writeDB(db);
    res.json({ success: true, data: db });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KasirKu Server running on http://localhost:${PORT}`);
  });
}

startServer();
