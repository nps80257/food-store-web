import React, { useState, useEffect } from 'react';
import { FoodStore, SeatStatus, STATUS_LABELS, FOOD_THEMES, Reservation } from './types';
import StatsGrid from './components/StatsGrid';
import MobilePreview from './components/MobilePreview';
import StoreForm from './components/StoreForm';
import LoginOrRegister from './components/LoginOrRegister';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  Clock, 
  Edit3, 
  Trash2, 
  Filter, 
  Sparkles, 
  UtensilsCrossed,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Key,
  Lock,
  User,
  LogOut,
  Sparkle,
  Users,
  Check,
  CheckCircle,
  Bell,
  Upload,
  Calendar,
  X,
  LayoutDashboard,
  Store,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'food_stores_admin_data';
const RESERVATIONS_STORAGE_KEY = 'food_stores_reservations_data';

// Custom Taiwan local time formatted string
const getFormattedNow = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

const DEFAULT_STORES: FoodStore[] = [
  {
    id: 'store-1',
    name: '一葉豚骨拉麵 (大安總店)',
    address: '台北市大安區信義路四段 123 號 1 樓',
    phone: '02-2708-8899',
    businessHours: '11:30 - 14:30, 17:30 - 21:30',
    status: 'available',
    notes: '💡 每日熬煮 12 小時老火豚骨湯頭，現場座位限 12 席。建議用餐時間儘早到場！',
    imageCategory: 'ramen',
    ownerUsername: 'ramen123',
    ownerPassword: '123',
    lastUpdated: getFormattedNow()
  },
  {
    id: 'store-2',
    name: '微光精品咖啡館 (公益特區)',
    address: '台中市西區公益路二段 45 號',
    phone: '04-2321-4321',
    businessHours: '09:00 - 18:00 (每週一公休)',
    status: 'almost-full',
    notes: '☕ 招牌手沖耶加雪菲與草莓司康。全店座位配有充足插頭與免費 Wi-Fi，不限使用時間。',
    imageCategory: 'coffee',
    ownerUsername: 'coffee123',
    ownerPassword: '123',
    lastUpdated: getFormattedNow()
  },
  {
    id: 'store-3',
    name: '鼎珍極致麻辣鴛鴦鍋',
    address: '高雄市鼓山區美術東二路 88 號 2 樓',
    phone: '07-555-9876',
    businessHours: '12:00 - 02:00 (凌晨)',
    status: 'full',
    notes: '🍲 極致辛香四川老火鍋。用餐時段限 120 分鐘。本日晚餐時段預約已全客滿。',
    imageCategory: 'hotpot',
    ownerUsername: 'hotpot123',
    ownerPassword: '123',
    lastUpdated: getFormattedNow()
  },
  {
    id: 'store-4',
    name: '貓咪與舒芙蕾法式甜點',
    address: '台北市中山區中山北路二段 42 巷 15 號',
    phone: '02-2567-1122',
    businessHours: '13:00 - 20:00 (每週二公休)',
    status: 'available',
    notes: '🍰 軟綿舒芙蕾與精緻茶歐蕾。店內有 4 隻可愛店貓自由走動，禁止攜帶寵物入內。',
    imageCategory: 'dessert',
    ownerUsername: 'dessert123',
    ownerPassword: '123',
    lastUpdated: getFormattedNow()
  },
  {
    id: 'store-5',
    name: '巨無霸起司漢堡工廠 (信義店)',
    address: '台北市信義區忠孝東路五段 230 號',
    phone: '02-2756-3399',
    businessHours: '11:00 - 22:00',
    status: 'almost-full',
    notes: '🍔 美式熔岩起司手打漢堡，生啤酒買一送一活動進行中！',
    imageCategory: 'burger',
    ownerUsername: 'burger123',
    ownerPassword: '123',
    lastUpdated: getFormattedNow()
  }
];

const DEFAULT_RESERVATIONS: Reservation[] = [
  {
    id: 'res-1',
    storeId: 'store-1',
    name: '林建國',
    phone: '0912-333-444',
    people: 3,
    createdAt: '12:05',
    status: 'waiting'
  },
  {
    id: 'res-2',
    storeId: 'store-1',
    name: '張雅婷',
    phone: '0928-888-999',
    people: 2,
    createdAt: '12:12',
    status: 'waiting'
  },
  {
    id: 'res-3',
    storeId: 'store-2',
    name: '王小明',
    phone: '0933-777-111',
    people: 1,
    createdAt: '12:15',
    status: 'waiting'
  }
];

export default function App() {
  const [stores, setStores] = useState<FoodStore[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SeatStatus>('all');
  
  // View mode分流狀態: 'platform' (總平台) 與 'store-portal' (店家端)
  const [viewMode, setViewMode] = useState<'platform' | 'store-portal'>('store-portal');

  // Login / Workspace states
  const [loggedInStoreId, setLoggedInStoreId] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Form handling state (Public Admin context)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<FoodStore | null>(null);

  // Load from local storage or set defaults
  useEffect(() => {
    // 1. Stores
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    let storesList: FoodStore[] = [];
    if (saved) {
      try {
        storesList = JSON.parse(saved);
        // Ensure default accounts exist for legacy data, and force update preloaded store credentials
        let mutated = false;
        storesList = storesList.map((s) => {
          const defaultPreset = DEFAULT_STORES.find(ds => ds.id === s.id);
          if (defaultPreset) {
            if (s.ownerUsername !== defaultPreset.ownerUsername || s.ownerPassword !== defaultPreset.ownerPassword) {
              mutated = true;
              return {
                ...s,
                ownerUsername: defaultPreset.ownerUsername,
                ownerPassword: defaultPreset.ownerPassword
              };
            }
          } else if (!s.ownerUsername) {
            mutated = true;
            return {
              ...s,
              ownerUsername: `owner_${Math.floor(Math.random() * 900 + 100)}`,
              ownerPassword: '123'
            };
          }
          return s;
        });
        setStores(storesList);
        if (mutated) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storesList));
        }
      } catch (e) {
        storesList = DEFAULT_STORES;
        setStores(DEFAULT_STORES);
      }
    } else {
      storesList = DEFAULT_STORES;
      setStores(DEFAULT_STORES);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_STORES));
    }

    if (storesList.length > 0) {
      setSelectedStoreId(storesList[0].id);
    }

    // 2. Reservations
    const savedRes = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    if (savedRes) {
      try {
        setReservations(JSON.parse(savedRes));
      } catch (e) {
        setReservations(DEFAULT_RESERVATIONS);
      }
    } else {
      setReservations(DEFAULT_RESERVATIONS);
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_RESERVATIONS));
    }

  }, []);

  // Save stores helper
  const saveStoresAndSync = (newStores: FoodStore[]) => {
    setStores(newStores);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newStores));
  };

  // Save reservations helper
  const saveReservationsAndSync = (newRes: Reservation[]) => {
    setReservations(newRes);
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(newRes));
  };

  // Add guest reservation in real-time
  const handleAddReservation = (storeId: string, name: string, phone: string, people: number) => {
    const now = new Date();
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newRes: Reservation = {
      id: 'res-' + Date.now(),
      storeId,
      name,
      phone,
      people,
      createdAt: timeFormatted,
      status: 'waiting'
    };
    const updated = [...reservations, newRes];
    saveReservationsAndSync(updated);

    console.log(`New reservation for ${storeId}: ${name}`);
  };

  // Update specific Guest Reservation status from waitlist
  const handleUpdateReservationStatus = (id: string, newStatus: 'waiting' | 'called' | 'completed' | 'cancelled') => {
    const updated = reservations.map(r => r.id === id ? { ...r, status: newStatus } : r);
    saveReservationsAndSync(updated);
  };

  // Create or Update Store info (Admin / Owner Context)
  const handleSaveStore = (formData: {
    name: string;
    address: string;
    phone: string;
    businessHours: string;
    status: SeatStatus;
    notes?: string;
    imageCategory: string;
    ownerUsername?: string;
    ownerPassword?: string;
    customImage?: string;
  }) => {
    if (editingStore) {
      // Edit mode
      const updated = stores.map((s) => {
        if (s.id === editingStore.id) {
          return {
            ...s,
            ...formData,
            lastUpdated: getFormattedNow()
          };
        }
        return s;
      });
      saveStoresAndSync(updated);
      setSelectedStoreId(editingStore.id);
    } else {
      // Add mode
      const newStore: FoodStore = {
        id: 'store-' + Date.now(),
        ...formData,
        lastUpdated: getFormattedNow()
      };
      const updated = [newStore, ...stores];
      saveStoresAndSync(updated);
      setSelectedStoreId(newStore.id);
    }

    // Close form
    setIsFormOpen(false);
    setEditingStore(null);
  };

  // Delete Store (Admin Context)
  const handleDeleteStore = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('確定要刪除這家店家的所有檔案嗎？此動作將無法復原。')) {
      const updated = stores.filter(s => s.id !== id);
      saveStoresAndSync(updated);
      
      if (selectedStoreId === id) {
        setSelectedStoreId(updated.length > 0 ? updated[0].id : null);
      }
      if (loggedInStoreId === id) {
        setLoggedInStoreId(null);
      }
    }
  };

  // Quick state update switch on store list row
  const handleQuickStatusChange = (id: string, newStatus: SeatStatus, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = stores.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          status: newStatus,
          lastUpdated: getFormattedNow()
        };
      }
      return s;
    });
    saveStoresAndSync(updated);
  };

  // Trigger login workflow from top-bar modal
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const matchedStore = stores.find(
      s => s.ownerUsername?.toLowerCase() === loginUsername.trim().toLowerCase() && 
           s.ownerPassword === loginPassword
    );

    if (matchedStore) {
      setLoggedInStoreId(matchedStore.id);
      setSelectedStoreId(matchedStore.id);
      setIsLoginModalOpen(false);
      setLoginUsername('');
      setLoginPassword('');
      // 自動轉入店家自營管理畫面，給予最佳操作體驗
      setViewMode('store-portal');
    } else {
      setLoginError('❌ 帳號或密碼錯誤。請再次確認預設帳號 (如 ramen123, 密碼 123)。');
    }
  };

  const handleLogout = () => {
    setLoggedInStoreId(null);
  };

  // Start Editing (Admin / Owner Context)
  const triggerEdit = (store: FoodStore, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStore(store);
    setIsFormOpen(true);
  };

  // Start Creating (Admin Context)
  const triggerAdd = () => {
    setEditingStore(null);
    setIsFormOpen(true);
  };

  // Get current active store
  const selectedStore = stores.find(s => s.id === selectedStoreId) || null;
  const loggedInStore = stores.find(s => s.id === loggedInStoreId) || null;

  // Filtered store calculations based on query parameters (Only used in Platform admin directory)
  const filteredStores = stores.filter((store) => {
    const matchesSearch = 
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      store.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || store.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-800 dark:text-zinc-100 flex flex-col transition-colors" id="applet-root">
      
      {/* GLOBAL BANNER HEADER */}
      <header className="hidden" id="applet-header"></header>

      {/* LOGIN MODAL */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 relative"
            >
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/40 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto text-xl animate-pulse">
                  🔑
                </div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">店家快捷登入驗證</h3>
                <p className="text-xs text-zinc-400">輸入店家管理帳號，即可秒級更改座位與預約狀態</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-450 text-xs p-3 rounded-xl border border-red-200 dark:border-red-900/60 font-medium">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">登入帳號 (Username)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text"
                      required
                      placeholder="例如: ramen123"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full text-sm pl-9 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">登入密碼 (Password)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                    <input 
                      type="password"
                      required
                      placeholder="例如: 123"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full text-sm pl-9 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                  </div>
                </div>

                <div className="bg-amber-50/70 dark:bg-zinc-950 p-3 rounded-xl border border-amber-100/50 dark:border-zinc-800 flex gap-2 text-[10px] text-zinc-500">
                  <span className="text-amber-500 font-bold shrink-0">💡 提示：</span>
                  <div>
                    您可以登入預設的店家測試。範例有：<br />
                    - 一葉豚骨拉麵 帳號：<strong>ramen123</strong> / 密碼：<strong>123</strong><br />
                    - 微光精品咖啡 帳號：<strong>coffee123</strong> / 密碼：<strong>123</strong>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98"
                >
                  安全登入
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6 animate-fade-in" id="dashboard-main">
        
        {/* ==================== 1. 店家獨立經營端 (店家後台) ==================== */}
        {viewMode === 'store-portal' && (
          <div className="space-y-6" id="owner-terminal-scope">
            
            {/* 1A. 未登入狀態：完全不出現全部統計、搜尋、店家資料列表。 只出現精美自建帳號及登入元件 */}
            {!loggedInStoreId ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="py-10"
              >
                <LoginOrRegister 
                  stores={stores}
                  onLoginSuccess={(id) => {
                    setLoggedInStoreId(id);
                    setSelectedStoreId(id);
                    // Add success prompt
                  }}
                  onRegisterSuccess={(newStore) => {
                    // Save and auto-login
                    const updated = [newStore, ...stores];
                    saveStoresAndSync(updated);
                    setLoggedInStoreId(newStore.id);
                    setSelectedStoreId(newStore.id);
                  }}
                />
              </motion.div>
            ) : (
              
              /* 1B. 已登入狀態：唯獨顯現該店家的控制台與專屬右側 Live 電腦預覽，同樣不顯示其他店家的任何干擾列表 */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 左側：登入店家的專屬工作台 */}
                <div className="lg:col-span-8 flex flex-col space-y-6">
                  
                  {/* Workspace Card Header & Controller */}
                  <motion.section 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-zinc-900 text-white rounded-3xl p-6 border border-zinc-800 shadow-xl space-y-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    {/* Header inside Workspace */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center text-base font-black">
                          👑
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black tracking-tight text-white">
                              {loggedInStore.name} 
                            </h2>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold px-2 py-0.5 rounded-full">
                              正常運作中
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400">目前身分：店家經理 (獨立工作大廳。此處已完美過濾其它店家的資訊與干擾)</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">最後更新：</span>
                          <span className="font-mono bg-zinc-850 text-zinc-300 py-1 px-2.5 rounded-md text-[11px] border border-zinc-800">
                            {loggedInStore.lastUpdated}
                          </span>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-bold py-1 px-3 rounded-md text-[11px] flex items-center gap-1.5 transition-colors border border-zinc-700 pointer-events-auto cursor-pointer"
                        >
                          <LogOut className="w-3" />
                          <span>登出店家</span>
                        </button>
                      </div>
                    </div>

                    {/* Grid 2 Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Sub-column 1: Live Seat Controller */}
                      <div className="space-y-4 bg-zinc-950/40 border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between">
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4" /> ➀ 客席當前空位狀態
                          </h3>
                          <p className="text-[11px] text-zinc-400 leading-relaxed">
                            點擊下方切換，該店裝的手機 Live 預覽端與消費者總平台將在一微秒內同步更變：
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 py-3">
                          {/* Available */}
                          <button
                            onClick={() => handleQuickStatusChange(loggedInStore.id, 'available')}
                            className={`py-3 px-1 text-xs font-bold rounded-xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                              loggedInStore.status === 'available'
                                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-450 font-extrabold scale-102 ring-2 ring-emerald-500/30 shadow'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-450 hover:border-zinc-750 hover:text-zinc-300'
                            }`}
                          >
                            <span className="text-xl">🟢</span>
                            <span>有空位</span>
                          </button>

                          {/* Almost full */}
                          <button
                            onClick={() => handleQuickStatusChange(loggedInStore.id, 'almost-full')}
                            className={`py-3 px-1 text-xs font-bold rounded-xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                              loggedInStore.status === 'almost-full'
                                ? 'bg-amber-600/30 border-amber-500 text-amber-440 font-extrabold scale-102 ring-2 ring-amber-500/30 shadow'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-450 hover:border-zinc-750 hover:text-zinc-300'
                            }`}
                          >
                            <span className="text-xl">🟡</span>
                            <span>快客滿</span>
                          </button>

                          {/* Full */}
                          <button
                            onClick={() => handleQuickStatusChange(loggedInStore.id, 'full')}
                            className={`py-3 px-1 text-xs font-bold rounded-xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                              loggedInStore.status === 'full'
                                ? 'bg-rose-600/30 border-rose-500 text-rose-440 font-extrabold scale-102 ring-2 ring-rose-500/30 shadow'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-450 hover:border-zinc-750 hover:text-zinc-300'
                            }`}
                          >
                            <span className="text-xl">🔴</span>
                            <span>客滿</span>
                          </button>
                        </div>

                        {/* Interactive edit store button */}
                        <button
                          onClick={(e) => triggerEdit(loggedInStore, e)}
                          className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-250 border border-zinc-750 hover:border-zinc-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>修改我的營業時間、地址與特色照</span>
                        </button>
                      </div>

                      {/* Sub-column 2: Current store physical status card */}
                      <div className="space-y-3 bg-zinc-950/40 border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between text-xs">
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">🏪 門店公開卡片詳情</h4>
                          <h4 className="text-sm font-bold text-white">{loggedInStore.name}</h4>
                        </div>
                        
                        <div className="space-y-2 text-zinc-400 font-medium">
                          <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" /> <span>{loggedInStore.address}</span></p>
                          <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" /> <span>{loggedInStore.businessHours}</span></p>
                          <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" /> <span className="font-mono">電話: {loggedInStore.phone}</span></p>
                        </div>

                        <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-805 text-[11px] leading-relaxed italic text-zinc-400">
                          {loggedInStore.notes || '暫無自訂店家簡介。'}
                        </div>
                      </div>

                    </div>

                  </motion.section>

                  {/* 1C. 獨立預約排隊管理者模組 (Reservation waitlist workspace for this store) */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-amber-500" />
                          <span>【即時預約排隊表單管理】(本門店專屬)</span>
                        </h3>
                        <p className="text-[11px] text-zinc-400 mt-1">消費者可在右側手機模擬器內點擊「線上預約」填寫，即可立刻傳送至此处叫號及帶位</p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 border border-emerald-250/20 font-mono font-bold py-1 px-2 rounded-full animate-pulse">
                        ● Live Synchronizing
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {reservations.filter(r => r.storeId === loggedInStore.id).length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-center text-zinc-400 py-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                          <span className="text-3xl mb-1">📋</span>
                          <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">目前尚無線客戶預約登記</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">您可以在右側的手機 live 模擬器中，試著新增一筆顧客預約測試！</p>
                        </div>
                      ) : (
                        reservations.filter(r => r.storeId === loggedInStore.id).map((res, index) => {
                          return (
                            <div 
                              key={res.id} 
                              className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 text-sm transition-all ${
                                res.status === 'called' 
                                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-450' 
                                  : res.status === 'completed'
                                    ? 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-150 dark:border-zinc-850 opacity-60'
                                    : res.status === 'cancelled'
                                      ? 'bg-zinc-50 dark:bg-zinc-950/20 border-zinc-150 dark:border-zinc-850 opacity-40 line-through'
                                      : 'bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-850 shadow-xs'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`font-bold px-2.5 py-1 rounded-lg font-mono text-xs ${
                                  res.status === 'called'
                                    ? 'bg-amber-500 text-white'
                                    : res.status === 'completed'
                                      ? 'bg-emerald-600 text-white'
                                      : res.status === 'cancelled'
                                        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                                        : 'bg-zinc-900 text-white dark:bg-zinc-800'
                                }`}>
                                  A-{String(index + 1).padStart(2, '0')}
                                </span>
                                <div>
                                  <p className="font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <span>{res.name} 先生/女士</span>
                                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-md font-normal">
                                      {res.people} 人座
                                    </span>
                                  </p>
                                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                                    登記同聯電話：{res.phone} • 時間：{res.createdAt}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {res.status === 'waiting' && (
                                  <button
                                    onClick={() => handleUpdateReservationStatus(res.id, 'called')}
                                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-lg text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                                  >
                                    <span>📞 叫號</span>
                                  </button>
                                )}
                                {res.status === 'called' && (
                                  <button
                                    onClick={() => handleUpdateReservationStatus(res.id, 'completed')}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-600 text-white font-extrabold rounded-lg text-xs transition-colors shadow-xs flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" /> 
                                    <span>帶位入座</span>
                                  </button>
                                )}
                                {res.status !== 'completed' && res.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleUpdateReservationStatus(res.id, 'cancelled')}
                                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-rose-500 rounded-lg border border-transparent hover:border-zinc-200/40"
                                    title="取消此預約"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                                {res.status === 'completed' && (
                                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-black px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/20 rounded-md">
                                    ✓ 已入座就位
                                  </span>
                                )}
                                {res.status === 'cancelled' && (
                                  <span className="text-xs text-zinc-400 font-bold px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 rounded-md">
                                    已取消
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

                {/* 右側：專屬的手機顧客預覽 */}
                <div className="lg:col-span-4" id="right-preview-column">
                  <div className="sticky top-40 space-y-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/85 dark:border-zinc-850 p-4 rounded-2xl shadow-xs">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        <span className="text-base">📱</span> 
                        <span>手機端 Live 顧客預覽</span>
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-1">此處僅展示您自營門店的即時效果。顧客可在此預約登記，狀態會與左邊無縫同步。</p>
                    </div>

                    <AnimatePresence mode="wait">
                      {isFormOpen ? (
                        <motion.div
                          key="form-panel-owner"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                        >
                          <StoreForm 
                            store={editingStore}
                            onSave={handleSaveStore}
                            onCancel={() => {
                              setIsFormOpen(false);
                              setEditingStore(null);
                            }}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="preview-panel-owner"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                        >
                          <MobilePreview 
                            store={loggedInStore} 
                            onAddReservation={handleAddReservation} 
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ==================== 2. 總平台管理者端 (總後台) ==================== */}
        {viewMode === 'platform' && (
          <div className="space-y-6 animate-fade-in" id="platform-scope">
            
            {/* STATS COUNT GRID (Only displayed in Platform Admin) */}
            <StatsGrid stores={stores} />

            {/* WORKPLACE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="workplace-grid">
              
              {/* LEFT COLUMN: STORES MANAGER AREA (lg:col-span-8) */}
              <section className="lg:col-span-8 flex flex-col space-y-4" id="left-manager-column">
                
                {/* SEARCH AND FILTERS TOOLBAR */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    
                    {/* Search Bar */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                      <input 
                        type="text" 
                        placeholder="搜尋店名、特定地址或商圈..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-sm pl-10 pr-4 py-2.5 border border-zinc-200 dark:border-zinc-850 rounded-xl bg-zinc-50 dark:bg-zinc-955 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 dark:focus:border-amber-400 text-zinc-900 dark:text-zinc-50 transition-all placeholder:text-zinc-400"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3.5 top-2.5 text-xs text-zinc-400 hover:text-zinc-650"
                        >
                          清除
                        </button>
                      )}
                    </div>

                    {/* Create Trigger Button */}
                    <button
                      onClick={triggerAdd}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> 建立新店家及帳號
                    </button>

                  </div>

                  {/* Filtering tabs */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/65">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                        <Filter className="w-3.5 h-3.5 text-zinc-400" /> 篩選狀態：
                      </span>
                      
                      {/* Filter tab buttons */}
                      <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                          statusFilter === 'all'
                            ? 'bg-zinc-900 dark:bg-zinc-105 border-zinc-900 dark:border-zinc-105 text-white dark:text-zinc-900 font-bold'
                            : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 hover:text-zinc-800'
                        }`}
                      >
                        全部 ({stores.length})
                      </button>

                      <button
                        onClick={() => setStatusFilter('available')}
                        className={`px-3 py-1 text-xs rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                          statusFilter === 'available'
                            ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                            : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20'
                        }`}
                      >
                        🟢 有空位 ({stores.filter(s => s.status === 'available').length})
                      </button>

                      <button
                        onClick={() => setStatusFilter('almost-full')}
                        className={`px-3 py-1 text-xs rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                          statusFilter === 'almost-full'
                            ? 'bg-amber-500 border-amber-500 text-white font-bold'
                            : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-950/20'
                        }`}
                      >
                        🟡 快客滿 ({stores.filter(s => s.status === 'almost-full').length})
                      </button>

                      <button
                        onClick={() => setStatusFilter('full')}
                        className={`px-3 py-1 text-xs rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                          statusFilter === 'full'
                            ? 'bg-rose-600 border-rose-600 text-white font-bold'
                            : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-rose-600 dark:text-rose-450 hover:bg-rose-50/40 dark:hover:bg-rose-955/20'
                        }`}
                      >
                        🔴 客滿 ({stores.filter(s => s.status === 'full').length})
                      </button>
                    </div>

                    <div className="text-[10px] text-zinc-450 flex items-center gap-1">
                      💡 點擊店家卡片可切換右側「手機 Live 預覽」
                    </div>
                  </div>
                </div>

                {/* STORES LIST GRID */}
                <div className="space-y-3" id="stores-list-wrapper">
                  <AnimatePresence mode="popLayout">
                    {filteredStores.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center"
                        id="no-match-stores"
                      >
                        <div className="text-3xl mb-3">🔍</div>
                        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">未能尋得符合條件之店家</h3>
                        <p className="text-xs text-zinc-500 mt-1 max-w-[300px] mx-auto">請嘗試變更您的搜尋標籤、篩選空位按鈕，或是直接點擊右上方的「建立新店家」。</p>
                      </motion.div>
                    ) : (
                      filteredStores.map((store) => {
                        const statusConfig = STATUS_LABELS[store.status];
                        const isSelected = selectedStoreId === store.id;
                        const cardTheme = FOOD_THEMES.find(t => t.id === store.imageCategory) || FOOD_THEMES[0];

                        return (
                          <motion.div
                            layout
                            key={store.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            onClick={() => {
                              setSelectedStoreId(store.id);
                              // Auto scroll or focus preview on mobile
                              if (window.innerWidth < 1024) {
                                document.getElementById('right-preview-column')?.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            className={`bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md cursor-pointer relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                              isSelected 
                                ? 'border-amber-500/80 ring-2 ring-amber-500/10' 
                                : 'border-zinc-200/80 dark:border-zinc-800/80'
                            }`}
                            id={`store-card-${store.id}`}
                          >
                            {/* Decorator strip */}
                            <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${statusConfig.bullet}`} />

                            {/* Store Info Left Body */}
                            <div className="flex items-start gap-4 flex-1">
                              {/* Mini visual indicator avatar */}
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-850 flex-shrink-0 relative border border-zinc-200/40 dark:border-zinc-850">
                                <img 
                                  referrerPolicy="no-referrer"
                                  src={store.customImage || cardTheme.image} 
                                  alt={store.name} 
                                  className="w-full h-full object-cover" 
                                />
                                <div className="absolute top-0.5 left-0.5 bg-black/60 text-[10px] p-0.5 leading-none rounded-xs">
                                  {store.customImage ? '📸' : cardTheme.icon}
                                </div>
                              </div>

                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-base leading-snug">
                                    {store.name}
                                  </h3>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig.color} ${statusConfig.bg} ${statusConfig.border}`}>
                                    {statusConfig.label}
                                  </span>
                                  
                                  {/* Account label indicator */}
                                  <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 py-0.5 px-1.5 rounded-md font-mono">
                                    🔑 帳號: {store.ownerUsername}
                                  </span>
                                </div>

                                {/* Info Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                  <span className="flex items-center gap-1 min-w-0">
                                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                    <span className="truncate">{store.address}</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                    <span className="truncate">{store.businessHours}</span>
                                  </span>
                                  <span className="flex items-center gap-1 sm:col-span-2 font-mono">
                                    <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                    <span>聯絡電話：{store.phone}</span>
                                  </span>
                                </div>

                                {/* Additional metadata: Last Updated Date/Time */}
                                <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/40">
                                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>最後更新時間：<strong className="font-semibold text-zinc-650 dark:text-zinc-300">{store.lastUpdated || '未知'}</strong></span>
                                </div>
                              </div>
                            </div>

                            {/* Store Action Right Body (Quick status editor & edit tools) */}
                            <div className="flex flex-row md:flex-col items-end gap-3 justify-between pt-3 md:pt-0 md:pl-4 border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800/60 shrink-0">
                              
                              {/* Quick Availability Trigger Group */}
                              <div className="text-left md:text-right w-full md:w-auto">
                                <span className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">
                                  快速切換狀態 (手動 Live)
                                </span>
                                <div className="inline-flex rounded-lg p-0.5 bg-zinc-105 dark:bg-zinc-800 border border-zinc-200/55 dark:border-zinc-800/60">
                                  <button
                                    title="設為有空位"
                                    onClick={(e) => handleQuickStatusChange(store.id, 'available', e)}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                      store.status === 'available'
                                        ? 'bg-emerald-500 text-white shadow-xs font-black'
                                        : 'text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400'
                                      }`}
                                  >
                                    有空位
                                  </button>
                                  <button
                                    title="設為快客滿"
                                    onClick={(e) => handleQuickStatusChange(store.id, 'almost-full', e)}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                      store.status === 'almost-full'
                                        ? 'bg-amber-500 text-white shadow-xs font-black'
                                        : 'text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400'
                                    }`}
                                  >
                                    快客滿
                                  </button>
                                  <button
                                    title="設為客滿"
                                    onClick={(e) => handleQuickStatusChange(store.id, 'full', e)}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                      store.status === 'full'
                                        ? 'bg-rose-500 text-white shadow-xs font-black'
                                        : 'text-zinc-400 hover:text-rose-500 dark:hover:text-rose-455'
                                    }`}
                                  >
                                    客滿
                                  </button>
                                </div>
                              </div>

                              {/* Detail Edit & Delete Buttons */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => triggerEdit(store, e)}
                                  className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-205 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-750/70 hover:border-zinc-350 dark:hover:border-zinc-700 rounded-lg transition-all cursor-pointer"
                                  title="編輯店家細節資料"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteStore(store.id, e)}
                                  className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/40 hover:border-rose-300 dark:hover:border-rose-900/60 rounded-lg transition-all cursor-pointer"
                                  title="刪除此店家"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                            </div>

                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>

              </section>

              {/* RIGHT COLUMN: PREVIEW PANEL OR DATA FORM (lg:col-span-4) */}
              <section className="lg:col-span-4" id="right-preview-column">
                <div className="sticky top-40 space-y-4">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-850 p-4 rounded-2xl shadow-xs">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                      <span className="text-base">📱</span> 
                      <span>智慧手機消費者端即時預覽</span>
                    </h4>
                    <p className="text-[10px] text-zinc-400 mt-1">模擬顧客手持行動地圖，檢視您的當前實況狀態，可點「預約」即時測試登記排隊。</p>
                  </div>

                  <AnimatePresence mode="wait">
                    {isFormOpen ? (
                      <motion.div
                        key="form-panel"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <StoreForm 
                          store={editingStore}
                          onSave={handleSaveStore}
                          onCancel={() => {
                            setIsFormOpen(false);
                            setEditingStore(null);
                          }}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="preview-panel"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <MobilePreview 
                          store={selectedStore} 
                          onAddReservation={handleAddReservation} 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

            </div>
          </div>
        )}

      </main>

      {/* SYSTEM INFO FOOTER */}
      <footer className="mt-12 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800/80 py-6 text-xs text-zinc-500 dark:text-zinc-550" id="platform-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="font-semibold flex items-center justify-center gap-1 text-zinc-650 dark:text-zinc-450">
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" /> 食品店家空位狀態Live管理終端
          </p>
          <p>
            本後台已自動整合 LocalStorage，您所建立或註冊的任何店家資料、自訂圖片、最後更新時間與排隊登記均會自動在本機持續保存。
          </p>
          <div className="pt-2 flex justify-center gap-3 text-[10px] text-zinc-400">
            <span>支援：店名、地址、電話、工作時間、自修、相片實時壓縮、店家管理員登入帳密、及無干擾之兩端安全管理。</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
