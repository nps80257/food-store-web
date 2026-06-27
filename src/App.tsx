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
  UserCheck,
  Compass,
  Smartphone
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

// Return a formatted time string for today at specific hours and minutes
const getTodayWithTime = (hours: number, minutes: number) => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(hours).padStart(2, '0');
  const min = String(minutes).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:00`;
};

// Calculate duration weights of seat status logs
const calculateStatusShares = (logs?: { status: SeatStatus; timestamp: string; availableSeats: number }[]) => {
  const shares: Record<SeatStatus, number> = {
    'available': 0,
    'almost-full': 0,
    'full': 0
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = (logs || []).filter(l => l.timestamp.startsWith(todayStr));

  if (todayLogs.length === 0) {
    return [
      { status: 'available' as const, minutes: 360, percentage: 60, label: '有空位' },
      { status: 'almost-full' as const, minutes: 180, percentage: 30, label: '快客滿' },
      { status: 'full' as const, minutes: 60, percentage: 10, label: '客滿' }
    ];
  }

  const sorted = [...todayLogs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const now = new Date();
  
  for (let i = 0; i < sorted.length; i++) {
    const start = new Date(sorted[i].timestamp);
    const end = (i < sorted.length - 1) 
      ? new Date(sorted[i + 1].timestamp) 
      : now;
    
    let diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) diffMs = 0;
    const diffMins = Math.round(diffMs / (1000 * 60));
    shares[sorted[i].status] = (shares[sorted[i].status] || 0) + diffMins;
  }

  const totalMin = Object.values(shares).reduce((sum, v) => sum + v, 0);

  if (totalMin <= 5) {
    const counts = { 'available': 0, 'almost-full': 0, 'full': 0 };
    todayLogs.forEach(l => { counts[l.status]++ });
    const tot = todayLogs.length || 1;
    return [
      { status: 'available' as const, minutes: counts['available'] * 60, percentage: Math.round((counts['available'] / tot) * 100) || 40, label: '有空位' },
      { status: 'almost-full' as const, minutes: counts['almost-full'] * 60, percentage: Math.round((counts['almost-full'] / tot) * 100) || 40, label: '快客滿' },
      { status: 'full' as const, minutes: counts['full'] * 60, percentage: Math.round((counts['full'] / tot) * 100) || 20, label: '客滿' }
    ];
  }

  return [
    { status: 'available' as const, minutes: shares['available'], percentage: Math.round((shares['available'] / totalMin) * 100), label: '有空位' },
    { status: 'almost-full' as const, minutes: shares['almost-full'], percentage: Math.round((shares['almost-full'] / totalMin) * 100), label: '快客滿' },
    { status: 'full' as const, minutes: shares['full'], percentage: Math.round((shares['full'] / totalMin) * 100), label: '客滿' }
  ];
};

const formatMinutes = (mins: number) => {
  if (mins <= 0) return '0 分鐘';
  const hrs = Math.floor(mins / 60);
  const leftMins = mins % 60;
  if (hrs > 0) {
    return `${hrs} 小時 ${leftMins} 分鐘`;
  }
  return `${leftMins} 分鐘`;
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
    lastUpdated: getFormattedNow(),
    availableSeats: 8,
    maxSeats: 12,
    estimatedWaitMinutes: 0,
    todayImpressions: 420,
    todayClicks: 210,
    favoritesCount: 35,
    navigationCount: 18,
    hourlyViews: {
      '11:00': 45,
      '12:00': 55,
      '18:00': 40,
      '19:00': 35,
      '20:00': 25,
      'other': 10
    },
    statusLogs: [
      { status: 'available', timestamp: getTodayWithTime(11, 30), availableSeats: 12 },
      { status: 'almost-full', timestamp: getTodayWithTime(12, 15), availableSeats: 3 },
      { status: 'full', timestamp: getTodayWithTime(13, 0), availableSeats: 0 },
      { status: 'available', timestamp: getTodayWithTime(13, 45), availableSeats: 6 },
      { status: 'available', timestamp: getTodayWithTime(17, 30), availableSeats: 12 },
      { status: 'full', timestamp: getTodayWithTime(18, 30), availableSeats: 0 },
      { status: 'almost-full', timestamp: getTodayWithTime(20, 0), availableSeats: 2 }
    ]
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
    lastUpdated: getFormattedNow(),
    availableSeats: 2,
    maxSeats: 20,
    estimatedWaitMinutes: 0,
    todayImpressions: 540,
    todayClicks: 320,
    favoritesCount: 48,
    navigationCount: 22,
    hourlyViews: {
      '11:00': 50,
      '12:00': 60,
      '18:00': 80,
      '19:00': 70,
      '20:00': 40,
      'other': 20
    },
    statusLogs: [
      { status: 'available', timestamp: getTodayWithTime(9, 0), availableSeats: 20 },
      { status: 'available', timestamp: getTodayWithTime(11, 0), availableSeats: 16 },
      { status: 'almost-full', timestamp: getTodayWithTime(13, 30), availableSeats: 4 },
      { status: 'almost-full', timestamp: getTodayWithTime(15, 30), availableSeats: 2 }
    ]
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
    lastUpdated: getFormattedNow(),
    availableSeats: 0,
    maxSeats: 40,
    estimatedWaitMinutes: 45,
    todayImpressions: 780,
    todayClicks: 490,
    favoritesCount: 89,
    navigationCount: 56,
    hourlyViews: {
      '11:00': 80,
      '12:00': 110,
      '18:00': 120,
      '19:00': 100,
      '20:00': 60,
      'other': 20
    },
    statusLogs: [
      { status: 'available', timestamp: getTodayWithTime(12, 0), availableSeats: 40 },
      { status: 'almost-full', timestamp: getTodayWithTime(12, 30), availableSeats: 8 },
      { status: 'full', timestamp: getTodayWithTime(13, 0), availableSeats: 0 },
      { status: 'almost-full', timestamp: getTodayWithTime(15, 0), availableSeats: 12 },
      { status: 'full', timestamp: getTodayWithTime(18, 0), availableSeats: 0 },
      { status: 'almost-full', timestamp: getTodayWithTime(21, 0), availableSeats: 5 }
    ]
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
    lastUpdated: getFormattedNow(),
    availableSeats: 15,
    maxSeats: 25,
    estimatedWaitMinutes: 0,
    todayImpressions: 310,
    todayClicks: 150,
    favoritesCount: 28,
    navigationCount: 12,
    hourlyViews: {
      '11:00': 20,
      '12:00': 30,
      '18:00': 40,
      '19:00': 30,
      '20:00': 20,
      'other': 10
    },
    statusLogs: [
      { status: 'available', timestamp: getTodayWithTime(13, 0), availableSeats: 25 },
      { status: 'available', timestamp: getTodayWithTime(14, 30), availableSeats: 20 },
      { status: 'almost-full', timestamp: getTodayWithTime(16, 0), availableSeats: 5 },
      { status: 'available', timestamp: getTodayWithTime(18, 30), availableSeats: 15 }
    ]
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
    lastUpdated: getFormattedNow(),
    availableSeats: 3,
    maxSeats: 18,
    estimatedWaitMinutes: 0,
    todayImpressions: 610,
    todayClicks: 380,
    favoritesCount: 52,
    navigationCount: 34,
    hourlyViews: {
      '11:00': 60,
      '12:00': 80,
      '18:00': 90,
      '19:00': 80,
      '20:00': 50,
      'other': 20
    },
    statusLogs: [
      { status: 'available', timestamp: getTodayWithTime(11, 0), availableSeats: 18 },
      { status: 'almost-full', timestamp: getTodayWithTime(12, 0), availableSeats: 4 },
      { status: 'available', timestamp: getTodayWithTime(13, 30), availableSeats: 12 },
      { status: 'full', timestamp: getTodayWithTime(18, 30), availableSeats: 0 },
      { status: 'almost-full', timestamp: getTodayWithTime(20, 30), availableSeats: 3 }
    ]
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

  // 讀取網址 query string `?view=platform` 或 `?view=store` 來進行預設視圖切換
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('view');
    if (v === 'platform') {
      setViewMode('platform');
    } else if (v === 'store') {
      setViewMode('store-portal');
    }
  }, []);

  // 同步 viewMode 到瀏覽器的網址，方便重新整理或分享時保留正確視圖
  const handleViewModeChange = (mode: 'platform' | 'store-portal') => {
    setViewMode(mode);
    const url = new URL(window.location.href);
    if (mode === 'platform') {
      url.searchParams.set('view', 'platform');
    } else {
      url.searchParams.delete('view');
    }
    window.history.replaceState({}, '', url.toString());
  };

  // Login / Workspace states
  const [loggedInStoreId, setLoggedInStoreId] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Form handling state (Public Admin context)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<FoodStore | null>(null);

  // Manual Walk-In reservation state (Merchant back-end)
  const [isWalkInFormOpen, setIsWalkInFormOpen] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInPeople, setWalkInPeople] = useState(2);

  // Store Owner Active Tab selection State
  const [ownerActiveTab, setOwnerActiveTab] = useState<'waitlist' | 'analytics' | 'controls' | 'preview'>('waitlist');

  // Platform Active Tab selection State
  const [platformActiveTab, setPlatformActiveTab] = useState<'list' | 'preview'>('list');

  // Edit seat capacity configs state (Merchant waitlist view)
  const [isEditingSeats, setIsEditingSeats] = useState(false);

  // 3. User favorites state
  const [favoritedStores, setFavoritedStores] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('favorited_stores');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track impressions/clicks dynamically when user selects a store in customer view
  useEffect(() => {
    if (selectedStoreId && viewMode === 'platform') {
      setStores(prev => {
        let changed = false;
        const updated = prev.map(s => {
          if (s.id === selectedStoreId) {
            changed = true;

            // Determine hourly view category matching: 11:00, 12:00, 18:00, 19:00, 20:00, other
            const currentHour = new Date().getHours();
            let hourKey: '11:00' | '12:00' | '18:00' | '19:00' | '20:00' | 'other' = 'other';
            if (currentHour === 11) hourKey = '11:00';
            else if (currentHour === 12) hourKey = '12:00';
            else if (currentHour === 18) hourKey = '18:00';
            else if (currentHour === 19) hourKey = '19:00';
            else if (currentHour === 20) hourKey = '20:00';

            const currentHourly = s.hourlyViews || {
              '11:00': 0,
              '12:00': 0,
              '18:00': 0,
              '19:00': 0,
              '20:00': 0,
              'other': 0
            };

            const updatedHourly = {
              ...currentHourly,
              [hourKey]: (currentHourly[hourKey] || 0) + 1
            };

            // Increment clicks + impressions on select
            return {
              ...s,
              todayImpressions: (s.todayImpressions || 0) + 1,
              todayClicks: (s.todayClicks || 0) + 1,
              hourlyViews: updatedHourly
            };
          }
          return s;
        });
        if (changed) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
      });
    }
  }, [selectedStoreId, viewMode]);

  // Click handler for favorite toggle
  const handleToggleFavorite = (storeId: string) => {
    setFavoritedStores(prev => {
      const isFav = prev.includes(storeId);
      const next = isFav ? prev.filter(id => id !== storeId) : [...prev, storeId];
      localStorage.setItem('favorited_stores', JSON.stringify(next));

      // Synchronize back to stores list to display the aggregate favorite analytics count
      setStores(orig => {
        const updated = orig.map(s => {
          if (s.id === storeId) {
            const currentCount = s.favoritesCount || 0;
            return {
              ...s,
              favoritesCount: isFav ? Math.max(0, currentCount - 1) : currentCount + 1
            };
          }
          return s;
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      return next;
    });
  };

  // Click handler for Google Map Navigate
  const handleNavigateClick = (storeId: string) => {
    setStores(prev => {
      const updated = prev.map(s => {
        if (s.id === storeId) {
          return {
            ...s,
            navigationCount: (s.navigationCount || 0) + 1
          };
        }
        return s;
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

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

  // Update specific Guest Reservation party size / seats count
  const handleUpdateReservationPeople = (id: string, people: number) => {
    const updated = reservations.map(r => r.id === id ? { ...r, people } : r);
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
    availableSeats?: number;
    maxSeats?: number;
    seatsCount1?: number;
    seatsCount2?: number;
    seatsCount3?: number;
    seatsCount4?: number;
    seatsCount5?: number;
    estimatedWaitMinutes?: number;
  }) => {
    if (editingStore) {
      // Edit mode
      const updated = stores.map((s) => {
        if (s.id === editingStore.id) {
          const hasStatusChanged = s.status !== formData.status || s.availableSeats !== formData.availableSeats;
          const updatedLogs = hasStatusChanged 
            ? [...(s.statusLogs || []), { status: formData.status, timestamp: getFormattedNow(), availableSeats: formData.availableSeats ?? s.availableSeats ?? 8 }]
            : (s.statusLogs || []);

          return {
            ...s,
            ...formData,
            statusLogs: updatedLogs,
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
        lastUpdated: getFormattedNow(),
        todayImpressions: 45,
        todayClicks: 15,
        favoritesCount: 2,
        navigationCount: 1,
        hourlyViews: {
          '11:00': 3,
          '12:00': 5,
          '18:00': 4,
          '19:00': 2,
          '20:00': 1,
          'other': 0
        },
        statusLogs: [
          {
            status: formData.status,
            timestamp: getFormattedNow(),
            availableSeats: formData.availableSeats ?? 8
          }
        ]
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

  // Quick state update switch on store list row with smart seat adjustment
  const handleQuickStatusChange = (id: string, newStatus: SeatStatus, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = stores.map((s) => {
      if (s.id === id) {
        const maxVal = s.maxSeats !== undefined ? s.maxSeats : 15;
        let finalAvailable = s.availableSeats !== undefined ? s.availableSeats : 8;
        
        if (newStatus === 'full') {
          finalAvailable = 0;
        } else if (newStatus === 'almost-full') {
          if (finalAvailable === 0 || finalAvailable > Math.ceil(maxVal * 0.25)) {
            finalAvailable = Math.max(1, Math.ceil(maxVal * 0.15)); // e.g. 2 or 3 seats
          }
        } else if (newStatus === 'available') {
          if (finalAvailable <= Math.ceil(maxVal * 0.25)) {
            finalAvailable = Math.ceil(maxVal * 0.5); // e.g. 10 or half full
          }
        }

        const newLogs = [
          ...(s.statusLogs || []),
          {
            status: newStatus,
            timestamp: getFormattedNow(),
            availableSeats: finalAvailable
          }
        ];

        return {
          ...s,
          status: newStatus,
          availableSeats: finalAvailable,
          statusLogs: newLogs,
          lastUpdated: getFormattedNow()
        };
      }
      return s;
    });
    saveStoresAndSync(updated);
  };

  // Direct available seats modifier with smart auto-status syncing
  const handleSeatChange = (id: string, increment: boolean) => {
    const updated = stores.map((s) => {
      if (s.id === id) {
        const maxVal = s.maxSeats !== undefined ? s.maxSeats : 15;
        let nextVal = s.availableSeats !== undefined ? s.availableSeats : 8;
        if (increment) {
          nextVal = Math.min(maxVal, nextVal + 1);
        } else {
          nextVal = Math.max(0, nextVal - 1);
        }

        // Auto determine new status matching empty slots ratio
        let resolvedStatus = s.status;
        if (nextVal === 0) {
          resolvedStatus = 'full';
        } else if (nextVal <= Math.ceil(maxVal * 0.25)) {
          resolvedStatus = 'almost-full';
        } else {
          resolvedStatus = 'available';
        }

        const newLogs = [
          ...(s.statusLogs || []),
          {
            status: resolvedStatus,
            timestamp: getFormattedNow(),
            availableSeats: nextVal
          }
        ];

        return {
          ...s,
          availableSeats: nextVal,
          status: resolvedStatus,
          statusLogs: newLogs,
          lastUpdated: getFormattedNow()
        };
      }
      return s;
    });
    saveStoresAndSync(updated);
  };

  // Modifier to adjust wait minutes directly inside vendor portal
  const handleWaitMinutesChange = (id: string, waitMins: number) => {
    const updated = stores.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          estimatedWaitMinutes: waitMins,
          lastUpdated: getFormattedNow()
        };
      }
      return s;
    });
    saveStoresAndSync(updated);
  };

  // Modifier to edit specific capacity seats counts directly
  const handleUpdateStoreSeatsCount = (storeId: string, key: 'seatsCount1' | 'seatsCount2' | 'seatsCount3' | 'seatsCount4' | 'seatsCount5', value: number) => {
    const updated = stores.map((s) => {
      if (s.id === storeId) {
        return {
          ...s,
          [key]: value,
          lastUpdated: getFormattedNow()
        };
      }
      return s;
    });
    saveStoresAndSync(updated);
  };

  // Direct max (hardware) seats modifier inside vendor portal
  const handleMaxSeatsChange = (id: string, newMax: number) => {
    const finalMax = Math.max(1, newMax);
    const updated = stores.map((s) => {
      if (s.id === id) {
        // Clamp existing availableSeats so they cannot exceed the new hardware limit
        const nextAvailable = s.availableSeats !== undefined 
          ? Math.min(finalMax, s.availableSeats)
          : Math.min(finalMax, 8);
        
        let resolvedStatus = s.status;
        if (nextAvailable === 0) {
          resolvedStatus = 'full';
        } else if (nextAvailable <= Math.ceil(finalMax * 0.25)) {
          resolvedStatus = 'almost-full';
        } else {
          resolvedStatus = 'available';
        }
        
        const newLogs = [
          ...(s.statusLogs || []),
          {
            status: resolvedStatus,
            timestamp: getFormattedNow(),
            availableSeats: nextAvailable
          }
        ];

        return {
          ...s,
          maxSeats: finalMax,
          availableSeats: nextAvailable,
          status: resolvedStatus,
          statusLogs: newLogs,
          lastUpdated: getFormattedNow()
        };
      }
      return s;
    });
    saveStoresAndSync(updated);
  };

  const handleResetStatusLogs = (id: string) => {
    if (confirm('確定要清空本日的狀態更動歷程與佔比統計嗎？')) {
      const updated = stores.map(s => {
        if (s.id === id) {
          return {
            ...s,
            statusLogs: [
              {
                status: s.status,
                timestamp: getFormattedNow(),
                availableSeats: s.availableSeats ?? 8
              }
            ]
          };
        }
        return s;
      });
      saveStoresAndSync(updated);
    }
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
        
        {/* 頂部極簡視圖控制切換器 (極致美觀、無干擾、具備現代感) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/85 shadow-xs" id="view-mode-selector">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-white text-lg shadow-xs shrink-0 font-bold">
              🍛
            </div>
            <div>
              <h1 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                Veyra 零感排隊行控中心 Live
                <span className="text-[10px] bg-amber-100 dark:bg-amber-955/60 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  多端並行控制網
                </span>
              </h1>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                店家獨立帳號、自服務註冊相片上傳、一鍵秒級更動座位與預約狀況。
              </p>
            </div>
          </div>

          <div className="bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl flex items-center gap-1 border border-zinc-200/50 dark:border-zinc-850 shadow-xs shrink-0">
            <button
              onClick={() => handleViewModeChange('store-portal')}
              className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'store-portal'
                  ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-sm border border-zinc-200/40 dark:border-zinc-805'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              🏪 店家管理專區
            </button>
            <button
              onClick={() => handleViewModeChange('platform')}
              className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'platform'
                  ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-sm border border-zinc-200/40 dark:border-zinc-805'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              🌐 總平台管理員
            </button>
          </div>
        </div>

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
                <div className={`${ownerActiveTab === 'preview' || !isFormOpen ? 'lg:col-span-12' : 'lg:col-span-8'} flex flex-col space-y-6`}>
                  
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

                    {/* Premium Segmented Navigation Tabs */}
                    <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-850">
                      <button
                        type="button"
                        onClick={() => setOwnerActiveTab('waitlist')}
                        className={`flex-1 py-2.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
                          ownerActiveTab === 'waitlist'
                            ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>📋 現場候位管理</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOwnerActiveTab('controls')}
                        className={`flex-1 py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
                          ownerActiveTab === 'controls'
                            ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>⚡ 當前空席控制</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOwnerActiveTab('analytics')}
                        className={`flex-1 py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
                          ownerActiveTab === 'analytics'
                            ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>📈 經營數據分析</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOwnerActiveTab('preview')}
                        className={`flex-1 py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
                          ownerActiveTab === 'preview'
                            ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>📱 顧客前台預覽</span>
                      </button>
                    </div>

                    {ownerActiveTab === 'analytics' ? (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        {/* 🚀 NEW: 店家經營數據後台 (Live Business Analytics Bench) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="merchant-analytics-grid">
                      {/* Impressions Card */}
                      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all hover:border-zinc-700">
                        <div className="absolute top-1.5 right-2 text-zinc-700 text-lg">💡</div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">今日曝光數</span>
                        <div className="mt-2.5 flex items-baseline gap-1">
                          <span className="text-xl font-black text-white font-mono">{loggedInStore.todayImpressions || 0}</span>
                          <span className="text-[10px] text-zinc-500">次</span>
                        </div>
                        <p className="text-[9px] text-emerald-400 mt-1 flex items-center gap-0.5">
                          <span>↑ 12%</span> <span className="text-zinc-600 scale-90 text-[8px]">較昨日</span>
                        </p>
                      </div>

                      {/* Clicks Card */}
                      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all hover:border-zinc-700">
                        <div className="absolute top-1.5 right-2 text-zinc-700 text-lg">🖱️</div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">今日點擊數</span>
                        <div className="mt-2.5 flex items-baseline gap-1">
                          <span className="text-xl font-black text-amber-400 font-mono">{loggedInStore.todayClicks || 0}</span>
                          <span className="text-[10px] text-zinc-500">次</span>
                        </div>
                        <p className="text-[9px] text-zinc-400 mt-1">
                          <span>點擊率 {loggedInStore.todayImpressions ? Math.round(((loggedInStore.todayClicks || 0) / loggedInStore.todayImpressions) * 100) : 45}%</span>
                        </p>
                      </div>

                      {/* Bookmarks Card */}
                      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all hover:border-zinc-700">
                        <div className="absolute top-1.5 right-2 text-zinc-750 text-lg">❤️</div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">累積收藏數</span>
                        <div className="mt-2.5 flex items-baseline gap-1">
                          <span className="text-xl font-black text-rose-400 font-mono">{loggedInStore.favoritesCount || 0}</span>
                          <span className="text-[10px] text-zinc-500">人</span>
                        </div>
                        <p className="text-[9px] text-rose-350/90 mt-1">
                          <span>最愛人氣地標</span>
                        </p>
                      </div>

                      {/* Navigations Card */}
                      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all hover:border-zinc-700">
                        <div className="absolute top-1.5 right-2 text-zinc-700 text-lg">🧭</div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">導航點閱數</span>
                        <div className="mt-2.5 flex items-baseline gap-1">
                          <span className="text-xl font-black text-teal-400 font-mono">{loggedInStore.navigationCount || 0}</span>
                          <span className="text-[10px] text-zinc-500">次</span>
                        </div>
                        <p className="text-[9px] text-zinc-400 mt-1">
                          <span>地圖實體到店率</span>
                        </p>
                      </div>
                    </div>

                    {/* 📊 時段查看人次分析 (Hourly Traffic Analytics) */}
                    {(() => {
                      const hourlyData = loggedInStore.hourlyViews || {
                        '11:00': 0,
                        '12:00': 0,
                        '18:00': 0,
                        '19:00': 0,
                        '20:00': 0,
                        'other': 0
                      };
                      
                      const totalHourly = (
                        (hourlyData['11:00'] || 0) +
                        (hourlyData['12:00'] || 0) +
                        (hourlyData['18:00'] || 0) +
                        (hourlyData['19:00'] || 0) +
                        (hourlyData['20:00'] || 0) +
                        (hourlyData['other'] || 0)
                      ) || 1;
                      
                      const slots = [
                        { label: '11:00', value: hourlyData['11:00'] || 0, tag: '午餐初段 🍜', color: 'from-amber-500 to-amber-600', hoverBg: 'hover:border-amber-500/50' },
                        { label: '12:00', value: hourlyData['12:00'] || 0, tag: '午餐尖峰 🍱', color: 'from-amber-600 to-red-500', hoverBg: 'hover:border-red-500/50' },
                        { label: '18:00', value: hourlyData['18:00'] || 0, tag: '晚餐尖峰 🍲', color: 'from-amber-600 to-red-500', hoverBg: 'hover:border-red-500/50' },
                        { label: '19:00', value: hourlyData['19:00'] || 0, tag: '晚餐次峰 🍔', color: 'from-amber-500 to-amber-600', hoverBg: 'hover:border-amber-500/50' },
                        { label: '20:00', value: hourlyData['20:00'] || 0, tag: '消夜前段 🍺', color: 'from-amber-400 to-yellow-500', hoverBg: 'hover:border-yellow-500/50' },
                        { label: '其他', value: hourlyData['other'] || 0, tag: '其它離峰 ⏰', color: 'from-zinc-500 to-zinc-650', hoverBg: 'hover:border-zinc-700' }
                      ];

                      return (
                        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                            <div>
                              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                📊 本日顧客進站時段熱度分析
                              </h3>
                              <p className="text-[10px] text-zinc-400 mt-1">分時段統計今日來客查看商舖卡片的累積次數，幫助經理精確調配內外場人力。</p>
                            </div>
                            <div className="flex gap-1.5 shrink-0 self-start sm:self-center">
                              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Live 即時統計
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {slots.map((slot) => {
                              const percentage = Math.round((slot.value / totalHourly) * 100);
                              return (
                                <div key={slot.label} className={`bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between transition-all ${slot.hoverBg} hover:scale-[1.02]`}>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-black text-white font-mono">{slot.label}</span>
                                    <span className="text-[8px] font-bold text-zinc-500 tracking-tight shrink-0">{slot.tag}</span>
                                  </div>
                                  
                                  <div className="mt-4 space-y-1.5">
                                    <div className="flex items-baseline justify-between gap-1">
                                      <div>
                                        <span className="text-lg font-black text-white font-mono">{slot.value}</span>
                                        <span className="text-[9px] font-semibold text-zinc-400 ml-0.5">次</span>
                                      </div>
                                      <span className="text-[9px] font-bold text-zinc-500 font-mono">{percentage}%</span>
                                    </div>
                                    
                                    {/* Real percentage segment bar */}
                                    <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden">
                                      <div 
                                        className={`bg-gradient-to-r ${slot.color} h-full rounded-full transition-all duration-500`}
                                        style={{ width: `${Math.max(2, percentage)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Rich analysis description based on the peak hour */}
                          {(() => {
                            const peak = slots.reduce((max, s) => s.value > max.value ? s : max, slots[0]);
                            return (
                              <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-3 flex items-center gap-3">
                                <span className="text-base shrink-0">💡</span>
                                <p className="text-[10px] text-zinc-400 leading-relaxed md:leading-normal">
                                  本日流量高峰落在 <span className="text-amber-400 font-bold font-mono text-xs">{peak.label}</span> 區段，共計已被搜尋點閱 <span className="text-white font-black font-mono text-xs">{peak.value}</span> 次（佔全天比率 <span className="font-bold text-amber-300 font-mono text-xs">{Math.round((peak.value / totalHourly) * 100)}%</span>）。建議在 {peak.label} 前後 30 分鐘確保排隊等候時間、以及桌況資訊隨時是最準確的。
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })()}

                    {/* 📈 即時狀態紀錄與全日份額分析 (Real-Time Status History & Daily Share Analysis) */}
                    {(() => {
                      const shares = calculateStatusShares(loggedInStore.statusLogs);
                      const logs = loggedInStore.statusLogs || [];

                      // Sort logs in reverse chronological order for the history feed (newest first)
                      const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                      // Determine peak status today
                      const peakStatusObj = shares.reduce((max, s) => s.percentage > max.percentage ? s : max, shares[0]);

                      return (
                        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-5 shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                            <div>
                              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                📈 門店空席狀態歷程與全日份額佔比分析
                              </h3>
                              <p className="text-[10px] text-zinc-400 mt-1">
                                根據狀態變更即時累計持續時間，精準統計全天有餐飲座位的各空位狀態佔比。
                              </p>
                            </div>
                            <div className="flex gap-1.5 shrink-0 self-start sm:self-center">
                              <button
                                type="button"
                                onClick={() => handleResetStatusLogs(loggedInStore.id)}
                                className="text-[9px] bg-zinc-900 hover:bg-zinc-800 text-zinc-450 border border-zinc-800 hover:border-zinc-700 py-1.5 px-3 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-bold"
                              >
                                🔄 重設今日統計
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                            {/* Left 5 cols: Share calculation visualization */}
                            <div className="lg:col-span-5 bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/60 flex flex-col justify-between space-y-4">
                              <div className="space-y-1">
                                <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">⏱️ 營運狀態分佈比例 (營業一日)</h4>
                                <p className="text-[9px] text-zinc-500">
                                  統計自今日起，各空位層級佔用的時間與占比
                                </p>
                              </div>

                              {/* Segmented horizontal percentage bar */}
                              <div className="space-y-1.5">
                                <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden flex">
                                  {shares.map((sh) => {
                                    const colorMap = {
                                      'available': 'bg-emerald-500',
                                      'almost-full': 'bg-amber-500',
                                      'full': 'bg-rose-500'
                                    };
                                    if (sh.percentage <= 0) return null;
                                    return (
                                      <div
                                        key={sh.status}
                                        className={`${colorMap[sh.status]} h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                                        style={{ width: `${sh.percentage}%` }}
                                        title={`${sh.label}: ${sh.percentage}%`}
                                      ></div>
                                    );
                                  })}
                                </div>

                                <div className="flex justify-between text-[9px] text-zinc-550 px-1 font-mono">
                                  <span>0%</span>
                                  <span>25%</span>
                                  <span>50%</span>
                                  <span>75%</span>
                                  <span>100%</span>
                                </div>
                              </div>

                              {/* Status Breakdown Legend & Time details */}
                              <div className="space-y-2 pt-1 border-t border-zinc-800/40">
                                {shares.map((sh) => {
                                  const bulletColor = {
                                    'available': 'bg-emerald-500',
                                    'almost-full': 'bg-amber-500',
                                    'full': 'bg-rose-500'
                                  }[sh.status];

                                  const textColor = {
                                    'available': 'text-emerald-400',
                                    'almost-full': 'text-amber-400',
                                    'full': 'text-rose-400'
                                  }[sh.status];

                                  return (
                                    <div key={sh.status} className="flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${bulletColor}`}></span>
                                        <span className="text-zinc-300 font-medium">{sh.label}</span>
                                      </div>
                                      <div className="flex items-baseline gap-2 font-mono">
                                        <span className="text-[10px] text-zinc-500">{formatMinutes(sh.minutes)}</span>
                                        <span className={`font-bold ${textColor}`}>{sh.percentage}%</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Dynamic Suggestion based on peak state */}
                              <div className="bg-zinc-950/50 rounded-lg p-2.5 border border-zinc-850 text-[10px] text-zinc-400 leading-relaxed md:leading-normal flex gap-2">
                                <span className="text-sm shrink-0">💡</span>
                                <p>
                                  {peakStatusObj.status === 'full' && (
                                    <>本日門店大部分時間處於 <span className="text-rose-400 font-bold">客滿</span> 狀態（高達 {peakStatusObj.percentage}%）。建議加速餐點製作時間，或搭配桌邊快速點餐系統，提升顧客結帳翻桌效率。</>
                                  )}
                                  {peakStatusObj.status === 'almost-full' && (
                                    <>今日大多呈現 <span className="text-amber-400 font-bold">快客滿</span> 狀態（約佔 {peakStatusObj.percentage}%）。此時是座位調度的高峰時刻，配合線上預約排隊功能能最有效率銜接空席！</>
                                  )}
                                  {peakStatusObj.status === 'available' && (
                                    <>今日以 <span className="text-emerald-400 font-bold">有空位</span> 狀態（佔比 {peakStatusObj.percentage}%）時間居多。建議可設定專屬限時驚喜優惠、或使用特色行銷功能吸引更多卡片點擊率。</>
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Right 7 cols: Real-time update history logs feed */}
                            <div className="lg:col-span-7 bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/60 flex flex-col justify-between space-y-2">
                              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-2 mb-1">
                                <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                                  <span>🗂️ 本日即時空位更動 Log (現場即時反饋紀錄)</span>
                                </h4>
                                <span className="text-[8px] font-bold text-zinc-500 font-mono">
                                  共計標記 {logs.length} 筆
                                </span>
                              </div>

                              <div className="space-y-2 overflow-y-auto max-h-[190px] pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                                {sortedLogs.length === 0 ? (
                                  <div className="h-32 flex flex-col items-center justify-center text-center text-zinc-500">
                                    <span className="text-xl mb-1">📝</span>
                                    <p className="text-[10px] font-bold">今日尚無即時空位調整紀錄</p>
                                    <p className="text-[9px] text-zinc-600 mt-0.5">當您在下方客盤面板調整現場空隙或狀態時，詳細歷程、時間碼將記錄於此</p>
                                  </div>
                                ) : (
                                  sortedLogs.map((log, index) => {
                                    const statusLabel = {
                                      'available': '🟢 有空位',
                                      'almost-full': '🟡 快客滿',
                                      'full': '🔴 客滿'
                                    }[log.status];

                                    const badgeColor = {
                                      'available': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                                      'almost-full': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                                      'full': 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    }[log.status];

                                    const isJustNow = index === 0;

                                    return (
                                      <div
                                        key={index}
                                        className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors border group ${
                                          isJustNow 
                                            ? 'bg-zinc-850/60 border-amber-500/30' 
                                            : 'bg-zinc-950/40 border-zinc-900 shadow-sm hover:bg-zinc-900/60'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <span className="font-mono text-[9px] text-zinc-500 group-hover:text-zinc-400">
                                            {log.timestamp.split(' ')[1] || log.timestamp}
                                          </span>
                                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeColor}`}>
                                            {statusLabel}
                                          </span>
                                          {isJustNow && (
                                            <span className="text-[8px] bg-emerald-600 text-white font-extrabold px-1 rounded scale-90 animate-pulse">
                                              最新變更
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] text-zinc-400 font-mono bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-850">
                                            目前空席: <strong className="text-amber-400 font-bold">{log.availableSeats}</strong> 席
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                              <p className="text-[9.5px] text-zinc-650 leading-relaxed pt-1.5 mt-1 border-t border-zinc-800/40 text-center font-medium">
                                💡 本日分佈統計也將顯示在前台卡片與後台歷史趨勢中，幫助掌握餐點供應之座位能效
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                      </motion.div>
                    ) : null}

                    {ownerActiveTab === 'controls' ? (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
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

                        {/* 🚀 New vacancy manual control widget */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex flex-col space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-300 font-bold text-[11px] uppercase flex items-center gap-1">
                              <span>🪑 客席空位數量</span>
                            </span>
                            <div className="flex items-center gap-1 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-850">
                              <span className="text-[9.5px] font-bold text-zinc-500 uppercase tracking-wider shrink-0">硬體上限:</span>
                              <input
                                type="number"
                                min="1"
                                max="500"
                                className="w-9 h-5 bg-zinc-900 text-center font-mono text-[10px] font-bold text-amber-500 rounded border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={loggedInStore.maxSeats !== undefined ? loggedInStore.maxSeats : 15}
                                onChange={(e) => handleMaxSeatsChange(loggedInStore.id, Number(e.target.value) || 1)}
                              />
                              <span className="text-[10px] text-zinc-400 font-bold">席</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleSeatChange(loggedInStore.id, false)}
                                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-white font-black text-sm flex items-center justify-center cursor-pointer transition-all active:scale-90"
                              >
                                －
                              </button>
                              
                              <div className="bg-zinc-950 px-2.5 py-1.5 h-8 rounded-lg border border-zinc-800 text-center font-mono text-xs font-bold text-amber-400 min-w-[70px] flex items-center justify-center">
                                {loggedInStore.availableSeats !== undefined ? loggedInStore.availableSeats : 8} 席
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => handleSeatChange(loggedInStore.id, true)}
                                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-white font-black text-sm flex items-center justify-center cursor-pointer transition-all active:scale-90"
                              >
                                ＋
                              </button>
                            </div>
                            
                            <span className="text-[10px] text-zinc-500 text-right leading-tight grow">
                              點擊加減即時同步前台
                            </span>
                          </div>
                        </div>

                        {/* 🚀 New Wait minutes setting, only when status is full */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex flex-col space-y-2">
                          <label className="text-zinc-300 font-bold text-[11px] uppercase block">⏱️ 客滿預估排隊時間</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="120"
                              disabled={loggedInStore.status !== 'full'}
                              value={loggedInStore.estimatedWaitMinutes !== undefined ? loggedInStore.estimatedWaitMinutes : 15}
                              onChange={(e) => handleWaitMinutesChange(loggedInStore.id, Math.max(0, Number(e.target.value) || 0))}
                              className="w-full text-xs font-mono px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-40 disabled:bg-zinc-900/40 disabled:text-zinc-500"
                              placeholder="例: 15"
                            />
                            <span className="text-xs text-zinc-400 shrink-0">分鐘</span>
                          </div>
                          {loggedInStore.status !== 'full' ? (
                            <p className="text-[9px] text-zinc-500">（目前非「客滿」狀態，此選像暫不用啟用）</p>
                          ) : (
                            <div className="flex gap-1 items-center py-1">
                              {[10, 20, 30, 45, 60].map((t) => (
                                <button
                                  type="button"
                                  key={t}
                                  onClick={() => handleWaitMinutesChange(loggedInStore.id, t)}
                                  className={`text-[9px] px-2 py-1 rounded transition-colors ${
                                    loggedInStore.estimatedWaitMinutes === t
                                      ? 'bg-amber-500 text-white font-bold'
                                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
                                  }`}
                                >
                                  {t}分
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Interactive edit store button */}
                        <button
                          onClick={(e) => triggerEdit(loggedInStore, e)}
                          className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-250 border border-zinc-750 hover:border-zinc-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>修改我的硬體座位上限、營業時間、特色照</span>
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
                      </motion.div>
                    ) : null}

                  </motion.section>

                  {ownerActiveTab === 'waitlist' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* 1C. 獨立預約排隊管理者模組 (Reservation waitlist workspace for this store) */}
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-amber-500" />
                          <span>【即時預約排隊表單管理】(本門店專屬)</span>
                        </h3>
                        <p className="text-[11px] text-zinc-400 mt-1">消費者可在右側手機模擬器內點擊「線上預約」填寫，或在此手動登記現場/電話客</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setIsWalkInFormOpen(!isWalkInFormOpen);
                            setWalkInName('');
                            setWalkInPhone('');
                            setWalkInPeople(2);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm ${
                            isWalkInFormOpen
                              ? 'bg-zinc-800 text-white border border-zinc-700'
                              : 'bg-amber-500 hover:bg-amber-600 text-white'
                          }`}
                        >
                          {isWalkInFormOpen ? '✕ 關閉登記' : '➕ 登記現場/電話客'}
                        </button>
                        <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 border border-emerald-250/20 font-mono font-bold py-1 px-2 rounded-full animate-pulse">
                          ● Live Synchronizing
                        </span>
                      </div>
                    </div>

                    {/* 📝 Manual back-end walk-in booking form */}
                    {isWalkInFormOpen && (
                      <motion.form
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!walkInName || !walkInPhone) return;
                          handleAddReservation(loggedInStore.id, walkInName, walkInPhone, walkInPeople);
                          setIsWalkInFormOpen(false);
                          setWalkInName('');
                          setWalkInPhone('');
                          setWalkInPeople(2);
                        }}
                        className="bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-4.5 space-y-4"
                      >
                        <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-200 flex items-center gap-1.5">
                          <span>📝 現場/電話預約特別登錄 (即時寫入幾人座)</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-550 mb-1 uppercase">顧客姓名 <span className="text-rose-500">*</span></label>
                            <input
                              type="text"
                              required
                              placeholder="例: 林先生"
                              value={walkInName}
                              onChange={(e) => setWalkInName(e.target.value)}
                              className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-550 mb-1 uppercase">聯絡電話 <span className="text-rose-500">*</span></label>
                            <input
                              type="tel"
                              required
                              placeholder="例: 0912-345-678"
                              value={walkInPhone}
                              onChange={(e) => setWalkInPhone(e.target.value)}
                              className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-550 mb-1 uppercase">預約人數 / 幾人座 <span className="text-rose-500">*</span></label>
                            <select
                              value={walkInPeople}
                              onChange={(e) => setWalkInPeople(Number(e.target.value))}
                              className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                            >
                              <option value="1">1 人座 (個人吧檯位)</option>
                              <option value="2">2 人座 (雙人專用座)</option>
                              <option value="3">3 人座 (三至四人普通座)</option>
                              <option value="4">4 人座 (四人家庭座)</option>
                              <option value="5">5 人座以上 (大型團體合併桌)</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsWalkInFormOpen(false)}
                            className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold rounded-lg cursor-pointer"
                          >
                            取消
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg shadow-sm cursor-pointer"
                          >
                            完成登錄並發送號碼牌
                          </button>
                        </div>
                      </motion.form>
                    )}

                    {/* 📊 待入座「幾人座」容量與需求排隊佔比分析统计 */}
                    {(() => {
                      const waitingRes = reservations.filter(r => r.storeId === loggedInStore.id && r.status === 'waiting');
                      const counts = {
                        '1': waitingRes.filter(r => r.people === 1).length,
                        '2': waitingRes.filter(r => r.people === 2).length,
                        '3': waitingRes.filter(r => r.people === 3).length,
                        '4': waitingRes.filter(r => r.people === 4).length,
                        '5+': waitingRes.filter(r => r.people >= 5).length,
                      };

                      const sc1 = loggedInStore.seatsCount1 !== undefined ? loggedInStore.seatsCount1 : 3;
                      const sc2 = loggedInStore.seatsCount2 !== undefined ? loggedInStore.seatsCount2 : 4;
                      const sc3 = loggedInStore.seatsCount3 !== undefined ? loggedInStore.seatsCount3 : 1;
                      const sc4 = loggedInStore.seatsCount4 !== undefined ? loggedInStore.seatsCount4 : 1;
                      const sc5 = loggedInStore.seatsCount5 !== undefined ? loggedInStore.seatsCount5 : 0;

                      return (
                        <div className="bg-zinc-55/65 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/80 space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-zinc-200/50 dark:border-zinc-850 gap-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-black uppercase text-zinc-650 dark:text-zinc-400 flex items-center gap-1">
                                <span>📊 幾人座等候組數與店內總桌數對比</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsEditingSeats(!isEditingSeats)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer select-none flex items-center gap-1 border ${
                                  isEditingSeats
                                    ? 'bg-amber-500 text-zinc-950 font-extrabold border-amber-600 shadow-sm'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-250 dark:border-zinc-700 hover:text-amber-500 dark:hover:text-amber-400'
                                }`}
                              >
                                {isEditingSeats ? '💾 儲存並關閉' : '✏️ 編輯席次配置'}
                              </button>
                            </div>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                              等候中：共 {waitingRes.length} 組
                            </span>
                          </div>
                          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
                            <div className="bg-white dark:bg-zinc-900/60 p-2 border border-zinc-200/40 dark:border-zinc-850 rounded-xl text-center flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] text-zinc-500 font-medium block">1 人吧檯座</span>
                                {isEditingSeats ? (
                                  <div className="inline-flex items-center justify-center gap-1 mt-1 bg-zinc-100 dark:bg-zinc-950 px-1 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStoreSeatsCount(loggedInStore.id, 'seatsCount1', Math.max(0, sc1 - 1))}
                                      className="text-[9px] text-zinc-550 dark:text-zinc-400 hover:text-amber-500 font-black px-1 transition-colors select-none cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <input 
                                      type="text" 
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={sc1}
                                      onChange={(e) => handleUpdateStoreSeatsCount(loggedInStore.id, 'seatsCount1', Math.max(0, Number(e.target.value) || 0))}
                                      className="w-4 text-[10px] text-zinc-950 dark:text-zinc-50 font-black text-center bg-transparent border-none p-0 focus:ring-0 focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStoreSeatsCount(loggedInStore.id, 'seatsCount1', sc1 + 1)}
                                      className="text-[9px] text-zinc-550 dark:text-zinc-400 hover:text-amber-500 font-black px-1 transition-colors select-none cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[9px] text-zinc-400 block mt-1">(配置: {sc1} 席)</span>
                                )}
                              </div>
                              <strong className={`text-base font-mono block mt-1.5 ${counts['1'] > 0 ? 'text-amber-500 font-black' : 'text-zinc-400'}`}>
                                {counts['1']} 組
                              </strong>
                            </div>
                            <div className="bg-white dark:bg-zinc-900/60 p-2 border border-zinc-200/40 dark:border-zinc-850 rounded-xl text-center flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] text-zinc-500 font-medium block">2 人雙人位</span>
                                {isEditingSeats ? (
                                  <div className="inline-flex items-center justify-center gap-1 mt-1 bg-zinc-100 dark:bg-zinc-950 px-1 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStoreSeatsCount(loggedInStore.id, 'seatsCount2', Math.max(0, sc2 - 1))}
                                      className="text-[9px] text-zinc-550 dark:text-zinc-400 hover:text-amber-500 font-black px-1 transition-colors select-none cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <input 
                                      type="text" 
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={sc2}
                                      onChange={(e) => handleUpdateStoreSeatsCount(loggedInStore.id, 'seatsCount2', Math.max(0, Number(e.target.value) || 0))}
                                      className="w-4 text-[10px] text-zinc-950 dark:text-zinc-50 font-black text-center bg-transparent border-none p-0 focus:ring-0 focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStoreSeatsCount(loggedInStore.id, 'seatsCount2', sc2 + 1)}
                                      className="text-[9px] text-zinc-550 dark:text-zinc-400 hover:text-amber-500 font-black px-1 transition-colors select-none cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[9px] text-zinc-400 block mt-1">(配置: {sc2} 桌)</span>
                                )}
                              </div>
                              <strong className={`text-base font-mono block mt-1.5 ${counts['2'] > 0 ? 'text-amber-500 font-black' : 'text-zinc-400'}`}>
                                {counts['2']} 組
                              </strong>
                            </div>
                            <div className="bg-white dark:bg-zinc-900/60 p-2 border border-zinc-200/40 dark:border-zinc-850 rounded-xl text-center flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] text-zinc-500 font-medium block">3 人普通座</span>
                                {isEditingSeats ? (
                                  <div className="inline-flex items-center justify-center gap-1 mt-1 bg-zinc-100 dark:bg-zinc-950 px-1 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStoreSeatsCount(loggedInStore.id, 'seatsCount3', Math.max(0, sc3 - 1))}
                                      className="text-[9px] text-zinc-550 dark:text-zinc-400 hover:text-amber-500 font-black px-1 transition-colors select-none cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <input 
                                      type="text" 
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={sc3}
                                      onChange={(e) => handleUpdateStoreSeatsCount(loggedInStore.id, 'seatsCount3', Math.max(0, Number(e.target.value) || 0))}
                                      className="w-4 text-[10px] text-zinc-950 dark:text-zinc-50 font-black text-center bg-transparent border-none p-0 focus:ring-0 focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStoreSeatsCount(loggedInStore.id, 'seatsCount3', sc3 + 1)}
                                      className="text-[9px] text-zinc-550 dark:text-zinc-400 hover:text-amber-500 font-black px-1 transition-colors select-none cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[9px] text-zinc-400 block mt-1">(配置: {sc3} 桌)</span>
                                )}
                              </div>
                              <strong className={`text-base font-mono block mt-1.5 ${counts['3'] > 0 ? 'text-amber-500 font-black' : 'text-zinc-400'}`}>
                                {counts['3']} 組
                              </strong>
                            </div>
                            <div className="bg-white dark:bg-zinc-900/60 p-2 border border-zinc-200/40 dark:border-zinc-850 rounded-xl text-center flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] text-zinc-500 font-medium block">4 人家庭座</span>
                                {isEditingSeats ? (
                                  <div className="inline-flex items-center justify-center gap-1 mt-1 bg-zinc-100 dark:bg-zinc-950 px-1 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStoreSeatsCount(loggedInStore.id, 'seatsCount4', Math.max(0, sc4 - 1))}
                                      className="text-[9px] text-zinc-550 dark:text-zinc-400 hover:text-amber-500 font-black px-1 transition-colors select-none cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <input 
                                      type="text" 
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={sc4}
                                      onChange={(e) => handleUpdateStoreSeatsCount(loggedInStore.id, 'seatsCount4', Math.max(0, Number(e.target.value) || 0))}
                                      className="w-4 text-[10px] text-zinc-950 dark:text-zinc-50 font-black text-center bg-transparent border-none p-0 focus:ring-0 focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStoreSeatsCount(loggedInStore.id, 'seatsCount4', sc4 + 1)}
                                      className="text-[9px] text-zinc-550 dark:text-zinc-400 hover:text-amber-500 font-black px-1 transition-colors select-none cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[9px] text-zinc-400 block mt-1">(配置: {sc4} 桌)</span>
                                )}
                              </div>
                              <strong className={`text-base font-mono block mt-1.5 ${counts['4'] > 0 ? 'text-amber-500 font-black' : 'text-zinc-400'}`}>
                                {counts['4']} 組
                              </strong>
                            </div>
                            <div className="bg-white dark:bg-zinc-900/60 p-2 border border-zinc-200/40 dark:border-zinc-850 rounded-xl text-center flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] text-zinc-500 font-medium block">5 人+大桌</span>
                                {isEditingSeats ? (
                                  <div className="inline-flex items-center justify-center gap-1 mt-1 bg-zinc-100 dark:bg-zinc-950 px-1 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStoreSeatsCount(loggedInStore.id, 'seatsCount5', Math.max(0, sc5 - 1))}
                                      className="text-[9px] text-zinc-550 dark:text-zinc-400 hover:text-amber-500 font-black px-1 transition-colors select-none cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <input 
                                      type="text" 
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={sc5}
                                      onChange={(e) => handleUpdateStoreSeatsCount(loggedInStore.id, 'seatsCount5', Math.max(0, Number(e.target.value) || 0))}
                                      className="w-4 text-[10px] text-zinc-950 dark:text-zinc-50 font-black text-center bg-transparent border-none p-0 focus:ring-0 focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStoreSeatsCount(loggedInStore.id, 'seatsCount5', sc5 + 1)}
                                      className="text-[9px] text-zinc-550 dark:text-zinc-400 hover:text-amber-500 font-black px-1 transition-colors select-none cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[9px] text-zinc-400 block mt-1">(配置: {sc5} 桌)</span>
                                )}
                              </div>
                              <strong className={`text-base font-mono block mt-1.5 ${counts['5+'] > 0 ? 'text-amber-500 font-black' : 'text-zinc-400'}`}>
                                {counts['5+']} 組
                              </strong>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

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
                                  <div className="font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <span>{res.name} 先生/女士</span>
                                    <div className="inline-flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700/80">
                                      <select
                                        value={res.people}
                                        onChange={(e) => handleUpdateReservationPeople(res.id, Number(e.target.value) || 2)}
                                        className="bg-transparent border-none text-[10px] font-bold text-amber-600 dark:text-amber-400 p-0 pr-1 select-none focus:outline-none focus:ring-0 cursor-pointer text-center"
                                      >
                                        <option value="1" className="text-zinc-950">1 人座</option>
                                        <option value="2" className="text-zinc-950">2 人座</option>
                                        <option value="3" className="text-zinc-950">3 人座</option>
                                        <option value="4" className="text-zinc-950">4 人座</option>
                                        <option value="5" className="text-zinc-950">5 人座</option>
                                        <option value="6" className="text-zinc-950">6 人座</option>
                                        <option value="7" className="text-zinc-950">7 人座</option>
                                        <option value="8" className="text-zinc-950">8 人座</option>
                                        <option value="10" className="text-zinc-950">10 人座</option>
                                      </select>
                                    </div>
                                  </div>
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
                    </motion.div>
                  ) : null}

                  {ownerActiveTab === 'preview' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6 max-w-sm sm:max-w-md mx-auto"
                    >
                      <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 shadow-xs text-center space-y-1.5">
                        <h4 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                          <span className="text-lg">📱</span> 
                          <span>手機端 Live 顧客預覽</span>
                        </h4>
                        <p className="text-[10px] text-zinc-400">
                          此處模擬客戶的手機螢幕頁籤。消費者可在這裡進行即時候位登記、瀏覽美妙菜單。您的所有客滿更動在此處都是百分之百實時秒級同步。
                        </p>
                      </div>

                      <MobilePreview 
                        store={loggedInStore} 
                        onAddReservation={handleAddReservation} 
                        onToggleFavorite={handleToggleFavorite}
                        isFavorited={loggedInStore ? favoritedStores.includes(loggedInStore.id) : false}
                        onNavigateClick={handleNavigateClick}
                      />
                    </motion.div>
                  ) : null}

                </div>

                {/* 右側：專屬的編輯表單 (只有在點擊編輯時顯示) */}
                {ownerActiveTab !== 'preview' && isFormOpen && (
                  <div className="lg:col-span-4" id="right-preview-column">
                    <div className="sticky top-40 space-y-4">
                      <AnimatePresence mode="wait">
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
                      </AnimatePresence>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ==================== 2. 總平台管理者端 (總後台) ==================== */}
        {viewMode === 'platform' && (
          <div className="space-y-6 animate-fade-in" id="platform-scope">
            
            {/* STATS COUNT GRID (Only displayed in Platform Admin) */}
            <StatsGrid stores={stores} />

            {/* Premium Platform Segmented Navigation Tabs */}
            <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-850 shadow-xs max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => setPlatformActiveTab('list')}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
                  platformActiveTab === 'list'
                    ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-205'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>🏪 店家地圖大廳</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatformActiveTab('preview')}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
                  platformActiveTab === 'preview'
                    ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-205'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>📱 顧客手機預覽</span>
              </button>
            </div>

            {/* WORKPLACE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="workplace-grid">
              
              {/* LEFT COLUMN: STORES MANAGER AREA (lg:col-span-8) */}
              {platformActiveTab === 'list' && (
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
              )}

              {platformActiveTab === 'preview' && (
                <section className="lg:col-span-12 flex flex-col space-y-4 max-w-sm sm:max-w-md mx-auto" id="left-preview-tab-column">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-850 p-4 rounded-2xl shadow-xs text-center space-y-1.5">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-1">
                      <span className="text-base">📱</span> 
                      <span>智慧手機消費者端即時預覽</span>
                    </h4>
                    <p className="text-[10px] text-zinc-400">目前預覽店家：<strong className="text-amber-500 font-extrabold">{selectedStore ? selectedStore.name : '未選擇'}</strong></p>
                  </div>
                  <MobilePreview 
                    store={selectedStore} 
                    onAddReservation={handleAddReservation} 
                    onToggleFavorite={handleToggleFavorite}
                    isFavorited={selectedStore ? favoritedStores.includes(selectedStore.id) : false}
                    onNavigateClick={handleNavigateClick}
                  />
                </section>
              )}

              {/* RIGHT COLUMN: PREVIEW PANEL OR DATA FORM (lg:col-span-4) */}
              {platformActiveTab !== 'preview' && (
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
                            onToggleFavorite={handleToggleFavorite}
                            isFavorited={selectedStore ? favoritedStores.includes(selectedStore.id) : false}
                            onNavigateClick={handleNavigateClick}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </section>
              )}

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
