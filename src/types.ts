export type SeatStatus = 'available' | 'almost-full' | 'full';

export interface FoodStore {
  id: string;
  name: string;           // 店名
  address: string;        // 地址
  phone: string;          // 電話
  businessHours: string;  // 營業時間
  status: SeatStatus;     // 空位狀態
  lastUpdated: string;    // 最後更新時間
  notes?: string;         // 備註 / 行銷特色 (增加資訊豐富度)
  imageCategory?: string; // 隨機封面圖類型 (拉麵、咖啡、甜點等)
  ownerUsername?: string; // 店家管理員帳號
  ownerPassword?: string; // 店家管理員密碼
  customImage?: string;   // 店家上傳的自訂封面照片 (Base64格式)
  availableSeats?: number; // 目前空位數
  maxSeats?: number;       // 總座位數
  seatsCount1?: number;    // 1人座總桌數/席數
  seatsCount2?: number;    // 2人座總桌數/席數
  seatsCount3?: number;    // 3人座總桌數/席數
  seatsCount4?: number;    // 4人座總桌數/席數
  seatsCount5?: number;    // 5人及以上總桌數/席數
  estimatedWaitMinutes?: number; // 客滿時的預估等待時間（分鐘）
  todayImpressions?: number; // 今日曝光數
  todayClicks?: number;      // 今日點擊數
  favoritesCount?: number;   // 收藏數
  navigationCount?: number;  // 導航次數
  hourlyViews?: {
    '11:00': number;
    '12:00': number;
    '18:00': number;
    '19:00': number;
    '20:00': number;
    'other': number;
  };
  statusLogs?: {
    status: SeatStatus;
    timestamp: string;
    availableSeats: number;
  }[];
}

export const STATUS_LABELS: Record<SeatStatus, { label: string; color: string; bg: string; border: string; bullet: string }> = {
  'available': {
    label: '有空位',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    bullet: 'bg-emerald-500'
  },
  'almost-full': {
    label: '快客滿',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800/50',
    bullet: 'bg-amber-500'
  },
  'full': {
    label: '客滿',
    color: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-800/50',
    bullet: 'bg-rose-500'
  }
};

export const FOOD_THEMES = [
  { id: 'ramen', label: '日式拉麵', icon: '🍜', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80' },
  { id: 'coffee', label: '咖啡輕食', icon: '☕', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&fit=crop&q=80' },
  { id: 'dessert', label: '精緻甜點', icon: '🍰', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=80' },
  { id: 'hotpot', label: '美味火鍋', icon: '🍲', image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=500&auto=format&fit=crop&q=80' },
  { id: 'burger', label: '美式漢堡', icon: '🍔', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80' },
  { id: 'pasta', label: '義式料理', icon: '🍝', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80' },
  { id: 'beverage', label: '手搖飲品', icon: '🥤', image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500&auto=format&fit=crop&q=80' },
  { id: 'bento', label: '精緻便當', icon: '🍱', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80' },
];

export interface Reservation {
  id: string;
  storeId: string;
  name: string;
  phone: string;
  people: number;
  createdAt: string;
  status: 'waiting' | 'called' | 'completed' | 'cancelled';
}

