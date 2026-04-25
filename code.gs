/** 
 * GOOGLE APPS SCRIPT BACKEND - POS SYSTEM (FINAL STABLE v5.2)
 */

const DB_SHEET_NAME = "DATABASE_JSON";

function setup() {
  getDatabase();
  const db = {
    settings: { storeName: "KasirKu" },
    users: [
      { id: "U1", username: "admin", password: "admin123", name: "Administrator", role: "admin", permissions: ["dashboard", "pos", "inventory", "history", "reports", "returns", "opname", "purchases", "customers", "suppliers", "users", "settings"] }
    ],
    products: [],
    sales: [],
    customers: [],
    suppliers: [],
    categories: ["Default"],
    purchases: [],
    stockHistory: []
  };
  saveDatabase(db);
  updateVisibleSheets(db);
}

function doGet(e) {
  const db = getDatabase();
  return ContentService.createTextOutput(JSON.stringify(db))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const { action, payload } = contents;
    let db = getDatabase();

    const keys = ['products', 'sales', 'customers', 'suppliers', 'stockHistory', 'categories', 'purchases', 'saleReturns', 'purchaseReturns', 'stockOpnames', 'cashFlow', 'shifts', 'activityLog', 'users'];
    keys.forEach(k => { if (!Array.isArray(db[k])) db[k] = []; });
    if (!db.settings) db.settings = {};

    // Auto-create default users if no users exist
    if (db.users.length === 0) {
      db.users.push({ id: "U1", username: "admin", password: "admin123", name: "Administrator", role: "admin", permissions: ["dashboard", "pos", "inventory", "history", "reports", "returns", "opname", "purchases", "customers", "suppliers", "users", "settings"] });
      db.users.push({ id: "U2", username: "kasir", password: "kasir123", name: "Kasir Toko", role: "kasir", permissions: ["pos", "history"] });
    }

    switch (action) {
      case 'LOGIN':
        const user = db.users.find(u => u.username === payload.username && u.password === payload.password);
        if (user) {
          return ContentService.createTextOutput(JSON.stringify({ 
            success: true, 
            user: { 
              id: user.id, username: user.username, role: user.role, name: user.name,
              shift: user.shift, permissions: user.permissions
            } 
          })).setMimeType(ContentService.MimeType.JSON);
        } else {
          return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Username atau password salah" }))
            .setMimeType(ContentService.MimeType.JSON);
        }

      case 'SYNC_ALL':
      case 'RESTORE_DATABASE':
        db = payload;
        break;
      
      case 'UPSERT_PRODUCT':
        const pIdx = db.products.findIndex(p => p.id === payload.id);
        if (pIdx > -1) db.products[pIdx] = payload;
        else db.products.push({ ...payload, id: payload.id || "P" + Date.now() });
        break;

      case 'CREATE_SALE':
        const sale = { ...payload, id: "TRX-" + Date.now(), date: new Date().toISOString() };
        db.sales.push(sale);
        (payload.items || []).forEach(item => {
          const p = db.products.find(x => x.id === item.id);
          if (p) p.stock -= item.quantity;
        });
        break;

      case 'CREATE_PURCHASE':
        const purchase = { ...payload, id: "PRCH-" + Date.now(), date: new Date().toISOString() };
        // Resolve Supplier Name for Sheet display
        const supp = db.suppliers.find(s => s.id === payload.supplierId);
        purchase.supplierName = supp ? supp.name : "Unknown";
        
        db.purchases.push(purchase);
        (payload.items || []).forEach(item => {
          const p = db.products.find(x => x.id === item.id);
          if (p) {
            p.stock += item.quantity;
            p.buyPrice = item.price;
          }
        });
        break;

      case 'UPDATE_SETTINGS':
        db.settings = { ...(db.settings || {}), ...payload };
        break;

      case 'UPSERT_CATEGORY':
        if (!db.categories.includes(payload.name)) {
          db.categories.push(payload.name);
        }
        break;
      
      case 'DELETE_CATEGORY':
        db.categories = db.categories.filter(c => c !== payload.name);
        break;

      case 'UPSERT_USER':
        const uIdx = db.users.findIndex(u => u.id === payload.id);
        if (uIdx > -1) db.users[uIdx] = payload;
        else db.users.push({ ...payload, id: payload.id || "U" + Date.now() });
        break;

      case 'DELETE_USER':
        db.users = db.users.filter(u => u.id !== payload.id);
        break;

      case 'IMPORT_PRODUCTS':
        if (Array.isArray(payload.products)) {
          payload.products.forEach(newProd => {
            const idx = db.products.findIndex(p => p.id === newProd.id || (newProd.sku && p.sku === newProd.sku));
            if (idx > -1) {
              db.products[idx] = { ...db.products[idx], ...newProd };
            } else {
              db.products.push({ ...newProd, id: newProd.id || "P" + Date.now() + Math.floor(Math.random() * 1000) });
            }
          });
        }
        break;

      case 'RESET_DATABASE':
        db.products = (db.products || []).map(p => {
          p.stock = 0;
          return p;
        });
        db.sales = [];
        db.purchases = [];
        db.stockHistory = [];
        db.saleReturns = [];
        db.purchaseReturns = [];
        db.stockOpnames = [];
        db.cashFlow = [];
        db.shifts = [];
        db.activityLog = [];
        break;

      default:
        if (action.startsWith('UPSERT_')) {
          const key = action.split('_')[1].toLowerCase() + 's';
          if (db[key]) {
            const idx = db[key].findIndex(i => i.id === payload.id);
            if (idx > -1) db[key][idx] = payload;
            else db[key].push({ ...payload, id: payload.id || Date.now() });
          }
        }
    }

    saveDatabase(db);
    updateVisibleSheets(db);

    return ContentService.createTextOutput(JSON.stringify({ success: true, data: db }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(DB_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(DB_SHEET_NAME);
    sheet.getRange(1, 1).setValue("{}");
  }
  const raw = sheet.getRange(1, 1).getValue();
  try {
    const data = JSON.parse(raw);
    return (data && typeof data === 'object') ? data : {};
  } catch (e) { return {}; }
}

function saveDatabase(db) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(DB_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(DB_SHEET_NAME);
  sheet.getRange(1, 1).setValue(JSON.stringify(db));
}

function updateVisibleSheets(db) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const clean = (val) => (val === null || val === undefined) ? "" : val;

  // 1. PRODUK
  const prodRows = (db.products || []).map(p => [
    clean(p.id), clean(p.sku), clean(p.name), clean(p.category), clean(p.stock), clean(p.sellPrice)
  ]);
  updateSheet(ss, "PRODUK", ["ID", "SKU", "NAMA", "KATEGORI", "STOK", "HARGA"], prodRows);

  // 2. PENJUALAN
  const saleRows = (db.sales || []).map(s => [
    clean(s.id), clean(s.date), clean(s.total), clean(s.paymentMethod), clean(s.customerName)
  ]);
  updateSheet(ss, "PENJUALAN", ["ID_TRX", "TANGGAL", "TOTAL", "METODE", "PELANGGAN"], saleRows);

  // 3. PEMBELIAN
  const purchaseRows = (db.purchases || []).map(s => [
    clean(s.id), clean(s.date), clean(s.total), clean(s.supplierName)
  ]);
  updateSheet(ss, "PEMBELIAN", ["ID", "TANGGAL", "TOTAL", "SUPPLIER"], purchaseRows);

  // 4. PELANGGAN
  const custRows = (db.customers || []).map(c => [
    clean(c.id), clean(c.name), clean(c.phone), clean(c.points)
  ]);
  updateSheet(ss, "PELANGGAN", ["ID", "NAMA", "TELP", "POIN"], custRows);

  // 5. SUPPLIER
  const suppRows = (db.suppliers || []).map(s => [
    clean(s.id), clean(s.name), clean(s.contact), clean(s.address)
  ]);
  updateSheet(ss, "SUPPLIER", ["ID", "NAMA", "KONTAK", "ALAMAT"], suppRows);

  // 6. USER
  const userRows = (db.users || []).map(u => [
    clean(u.id), clean(u.username), clean(u.name), clean(u.role), clean(u.shift)
  ]);
  updateSheet(ss, "USER", ["ID", "USERNAME", "NAMA", "ROLE", "SHIFT"], userRows);
}

function updateSheet(ss, name, headers, rows) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground("#e5e7eb");
  if (rows && rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  SpreadsheetApp.flush();
}
