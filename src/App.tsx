import React, { useState, useEffect, useMemo } from 'react';
import { 
  User as UserIcon,
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  History, 
  Settings as SettingsIcon, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  Plus,
  Search,
  ShoppingCart as CartIcon,
  Trash2,
  Printer,
  ChevronDown,
  TrendingUp,
  CreditCard,
  Truck,
  UserPlus,
  Download,
  Upload,
  Cloud,
  BarChart3,
  TrendingDown,
  Tag,
  Barcode,
  X,
  Menu,
  CheckCircle,
  Bluetooth,
  Laptop,
  Grid,
  List,
  RotateCcw,
  ShoppingBag,
  BookOpen,
  Database as DbIcon,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import { Database, User, Product, Sale, Purchase, Settings, Customer, Supplier } from './types';

// Utils
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
};

const exportToXLSX = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const finalData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(finalData, `${fileName}.xlsx`);
};

const exportToCSV = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const finalData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(finalData, `${fileName}.csv`);
};

const exportToPDF = (headers: string[], data: any[][], fileName: string, title: string) => {
  const doc = new jsPDF();
  doc.text(title, 14, 15);
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 20,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [99, 102, 241] }
  });
  doc.save(`${fileName}.pdf`);
};

const exportToDoc = async (headers: string[], rows: string[][], fileName: string, title: string) => {
  const table = new Table({
    rows: [
      new TableRow({
        children: headers.map(h => new TableCell({
          children: [new Paragraph({ 
            children: [new TextRun({ text: h, bold: true })]
          })],
          shading: { fill: "6366f1" }
        }))
      }),
      ...rows.map(row => new TableRow({
        children: row.map(cell => new TableCell({
          children: [new Paragraph({ text: cell })]
        }))
      }))
    ],
    width: { size: 100, type: WidthType.PERCENTAGE }
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: title,
          heading: "Title",
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({ text: "" }),
        table
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileName}.docx`);
};

const ExportButtons = ({ 
  data, 
  fileName, 
  title, 
  headers, 
  pdfRows 
}: { 
  data: any[], 
  fileName: string, 
  title: string, 
  headers: string[], 
  pdfRows?: any[][] 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:border-indigo-500 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all"
      >
        <Download size={16} className="text-indigo-400" /> Ekspor Data
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[100] overflow-hidden">
          <button 
            onClick={() => { exportToXLSX(data, fileName); setIsOpen(false); }}
            className="w-full px-4 py-3 text-left text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-indigo-400 transition-colors flex items-center gap-2 border-b border-slate-800"
          >
            <Download size={14} /> Excel (.xlsx)
          </button>
          <button 
            onClick={() => { exportToCSV(data, fileName); setIsOpen(false); }}
            className="w-full px-4 py-3 text-left text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-indigo-400 transition-colors flex items-center gap-2 border-b border-slate-800"
          >
            <Download size={14} /> CSV (.csv)
          </button>
          <button 
            onClick={() => { 
              if (pdfRows) exportToPDF(headers, pdfRows, fileName, title);
              setIsOpen(false); 
            }}
            className="w-full px-4 py-3 text-left text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-indigo-400 transition-colors flex items-center gap-2 border-b border-slate-800"
          >
            <Download size={14} /> PDF (.pdf)
          </button>
          <button 
            onClick={() => { 
              if (pdfRows) exportToDoc(headers, pdfRows, fileName, title);
              setIsOpen(false); 
            }}
            className="w-full px-4 py-3 text-left text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-indigo-400 transition-colors flex items-center gap-2"
          >
            <Download size={14} /> Word (.docx)
          </button>
        </div>
      )}
    </div>
  );
};

// Components
const Toast = ({ message, type }: { message: string, type: 'success' | 'error' }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className={cn(
      "fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 font-medium border",
      type === 'success' ? "bg-emerald-600/90 border-emerald-500 text-white" : "bg-rose-600/90 border-rose-500 text-white"
    )}
  >
    {message}
  </motion.div>
);

const Navbar = ({ storeName, user, onLogout, activeShift, onToggleMobileMenu }: { storeName: string, user: User, onLogout: () => void, activeShift: any, onToggleMobileMenu?: () => void }) => (
  <header className="h-14 md:h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
    <div className="flex items-center gap-3">
      {onToggleMobileMenu && (
        <button 
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
      )}
      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
        <ShoppingCart className="text-white w-5 h-5" />
      </div>
      <h1 className="font-bold text-lg md:text-xl tracking-tight text-white">{storeName}</h1>
    </div>
    <div className="flex items-center gap-4">
      {activeShift && (
        <div className="hidden lg:flex flex-col items-end mr-2">
          <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">{activeShift.name}</p>
          <p className="text-[9px] text-slate-500 font-mono">Modal: {formatIDR(activeShift.initialBalance)}</p>
        </div>
      )}
      <div className="text-right hidden sm:block">
        <p className="text-sm font-semibold text-white leading-none">{user.name}</p>
        <p className="text-xs text-slate-400 capitalize">{user.role}</p>
      </div>
      <button 
        onClick={onLogout}
        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
      >
        <LogOut size={20} />
      </button>
    </div>
  </header>
);

const SidebarItem = ({ icon: Icon, label, active, collapsed, onClick }: { icon: any, label: string, active: boolean, collapsed: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : ""}
    className={cn(
      "w-full flex items-center justify-center lg:justify-start gap-3 rounded-xl transition-all duration-300 group relative",
      collapsed ? "px-0 py-3 h-12" : "px-4 py-3",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
        : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
    )}
  >
    <div className={cn("flex items-center justify-center shrink-0", collapsed ? "w-full" : "")}>
      <Icon size={20} className={cn("transition-transform duration-200", active ? "scale-110" : "group-hover:scale-110")} />
    </div>
    {!collapsed && <span className="font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300">{label}</span>}
    {active && !collapsed && (
      <motion.div 
        layoutId="sidebar-active"
        className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
      />
    )}
  </button>
);

// Constants
const INITIAL_DATABASE: Database = {
  settings: {
    storeName: "KasirKu POS",
    address: "Jl. Contoh No. 123, Kota",
    phone: "08123456789",
    currency: "IDR",
    taxRate: 0,
    dateFormat: "dd/MM/yyyy",
    minSpendForDiscount: 100000,
    autoDiscountValue: 0,
    autoDiscountType: "fixed",
    pointsPer1000: 1
  },
  users: [
    { id: "U1", username: "admin", password: "admin123", name: "Administrator", role: "admin", permissions: ["dashboard", "pos", "inventory", "history", "reports", "returns", "opname", "purchases", "customers", "suppliers", "users", "settings"] },
    { id: "U2", username: "kasir", password: "kasir123", name: "Kasir Toko", role: "kasir", permissions: ["pos", "history"] }
  ],
  products: [],
  categories: ["Default"],
  suppliers: [],
  customers: [
    { id: "C001", name: "Umum", phone: "-", address: "-", level: "priceEcer", points: 0 }
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

// Helper to ensure DB validity
const sanitizeDb = (data: any): Database => {
  const base = { ...INITIAL_DATABASE };
  if (!data || typeof data !== 'object') {
    console.warn('sanitizeDb: data is not an object, returning INITIAL_DATABASE');
    return base;
  }

  const result = { ...base, ...data };
  
  // Ensure all arrays are strictly arrays
  const arrayKeys = [
    'users', 'products', 'categories', 'suppliers', 'customers', 'sales', 
    'purchases', 'saleReturns', 'purchaseReturns', 'stockOpnames', 
    'stockHistory', 'cashFlow', 'shifts', 'activityLog'
  ];

  arrayKeys.forEach((key) => {
    if (!Array.isArray(result[key as keyof Database])) {
      (result as any)[key] = [];
    }
  });

  // Ensure users exists and has at least one admin
  if (result.users.length === 0) {
    result.users = [...INITIAL_DATABASE.users];
  }

  // Ensure customers exists and has at least one default customer
  if (result.customers.length === 0) {
    result.customers = [...INITIAL_DATABASE.customers];
  } else if (!result.customers.find((c: any) => c.id === 'C001')) {
    result.customers = [INITIAL_DATABASE.customers[0], ...result.customers];
  }

  // Category must at least have "Default" if empty
  if (result.categories.length === 0) {
    result.categories = ["Default"];
  }

  // Ensure settings exists
  result.settings = { ...base.settings, ...(data.settings || {}) };
  
  return result;
};

// Default Google Apps Script URL (Tanam di kode)
const DEFAULT_BACKEND_URL = 'https://script.google.com/macros/s/AKfycbwqkQntauGz-Ry6P-YjVGHA6Qp0gJYy7oNmW05XSMRJPH-XNv_Xqf4UhNH5gKIqrcw/exec'; // Anda bisa mengisi URL default di sini jika sudah ada

// Main Layout
export default function App() {
  const [db, setDb] = useState<Database>(INITIAL_DATABASE);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeShift, setActiveShift] = useState<{ id: string, name: string, startTime: string, initialBalance: number } | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // States for POS
  const [cart, setCart] = useState<{ productId: string, product: Product, quantity: number, price: number }[]>([]);
  const [posSearch, setPosSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('C001');

  // Initialization
  useEffect(() => {
    fetchSystemData();
    const savedUser = localStorage.getItem('pos_user');
    if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
        localStorage.removeItem('pos_user');
      }
    }

    // PWA Install Prompt Listener
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      showToast("Aplikasi berhasil diinstal!", "success");
    });
  }, []);

  const fetchSystemData = async () => {
    try {
      const savedGasUrl = (localStorage.getItem('gas_url') || '').trim();
      const url = (!savedGasUrl || savedGasUrl === "undefined" || savedGasUrl === "null") 
        ? (DEFAULT_BACKEND_URL || '/api/data') 
        : savedGasUrl;
      const res = await fetch(url);
      
      if (!res.ok) {
        if (res.status === 404 && (window.location.hostname.includes('netlify') || window.location.hostname.includes('vercel'))) {
          throw new Error(`Status 404: Backend tidak ditemukan. Pastikan anda sudah memasang 'Google Apps Script URL' di menu Pengaturan.`);
        }
        throw new Error(`HTTP ${res.status}`);
      }
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        throw new Error("Backend tidak ditemukan atau sedang offline (Mengirim HTML).");
      }
      
      const data = await res.json();
      setDb(sanitizeDb(data));
    } catch (err: any) {
      console.error(err);
      showToast(`Gagal memuat data: ${err.message || 'Koneksi terputus'}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (action: string, payload: any) => {
    // PRE-FETCH: Handle settings update locally first to avoid 404 blocking GAS setup
    if (action === 'UPDATE_SETTINGS' && payload.gasUrl !== undefined) {
      const trimmedUrl = (payload.gasUrl || '').trim();
      if (trimmedUrl) localStorage.setItem('gas_url', trimmedUrl);
      else localStorage.removeItem('gas_url');
      
      // If we are on static host and update GAS URL, just refresh data and return
      if (window.location.hostname.includes('netlify') || window.location.hostname.includes('vercel')) {
        showToast("URL Backend tersimpan lokal. Memuat data...", "success");
        setTimeout(() => fetchSystemData(), 500);
        // We still try to send to GAS if it's already set, but don't block on error
      }
    }

    try {
      const savedGasUrl = (localStorage.getItem('gas_url') || '').trim();
      const url = (!savedGasUrl || savedGasUrl === "undefined" || savedGasUrl === "null") 
        ? (DEFAULT_BACKEND_URL || '/api/action') 
        : savedGasUrl;
      const isGas = url.includes('script.google.com');
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': isGas ? 'text/plain' : 'application/json' 
        },
        body: JSON.stringify({ action, payload })
      });
      
      if (!res.ok) {
        if (res.status === 404 && (window.location.hostname.includes('netlify') || window.location.hostname.includes('vercel'))) {
          // If it was UPDATE_SETTINGS, we already saved it locally, so don't throw
          if (action === 'UPDATE_SETTINGS') return true;
          throw new Error("Backend 404. Silakan cek URL Google Apps Script anda di Pengaturan.");
        }
        throw new Error(`Status Server: ${res.status}`);
      }
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        throw new Error("Backend tidak ditemukan atau sedang offline (Mengirim HTML).");
      }
      
      const result = await res.json();
      console.log('Action Response:', result);
      
      // Handle different response formats (Internal API vs GAS)
      if (result.success || result.status === "success" || (result.data && !result.message)) {
        const dbData = result.data || result;
        
        if (action === 'LOGIN') {
          if (result.user) {
            setCurrentUser(result.user);
            localStorage.setItem('pos_user', JSON.stringify(result.user));
            return true;
          } else {
            showToast("User data tidak ditemukan", "error");
            return false;
          }
        }

        if (action === 'UPDATE_SETTINGS' && payload.gasUrl !== undefined) {
          if (payload.gasUrl) localStorage.setItem('gas_url', payload.gasUrl.trim());
          else localStorage.removeItem('gas_url');
        }

        const sanitized = sanitizeDb(dbData);
        setDb(sanitized);
        return true;
      } else {
        showToast(result.message || "Gagal memproses data", "error");
        return false;
      }
    } catch (err: any) {
      console.error('Action error:', err);
      showToast(`Error: ${err.message || 'Cek URL Backend/Koneksi'}`, "error");
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveShift(null);
    localStorage.removeItem('pos_user');
    localStorage.removeItem('active_shift');
    setActiveTab('dashboard');
  };

  useEffect(() => {
    const savedShift = localStorage.getItem('active_shift');
    if (savedShift) {
      setActiveShift(JSON.parse(savedShift));
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">Menghubungkan ke sistem...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <LoginPage onLogin={(u, p) => handleAction('LOGIN', { username: u, password: p })} />
        
        {(window.location.hostname.includes('netlify') || window.location.hostname.includes('vercel')) && (
          <div className="mt-8 text-center p-4 bg-slate-900/50 border border-slate-800 rounded-xl max-w-sm">
            <p className="text-[10px] text-slate-500 mb-2 uppercase font-bold tracking-wider">Metode Backend: {localStorage.getItem('gas_url') ? 'GAS Aktif' : 'Default (Netlify/Vercel)'}</p>
            <button 
              onClick={() => {
                const url = prompt("Masukkan Google Apps Script URL (https://script.google.com/macros/s/.../exec):", localStorage.getItem('gas_url') || '');
                if (url !== null) {
                  if (url.trim()) localStorage.setItem('gas_url', url.trim());
                  else localStorage.removeItem('gas_url');
                  window.location.reload();
                }
              }}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
            >
              Atur Google Apps Script URL
            </button>
            <p className="text-[9px] text-slate-600 mt-2">Gunakan tombol ini jika Anda mendapat error 404 saat login di Netlify.</p>
          </div>
        )}
      </div>
    );
  }

  if (!activeShift && currentUser.role === 'kasir') {
    return (
      <ShiftStartPage 
        onStart={(name, modal) => {
          const shiftData = {
            id: "SHFT-" + Date.now(),
            name,
            startTime: new Date().toISOString(),
            status: "open",
            userId: currentUser.id,
            userName: currentUser.name,
            initialBalance: modal,
            totalSales: 0,
            cashBalance: modal
          };
          setActiveShift(shiftData);
          localStorage.setItem('active_shift', JSON.stringify(shiftData));
          handleAction('UPSERT_SHIFT', shiftData);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden relative">
      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[60] w-[95%] max-w-md">
          <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-white/20 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <ShoppingCart size={24} />
              </div>
              <div>
                <p className="font-bold text-sm">Instal KasirKu POS</p>
                <p className="text-xs text-indigo-100">Akses lebih cepat & offline</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleInstallClick}
                className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Instal
              </button>
              <button 
                onClick={() => setShowInstallBanner(false)}
                className="p-1 hover:bg-white/10 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-900 border-r border-slate-800 flex flex-col gap-6 h-screen transition-all duration-300 z-[60] shrink-0",
        // Mobile behavior: slides in from left
        "fixed md:sticky top-0 left-0 pt-14 md:pt-4",
        isMobileMenuOpen 
          ? "w-64 translate-x-0 shadow-2xl" 
          : "-translate-x-full md:translate-x-0",
        // Desktop behavior: width depends on collapse state
        "md:flex",
        isMobileMenuOpen || !activeTab ? "w-64 p-4" : "w-16 lg:w-20 p-2 lg:p-4"
      )}>
        <div className={cn("hidden md:flex items-center gap-3 px-2 overflow-hidden", activeTab ? "justify-center px-0" : "")}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <ShoppingCart className="text-white w-6 h-6" />
          </div>
          {!activeTab && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-bold text-white leading-tight">KasirKu</h2>
              <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">POS Professional</p>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-2 md:px-0 pr-1 pb-24 md:pb-4 scrollbar-none">
          {(!currentUser.permissions || currentUser.permissions.includes('dashboard')) && (
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              collapsed={!!activeTab && !isMobileMenuOpen} 
              onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} 
            />
          )}
          {(!currentUser.permissions || currentUser.permissions.includes('pos')) && (
            <SidebarItem 
              icon={CartIcon} 
              label="Kasir (POS)" 
              active={activeTab === 'pos'} 
              collapsed={!!activeTab && !isMobileMenuOpen} 
              onClick={() => { setActiveTab('pos'); setIsMobileMenuOpen(false); }} 
            />
          )}
          {(!currentUser.permissions || currentUser.permissions.includes('inventory')) && (
            <SidebarItem 
              icon={Package} 
              label="Inventori" 
              active={activeTab === 'inventory'} 
              collapsed={!!activeTab && !isMobileMenuOpen} 
              onClick={() => { setActiveTab('inventory'); setIsMobileMenuOpen(false); }} 
            />
          )}
          {(!currentUser.permissions || currentUser.permissions.includes('history')) && (
            <SidebarItem 
              icon={History} 
              label="Riwayat" 
              active={activeTab === 'history'} 
              collapsed={!!activeTab && !isMobileMenuOpen} 
              onClick={() => { setActiveTab('history'); setIsMobileMenuOpen(false); }} 
            />
          )}
          
          {/* Removing hardcoded kasir restriction to respect admin permissions */}
          {(!currentUser.permissions || currentUser.permissions.includes('reports')) && (
            <SidebarItem 
              icon={BarChart3} 
              label="Laporan & Laba" 
              active={activeTab === 'reports'} 
              collapsed={!!activeTab && !isMobileMenuOpen} 
              onClick={() => { setActiveTab('reports'); setIsMobileMenuOpen(false); }} 
            />
          )}
              {(!currentUser.permissions || currentUser.permissions.includes('returns')) && (
                <SidebarItem 
                  icon={RotateCcw} 
                  label="Retur" 
                  active={activeTab === 'returns'} 
                  collapsed={!!activeTab && !isMobileMenuOpen} 
                  onClick={() => { setActiveTab('returns'); setIsMobileMenuOpen(false); }} 
                />
              )}
              {(!currentUser.permissions || currentUser.permissions.includes('opname')) && (
                <SidebarItem 
                  icon={Laptop} 
                  label="Stok Opname" 
                  active={activeTab === 'opname'} 
                  collapsed={!!activeTab && !isMobileMenuOpen} 
                  onClick={() => { setActiveTab('opname'); setIsMobileMenuOpen(false); }} 
                />
              )}
              {(!currentUser.permissions || currentUser.permissions.includes('stock-card')) && (
                <SidebarItem 
                  icon={List} 
                  label="Kartu Stok" 
                  active={activeTab === 'stock-card'} 
                  collapsed={!!activeTab && !isMobileMenuOpen} 
                  onClick={() => { setActiveTab('stock-card'); setIsMobileMenuOpen(false); }} 
                />
              )}
              {(!currentUser.permissions || currentUser.permissions.includes('purchases')) && (
                <SidebarItem 
                  icon={Truck} 
                  label="Pembelian" 
                  active={activeTab === 'purchases'} 
                  collapsed={!!activeTab && !isMobileMenuOpen} 
                  onClick={() => { setActiveTab('purchases'); setIsMobileMenuOpen(false); }} 
                />
              )}
              {(!currentUser.permissions || currentUser.permissions.includes('customers')) && (
                <SidebarItem 
                  icon={Users} 
                  label="Pelanggan" 
                  active={activeTab === 'customers'} 
                  collapsed={!!activeTab && !isMobileMenuOpen} 
                  onClick={() => { setActiveTab('customers'); setIsMobileMenuOpen(false); }} 
                />
              )}
              {(!currentUser.permissions || currentUser.permissions.includes('suppliers')) && (
                <SidebarItem 
                  icon={Truck} 
                  label="Supplier" 
                  active={activeTab === 'suppliers'} 
                  collapsed={!!activeTab && !isMobileMenuOpen} 
                  onClick={() => { setActiveTab('suppliers'); setIsMobileMenuOpen(false); }} 
                />
              )}
              {(currentUser.role === 'admin' || currentUser.role === 'owner') && (!currentUser.permissions || currentUser.permissions.includes('users')) && (
                <SidebarItem 
                  icon={UserPlus} 
                  label="Manajemen User" 
                  active={activeTab === 'users'} 
                  collapsed={!!activeTab && !isMobileMenuOpen} 
                  onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }} 
                />
              )}
          {(!currentUser.permissions || currentUser.permissions.includes('backup')) && (
            <SidebarItem 
              icon={Download} 
              label="Backup & Data" 
              active={activeTab === 'backup'} 
              collapsed={!!activeTab && !isMobileMenuOpen} 
              onClick={() => { setActiveTab('backup'); setIsMobileMenuOpen(false); }} 
            />
          )}
          
          <div className="mt-auto pt-4 border-t border-slate-800">
            {(!currentUser.permissions || currentUser.permissions.includes('settings')) && (
              <SidebarItem 
                icon={SettingsIcon} 
                label="Pengaturan" 
                active={activeTab === 'settings'} 
                collapsed={!!activeTab && !isMobileMenuOpen} 
                onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} 
              />
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-950 h-screen flex flex-col overflow-hidden">
        <Navbar 
          storeName={db.settings?.storeName || "KasirKu"} 
          user={currentUser} 
          onLogout={handleLogout} 
          activeShift={activeShift} 
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <div className={cn("p-2 sm:p-4 md:p-6 mx-auto w-full flex-1 pb-20 md:pb-0", activeTab === 'pos' ? "max-w-none h-full flex flex-col overflow-hidden" : "max-w-7xl overflow-y-auto overflow-x-hidden")}>
          {activeTab === 'dashboard' && <DashboardPage db={db} />}
          {activeTab === 'pos' && currentUser && (
            <POSPage 
              db={db} 
              user={currentUser}
              cart={cart} 
              setCart={setCart} 
              onSaveSale={(sale) => {
                handleAction('CREATE_SALE', { ...sale, shiftId: activeShift?.id });
                showToast("Transaksi Berhasil!", "success");
                setCart([]);
                setSelectedCustomerId('C001');
              }}
              selectedCustomerId={selectedCustomerId}
              setSelectedCustomerId={setSelectedCustomerId}
            />
          )}
          {activeTab === 'inventory' && (
            <InventoryPage 
              db={db} 
              onUpsert={(p) => handleAction('UPSERT_PRODUCT', p)}
              onDelete={(id) => handleAction('DELETE_PRODUCT', { id })}
              onAction={handleAction}
            />
          )}
          {activeTab === 'history' && <HistoryPage db={db} />}
          {activeTab === 'reports' && <ReportsPage db={db} />}
          {activeTab === 'returns' && (
            <ReturnsPage 
              db={db} 
              onSaleReturn={(payload) => handleAction('CREATE_SALE_RETURN', payload)}
              onPurchaseReturn={(payload) => handleAction('CREATE_PURCHASE_RETURN', payload)}
            />
          )}
          {activeTab === 'opname' && (
            <StockOpnamePage 
              db={db} 
              onSave={(payload) => handleAction('CREATE_STOCK_OPNAME', payload)}
            />
          )}
          {activeTab === 'stock-card' && (
            <StockCardPage db={db} />
          )}
          {activeTab === 'purchases' && (
             <PurchasePage 
              db={db} 
              onSavePurchase={(p) => {
                handleAction('CREATE_PURCHASE', p);
                showToast("Pembelian Berhasil!", "success");
              }}
            />
          )}
          {activeTab === 'suppliers' && (
            <SupplierPage 
              db={db} 
              onUpsert={(s) => handleAction('UPSERT_SUPPLIER', s)}
              onDelete={(id) => handleAction('DELETE_SUPPLIER', { id })}
            />
          )}
          {activeTab === 'customers' && (
            <CustomerPage 
              db={db} 
              onUpsert={(c) => handleAction('UPSERT_CUSTOMER', c)}
            />
          )}
          {activeTab === 'users' && (
            <UsersPage 
              db={db}
              onUpsert={(u) => handleAction('UPSERT_USER', u)}
              onDelete={(id) => handleAction('DELETE_USER', { id })}
            />
          )}
          {activeTab === 'backup' && (
            <BackupPage 
              db={db} 
              onRestore={(data) => handleAction('RESTORE_DATABASE', data)}
              onReset={() => handleAction('RESET_DATABASE', {})}
              onAction={handleAction}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsPage 
              db={db} 
              setActiveTab={setActiveTab}
              onUpdate={(s) => handleAction('UPDATE_SETTINGS', s)}
              onRestore={(data) => handleAction('RESTORE_DATABASE', data)}
              onReset={() => handleAction('RESET_DATABASE', {})}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-1 left-2 right-2 h-16 bg-slate-900/90 backdrop-blur-xl border border-slate-800 flex items-center justify-around z-50 px-2 rounded-2xl shadow-2xl overflow-hidden mb-safe">
        {(!currentUser.permissions || currentUser.permissions.includes('pos')) && (
          <button 
            onClick={() => setActiveTab('pos')} 
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-200 flex-1 h-full relative",
              activeTab === 'pos' ? "text-indigo-400" : "text-slate-500"
            )}
          >
            <CartIcon size={22} className={cn("transition-transform", activeTab === 'pos' && "scale-110")} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Kasir POS</span>
            {activeTab === 'pos' && (
              <motion.div layoutId="nav-indicator" className="absolute -bottom-1 w-1 h-1 bg-indigo-500 rounded-full" />
            )}
          </button>
        )}
        
        {(!currentUser.permissions || currentUser.permissions.includes('returns')) && (
          <button 
            onClick={() => setActiveTab('returns')} 
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-200 flex-1 h-full relative",
              activeTab === 'returns' ? "text-indigo-400" : "text-slate-500"
            )}
          >
            <RotateCcw size={22} className={cn("transition-transform", activeTab === 'returns' && "scale-110")} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Retur</span>
            {activeTab === 'returns' && (
              <motion.div layoutId="nav-indicator" className="absolute -bottom-1 w-1 h-1 bg-indigo-500 rounded-full" />
            )}
          </button>
        )}

        {(!currentUser.permissions || currentUser.permissions.includes('purchases')) && (
          <button 
            onClick={() => setActiveTab('purchases')} 
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-200 flex-1 h-full relative",
              activeTab === 'purchases' ? "text-indigo-400" : "text-slate-500"
            )}
          >
            <Truck size={22} className={cn("transition-transform", activeTab === 'purchases' && "scale-110")} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Pembelian</span>
            {activeTab === 'purchases' && (
              <motion.div layoutId="nav-indicator" className="absolute -bottom-1 w-1 h-1 bg-indigo-500 rounded-full" />
            )}
          </button>
        )}

        <button 
          onClick={handleLogout} 
          className="flex flex-col items-center justify-center gap-1 transition-all duration-200 flex-1 h-full relative text-slate-500 active:text-indigo-400"
        >
          <LogOut size={22} className="transition-transform active:scale-110" />
          <span className="text-[9px] font-bold uppercase tracking-tighter text-rose-500">Logout</span>
        </button>

        {(!currentUser.permissions || currentUser.permissions.includes('settings')) && (
          <button 
            onClick={() => setActiveTab('settings')} 
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-200 flex-1 h-full relative",
              activeTab === 'settings' ? "text-indigo-400" : "text-slate-500"
            )}
          >
            <SettingsIcon size={22} className={cn("transition-transform", activeTab === 'settings' && "scale-110")} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Setting</span>
            {activeTab === 'settings' && (
              <motion.div layoutId="nav-indicator" className="absolute -bottom-1 w-1 h-1 bg-indigo-500 rounded-full" />
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}

// Sub-pages and helper components
function ShiftStartPage({ onStart }: { onStart: (name: string, modal: number) => void }) {
  const [name, setName] = useState('Shift Pagi');
  const [modal, setModal] = useState('');

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center px-4 z-[60]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md card p-8"
      >
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/20">
            <DbIcon className="text-white w-8 h-8" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Mulai Shift Baru</h1>
            <p className="text-slate-400 text-sm">Pilih shift anda dan masukkan modal awal</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Pilih Shift</label>
            <select 
              className="input-field"
              value={name}
              onChange={e => setName(e.target.value)}
            >
              <option value="Shift Pagi">Shift Pagi</option>
              <option value="Shift Siang">Shift Siang</option>
              <option value="Shift Sore">Shift Sore</option>
              <option value="Shift Malam">Shift Malam</option>
            </select>
          </div>
          <div>
            <label className="label">Modal Awal (Cash di Laci)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">Rp</span>
              <input 
                type="text" 
                className="input-field pl-10" 
                placeholder="0" 
                value={modal}
                onChange={e => setModal(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
          </div>
          <button 
            onClick={() => onStart(name, Number(modal))}
            disabled={!modal}
            className="w-full btn-primary h-12 flex items-center justify-center gap-2 mt-4 bg-amber-600 hover:bg-amber-500 shadow-amber-500/20"
          >
            Buka Shift Sekarang
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: (u: string, p: string) => Promise<boolean> }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await onLogin(username, password);
    if (!success) {
      // Fallback for default local credentials if API login fails
      if (username === 'admin' && password === 'admin123') {
        const adminUser: User = { id: "1", username: "admin", name: "Administrator", role: "admin" };
        handleLocalLogin(adminUser);
      } else if (username === 'kasir' && password === 'kasir123') {
        const kasirUser: User = { id: "2", username: "kasir", name: "Kasir Toko", role: "kasir" };
        handleLocalLogin(kasirUser);
      } else {
        setErr("Username atau password salah");
      }
    }
    setLoading(false);
  };

  const handleLocalLogin = (user: User) => {
    localStorage.setItem('pos_user', JSON.stringify(user));
    window.location.reload(); // Hard reload to ensure state consistency
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md card p-8 sm:p-10"
      >
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
            <ShoppingCart className="text-white w-8 h-8" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">KasirKu POS</h1>
            <p className="text-slate-400 text-sm">Masuk ke sistem kasir toko anda</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Username</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. admin" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          {err && <p className="text-rose-400 text-xs font-medium">{err}</p>}
          <button 
            type="submit" 
            className="w-full btn-primary h-12 flex items-center justify-center gap-2 mt-4"
            disabled={loading}
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Masuk Sekarang"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function DashboardPage({ db }: { db: Database }) {
  const today = new Date().toISOString().split('T')[0];
  const salesToday = db.sales.filter(s => s.date.startsWith(today));
  const totalSalesToday = salesToday.reduce((acc, s) => acc + s.total, 0);
  const totalTransactions = salesToday.length;

  const lowStockProducts = db.products.filter(p => p.stock <= p.minStock);

  // Chart data for daily sales (last 7 days)
  const salesData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      return {
        date: format(d, 'dd MMM', { locale: id }),
        total: db.sales.filter(s => s.date.startsWith(dateStr)).reduce((acc, s) => acc + s.total, 0)
      };
    }).reverse();
    return last7Days;
  }, [db.sales]);

  const categoryData = useMemo(() => {
    return db.categories.map(cat => ({
      name: cat,
      value: db.products.filter(p => p.category === cat).length
    }));
  }, [db.products, db.categories]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Penjualan Hari Ini" value={formatIDR(totalSalesToday)} trend="+12.5%" icon={TrendingUp} color="text-indigo-400" />
        <StatCard title="Total Transaksi" value={totalTransactions.toString()} trend="+4" icon={CartIcon} color="text-emerald-400" />
        <StatCard title="Stok Menipis" value={lowStockProducts.length.toString()} trend="Warning" icon={Package} color="text-amber-400" />
        <StatCard title="Total Pelanggan" value={db.customers.length.toString()} trend="+2" icon={Users} color="text-indigo-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white text-lg">Ringkasan Penjualan</h3>
            <p className="text-xs text-slate-400">7 Hari Terakhir</p>
          </div>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp ${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card p-6">
          <h3 className="font-bold text-white text-lg mb-6">Distribusi Kategori</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.slice(0, 5).map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-slate-400">{cat.name}</span>
                </div>
                <span className="text-xs font-bold text-white">{cat.value} Item</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <h3 className="font-bold text-white">Transaksi Terakhir</h3>
            <button className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Lihat Semua</button>
          </div>
          <div className="divide-y divide-slate-800">
            {db.sales.slice(-5).reverse().map((sale) => (
              <div key={sale.id} className="p-4 hover:bg-slate-800/30 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400">
                    <CartIcon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{sale.id}</h4>
                    <p className="text-xs text-slate-500">{format(new Date(sale.date), 'HH:mm • dd MMM yyyy')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{formatIDR(sale.total)}</p>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase">{sale.paymentMethod}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <h3 className="font-bold text-white">Stok Menipis</h3>
            <button className="text-xs text-rose-400 font-bold uppercase tracking-wider">Restock Segera</button>
          </div>
          <div className="divide-y divide-slate-800">
            {lowStockProducts.slice(0, 5).map((p) => (
              <div key={p.id} className="p-4 hover:bg-slate-800/30 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-rose-900/20 rounded-full flex items-center justify-center text-rose-400">
                    <Package size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{p.name}</h4>
                    <p className="text-xs text-slate-500">{p.category} • SKU: {p.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-rose-400">{p.stock} {p.unit}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Batas: {p.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, color }: { title: string, value: string, trend: string, icon: any, color: string }) {
  return (
    <div className="card p-6 flex flex-col gap-4 relative overflow-hidden group">
      <div className={cn("absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity", color)}>
        <Icon size={120} />
      </div>
      <div className="flex items-center justify-between">
        <div className={cn("p-2 rounded-lg bg-opacity-20", color.replace('text-', 'bg-'))}>
          <Icon size={20} className={color} />
        </div>
        <span className={cn("text-xs font-bold px-2 py-1 rounded-full", trend.startsWith('+') ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-400")}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      </div>
    </div>
  );
}

function POSPage({ db, user, cart, setCart, onSaveSale, selectedCustomerId, setSelectedCustomerId }: { 
  db: Database, 
  user: User,
  cart: any[], 
  setCart: any, 
  onSaveSale: (sale: any) => void,
  selectedCustomerId: string,
  setSelectedCustomerId: any
}) {
  const [search, setSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState(() => {
    const current = db.customers.find(c => c.id === selectedCustomerId);
    return current ? current.name : '';
  });
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [category, setCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [discount, setDiscount] = useState(0);
  const [priceLevel, setPriceLevel] = useState<'priceEcer' | 'priceAgen' | 'priceDistributor'>('priceEcer');
  const [lastSale, setLastSale] = useState<any | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Handle Search Manual / Scanner
  const handleManualSearch = () => {
    if (!search) return;
    const match = db.products.find(p => 
      p.sku.toLowerCase() === search.toLowerCase() || 
      p.barcode?.toLowerCase() === search.toLowerCase()
    );
    if (match) {
      addToCart(match);
      setSearch('');
    }
  };

  // Camera Scanner implementation
  useEffect(() => {
    if (isScannerOpen) {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      }, false);
      
      scanner.render((decodedText) => {
        const match = db.products.find(p => p.sku === decodedText || p.barcode === decodedText);
        if (match) {
          addToCart(match);
          setIsScannerOpen(false);
          scanner.clear();
        }
      }, () => {
        // silence
      });

      return () => {
        scanner.clear();
      };
    }
  }, [isScannerOpen, db.products]);

  // Sync price level when customer changes
  useEffect(() => {
    const customer = db.customers.find(c => c.id === selectedCustomerId);
    if (customer && customer.level) {
      setPriceLevel(customer.level);
    } else {
      setPriceLevel('priceEcer');
    }
  }, [selectedCustomerId, db.customers]);

  // Sync customer search when selectedCustomerId changes
  useEffect(() => {
    const current = db.customers.find(c => c.id === selectedCustomerId);
    if (current) setCustomerSearch(current.name);
    else setCustomerSearch('');
  }, [selectedCustomerId, db.customers]);

  const getPriceByLevel = (p: Product) => {
    if (priceLevel === 'priceAgen') return p.priceAgen || p.sellPrice;
    if (priceLevel === 'priceDistributor') return p.priceDistributor || p.sellPrice;
    return p.priceEcer || p.sellPrice;
  };

  // Sync cart prices when price level changes
  useEffect(() => {
    setCart((prev: any[]) => prev.map(item => ({
      ...item,
      price: getPriceByLevel(item.product)
    })));
  }, [priceLevel]);

  const filteredProducts = db.products.filter(p => {
    // Show all if no search, otherwise need at least 3 chars to start filtering
    if (search.length > 0 && search.length < 3) return false;
    
    const matchesSearch = !search ? true : (
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase()) || 
      (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()))
    );
    return matchesSearch;
  });

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * (db.settings.taxRate / 100));
  
  // Auto discount logic
  useEffect(() => {
    if (db.settings.minSpendForDiscount > 0 && subtotal >= db.settings.minSpendForDiscount) {
      if (db.settings.autoDiscountType === 'percentage') {
        const disc = Math.round(subtotal * (db.settings.autoDiscountValue / 100));
        setDiscount(disc);
      } else {
        setDiscount(db.settings.autoDiscountValue);
      }
    } else {
      setDiscount(0);
    }
  }, [subtotal, db.settings.minSpendForDiscount, db.settings.autoDiscountValue, db.settings.autoDiscountType]);

  const total = subtotal + tax - discount;
  const change = Math.max(0, (Number(amountPaid) || 0) - total);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    const price = getPriceByLevel(product);
    const existing = cart.find((i: any) => i.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return;
      setCart(cart.map((i: any) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { productId: product.id, product, quantity: 1, price }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((i: any) => i.productId !== id));
  };

  const updateQuantity = (id: string, q: number) => {
    if (q <= 0) return removeFromCart(id);
    const item = cart.find((i: any) => i.productId === id);
    if (item && q > item.product.stock) return;
    setCart(cart.map((i: any) => i.productId === id ? { ...i, quantity: q } : i));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (Number(amountPaid) < total && paymentMethod === 'Tunai') return;

    const newSale = {
      items: cart.map(i => ({ id: i.productId, name: i.product.name, price: i.price, quantity: i.quantity, total: i.price * i.quantity })),
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      amountPaid: Number(amountPaid) || total,
      change,
      customerId: selectedCustomerId,
      cashierId: user?.id || '1',
      date: new Date().toISOString()
    };

    onSaveSale(newSale);
    setLastSale(newSale);
    setCart([]);
    setAmountPaid('');
    setDiscount(0);
  };

  const [printType, setPrintType] = useState<'58' | 'standard'>('58');
  const [printerStatus, setPrinterStatus] = useState<'IDLE' | 'CONNECTING' | 'CONNECTED'>('IDLE');

  const connectBluetooth = async () => {
    if (!(navigator as any).bluetooth) {
      alert("Browser anda tidak mendukung Web Bluetooth. Gunakan Chrome atau Edge.");
      return;
    }
    try {
      setPrinterStatus('CONNECTING');
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'] // Common thermal printer service
      });
      console.log("Connected to:", device.name);
      setPrinterStatus('CONNECTED');
      alert(`Terhubung ke ${device.name}`);
    } catch (err: any) {
      console.error(err);
      setPrinterStatus('IDLE');
      if (err.name === 'SecurityError') {
        alert("Akses Bluetooth ditolak. Pastikan izin telah diberikan di pengaturan browser.");
      } else {
        alert("Gagal terhubung ke Bluetooth: " + err.message);
      }
    }
  };

  const connectUSB = async () => {
    if (!(navigator as any).usb) {
      alert("Browser anda tidak mendukung Web USB. Gunakan Chrome atau Edge.");
      return;
    }
    try {
      setPrinterStatus('CONNECTING');
      const device = await (navigator as any).usb.requestDevice({ filters: [] });
      console.log("USB Device:", device);
      setPrinterStatus('CONNECTED');
      alert(`Terhubung ke Hardware USB Printer`);
    } catch (err: any) {
      console.error(err);
      setPrinterStatus('IDLE');
      if (err.name === 'SecurityError') {
        alert("Akses USB ditolak. Pastikan izin telah diberikan di pengaturan browser.");
      } else {
        alert("Gagal terhubung ke USB: " + err.message);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-full flex-1 overflow-hidden">
      {/* Camera Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[300]">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Barcode className="text-indigo-500" size={18} /> Scan Barcode Kamera
              </h3>
              <button 
                onClick={() => setIsScannerOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 bg-black">
              <div id="reader" className="w-full"></div>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-slate-400">Arahkan kamera ke barcode produk</p>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {lastSale && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <CheckCircle className="text-emerald-500" size={18} /> Transaksi Berhasil
              </h3>
              <button 
                onClick={() => setLastSale(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-white flex flex-col items-center">
              <div 
                id="receipt-content" 
                className={cn(
                  "bg-white text-black text-xs font-mono p-4 border border-dashed border-gray-300",
                  printType === '58' ? "w-[58mm]" : "w-full max-w-[21cm]"
                )}
              >
                <div className="text-center mb-4">
                  <h2 className="font-bold text-sm uppercase">{db.settings.storeName}</h2>
                  <p>{db.settings.address}</p>
                  <p>{db.settings.phone}</p>
                </div>

                <div className="border-t border-b border-dashed border-black py-2 mb-2 grid grid-cols-2 gap-y-1">
                  <span>Tgl:</span> <span className="text-right">{new Date().toLocaleString('id-ID')}</span>
                  <span>ID:</span> <span className="text-right">#{lastSale.id || Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                  <span>Cust:</span> <span className="text-right">{db.customers.find(c => c.id === lastSale.customerId)?.name}</span>
                </div>

                <div className="mb-2">
                  {lastSale.items.map((item: any, idx: number) => (
                    <div key={idx} className="mb-1">
                      <div className="flex justify-between font-bold">
                        <span>{item.name}</span>
                        <span>{formatIDR(item.total)}</span>
                      </div>
                      <div className="text-[10px]">
                        {item.quantity} x {formatIDR(item.price)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-black pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatIDR(lastSale.subtotal)}</span>
                  </div>
                  {lastSale.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Diskon:</span>
                      <span>-{formatIDR(lastSale.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm">
                    <span>TOTAL:</span>
                    <span>{formatIDR(lastSale.total)}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span>Bayar:</span>
                    <span>{formatIDR(lastSale.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kembali:</span>
                    <span>{formatIDR(lastSale.change)}</span>
                  </div>
                </div>

                <div className="text-center mt-6 text-[10px]">
                  <p>Terima Kasih Atas Kunjungan Anda</p>
                  <p>Power by POS App</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-3">
              <div className="flex gap-2">
                <button 
                  onClick={connectBluetooth}
                  className={cn("flex-1 p-2 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-2", 
                    printerStatus === 'CONNECTED' ? "bg-emerald-950 border-emerald-500/30 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-400"
                  )}
                >
                  <Bluetooth size={14} /> BT Printer
                </button>
                <button 
                  onClick={connectUSB}
                  className="flex-1 p-2 rounded-lg text-xs font-bold bg-slate-800 border border-slate-700 text-slate-400 transition-all border flex items-center justify-center gap-2"
                >
                  <Laptop size={14} /> USB Printer
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPrintType('58')}
                  className={cn("flex-1 p-2 rounded-lg text-xs font-bold transition-all border", 
                    printType === '58' ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400"
                  )}
                >
                  Thermal 58mm
                </button>
                <button 
                  onClick={() => setPrintType('standard')}
                  className={cn("flex-1 p-2 rounded-lg text-xs font-bold transition-all border", 
                    printType === 'standard' ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400"
                  )}
                >
                  Standar/HVS
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Printer size={18} /> Cetak Struk
                </button>
                <button 
                  onClick={() => setLastSale(null)}
                  className="flex-1 btn-secondary"
                >
                  Selesai
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Product Selection */}
      <div className="flex-none h-[25vh] lg:h-full lg:flex-[1.1] xl:flex-[1.3] flex flex-col gap-2 overflow-hidden bg-slate-900/40 rounded-xl p-2 md:p-2.5">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              className="input-field pl-9 h-9 w-full text-[10px]" 
              placeholder="Cari..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-1.5 items-center">
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="px-3 h-9 bg-slate-800 border border-slate-700 hover:border-indigo-500 text-indigo-400 rounded-lg font-bold text-[9px] flex items-center gap-1.5 transition-all"
            >
              <Barcode size={14} /> SCAN
            </button>
            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-indigo-600 text-white" : "text-slate-400")}
              >
                <Grid size={14} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-indigo-600 text-white" : "text-slate-400")}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 overflow-y-auto pb-4 pr-1 scrollbar-thin flex-1">
            {filteredProducts.map(p => {
              const currentPrice = getPriceByLevel(p);
              return (
                <motion.button
                  layout
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={p.stock <= 0}
                  className={cn(
                    "bg-slate-900/60 border border-slate-800 p-2.5 flex flex-col items-center gap-1.5 text-center transition-all group rounded-lg relative overflow-hidden",
                    p.stock <= 0 ? "opacity-30 p-1" : "hover:border-indigo-500 active:scale-95"
                  )}
                >
                  <div className="w-7 h-7 bg-slate-800 rounded flex items-center justify-center text-slate-500 group-hover:text-indigo-400">
                    <Package size={14} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[9px] font-bold text-slate-200 line-clamp-1 leading-tight">{p.name}</h4>
                    <p className="text-[10px] font-bold text-indigo-400 mt-0.5">{formatIDR(currentPrice)}</p>
                  </div>
                  <div className={cn("text-[7px] font-bold px-1 py-0.5 rounded-full", p.stock > p.minStock ? "bg-slate-800 text-slate-500" : "bg-rose-950 text-rose-400")}>
                    {p.stock}
                  </div>
                </motion.button>
              )
            })}
          </div>
        ) : (
          <div className="overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1 overflow-y-auto scrollbar-thin">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-800">
                  {filteredProducts.map(p => {
                    const currentPrice = getPriceByLevel(p);
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/20 text-[9px] transition-all group cursor-pointer" onClick={() => addToCart(p)}>
                        <td className="px-3 py-1.5">
                          <p className="font-bold text-slate-200 line-clamp-1">{p.name}</p>
                        </td>
                        <td className="px-3 py-1.5 text-right font-bold text-indigo-400">
                          {formatIDR(currentPrice)}
                        </td>
                        <td className={cn("px-3 py-1.5 text-center font-bold", p.stock <= p.minStock ? "text-rose-400" : "text-slate-500")}>
                          {p.stock}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Cart (Middle Column) */}
      <div className="flex-none h-[45vh] lg:h-full lg:w-[240px] xl:w-[270px] flex flex-col gap-2 overflow-hidden bg-slate-900/50 rounded-xl border border-slate-800 shrink-0">
        <div className="px-3 py-2.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <CartIcon size={14} className="text-indigo-400" />
            <h3 className="font-bold text-slate-200 text-[10px] uppercase tracking-wider">Keranjang</h3>
          </div>
          <button onClick={() => setCart([])} className="text-slate-600 hover:text-rose-400">
            <Trash2 size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
          {cart.map(item => (
            <div key={item.productId} className="bg-slate-800/40 p-2 rounded-lg border border-slate-800/30 flex flex-col gap-1 shadow-sm">
              <div className="flex justify-between items-start">
                <h4 className="text-[9px] font-bold text-slate-200 line-clamp-2 leading-tight flex-1">{item.product.name}</h4>
                <button onClick={() => removeFromCart(item.productId)} className="text-slate-600 hover:text-rose-400 ml-2 shrink-0">
                  <X size={10} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800/50">
                <div className="flex items-center bg-slate-700/30 rounded border border-slate-600/50 overflow-hidden">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-0.5 px-1.5 hover:bg-slate-600 text-white text-[9px]">-</button>
                  <input 
                    type="text" 
                    className="w-8 bg-transparent text-center text-[10px] font-bold text-white border-none focus:ring-0 p-0" 
                    value={item.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value.replace(/[^0-9]/g, ''));
                      if (!isNaN(val)) updateQuantity(item.productId, val);
                    }}
                  />
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-0.5 px-1.5 hover:bg-slate-600 text-white text-[9px]">+</button>
                </div>
                <p className="text-[9px] font-bold text-indigo-400">{formatIDR(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-950/50 border-t border-slate-800 space-y-1.5 shrink-0">
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>SUBTOTAL</span>
            <span className="font-bold text-slate-300">{formatIDR(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-[9px] text-rose-400">
              <span>DISKON {db.settings.autoDiscountType === 'percentage' ? `(${db.settings.autoDiscountValue}%)` : ''}</span>
              <span className="font-bold">-{formatIDR(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-[9px]">
            <span className="text-slate-500 font-bold uppercase tracking-tighter">TOTAL</span>
            <span className="text-indigo-400 font-bold text-xs">{formatIDR(total)}</span>
          </div>
        </div>
      </div>

      {/* Payment / Summary (Right Column) */}
      <div className="w-full lg:w-[220px] xl:w-[240px] flex flex-col gap-2 flex-1 lg:h-full shrink-0 overflow-y-auto scrollbar-thin pb-4">
        <div className="card p-3 space-y-3 bg-slate-900/80 backdrop-blur-sm border-slate-800">
          <div>
            <label className="text-[8px] uppercase font-bold text-slate-500 tracking-widest mb-1 block leading-none">Pelanggan</label>
            <div className="relative">
              <input 
                type="text" 
                className="input-field h-8 text-[9px] pr-8" 
                placeholder="Cari..."
                value={customerSearch}
                onFocus={() => setIsCustomerDropdownOpen(true)}
                onChange={e => {
                  setCustomerSearch(e.target.value);
                  setIsCustomerDropdownOpen(true);
                }}
              />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={10} />

              {isCustomerDropdownOpen && (
                <div className="absolute z-[100] w-full mt-1 bg-slate-900 border border-slate-700 rounded shadow-2xl max-h-40 overflow-y-auto">
                  {db.customers
                    .filter(c => 
                      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
                      c.phone.includes(customerSearch)
                    )
                    .map(c => (
                      <button
                        key={c.id}
                        className="w-full px-3 py-2 text-left hover:bg-slate-800 transition-colors border-b border-slate-800 flex flex-col"
                        onClick={() => {
                          setSelectedCustomerId(c.id);
                          setCustomerSearch(c.name);
                          setIsCustomerDropdownOpen(false);
                        }}
                      >
                        <p className="text-[10px] font-bold text-white">{c.name}</p>
                        <p className="text-[8px] text-slate-500">{c.phone} • {c.level.replace('price', '')}</p>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-[8px] uppercase font-bold text-slate-500 tracking-widest mb-1 block leading-none">Metode</label>
            <select className="input-field h-8 text-[9px]" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="Tunai">Tunai</option>
              <option value="Debit">Debit</option>
              <option value="Transfer">Transfer</option>
              <option value="QRIS">QRIS</option>
            </select>
          </div>

          {paymentMethod === 'Tunai' && (
            <div>
              <label className="text-[8px] uppercase font-bold text-slate-500 tracking-widest mb-1 block leading-none">Bayar</label>
              <input 
                type="text" 
                className="input-field h-9 pl-2 text-right font-bold text-xs bg-slate-950" 
                placeholder="0" 
                value={amountPaid}
                onChange={e => setAmountPaid(e.target.value.replace(/[^0-9]/g, ''))}
              />
              <div className="grid grid-cols-2 gap-1 mt-1.5">
                {[20000, 50000, 100000, 200000].map(v => (
                  <button key={v} onClick={() => setAmountPaid(String(v))} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-[8px] font-bold text-slate-400 rounded border border-slate-700">
                    +{v/1000}k
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-2.5 bg-slate-950 rounded border border-indigo-500/10 flex flex-col items-center">
            <span className="text-[8px] text-indigo-500 font-bold uppercase tracking-widest">Kembali</span>
            <span className="text-indigo-400 font-bold text-sm leading-tight">{formatIDR(change)}</span>
          </div>

          <button 
            disabled={cart.length === 0 || (paymentMethod === 'Tunai' && Number(amountPaid) < total)}
            onClick={handleCheckout}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 text-white rounded-lg flex items-center justify-center gap-2 font-bold text-xs shadow-lg transition-all active:scale-95"
          >
            <CreditCard size={16} />
            BAYAR
          </button>
        </div>
      </div>
    </div>
  );
}

function InventoryPage({ db, onUpsert, onDelete, onAction }: { db: Database, onUpsert: (p: any) => void, onDelete: (id: string) => void, onAction: (action: string, payload: any) => Promise<boolean> }) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [modal, setModal] = useState<Partial<Product> | null>(null);
  const [catModal, setCatModal] = useState(false);
  const [newCat, setNewCat] = useState('');

  const filtered = db.products.filter(p => 
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.includes(search) || p.barcode?.includes(search)) &&
    (filterCat === 'All' || p.category === filterCat)
  );

  const handleExport = () => {
    const headers = ['ID', 'SKU', 'Barcode', 'Nama', 'Kategori', 'Satuan', 'Harga Beli', 'Ecer', 'Agen', 'Distributor', 'Stok', 'Min Stok'];
    const rows = db.products.map(p => [
      p.id, p.sku, p.barcode || '', p.name, p.category, p.unit, p.buyPrice, p.priceEcer, p.priceAgen, p.priceDistributor, p.stock, p.minStock
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `produk_eksport_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (rawData.length < 2) {
          alert("File kosong atau tidak memiliki data.");
          return;
        }
        
        const headerRow = rawData[0].map(h => String(h || '').toLowerCase().trim());
        const dataRows = rawData.slice(1);
        
        const products = dataRows
          .filter(row => row.length > 0 && (row[1] || row[3])) // has SKU or Name
          .map(row => {
            const getVal = (possibleNames: string[], defaultIndex: number) => {
              const hIdx = headerRow.findIndex(h => possibleNames.some(name => h.includes(name.toLowerCase())));
              const finalIdx = hIdx > -1 ? hIdx : defaultIndex;
              return row[finalIdx];
            };

            const parsedBuyPrice = Number(String(getVal(['beli', 'buy'], 6) || 0).replace(/[^0-9.-]/g, ''));
            const parsedEcer = Number(String(getVal(['ecer'], 7) || 0).replace(/[^0-9.-]/g, ''));
            const parsedAgen = Number(String(getVal(['agen', 'agent'], 8) || 0).replace(/[^0-9.-]/g, ''));
            const parsedDist = Number(String(getVal(['distributor'], 9) || 0).replace(/[^0-9.-]/g, ''));
            const parsedStock = Number(String(getVal(['stok', 'stock'], 10) || 0).replace(/[^0-9.-]/g, ''));
            const parsedMinStock = Number(String(getVal(['min'], 11) || 0).replace(/[^0-9.-]/g, ''));

            return {
              id: String(getVal(['id'], 0) || `P${Date.now()}-${Math.random().toString(36).substr(2, 5)}`),
              sku: String(getVal(['sku'], 1) || ''),
              barcode: String(getVal(['barcode'], 2) || ''),
              name: String(getVal(['nama', 'name'], 3) || 'Produk Tanpa Nama'),
              category: String(getVal(['kategori', 'category'], 4) || 'Umum'),
              unit: String(getVal(['satuan', 'unit'], 5) || 'pcs'),
              buyPrice: isFinite(parsedBuyPrice) ? parsedBuyPrice : 0,
              priceEcer: isFinite(parsedEcer) ? parsedEcer : 0,
              priceAgen: isFinite(parsedAgen) ? parsedAgen : 0,
              priceDistributor: isFinite(parsedDist) ? parsedDist : 0,
              sellPrice: isFinite(parsedEcer) ? parsedEcer : 0,
              stock: isFinite(parsedStock) ? parsedStock : 0,
              minStock: isFinite(parsedMinStock) ? parsedMinStock : 0
            };
          });

        if (products.length > 0) {
          const success = await onAction('IMPORT_PRODUCTS', { products });
          if (success) {
            alert(`Berhasil mengimpor ${products.length} produk.`);
          } else {
            alert("Gagal menyimpan data ke server.");
          }
        } else {
          alert("Tidak ada data produk yang valid untuk diimpor.");
        }
      } catch (err) {
        console.error("Import Error:", err);
        alert("Gagal mengimpor data. Pastikan format file benar.");
      }
    };
    reader.readAsBinaryString(file);
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Manajemen Inventori</h2>
        <div className="flex flex-wrap gap-2">
          <ExportButtons 
            fileName={`Daftar_Produk_${new Date().toISOString().split('T')[0]}`}
            title="DAFTAR PRODUK"
            headers={['SKU', 'Nama', 'Kategori', 'HPP', 'Ecer', 'Stok']}
            data={db.products.map(p => ({
              SKU: p.sku,
              Nama: p.name,
              Kategori: p.category,
              HPP: p.buyPrice,
              Ecer: p.priceEcer,
              Stok: p.stock
            }))}
            pdfRows={db.products.map(p => [
              p.sku,
              p.name,
              p.category,
              formatIDR(p.buyPrice),
              formatIDR(p.priceEcer),
              `${p.stock} ${p.unit}`
            ])}
          />
          <label className="btn-secondary flex items-center gap-2 cursor-pointer text-xs h-10 px-4">
            <Upload size={16} className="text-indigo-400" /> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
          <button onClick={() => setCatModal(true)} className="btn-secondary flex items-center gap-2">
            <Tag size={18} /> Kelola Kategori
          </button>
          <button onClick={() => setModal({ 
            name: '', sku: '', barcode: '', category: db.categories[0], 
            buyPrice: 0, priceEcer: 0, priceAgen: 0, priceDistributor: 0, 
            sellPrice: 0, stock: 0, minStock: 0, unit: 'Pcs' 
          })} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Tambah Produk Baru
          </button>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              className="input-field pl-10" 
              placeholder="Cari ID, Nama, atau SKU..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input-field sm:w-48" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="All">Semua Kategori</option>
            {db.categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
                <tr className="bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4 text-center">Barcode</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4 text-right">Ecer</th>
                  <th className="px-6 py-4 text-right">Agen</th>
                  <th className="px-6 py-4 text-right">Dist.</th>
                  <th className="px-6 py-4 text-center">Stok</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/20 text-sm transition-all group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">SKU: {p.sku}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                      <Barcode size={10} className="inline mr-1" /> {p.barcode || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">{p.category}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-indigo-400 font-bold">{formatIDR(p.priceEcer || p.sellPrice)}</td>
                  <td className="px-6 py-4 text-right text-emerald-400 font-medium">{formatIDR(p.priceAgen || 0)}</td>
                  <td className="px-6 py-4 text-right text-amber-400 font-medium">{formatIDR(p.priceDistributor || 0)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "font-bold",
                      p.stock <= p.minStock ? "text-rose-400" : "text-emerald-400"
                    )}>
                      {p.stock}
                    </span>
                    <span className="text-slate-500 text-[10px] ml-1 uppercase">{p.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => setModal(p)} className="p-2 hover:bg-indigo-600/20 hover:text-indigo-400 rounded-lg text-slate-500 transition-all"><Plus size={16} /></button>
                       <button onClick={() => { if(confirm('Hapus produk?')) onDelete(p.id) }} className="p-2 hover:bg-rose-600/20 hover:text-rose-400 rounded-lg text-slate-500 transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
             <div className="py-20 text-center">
              <Package size={48} className="mx-auto text-slate-700 mb-4" />
              <p className="text-slate-500">Tidak ada produk dalam daftar ini</p>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col max-h-[95vh]"
          >
            <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-white">{modal.id ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
              <button onClick={() => setModal(null)} className="text-slate-500 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-6 overflow-y-auto scrollbar-thin">
              <div>
                <label className="label">SKU</label>
                <input type="text" className="input-field" value={modal.sku} onChange={e => setModal({...modal, sku: e.target.value})} />
              </div>
              <div>
                <label className="label">Barcode</label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input type="text" className="input-field pl-10" placeholder="Scan Barcode..." value={modal.barcode || ''} onChange={e => setModal({...modal, barcode: e.target.value})} />
                </div>
              </div>
              <div className="col-span-full">
                <label className="label">Nama Produk</label>
                <input type="text" className="input-field" value={modal.name} onChange={e => setModal({...modal, name: e.target.value})} />
              </div>
              <div>
                <label className="label">Kategori</label>
                <select className="input-field" value={modal.category} onChange={e => setModal({...modal, category: e.target.value})}>
                  {db.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Satuan</label>
                <input type="text" className="input-field" value={modal.unit} onChange={e => setModal({...modal, unit: e.target.value})} />
              </div>
              <div className="col-span-full grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-800">
                <div>
                  <label className="label text-rose-400">Harga Beli</label>
                  <input type="number" className="input-field" value={modal.buyPrice} onChange={e => setModal({...modal, buyPrice: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="label text-indigo-400">Harga Ecer</label>
                  <input type="number" className="input-field" value={modal.priceEcer} onChange={e => setModal({...modal, priceEcer: Number(e.target.value), sellPrice: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="label text-emerald-400">Harga Agen</label>
                  <input type="number" className="input-field" value={modal.priceAgen} onChange={e => setModal({...modal, priceAgen: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="label text-amber-400">Harga Dist.</label>
                  <input type="number" className="input-field" value={modal.priceDistributor} onChange={e => setModal({...modal, priceDistributor: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="label">Stok Saat Ini</label>
                <input type="number" className="input-field" value={modal.stock} onChange={e => setModal({...modal, stock: Number(e.target.value)})} />
              </div>
              <div>
                <label className="label">Stok Minimal</label>
                <input type="number" className="input-field" value={modal.minStock} onChange={e => setModal({...modal, minStock: Number(e.target.value)})} />
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-900/50 border-t border-slate-800 flex justify-end gap-4">
              <button onClick={() => setModal(null)} className="btn-secondary">Batal</button>
              <button onClick={() => { onUpsert(modal); setModal(null); }} className="btn-primary">Simpan Perubahan</button>
            </div>
          </motion.div>
        </div>
      )}

      {catModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Kelola Kategori</h3>
              <button onClick={() => setCatModal(false)} className="text-slate-500 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="input-field flex-1" 
                  placeholder="Kategori baru..." 
                  value={newCat} 
                  onChange={e => setNewCat(e.target.value)} 
                />
                <button 
                  onClick={async () => {
                    if (newCat) {
                      await onAction('UPSERT_CATEGORY', { name: newCat });
                      setNewCat('');
                    }
                  }}
                  className="btn-primary px-4"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {db.categories.map(cat => (
                  <div key={cat} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <span className="text-white font-medium">{cat}</span>
                    <button 
                      onClick={async () => {
                        if (confirm(`Hapus kategori "${cat}"?`)) {
                          await onAction('DELETE_CATEGORY', { name: cat });
                        }
                      }}
                      className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function HistoryPage({ db }: { db: Database }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Riwayat Transaksi</h2>
        <ExportButtons 
          fileName={`Riwayat_Transaksi_${new Date().toISOString().split('T')[0]}`}
          title="RIWAYAT TRANSAKSI PENJUALAN"
          headers={["ID", "Tanggal", "Metode", "Pelanggan", "Total"]}
          data={db.sales.map(sale => ({
            ID: sale.id,
            Tanggal: format(new Date(sale.date), 'dd/MM/yyyy HH:mm'),
            Metode: sale.paymentMethod,
            Pelanggan: db.customers.find(c => c.id === sale.customerId)?.name || "Umum",
            Total: sale.total
          }))}
          pdfRows={db.sales.map(sale => [
            sale.id,
            format(new Date(sale.date), 'dd MMM yyyy, HH:mm'),
            sale.paymentMethod,
            db.customers.find(c => c.id === sale.customerId)?.name || "Umum",
            formatIDR(sale.total)
          ])}
        />
      </div>
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="px-6 py-4">ID Transaksi</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Metode</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {db.sales.slice().reverse().map(sale => {
                const customer = db.customers.find(c => c.id === sale.customerId);
                return (
                  <tr key={sale.id} className="hover:bg-slate-800/20 text-sm transition-all group">
                    <td className="px-6 py-4 font-bold text-white">{sale.id}</td>
                    <td className="px-6 py-4 text-slate-400">{format(new Date(sale.date), 'dd MMM yyyy, HH:mm')}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase py-1 px-2 rounded bg-indigo-950 text-indigo-400 border border-indigo-500/20">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{customer?.name || "Umum"}</td>
                    <td className="px-6 py-4 text-indigo-400 font-bold">{formatIDR(sale.total)}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-white transition-all">
                        <Printer size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {db.sales.length === 0 && (
             <div className="py-20 text-center">
              <History size={48} className="mx-auto text-slate-700 mb-4" />
              <p className="text-slate-500">Belum ada riwayat transaksi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PurchasePage({ db, onSavePurchase }: { db: Database, onSavePurchase: (p: any) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState(db.suppliers[0]?.id || '');
  const [selectedProd, setSelectedProd] = useState(db.products[0]?.id || '');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(db.products[0]?.buyPrice || 0);

  const addItem = () => {
    const prod = db.products.find(p => p.id === selectedProd);
    if (!prod) return;
    setItems([...items, { id: prod.id, name: prod.name, price, quantity: qty, total: price * qty }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const total = items.reduce((acc, i) => acc + i.total, 0);

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-white">Input Pembelian Barang</h2>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="card p-6 space-y-4">
              <h3 className="font-bold text-white mb-4">Pilih Item</h3>
              <div>
                <label className="label">Produk</label>
                <select className="input-field" value={selectedProd} onChange={e => {
                  const p = db.products.find(x => x.id === e.target.value);
                  setSelectedProd(e.target.value);
                  if (p) setPrice(p.buyPrice);
                }}>
                  {db.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Jumlah</label>
                  <input type="number" className="input-field" value={qty} onChange={e => setQty(Number(e.target.value))} />
                </div>
                <div>
                  <label className="label">Harga Beli Baru</label>
                  <input type="number" className="input-field" value={price} onChange={e => setPrice(Number(e.target.value))} />
                </div>
              </div>
              <button onClick={addItem} className="w-full btn-secondary flex items-center justify-center gap-2">
                <Plus size={18} /> Tambah ke Daftar
              </button>
            </div>

            <div className="card p-6 space-y-4">
               <h3 className="font-bold text-white mb-4">Info Supplier</h3>
               <div>
                  <label className="label">Supplier</label>
                  <select className="input-field" value={selectedSupplierId} onChange={e => setSelectedSupplierId(e.target.value)}>
                    {db.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
               </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="card flex-1 min-h-[400px] overflow-hidden flex flex-col">
              <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-white">Item Pembelian</h3>
                <span className="text-xs text-slate-500 font-bold uppercase">{items.length} Item</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                      <th className="px-6 py-3">Barang</th>
                      <th className="px-6 py-3 text-center">Qty</th>
                      <th className="px-6 py-3 text-right">Harga</th>
                      <th className="px-6 py-3 text-right">Total</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {items.map((item, i) => (
                      <tr key={i} className="text-sm">
                        <td className="px-6 py-3 text-white font-medium">{item.name}</td>
                        <td className="px-6 py-3 text-center text-slate-400">{item.quantity}</td>
                        <td className="px-6 py-3 text-right text-slate-400">{formatIDR(item.price)}</td>
                        <td className="px-6 py-3 text-right text-indigo-400 font-bold">{formatIDR(item.total)}</td>
                        <td className="px-6 py-3 text-right">
                          <button onClick={() => removeItem(i)} className="text-slate-600 hover:text-rose-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-8 border-t border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-slate-500 text-xs uppercase font-bold tracking-widest leading-none">Grand Total</p>
                  <h3 className="text-3xl font-bold text-indigo-400 mt-2">{formatIDR(total)}</h3>
                </div>
                <button 
                  disabled={items.length === 0}
                  onClick={() => {
                    onSavePurchase({ items, total, supplierId: selectedSupplierId });
                    setItems([]);
                  }}
                  className="w-full sm:w-auto btn-primary h-14 px-10 text-lg flex items-center gap-3"
                >
                  <Truck size={20} /> Simpan Pembelian
                </button>
              </div>
            </div>
          </div>
       </div>
    </div>
  );
}

function CustomerPage({ db, onUpsert }: { db: Database, onUpsert: (c: any) => void }) {
  const [modal, setModal] = useState<Partial<Customer> | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Database Pelanggan</h2>
        <div className="flex items-center gap-2">
          <ExportButtons 
            fileName={`Daftar_Pelanggan_${new Date().toISOString().split('T')[0]}`}
            title="DATABASE PELANGGAN"
            headers={["Nama", "Level", "Telepon", "Alamat"]}
            data={db.customers.map(c => ({
              Nama: c.name,
              Level: c.level === 'priceAgen' ? 'Agen' : c.level === 'priceDistributor' ? 'Distributor' : 'Ecer',
              Telepon: c.phone,
              Alamat: c.address
            }))}
            pdfRows={db.customers.map(c => [
              c.name,
              c.level === 'priceAgen' ? 'Agen' : c.level === 'priceDistributor' ? 'Distributor' : 'Ecer',
              c.phone,
              c.address
            ])}
          />
          <button onClick={() => setModal({ name: '', phone: '', address: '', level: 'priceEcer' })} className="btn-primary flex items-center gap-2">
            <UserPlus size={20} /> Pelanggan Baru
          </button>
        </div>
      </div>

      <div className="card">
        <table className="w-full text-left">
           <thead>
             <tr className="bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
               <th className="px-6 py-4">Nama</th>
               <th className="px-6 py-4">Level Harga</th>
               <th className="px-6 py-4">No. Telp</th>
               <th className="px-6 py-4">Alamat</th>
               <th className="px-6 py-4 text-right">Aksi</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-800">
             {db.customers.map(c => (
               <tr key={c.id} className="hover:bg-slate-800/20 text-sm">
                 <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                 <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border",
                      c.level === 'priceEcer' ? "bg-indigo-950 text-indigo-400 border-indigo-500/30" :
                      c.level === 'priceAgen' ? "bg-emerald-950 text-emerald-400 border-emerald-500/30" :
                      "bg-amber-950 text-amber-400 border-amber-500/30"
                    )}>
                      {c.level === 'priceAgen' ? 'Agen' : c.level === 'priceDistributor' ? 'Distributor' : 'Ecer'}
                    </span>
                 </td>
                 <td className="px-6 py-4 text-slate-400">{c.phone}</td>
                 <td className="px-6 py-4 text-slate-400">{c.address}</td>
                 <td className="px-6 py-4 text-right">
                   <button onClick={() => setModal(c)} className="p-2 text-indigo-400 hover:bg-slate-800 rounded">Edit</button>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
           >
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <h3 className="font-bold text-white">Form Pelanggan</h3>
                <button onClick={() => setModal(null)} className="text-slate-500 hover:text-white">×</button>
              </div>
              <div className="p-6 space-y-4">
                 <div>
                    <label className="label">Nama Lengkap</label>
                    <input type="text" className="input-field" value={modal.name} onChange={e => setModal({...modal, name: e.target.value})} />
                 </div>
                 <div>
                    <label className="label">Level Harga Produk</label>
                    <select className="input-field" value={modal.level} onChange={e => setModal({...modal, level: e.target.value as any})}>
                      <option value="priceEcer">Ecer (Default)</option>
                      <option value="priceAgen">Agen</option>
                      <option value="priceDistributor">Distributor</option>
                    </select>
                 </div>
                 <div>
                    <label className="label">No. Telepon / WhatsApp</label>
                    <input type="text" className="input-field" value={modal.phone} onChange={e => setModal({...modal, phone: e.target.value})} />
                 </div>
                 <div>
                    <label className="label">Alamat</label>
                    <textarea className="input-field h-24" value={modal.address} onChange={e => setModal({...modal, address: e.target.value})} />
                 </div>
              </div>
              <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-end gap-2">
                 <button onClick={() => setModal(null)} className="btn-secondary">Batal</button>
                 <button onClick={() => { onUpsert(modal); setModal(null); }} className="btn-primary">Simpan Pelanggan</button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}

function ReportsPage({ db }: { db: Database }) {
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'sales' | 'purchases' | 'inventory' | 'finance' | 'stock'>('overview');
  
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentYear = new Date().toISOString().slice(0, 4);

  // Filter Data based on period
  const filteredSales = db.sales.filter(s => {
    if (period === 'daily') return s.date.startsWith(today);
    if (period === 'monthly') return s.date.startsWith(currentMonth);
    return s.date.startsWith(currentYear);
  });

  const filteredReturns = db.saleReturns.filter(r => {
    if (period === 'daily') return r.date.startsWith(today);
    if (period === 'monthly') return r.date.startsWith(currentMonth);
    return r.date.startsWith(currentYear);
  });

  const filteredPurchases = db.purchases.filter(p => {
    if (period === 'daily') return p.date.startsWith(today);
    if (period === 'monthly') return p.date.startsWith(currentMonth);
    return p.date.startsWith(currentYear);
  });

  // Financial Metrics
  const grossSales = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalSalesReturns = filteredReturns.reduce((acc, r) => acc + r.total, 0);
  const netSales = grossSales - totalSalesReturns;

  const totalCogs = filteredSales.reduce((acc, s) => {
    return acc + s.items.reduce((itemAcc, item) => {
      const product = db.products.find(p => p.id === item.id);
      return itemAcc + ((product?.buyPrice || 0) * item.quantity);
    }, 0);
  }, 0);

  const grossProfit = netSales - totalCogs;
  const margin = netSales > 0 ? (grossProfit / netSales) * 100 : 0;
  
  const totalPurchases = filteredPurchases.reduce((acc, p) => acc + p.total, 0);
  const avgTransaction = filteredSales.length > 0 ? netSales / filteredSales.length : 0;

  // Chart Data preparation
  const salesByDay = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSales.forEach(s => {
      const day = s.date.split('T')[0];
      map[day] = (map[day] || 0) + s.total;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a,b) => a.name.localeCompare(b.name));
  }, [filteredSales]);

  const topProducts = useMemo(() => {
    const map: Record<string, { name: string, qty: number, revenue: number }> = {};
    db.sales.forEach(s => {
      s.items.forEach(item => {
        if (!map[item.id]) map[item.id] = { name: item.name, qty: 0, revenue: 0 };
        map[item.id].qty += item.quantity;
        map[item.id].revenue += item.total;
      });
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [db.sales]);

  const categoryPerformance = useMemo(() => {
    const map: Record<string, number> = {};
    db.sales.forEach(s => {
      s.items.forEach(item => {
        const prod = db.products.find(p => p.id === item.id);
        const cat = prod?.category || "Lainnya";
        map[cat] = (map[cat] || 0) + item.total;
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [db.sales, db.products]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BarChart3 className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Laporan & Analitik</h2>
            <p className="text-slate-400 text-sm">Wawasan bisnis dan performa toko anda</p>
          </div>
        </div>
        
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 gap-2">
          <div className="flex gap-1">
            {(['daily', 'monthly', 'yearly'] as const).map((p) => (
              <button 
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize", 
                  period === p ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"
                )}
              >
                {p === 'daily' ? 'Hari Ini' : p === 'monthly' ? 'Bulan Ini' : 'Tahun Ini'}
              </button>
            ))}
          </div>
          <div className="border-l border-slate-800 my-1"></div>
          <ExportButtons 
            fileName={`Laporan_Ringkasan_${period}_${new Date().toISOString().split('T')[0]}`}
            title={`LAPORAN RINGKASAN BISNIS - ${period.toUpperCase()}`}
            headers={["Metrik", "Nilai"]}
            data={[
              { Metrik: "Penjualan Bersih", Nilai: netSales },
              { Metrik: "HPP (Modal)", Nilai: totalCogs },
              { Metrik: "Laba Kotor", Nilai: grossProfit },
              { Metrik: "Rata-rata Transaksi", Nilai: avgTransaction }
            ]}
            pdfRows={[
              ["Penjualan Bersih", formatIDR(netSales)],
              ["HPP (Modal)", formatIDR(totalCogs)],
              ["Laba Kotor", formatIDR(grossProfit)],
              ["Margin", `${margin.toFixed(1)}%`],
              ["Rata-rata Transaksi", formatIDR(avgTransaction)]
            ]}
          />
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-4 border-b border-slate-800">
        <button onClick={() => setActiveSubTab('overview')} className={cn("pb-4 text-sm font-bold transition-all relative", activeSubTab === 'overview' ? "text-indigo-400" : "text-slate-500 hover:text-slate-300")}>
          Ringkasan {activeSubTab === 'overview' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />}
        </button>
        <button onClick={() => setActiveSubTab('sales')} className={cn("pb-4 text-sm font-bold transition-all relative", activeSubTab === 'sales' ? "text-indigo-400" : "text-slate-500 hover:text-slate-300")}>
          Penjualan {activeSubTab === 'sales' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />}
        </button>
        <button onClick={() => setActiveSubTab('purchases')} className={cn("pb-4 text-sm font-bold transition-all relative", activeSubTab === 'purchases' ? "text-indigo-400" : "text-slate-500 hover:text-slate-300")}>
          Pembelian {activeSubTab === 'purchases' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />}
        </button>
        <button onClick={() => setActiveSubTab('inventory')} className={cn("pb-4 text-sm font-bold transition-all relative", activeSubTab === 'inventory' ? "text-indigo-400" : "text-slate-500 hover:text-slate-300")}>
          Inventori {activeSubTab === 'inventory' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />}
        </button>
        <button onClick={() => setActiveSubTab('stock')} className={cn("pb-4 text-sm font-bold transition-all relative", activeSubTab === 'stock' ? "text-indigo-400" : "text-slate-500 hover:text-slate-300")}>
          Stok Tipis {activeSubTab === 'stock' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />}
        </button>
        <button onClick={() => setActiveSubTab('finance')} className={cn("pb-4 text-sm font-bold transition-all relative", activeSubTab === 'finance' ? "text-indigo-400" : "text-slate-500 hover:text-slate-300")}>
          Keuangan {activeSubTab === 'finance' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />}
        </button>
      </div>

      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ReportStatCard icon={TrendingUp} label="Penjualan Bersih" value={formatIDR(netSales)} color="text-indigo-400" bgColor="bg-indigo-500/10" />
            <ReportStatCard icon={ShoppingBag} label="HPP (Modal)" value={formatIDR(totalCogs)} color="text-rose-400" bgColor="bg-rose-500/10" />
            <ReportStatCard icon={CheckCircle} label="Laba Kotor" value={formatIDR(grossProfit)} color="text-emerald-400" bgColor="bg-emerald-500/10" note={`Margin ${margin.toFixed(1)}%`} />
            <ReportStatCard icon={ShoppingCart} label="Rata-rata Transaksi" value={formatIDR(avgTransaction)} color="text-amber-400" bgColor="bg-amber-500/10" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-400" /> Tren Penjualan
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `Rp ${v/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      formatter={(v: number) => [formatIDR(v), 'Penjualan']}
                    />
                    <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                <Tag size={18} className="text-indigo-400" /> Penjualan per Kategori
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPerformance}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryPerformance.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                       formatter={(v: number) => [formatIDR(v), 'Total']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2">
              <h3 className="font-bold text-white mb-6">Produk Paling Menguntungkan</h3>
              <div className="space-y-4">
                {topProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400">#{idx+1}</div>
                      <div>
                        <p className="text-sm font-bold text-white">{p.name}</p>
                        <p className="text-[10px] text-slate-500">{p.qty} unit terjual</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-indigo-400">{formatIDR(p.revenue)}</p>
                      <p className="text-[10px] text-slate-500">Pendapatan</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-white mb-4">Peringatan Stok Rendah</h3>
              <div className="space-y-3">
                {db.products.filter(p => p.stock <= p.minStock).slice(0, 6).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2">
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[120px]">{p.name}</p>
                      <p className="text-[10px] text-rose-500">Stok: {p.stock} / Min: {p.minStock}</p>
                    </div>
                    <button onClick={() => {/* redirect to pembelian */}} className="p-1 px-2 rounded bg-rose-500/10 text-rose-500 text-[10px] font-bold border border-rose-500/20">Isi Stok</button>
                  </div>
                ))}
                {db.products.filter(p => p.stock <= p.minStock).length === 0 && (
                  <div className="py-10 text-center">
                    <CheckCircle className="mx-auto text-emerald-500 mb-2 opacity-30" size={32} />
                    <p className="text-xs text-slate-500">Semua stok aman</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'sales' && (
         <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Rincian Penjualan periode {period}</h3>
              <ExportButtons 
                fileName={`Laporan_Penjualan_${period}_${new Date().toISOString().split('T')[0]}`}
                title={`LAPORAN PENJUALAN - ${period.toUpperCase()}`}
                headers={["ID", "Tanggal", "Pelanggan", "Metode", "Total"]}
                data={filteredSales.map(s => ({
                  ID: s.id,
                  Tanggal: format(new Date(s.date), 'dd/MM/yyyy HH:mm'),
                  Pelanggan: db.customers.find(c => c.id === s.customerId)?.name || '-',
                  Metode: s.paymentMethod,
                  Total: s.total
                }))}
                pdfRows={filteredSales.map(s => [
                  s.id,
                  format(new Date(s.date), 'dd/MM/yy HH:mm'),
                  db.customers.find(c => c.id === s.customerId)?.name || '-',
                  s.paymentMethod,
                  formatIDR(s.total)
                ])}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400">
                    <th className="px-6 py-4">ID Transaksi</th>
                    <th className="px-6 py-4">Waktu</th>
                    <th className="px-6 py-4">Pelanggan</th>
                    <th className="px-6 py-4">Metode</th>
                    <th className="px-6 py-4 text-right">Subtotal</th>
                    <th className="px-6 py-4 text-right">Potongan</th>
                    <th className="px-6 py-4 text-right">Total Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {filteredSales.map(s => {
                    const cust = db.customers.find(c => c.id === s.customerId);
                    return (
                      <tr key={s.id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{s.id}</td>
                        <td className="px-6 py-4 text-slate-400">{format(new Date(s.date), 'dd/MM/yy HH:mm')}</td>
                        <td className="px-6 py-4 text-slate-300">{cust?.name || '-'}</td>
                        <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[9px] uppercase">{s.paymentMethod}</span></td>
                        <td className="px-6 py-4 text-right text-slate-400">{formatIDR(s.subtotal)}</td>
                        <td className="px-6 py-4 text-right text-rose-400">-{formatIDR(s.discount)}</td>
                        <td className="px-6 py-4 text-right font-bold text-white">{formatIDR(s.total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-900 font-bold border-t border-slate-800">
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-right text-slate-400 text-xs uppercase">Total Periode</td>
                    <td className="px-6 py-4 text-right text-indigo-400 text-lg">{formatIDR(netSales)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
         </div>
      )}
      
      {activeSubTab === 'purchases' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ReportStatCard icon={ShoppingCart} label="Total Pembelian" value={formatIDR(totalPurchases)} color="text-amber-400" bgColor="bg-amber-500/10" />
            <ReportStatCard icon={ShoppingBag} label="Jumlah Transaksi" value={filteredPurchases.length.toString()} color="text-indigo-400" bgColor="bg-indigo-500/10" />
            <ReportStatCard icon={Package} label="Item Dibeli" value={filteredPurchases.reduce((acc, p) => acc + p.items.length, 0).toString()} color="text-emerald-400" bgColor="bg-emerald-500/10" />
          </div>
          <div className="card">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Daftar Pembelian Ke Supplier</h3>
              <ExportButtons 
                fileName={`Laporan_Pembelian_${period}_${new Date().toISOString().split('T')[0]}`}
                title={`LAPORAN PEMBELIAN - ${period.toUpperCase()}`}
                headers={["Ref", "Tanggal", "Supplier", "Total"]}
                data={filteredPurchases.map(p => ({
                  Ref: p.id,
                  Tanggal: new Date(p.date).toLocaleString(),
                  Supplier: db.suppliers.find(s => s.id === p.supplierId)?.name || 'Unknown',
                  Total: p.total
                }))}
                pdfRows={filteredPurchases.map(p => [
                  p.id,
                  new Date(p.date).toLocaleString(),
                  db.suppliers.find(s => s.id === p.supplierId)?.name || 'Unknown',
                  formatIDR(p.total)
                ])}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                <thead className="bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <tr>
                    <th className="px-6 py-4 italic">No. Referensi</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Supplier</th>
                    <th className="px-6 py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredPurchases.length > 0 ? filteredPurchases.slice().reverse().map(p => {
                    const supplier = db.suppliers.find(s => s.id === p.supplierId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/10 transition-colors group">
                        <td className="px-6 py-4 font-mono text-xs text-indigo-400">{p.id}</td>
                        <td className="px-6 py-4 text-slate-400 text-sm whitespace-nowrap">{new Date(p.date).toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-white">{supplier?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-right text-amber-500 font-bold">{formatIDR(p.total)}</td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-slate-500 italic">Tidak ada data pembelian untuk periode ini</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ReportStatCard icon={Package} label="Total SKU" value={db.products.length} color="text-indigo-400" bgColor="bg-indigo-500/10" />
            <ReportStatCard icon={DbIcon} label="Aset Stok (Modal)" value={formatIDR(db.products.reduce((acc, p) => acc + (p.stock * p.buyPrice), 0))} color="text-emerald-400" bgColor="bg-emerald-500/10" />
            <ReportStatCard icon={TrendingUp} label="Potensi Omzet" value={formatIDR(db.products.reduce((acc, p) => acc + (p.stock * p.sellPrice), 0))} color="text-amber-400" bgColor="bg-amber-500/10" />
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-white mb-6">Analisis Stok per Kategori</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {db.categories.map(cat => {
                const prods = db.products.filter(p => p.category === cat);
                const totalStock = prods.reduce((acc, p) => acc + p.stock, 0);
                const assetValue = prods.reduce((acc, p) => acc + (p.stock * p.buyPrice), 0);
                return (
                  <div key={cat} className="p-4 rounded-xl bg-slate-800/20 border border-slate-800">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{cat}</p>
                    <div className="flex justify-between mt-2">
                       <span className="text-slate-500 text-[10px]">Total Unit:</span>
                       <span className="text-white text-xs font-bold">{totalStock}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-slate-500 text-[10px]">Nilai Aset:</span>
                       <span className="text-emerald-400 text-xs font-bold">{formatIDR(assetValue)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'stock' && (
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-500" /> Produk Stok Minimum
              </h3>
              <ExportButtons 
                fileName={`Laporan_Stok_Kritis_${new Date().toISOString().split('T')[0]}`}
                title="DAFTAR PRODUK STOK KRITIS"
                headers={["Produk", "SKU", "Stok", "Minimum", "Status"]}
                data={db.products.filter(p => p.stock <= p.minStock).map(p => ({
                  Produk: p.name,
                  SKU: p.sku,
                  Stok: p.stock,
                  Minimum: p.minStock,
                  Status: p.stock === 0 ? "Habis" : "Kritis"
                }))}
                pdfRows={db.products.filter(p => p.stock <= p.minStock).map(p => [
                  p.name,
                  p.sku,
                  `${p.stock} ${p.unit}`,
                  `${p.minStock} ${p.unit}`,
                  p.stock === 0 ? "Habis" : "Kritis"
                ])}
              />
            </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400">
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4 text-center">Stok Saat Ini</th>
                  <th className="px-6 py-4 text-center">Stok Minimum</th>
                  <th className="px-6 py-4 text-center">Selisih</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {db.products.filter(p => p.stock <= p.minStock).map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{p.sku}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{p.category}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn("px-2 py-1 rounded font-bold", p.stock === 0 ? "bg-rose-500 text-white" : "bg-rose-500/20 text-rose-500")}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-400">{p.minStock} {p.unit}</td>
                    <td className="px-6 py-4 text-center text-rose-400 font-bold">{p.stock - p.minStock}</td>
                    <td className="px-6 py-4 text-center">
                      {p.stock === 0 ? (
                        <span className="text-[10px] uppercase font-bold text-rose-500">Habis</span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-amber-500">Kritis</span>
                      )}
                    </td>
                  </tr>
                ))}
                {db.products.filter(p => p.stock <= p.minStock).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-slate-500 italic">
                       <CheckCircle size={40} className="mx-auto mb-4 text-emerald-500 opacity-20" />
                       Semua stok produk mencukupi (diatas batas minimum)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="card p-6">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                  <CreditCard size={18} className="text-emerald-400" /> Kas Masuk (Penerimaan)
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                      <span className="text-slate-400 text-sm">Penjualan</span>
                      <span className="text-emerald-400 font-bold">{formatIDR(grossSales)}</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                      <span className="text-slate-400 text-sm">Retur Pembelian</span>
                      <span className="text-emerald-400 font-bold">{formatIDR(db.purchaseReturns.filter(r => r.date.startsWith(period === 'daily' ? today : period === 'monthly' ? currentMonth : currentYear)).reduce((acc, r) => acc + r.total, 0))}</span>
                   </div>
                </div>
             </div>

             <div className="card p-6">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingDown size={18} className="text-rose-400" /> Kas Keluar (Pengeluaran)
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                      <span className="text-slate-400 text-sm">Pembelian Stok</span>
                      <span className="text-rose-400 font-bold">{formatIDR(totalPurchases)}</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                      <span className="text-slate-400 text-sm">Retur Penjualan</span>
                      <span className="text-rose-400 font-bold">{formatIDR(totalSalesReturns)}</span>
                   </div>
                </div>
             </div>

             <div className="card p-6">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                  <CreditCard size={18} className="text-indigo-400" /> Metode Pembayaran
                </h3>
                <div className="space-y-4">
                   {['Tunai', 'Debit', 'Transfer', 'QRIS'].map(method => {
                     const total = db.sales
                       .filter(s => s.paymentMethod === method && s.date.startsWith(period === 'daily' ? today : period === 'monthly' ? currentMonth : currentYear))
                       .reduce((acc, s) => acc + s.total, 0);
                     return (
                        <div key={method} className="flex justify-between items-center py-2 border-b border-slate-800/50">
                           <span className="text-slate-400 text-sm">{method === 'Debit' ? 'Debit / Kredit' : method === 'Transfer' ? 'Transfer Bank' : method}</span>
                           <span className="text-indigo-400 font-bold">{formatIDR(total)}</span>
                        </div>
                     );
                   })}
                </div>
             </div>
          </div>
          
          <div className="card p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl relative">
             <div className="absolute top-6 right-6">
                <ExportButtons 
                  fileName={`Laporan_Keuangan_${period}_${new Date().toISOString().split('T')[0]}`}
                  title={`LAPORAN KEUANGAN & LABA RUGI - ${period.toUpperCase()}`}
                  headers={["Keterangan", "Nilai"]}
                  data={[
                    { Keterangan: "Pendapatan Bersih", Nilai: netSales },
                    { Keterangan: "Beban Pokok (HPP)", Nilai: totalCogs },
                    { Keterangan: "Laba Kotor", Nilai: grossProfit },
                    { Keterangan: "Total Pembelian", Nilai: totalPurchases }
                  ]}
                  pdfRows={[
                    ["Pendapatan Bersih", formatIDR(netSales)],
                    ["Beban Pokok (HPP)", formatIDR(totalCogs)],
                    ["Laba Kotor", formatIDR(grossProfit)],
                    ["Total Pembelian", formatIDR(totalPurchases)],
                    ["Retur Penjualan", formatIDR(totalSalesReturns)]
                  ]}
                />
             </div>
             <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white">Ringkasan Laba Rugi</h3>
                <p className="text-slate-400 text-sm italic">Estimasi performa periode {period}</p>
             </div>
             <div className="max-w-md mx-auto space-y-4">
                <div className="flex justify-between text-lg">
                   <span className="text-slate-300">Pendapatan Bersih:</span>
                   <span className="text-white font-bold">{formatIDR(netSales)}</span>
                </div>
                <div className="flex justify-between text-lg border-b border-slate-700 pb-2">
                   <span className="text-slate-300">Beban Pokok (HPP):</span>
                   <span className="text-rose-400 font-bold">-{formatIDR(totalCogs)}</span>
                </div>
                <div className="flex justify-between text-2xl pt-2">
                   <span className="text-white font-black uppercase tracking-tighter">Laba Kotor:</span>
                   <span className="text-emerald-400 font-black">{formatIDR(grossProfit)}</span>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportStatCard({ icon: Icon, label, value, color, bgColor, note }: any) {
  return (
    <div className="card p-6 relative overflow-hidden group">
      <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-110 transition-transform duration-500", bgColor)} />
      <div className="flex items-start justify-between">
        <div className={cn("p-3 rounded-2xl", bgColor)}>
          <Icon className={color} size={20} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{label}</p>
        <h3 className={cn("text-2xl font-bold mt-1", color)}>{value}</h3>
        {note && <p className="text-[10px] text-slate-500 mt-2 font-medium">{note}</p>}
      </div>
    </div>
  );
}

function SupplierPage({ db, onUpsert, onDelete }: { db: Database, onUpsert: (s: any) => void, onDelete: (id: string) => void }) {
  const [modal, setModal] = useState<Partial<Supplier> | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Database Supplier</h2>
          <p className="text-slate-400 text-sm">Kelola pemasok stok barang anda</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons 
            fileName={`Daftar_Supplier_${new Date().toISOString().split('T')[0]}`}
            title="DATABASE SUPPLIER"
            headers={["Supplier", "Kontak", "Telepon"]}
            data={db.suppliers.map(s => ({
              Supplier: s.name,
              Kontak: s.contact,
              Telepon: s.phone
            }))}
            pdfRows={db.suppliers.map(s => [
              s.name,
              s.contact,
              s.phone
            ])}
          />
          <button onClick={() => setModal({ name: '', contact: '', phone: '' })} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Tambah Supplier
          </button>
        </div>
      </div>

      <div className="card">
        <table className="w-full text-left">
           <thead>
             <tr className="bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
               <th className="px-6 py-4">Supplier</th>
               <th className="px-6 py-4">Kontak Person</th>
               <th className="px-6 py-4">Telepon</th>
               <th className="px-6 py-4 text-right">Aksi</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-800">
             {db.suppliers.map(s => (
               <tr key={s.id} className="hover:bg-slate-800/20 text-sm transition-all">
                 <td className="px-6 py-4 font-bold text-white">{s.name}</td>
                 <td className="px-6 py-4 text-slate-400">{s.contact}</td>
                 <td className="px-6 py-4 text-slate-400 font-mono">{s.phone}</td>
                 <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setModal(s)} className="p-2 text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors">Edit</button>
                      <button onClick={() => { if(confirm('Hapus supplier?')) onDelete(s.id) }} className="p-2 text-rose-500 hover:bg-slate-800 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
        {db.suppliers.length === 0 && (
          <div className="py-20 text-center">
            <Truck size={40} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500">Belum ada data supplier</p>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
           >
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <h3 className="font-bold text-white">Form Supplier</h3>
                <button onClick={() => setModal(null)} className="text-slate-500 hover:text-white">×</button>
              </div>
              <div className="p-6 space-y-4">
                 <div>
                    <label className="label">Nama Perusahaan / Supplier</label>
                    <input type="text" className="input-field" value={modal.name} onChange={e => setModal({...modal, name: e.target.value})} />
                 </div>
                 <div>
                    <label className="label">Kontak Person</label>
                    <input type="text" className="input-field" value={modal.contact} onChange={e => setModal({...modal, contact: e.target.value})} />
                 </div>
                 <div>
                    <label className="label">Nomor Telepon</label>
                    <input type="text" className="input-field" value={modal.phone} onChange={e => setModal({...modal, phone: e.target.value})} />
                 </div>
              </div>
              <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-end gap-2">
                 <button onClick={() => setModal(null)} className="btn-secondary">Batal</button>
                 <button onClick={() => { onUpsert(modal); setModal(null); }} className="btn-primary">Simpan Supplier</button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}

function ReturnsPage({ db, onSaleReturn, onPurchaseReturn }: { db: Database, onSaleReturn: (p: any) => void, onPurchaseReturn: (p: any) => void }) {
  const [activeSubTab, setActiveSubTab] = useState<'sale' | 'purchase'>('sale');
  const [selectedTxId, setSelectedTxId] = useState('');
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [reason, setReason] = useState('');

  const transactions = activeSubTab === 'sale' ? (db.sales || []) : (db.purchases || []);
  const currentTx = transactions.find(t => t.id.trim().toUpperCase() === selectedTxId.trim().toUpperCase());

  const handleSelectTx = (id: string) => {
    const searchId = id.trim().toUpperCase();
    const tx = transactions.find(t => t.id.trim().toUpperCase() === searchId);
    if (tx) {
      setSelectedTxId(tx.id);
      setReturnItems(tx.items.map(i => ({ ...i, returnQty: 0 })));
    } else {
      setSelectedTxId(id.toUpperCase());
      setReturnItems([]);
    }
  };

  const currentReturnTotal = returnItems.reduce((acc, item) => acc + (item.price * item.returnQty), 0);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
            <RotateCcw className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Manajemen Retur</h2>
            <p className="text-slate-400 text-sm">Pengembalian barang penjualan atau pembelian</p>
          </div>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          <button 
            onClick={() => { setActiveSubTab('sale'); setSelectedTxId(''); setReturnItems([]); }}
            className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", activeSubTab === 'sale' ? "bg-indigo-600 text-white" : "text-slate-400")}
          >
            Retur Penjualan
          </button>
          <button 
            onClick={() => { setActiveSubTab('purchase'); setSelectedTxId(''); setReturnItems([]); }}
            className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", activeSubTab === 'purchase' ? "bg-indigo-600 text-white" : "text-slate-400")}
          >
            Retur Pembelian
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-white">Cari Transaksi</h3>
            <div className="relative">
              <label className="label px-0">ID Transaksi ({activeSubTab === 'sale' ? 'TRX-...' : 'PUR-...'})</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  className="input-field pl-10 h-12 uppercase" 
                  placeholder="Ketik ID Transaksi..."
                  value={selectedTxId}
                  onChange={e => handleSelectTx(e.target.value.toUpperCase())}
                />
              </div>
              
              {selectedTxId && !currentTx && (
                <div className="absolute z-[70] w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                  {transactions
                    .filter(t => t.id.toUpperCase().includes(selectedTxId.trim().toUpperCase()))
                    .slice(0, 10)
                    .map(t => (
                      <button 
                        key={t.id}
                        onClick={() => handleSelectTx(t.id)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-800 border-b border-slate-800 last:border-0 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{t.id}</p>
                          <p className="text-[10px] text-slate-500">{format(new Date(t.date), 'dd/MM/yy HH:mm')}</p>
                        </div>
                        <p className="text-xs font-bold text-indigo-400">{formatIDR(t.total)}</p>
                      </button>
                    ))}
                  {transactions.filter(t => t.id.toUpperCase().includes(selectedTxId.trim().toUpperCase())).length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-500 italic">Transaksi tidak ditemukan</div>
                  )}
                </div>
              )}
            </div>
            {currentTx && (
              <div className="p-4 bg-slate-800/50 rounded-xl space-y-3 border border-slate-700">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">ID Transaksi:</p>
                  <p className="text-sm font-bold text-white">{currentTx.id}</p>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <p className="text-slate-400">Waktu:</p>
                  <p className="text-slate-200 uppercase">{format(new Date(currentTx.date), 'dd MMM yyyy HH:mm')}</p>
                </div>
                <div className="flex justify-between items-center text-lg font-black">
                  <p className="text-slate-400 text-xs">TOTAL:</p>
                  <p className="text-indigo-400">{formatIDR(currentTx.total)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-white">Alasan Retur</h3>
            <textarea 
              className="input-field h-32 text-sm" 
              placeholder="Contoh: Barang cacat, Salah kirim, Rusak saat diterima..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="lg:col-span-2 card flex flex-col overflow-hidden min-h-[500px]">
          <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-white">Pilih Item yang Diretur</h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-full font-bold">{returnItems.length} ITEMS</span>
          </div>
          <div className="flex-1 overflow-y-auto px-6">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                  <th className="py-4">Produk</th>
                  <th className="py-4 text-center">Beli/Jual</th>
                  <th className="py-4 text-center">Qty Retur</th>
                  <th className="py-4 text-right">Total Retur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {returnItems.map((item, idx) => (
                  <tr key={idx} className="text-sm group hover:bg-slate-800/10 transition-colors">
                    <td className="py-4">
                      <p className="text-white font-bold group-hover:text-indigo-400 transition-colors">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{formatIDR(item.price)} / unit</p>
                    </td>
                    <td className="py-4 text-center text-slate-400 font-bold">{item.quantity}</td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { const val = Math.max(0, item.returnQty - 1); const newItems = [...returnItems]; newItems[idx].returnQty = val; setReturnItems(newItems); }} className="w-6 h-6 rounded bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white">-</button>
                        <input 
                          type="number" 
                          className="bg-slate-950 border border-slate-800 rounded w-16 text-center text-white py-1 font-bold focus:border-indigo-500 outline-none"
                          value={item.returnQty}
                          max={item.quantity}
                          min={0}
                          onChange={e => {
                            const val = Math.min(item.quantity, Math.max(0, parseInt(e.target.value) || 0));
                            const newItems = [...returnItems];
                            newItems[idx].returnQty = val;
                            setReturnItems(newItems);
                          }}
                        />
                        <button onClick={() => { const val = Math.min(item.quantity, item.returnQty + 1); const newItems = [...returnItems]; newItems[idx].returnQty = val; setReturnItems(newItems); }} className="w-6 h-6 rounded bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white">+</button>
                      </div>
                    </td>
                    <td className="py-4 text-right text-rose-400 font-black">{formatIDR(item.price * item.returnQty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {returnItems.length === 0 && (
              <div className="py-24 text-center border-2 border-dashed border-slate-800 rounded-2xl my-6">
                <History size={48} className="mx-auto text-slate-800 mb-4" />
                <p className="text-slate-500 font-medium">Pilih transaksi untuk memulai retur</p>
                <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest font-bold">Cari ID Transaksi di panel sebelah kiri</p>
              </div>
            )}
          </div>
          <div className="p-8 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Estimasi Pengembalian Dana</p>
              <h3 className="text-3xl font-black text-rose-500 mt-1">{formatIDR(currentReturnTotal)}</h3>
            </div>
            <button 
              disabled={returnItems.filter(i => i.returnQty > 0).length === 0 || !reason}
              onClick={() => {
                const payload = {
                  saleId: activeSubTab === 'sale' ? selectedTxId : undefined,
                  purchaseId: activeSubTab === 'purchase' ? selectedTxId : undefined,
                  items: returnItems.filter(i => i.returnQty > 0).map(i => ({ 
                    id: i.id, 
                    productId: i.productId || i.id, // Support different object structures
                    name: i.name, 
                    quantity: i.returnQty, 
                    price: i.price, 
                    total: i.price * i.returnQty 
                  })),
                  total: currentReturnTotal,
                  reason,
                  date: new Date().toISOString()
                };
                if (activeSubTab === 'sale') onSaleReturn(payload);
                else onPurchaseReturn(payload);
                setSelectedTxId('');
                setReturnItems([]);
                setReason('');
              }}
              className="btn-primary bg-rose-600 hover:bg-rose-500 h-14 px-10 flex items-center gap-3 disabled:opacity-20 shadow-xl shadow-rose-900/20 active:scale-95"
            >
              <RotateCcw size={20} /> Simpan Retur
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StockOpnamePage({ db, onSave }: { db: Database, onSave: (p: any) => void }) {
  const [selectedProdId, setSelectedProdId] = useState('');
  const [actualStock, setActualStock] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');

  const product = db.products.find(p => p.id === selectedProdId);
  const sysStock = product?.stock || 0;
  const difference = (Number(actualStock) || 0) - sysStock;

  const filteredProducts = db.products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Laptop className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Stok Opname</h2>
          <p className="text-slate-400 text-sm">Penyesuaian stok sistem dengan stok fisik</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-8 space-y-6">
          <div className="relative">
            <label className="label px-0">Cari Produk</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                className="input-field pl-10 h-14" 
                placeholder="Ketik nama atau SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {search && !selectedProdId && (
              <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
                 {filteredProducts.map(p => (
                    <button 
                      key={p.id} 
                      className="w-full px-4 py-4 text-left hover:bg-slate-800 border-b border-slate-800 last:border-0 flex justify-between items-center group transition-colors"
                      onClick={() => {
                        setSelectedProdId(p.id);
                        setSearch(p.name);
                      }}
                    >
                       <div>
                          <p className="text-sm font-black text-white group-hover:text-indigo-400">{p.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">SKU: {p.sku} • {p.category}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-bold text-slate-400">Stok: {p.stock}</p>
                       </div>
                    </button>
                 ))}
                 {filteredProducts.length === 0 && <div className="p-4 text-center text-xs text-slate-500">Produk tidak ditemukan</div>}
              </div>
            )}
            {selectedProdId && (
              <button onClick={() => { setSelectedProdId(''); setSearch(''); }} className="absolute right-3 top-10 text-[10px] text-rose-500 font-bold uppercase hover:underline">Ganti</button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 bg-slate-800/30 rounded-2xl border border-slate-800 shadow-inner">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Stok Sistem</p>
              <p className="text-3xl font-black text-white">{sysStock} <span className="text-[10px] font-bold text-slate-500 uppercase">{product?.unit}</span></p>
            </div>
            <div className="p-5 bg-slate-800/30 rounded-2xl border border-slate-800 shadow-inner">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Hasil Selisih</p>
              <p className={cn("text-3xl font-black", difference === 0 ? "text-slate-400" : difference > 0 ? "text-emerald-400" : "text-rose-400")}>
                {difference > 0 ? `+${difference}` : difference}
              </p>
            </div>
          </div>

          <div>
            <label className="label px-0">Stok Fisik Lab-Real</label>
            <input 
              type="number" 
              className="input-field h-14 text-2xl font-black text-center text-indigo-400" 
              value={actualStock}
              onChange={e => setActualStock(e.target.value === '' ? '' : parseInt(e.target.value))}
              placeholder="0"
            />
          </div>

          <div>
            <label className="label px-0">Catatan / Alasan Selisih</label>
            <textarea 
              className="input-field h-24 text-sm" 
              placeholder="Berikan alasan penyesuaian stok (misal: Barang pecah, salah hitung, dll)..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <button 
            disabled={!selectedProdId || actualStock === ''}
            onClick={() => {
              onSave({
                productId: selectedProdId,
                actualStock: Number(actualStock),
                difference,
                notes,
                date: new Date().toISOString()
              });
              setSelectedProdId('');
              setActualStock('');
              setNotes('');
              setSearch('');
            }}
            className="w-full btn-primary h-14 text-lg font-black shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-3 disabled:opacity-20 active:scale-95"
          >
            <CheckCircle size={24} /> Simpan Penyesuaian
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-white">Riwayat Opname Terakhir</h3>
            <ExportButtons 
              fileName={`Riwayat_Opname_${new Date().toISOString().split('T')[0]}`}
              title="RIWAYAT STOK OPNAME"
              headers={["Waktu", "Produk", "Selisih", "Alasan"]}
              data={(db.stockOpnames || []).map(op => ({
                Waktu: format(new Date(op.date), 'dd/MM/yyyy HH:mm'),
                Produk: db.products.find(x => x.id === op.productId)?.name || 'Unknown',
                Selisih: op.difference,
                Alasan: op.notes
              }))}
              pdfRows={(db.stockOpnames || []).map(op => [
                format(new Date(op.date), 'dd/MM/yyyy HH:mm'),
                db.products.find(x => x.id === op.productId)?.name || 'Unknown',
                op.difference > 0 ? `+${op.difference}` : op.difference.toString(),
                op.notes
              ])}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                  <th className="px-6 py-3">Waktu</th>
                  <th className="px-6 py-3">Produk</th>
                  <th className="px-6 py-3 text-center">Selisih</th>
                  <th className="px-6 py-3">Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {db.stockOpnames?.slice(-10).reverse().map(op => {
                  const p = db.products.find(x => x.id === op.productId);
                  return (
                    <tr key={op.id} className="text-xs hover:bg-slate-800/30">
                      <td className="px-6 py-3 text-slate-400">{format(new Date(op.date), 'dd/MM HH:mm')}</td>
                      <td className="px-6 py-3 text-white font-medium">{p?.name}</td>
                      <td className={cn("px-6 py-3 text-center font-bold", op.difference > 0 ? "text-emerald-400" : "text-rose-400")}>
                        {op.difference > 0 ? `+${op.difference}` : op.difference}
                      </td>
                      <td className="px-6 py-3 text-slate-500 truncate max-w-[120px]">{op.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(!db.stockOpnames || db.stockOpnames.length === 0) && (
              <div className="py-20 text-center text-slate-600">Belum ada data opname</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StockCardPage({ db }: { db: Database }) {
  const [selectedProdId, setSelectedProdId] = useState('');
  const [search, setSearch] = useState('');

  const filteredProducts = db.products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5);

  const history = db.stockHistory
    .filter(h => h.productId === selectedProdId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const product = db.products.find(p => p.id === selectedProdId);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <BookOpen className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Kartu Stok</h2>
          <p className="text-slate-400 text-sm">Lacak riwayat mutasi barang secara detail</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-white">Filter Produk</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                className="input-field pl-10" 
                placeholder="Cari produk..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && !selectedProdId && (
                <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  {filteredProducts.map(p => (
                    <button 
                      key={p.id} 
                      className="w-full px-4 py-3 text-left hover:bg-slate-800 border-b border-slate-800 last:border-0"
                      onClick={() => { setSelectedProdId(p.id); setSearch(p.name); }}
                    >
                      <p className="text-xs font-bold text-white">{p.name}</p>
                      <p className="text-[10px] text-slate-500">{p.sku}</p>
                    </button>
                  ))}
                </div>
              )}
              {selectedProdId && (
                <button onClick={() => { setSelectedProdId(''); setSearch(''); }} className="absolute right-3 top-2 text-[10px] text-rose-500 font-bold">X</button>
              )}
            </div>
          </div>

          {product && (
            <div className="card p-6 space-y-4 bg-indigo-900/10 border-indigo-500/20">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Stok Saat Ini</p>
                <p className="text-4xl font-black text-white">{product.stock} <span className="text-xs text-slate-500 font-normal">{product.unit}</span></p>
              </div>
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Kategori:</span>
                  <span className="text-white font-bold">{product.category}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Harga Jual:</span>
                  <span className="text-indigo-400 font-bold">{formatIDR(product.sellPrice)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 card overflow-hidden flex flex-col min-h-[600px]">
          <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-white">Mutasi Stok {product ? `- ${product.name}` : ''}</h3>
            <div className="flex items-center gap-3">
              {product && (
                <ExportButtons 
                  fileName={`Kartu_Stok_${product.name}_${new Date().toISOString().split('T')[0]}`}
                  title={`KARTU STOK: ${product.name.toUpperCase()}`}
                  headers={["Waktu", "Tipe", "Masuk", "Keluar", "Saldo"]}
                  data={history.map(h => ({
                    Waktu: format(new Date(h.date), 'dd/MM/yyyy HH:mm'),
                    Tipe: h.type,
                    Masuk: h.change > 0 ? h.change : 0,
                    Keluar: h.change < 0 ? Math.abs(h.change) : 0,
                    Saldo: h.balanceAfter
                  }))}
                  pdfRows={history.map(h => [
                    format(new Date(h.date), 'dd/MM/yyyy HH:mm'),
                    h.type,
                    h.change > 0 ? h.change.toString() : '0',
                    h.change < 0 ? Math.abs(h.change).toString() : '0',
                    h.balanceAfter.toString()
                  ])}
                />
              )}
              <span className="text-[10px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full font-bold uppercase">{history.length} TRANSAKSI</span>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-slate-900 z-10 shadow-sm">
                <tr className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Tipe Transaksi</th>
                  <th className="px-6 py-4">Referensi</th>
                  <th className="px-6 py-4 text-center">In / Out</th>
                  <th className="px-6 py-4 text-center">Sisa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {history.map((h, i) => (
                  <tr key={i} className="text-xs hover:bg-slate-800/30 transition-colors uppercase font-medium">
                    <td className="px-6 py-4 text-slate-500">{format(new Date(h.date), 'dd/MM/yyyy HH:mm')}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[9px] uppercase font-bold px-2 py-0.5 rounded border",
                        h.type === 'SALE' ? "text-rose-400 border-rose-500/20 bg-rose-950/20" :
                        h.type === 'PURCHASE' ? "text-emerald-400 border-emerald-500/20 bg-emerald-950/20" :
                        "text-slate-400 border-slate-700 bg-slate-800"
                      )}>
                        {h.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{h.referenceId}</td>
                    <td className={cn("px-6 py-4 text-center font-bold", h.change > 0 ? "text-emerald-400" : "text-rose-400")}>
                      {h.change > 0 ? `+${h.change}` : h.change}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-white">{h.balanceAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!selectedProdId && (
              <div className="py-40 text-center">
                <BookOpen size={64} className="mx-auto text-slate-800 mb-6" />
                <p className="text-slate-500 font-medium">Pilih produk untuk melihat mutasi stok</p>
              </div>
            )}
            {selectedProdId && history.length === 0 && (
              <div className="py-40 text-center text-slate-600 font-medium">Belum ada riwayat mutasi untuk produk ini</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function BackupPage({ db, onRestore, onReset, onAction }: { 
  db: Database, 
  onRestore: (data: any) => void,
  onReset: () => any,
  onAction: (action: string, payload: any) => Promise<boolean>
}) {
  const [isExporting, setIsExporting] = useState(false);

  const exportJSON = () => {
    const dataStr = JSON.stringify(db, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    saveAs(blob, `backup_pos_${format(new Date(), 'yyyy-MM-dd')}.json`);
  };

  const exportCSV = () => {
    const headers = ["ID", "SKU", "Barcode", "Name", "Category", "Stock", "BuyPrice", "SellPrice", "Unit"];
    const rows = db.products.map(p => [
      p.id, p.sku, p.barcode, p.name, p.category, p.stock, p.buyPrice, p.sellPrice, p.unit
    ]);
    
    let csvContent = headers.join(",") + "\n";
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `products_pos_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportXLSX = () => {
    const wb = XLSX.utils.book_new();

    const wsProducts = XLSX.utils.json_to_sheet(db.products);
    XLSX.utils.book_append_sheet(wb, wsProducts, "Produk");

    const wsSales = XLSX.utils.json_to_sheet(db.sales.map(s => ({
      ID: s.id,
      Tanggal: s.date,
      Pelanggan: s.customerId,
      Total: s.total,
      Diskon: s.discount,
      Metode: s.paymentMethod
    })));
    XLSX.utils.book_append_sheet(wb, wsSales, "Penjualan");

    const wsHistory = XLSX.utils.json_to_sheet(db.stockHistory);
    XLSX.utils.book_append_sheet(wb, wsHistory, "Mutasi Stok");

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `full_report_pos_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportSQL = () => {
    let sql = `-- Backup POS Database\n-- Data: ${new Date().toLocaleString()}\n\n`;
    
    sql += `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);\n`;
    sql += `INSERT INTO settings (key, value) VALUES ('storeName', '${db.settings.storeName}');\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, sku TEXT, name TEXT, stock INTEGER, sellPrice INTEGER);\n`;
    db.products.forEach(p => {
      sql += `INSERT INTO products (id, sku, name, stock, sellPrice) VALUES ('${p.id}', '${p.sku}', '${p.name}', ${p.stock}, ${p.sellPrice});\n`;
    });

    sql += `\nCREATE TABLE IF NOT EXISTS sales (id TEXT PRIMARY KEY, date TEXT, total INTEGER);\n`;
    db.sales.forEach(s => {
      sql += `INSERT INTO sales (id, date, total) VALUES ('${s.id}', '${s.date}', ${s.total});\n`;
    });

    const blob = new Blob([sql], { type: "text/plain" });
    saveAs(blob, `backup_pos_${format(new Date(), 'yyyy-MM-dd')}.sql`);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.products && json.settings) {
          if (confirm('Apakah anda yakin ingin me-restore database ini? Data lama akan tertimpa.')) {
            onRestore(json);
          }
        } else {
          alert('Format file tidak valid!');
        }
      } catch (err) {
        alert('Gagal membaca file!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Download className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Manajemen Data & Backup</h2>
          <p className="text-slate-400 text-sm">Amankan data transaksi dan inventori anda secara berkala</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Download size={20} className="text-emerald-400" /> Ekspor Basis Data
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Pilih format file dibawah ini untuk mencadangkan data anda. Kami sangat merekomendasikan format <strong>XLSX (Excel)</strong> untuk keperluan laporan spreadsheet.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={exportXLSX}
              className="flex flex-col items-center justify-center p-6 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 rounded-2xl transition-all group"
            >
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="text-white" size={24} />
              </div>
              <span className="font-bold text-emerald-400 uppercase tracking-widest text-[10px]">Excel (XLSX)</span>
              <span className="text-[9px] text-emerald-500/60 mt-1 font-medium">PALING DIREKOMENDASIKAN</span>
            </button>

            <button 
              onClick={exportJSON}
              className="flex flex-col items-center justify-center p-6 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 rounded-2xl transition-all group"
            >
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Package className="text-white" size={24} />
              </div>
              <span className="font-bold text-indigo-400 uppercase tracking-widest text-[10px]">Basis Data (JSON)</span>
              <span className="text-[9px] text-indigo-500/60 mt-1 font-medium">BISA DI-RESTORE KEMBALI</span>
            </button>

            <button 
              onClick={exportCSV}
              className="flex flex-col items-center justify-center p-6 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-all group"
            >
              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <List className="text-white" size={20} />
              </div>
              <span className="font-bold text-slate-300 uppercase tracking-widest text-[10px]">Comma Separated (CSV)</span>
            </button>

            <button 
              onClick={exportSQL}
              className="flex flex-col items-center justify-center p-6 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-all group"
            >
              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <DbIcon className="text-white" size={20} />
              </div>
              <span className="font-bold text-slate-300 uppercase tracking-widest text-[10px]">SQL Script (SQL)</span>
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="card p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload size={20} className="text-indigo-400" /> Restore Basis Data
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Unggah file backup dalam format <strong>.json</strong> yang telah anda unduh sebelumnya untuk mengembalikan data sistem.
            </p>
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl cursor-pointer transition-all bg-slate-900/30 group">
              <Upload className="text-slate-600 mb-4 group-hover:text-indigo-400 group-hover:-translate-y-1 transition-all" size={32} />
              <span className="text-white font-bold text-center">Pilih File Backup (.json)</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Maksimal 50MB</span>
              <input type="file" accept=".json" className="hidden" onChange={handleRestoreFile} />
            </label>
          </div>

          <div className="card p-8 bg-amber-600/5 border-amber-500/20 space-y-6">
            <h3 className="text-lg font-bold text-amber-500 flex items-center gap-2">
              <Cloud size={20} /> Sinkronisasi Cloud (Google Sheets)
            </h3>
            <p className="text-sm text-slate-400">
              Gunakan fitur ini untuk <strong>mengirim paksa (Force Sync)</strong> seluruh data lokal ke Google Sheets sekaligus. Berguna jika data di spreadsheet tertinggal.
            </p>
            <button 
              onClick={async () => {
                if (confirm('Lakukan sinkronisasi total ke Google Sheets? Semua data di Google Sheets akan diperbarui sesuai data aplikasi saat ini.')) {
                  const success = await onAction('SYNC_ALL', db);
                  if (success) alert('Data berhasil disinkronkan ke Google Sheets!');
                }
              }}
              className="w-full py-4 bg-amber-600/10 hover:bg-amber-600 text-amber-500 hover:text-white border border-amber-500/30 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> SYNC TOTAL KE CLOUD
            </button>
          </div>

          <div className="card p-8 border border-rose-500/30 bg-rose-500/5 space-y-6">
            <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <RotateCcw size={20} /> Reset Total Sistem
            </h3>
            <p className="text-sm text-slate-400">
              Tindakan ini akan <strong>menghapus SELURUH riwayat transaksi</strong> dan mereset <strong>stok produk menjadi 0</strong>. Data produk, pelanggan, dan supplier akan tetap aman.
            </p>
            <button 
              onClick={async (e) => {
                e.preventDefault();
                const step1 = confirm('Backup Dulu Basis Data');
                if (!step1) return;
                
                const step2 = confirm('LANJUTKAN');
                if (!step2) return;

                try {
                  const success = await onAction('RESET_DATABASE', {});
                  if (success) {
                    alert('BERHASIL! Seluruh transaksi telah dihapus dan stok produk telah di-reset menjadi 0. Data produk, pelanggan, dan supplier tetap aman.');
                    window.location.reload();
                  } else {
                    alert('GAGAL! Data tidak terhapus. Silakan lengkapi URL Backend di Pengaturan.');
                  }
                } catch (err) {
                  alert('Error: ' + (err instanceof Error ? err.message : 'Terjadi kesalahan sistem'));
                }
              }}
              className="w-full btn bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-black text-lg transition-all shadow-xl active:scale-95"
            >
              RESET SELURUH DATA SISTEM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPage({ db, setActiveTab, onUpdate, onRestore, onReset }: { 
  db: Database, 
  setActiveTab: (tab: string) => void,
  onUpdate: (s: any) => void,
  onRestore: (data: any) => void,
  onReset: () => any
}) {
  const [form, setForm] = useState(db.settings);

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Pengaturan Sistem</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-8 space-y-6">
            <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-4 flex items-center gap-2">
              <SettingsIcon size={20} className="text-indigo-400" /> Profil Toko
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="col-span-full">
                <label className="label">Nama Toko</label>
                <input type="text" className="input-field" value={form.storeName} onChange={e => setForm({...form, storeName: e.target.value})} />
              </div>
              <div className="col-span-full">
                <label className="label">Alamat Lengkap</label>
                <textarea className="input-field h-20" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
              <div>
                <label className="label">Nomor WhatsApp</label>
                <input type="text" className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div>
                <label className="label">Mata Uang</label>
                <input type="text" className="input-field" value={form.currency} disabled />
              </div>
              <div>
                <label className="label">PPN (%)</label>
                <input type="number" className="input-field" value={form.taxRate} onChange={e => setForm({...form, taxRate: Number(e.target.value)})} />
              </div>
              <div>
                 <label className="label">Format Tanggal</label>
                 <input type="text" className="input-field" value={form.dateFormat} disabled />
              </div>
              <div>
                <label className="label">Min. Belanja (Diskon Otomatis)</label>
                <input type="number" className="input-field" value={form.minSpendForDiscount} onChange={e => setForm({...form, minSpendForDiscount: Number(e.target.value)})} />
              </div>
              <div>
                <label className="label">Nilai Diskon Otomatis</label>
                <div className="flex gap-2">
                  <input type="number" className="input-field" value={form.autoDiscountValue} onChange={e => setForm({...form, autoDiscountValue: Number(e.target.value)})} />
                  <select className="input-field w-32" value={form.autoDiscountType} onChange={e => setForm({...form, autoDiscountType: e.target.value as any})}>
                    <option value="fixed">IDR</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
              </div>
              <div className="col-span-full">
                <label className="label text-indigo-400 font-bold">Google Apps Script URL (Backend Eksternal)</label>
                <input 
                  type="text" 
                  className="input-field h-12 border-indigo-500/30" 
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={form.gasUrl || ''} 
                  onChange={e => setForm({...form, gasUrl: e.target.value})} 
                />
                <p className="text-[10px] text-slate-500 mt-2 italic">
                  Isi URL Web App setelah melakukan deployment di Apps Script. 
                  {DEFAULT_BACKEND_URL ? `Kosongkan untuk menggunakan URL bawaan (Direct Code).` : `Kosongkan untuk menggunakan backend internal Node.js.`}
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-800 flex justify-end">
               <button onClick={() => { onUpdate(form); alert('Pengaturan diperbarui!'); }} className="btn-primary px-8">Simpan Pengaturan</button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-8 bg-indigo-600/10 border-indigo-500/30 space-y-4">
             <h3 className="font-bold text-lg text-indigo-400 flex items-center gap-2">
              <Download size={20} /> Manajemen Data
            </h3>
            <p className="text-sm text-slate-400">
              Sekarang fitur Backup, Restore, dan Reset Database telah dipindahkan ke halaman khusus Manajemen Data untuk keamanan lebih baik.
            </p>
            <button 
              onClick={() => setActiveTab('backup')}
              className="w-full btn-primary py-4 text-sm font-black tracking-widest uppercase"
            >
              Buka Manajemen Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersPage({ db, onUpsert, onDelete }: { 
  db: Database, 
  onUpsert: (u: User) => void,
  onDelete: (id: string) => void
}) {
  const [modal, setModal] = useState<Partial<User> | null>(null);

  const availablePermissions = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pos', label: 'Kasir (POS)' },
    { id: 'inventory', label: 'Inventori' },
    { id: 'history', label: 'Riwayat' },
    { id: 'reports', label: 'Laporan' },
    { id: 'returns', label: 'Retur' },
    { id: 'opname', label: 'Stok Opname' },
    { id: 'purchases', label: 'Pembelian' },
    { id: 'customers', label: 'Pelanggan' },
    { id: 'suppliers', label: 'Supplier' },
    { id: 'users', label: 'Manajemen User' },
    { id: 'settings', label: 'Pengaturan' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Manajemen User</h2>
          <p className="text-slate-400 text-sm">Kelola akses karyawan dan kasir</p>
        </div>
        <button 
          onClick={() => setModal({ 
            name: '', username: '', password: '', role: 'kasir', 
            permissions: ['pos'] 
          })} 
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus size={18} /> Tambah User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {db.users.map(user => (
          <div key={user.id} className="card p-6 flex flex-col gap-4 relative group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 font-bold text-xl uppercase">
                {user.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-white">{user.name}</h4>
                <p className="text-xs text-slate-500">@{user.username} • {user.role.toUpperCase()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hak Akses:</p>
              <div className="flex flex-wrap gap-1">
                {user.permissions?.map(p => (
                  <span key={p} className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[9px] font-medium">
                    {availablePermissions.find(ap => ap.id === p)?.label || p}
                  </span>
                )) || <span className="text-[9px] text-slate-600">Full Access (Admin)</span>}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex gap-2">
              <button 
                onClick={() => setModal(user)}
                className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Edit
              </button>
              {user.username !== 'admin' && (
                <button 
                  onClick={() => confirm('Hapus user ini?') && onDelete(user.id)}
                  className="py-2 px-3 rounded-lg bg-rose-950/30 hover:bg-rose-900 text-rose-500 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* User Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col max-h-[95vh]"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-white">{modal.id ? 'Edit User' : 'Tambah User Baru'}</h3>
              <button onClick={() => setModal(null)} className="text-slate-500 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto scrollbar-thin">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Nama Lengkap (Karyawan)</label>
                  <input type="text" className="input-field" value={modal.name} onChange={e => setModal({...modal, name: e.target.value})} />
                </div>
                <div>
                  <label className="label">Username</label>
                  <input type="text" className="input-field" value={modal.username} onChange={e => setModal({...modal, username: e.target.value})} />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input type="password" placeholder="••••••••" className="input-field" value={modal.password} onChange={e => setModal({...modal, password: e.target.value})} />
                </div>
                <div>
                  <label className="label">Role</label>
                  <select className="input-field" value={modal.role} onChange={e => setModal({...modal, role: e.target.value as any})}>
                    <option value="kasir">Kasir</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label mb-3">Hak Akses Menu</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availablePermissions.map(perm => (
                    <label key={perm.id} className="flex items-center gap-2 p-3 bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors border border-slate-700">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                        checked={modal.permissions?.includes(perm.id)}
                        onChange={(e) => {
                          const current = modal.permissions || [];
                          if (e.target.checked) {
                            setModal({ ...modal, permissions: [...current, perm.id] });
                          } else {
                            setModal({ ...modal, permissions: current.filter(p => p !== perm.id) });
                          }
                        }}
                      />
                      <span className="text-xs text-white font-medium">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
              <button onClick={() => setModal(null)} className="btn-secondary">Batal</button>
              <button onClick={() => { onUpsert(modal as User); setModal(null); }} className="btn-primary">Simpan User</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
