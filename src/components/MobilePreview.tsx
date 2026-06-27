import React, { useState } from 'react';
import { FoodStore, STATUS_LABELS, FOOD_THEMES } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, Clock, Share2, Compass, AlertCircle, Sparkles, CheckCircle, Heart } from 'lucide-react';

const THEME_MENUS: Record<string, { name: string; price: number; desc: string; icon: string }[]> = {
  ramen: [
    { name: '特製極濃黑蒜豚骨拉麵', price: 240, desc: '慢火細熬 12 小時，香濃黑蒜油與豚骨高湯極致入魂', icon: '🍜' },
    { name: '辛口赤味噌風味拉麵', price: 250, desc: '特製熟成赤味噌，微辣帶勁，搭配軟嫩叉燒與溏心蛋', icon: '🍜' },
    { name: '酥炸手作日式煎餃', price: 80, desc: '金黃底皮酥脆，內餡鮮美多汁，店內招牌必點副食', icon: '🥟' }
  ],
  coffee: [
    { name: '衣索比亞 耶加雪菲 經典手沖', price: 150, desc: '細緻花香、明亮柑橘酸質、口感純淨乾淨且層次豐富', icon: '☕' },
    { name: '熔岩靜岡鮮抹茶拿鐵', price: 130, desc: '日本進口靜岡宇治抹茶，奶香濃厚、質地綿密滑順', icon: '🥛' },
    { name: '酪梨煙燻培根熱壓三明治', price: 140, desc: '熟成酪梨配上香烤香脆培根與熔岩起司，令人大飽口福', icon: '🥪' }
  ],
  dessert: [
    { name: '法式經典草莓千層蛋糕', price: 160, desc: '手工精緻層疊薄餅，夾入特調生乳鮮奶油與新鮮香甜草莓', icon: '🍰' },
    { name: '英式焦糖香草脆皮烤布丁', price: 90, desc: '採用馬達加斯加香草莢，口感綿密、頂層微苦焦糖絕配', icon: '🍮' },
    { name: '法國法芙娜巧克力熔岩蛋糕', price: 140, desc: '現點現烤微溫流心，大師級超濃郁苦甜巧克力風味', icon: '🧁' }
  ],
  hotpot: [
    { name: '主廚特製秘傳麻辣鴨血豆腐鍋', price: 380, desc: '獨門數十種中藥材滷製鴨血，麻香溫潤不刺喉，辣而不燥', icon: '🍲' },
    { name: '鮮甜柴魚黃金昆布小肥牛鍋', price: 320, desc: '使用高檔柴魚昆布慢火熬製，襯托頂級小肥牛的天然鮮美', icon: '🍲' },
    { name: '手工章魚爆漿明太子起司球', price: 90, desc: '手工捏製，香濃起司內餡包裹新鮮魚卵，咬下多汁滿足', icon: '🍢' }
  ],
  burger: [
    { name: '特製雙層熔岩起司手作牛肉堡', price: 220, desc: '黃金美式手打厚切牛肉漢堡排，雙倍熔岩切達起司與經典醬底', icon: '🍔' },
    { name: '外酥內嫩咔啦美式辣雞腿堡', price: 180, desc: '去骨香炸雞腿排鮮嫩多汁，加上主廚手作微辣醬、涼爽生菜', icon: '🍗' },
    { name: '主廚松露起司金黃現炸薯條', price: 100, desc: '現炸金黃脆薯均勻灑上黑松露細鹽與帕瑪森乾酪，香氣宜人', icon: '🍟' }
  ],
  pasta: [
    { name: '香蒜白酒蛤蜊羅勒義大利麵', price: 220, desc: '新鮮蛤蜊滿滿海味，佐大蒜、橄欖油、乾白酒，麵體Ｑ彈帶勁', icon: '🍝' },
    { name: '黑松露野菇生蛋黃醇香寬麵', price: 260, desc: '手作寬幅麵條完美吸附大器黑松露醬汁與頂級香滑新鮮生蛋黃', icon: '🍝' },
    { name: '義式羅馬完熟番茄羅勒濃湯', price: 80, desc: '完熟成熟紅番茄慢火燉煮，果酸與起司絲融合，清甜可口', icon: '🍅' }
  ],
  beverage: [
    { name: '招牌黑糖琥珀珍珠厚鮮奶', price: 75, desc: '手工炒製手作黑糖，慢火蜜漬珍珠與台灣在地醇濃小農鮮乳', icon: '🥤' },
    { name: '百香果翡翠手作雙Q綠茶', price: 65, desc: '嚴選百香鮮果汁，雙料寒天與Q彈手工珍珠組合，酸甜好滋味', icon: '🍋' },
    { name: '炭焙紅玉紅茶極上芝士奶蓋', price: 75, desc: '精選魚池紅玉紅茶，頂層慢打厚實海鹽芝士奶蓋，鹹甜回甘', icon: '🍵' }
  ],
  bento: [
    { name: '招牌香酥秘製大雞腿便當', price: 130, desc: '精選大份量雞腿，外皮金黃香酥，肉質鮮嫩且肉汁飽滿豐沛', icon: '🍱' },
    { name: '日本蒲燒鰻魚玉子絲便當', price: 185, desc: '細滑無刺特鮮蒲燒鰻魚，特調照燒鹹甜醬汁搭配鮮黃嫩蛋皮', icon: '🍱' },
    { name: '台式塔香起司菜脯厚煎蛋', price: 60, desc: '懷舊古早味菜脯結合大份量九層塔與香濃牽絲熔岩起司', icon: '🍳' }
  ]
};

const DEFAULT_MENU = [
  { name: '招牌主廚特製限量推薦套餐', price: 200, desc: '本店嚴選一流時令新鮮食材精細烹調，營養均衡美味十足', icon: '精' },
  { name: '經典手作點心拼盤', price: 80, desc: '每日清晨新鮮手作，佐以花茶或美式咖啡是最完美的下午茶組合', icon: '點' },
  { name: '現調水果氣泡季節冷飲', price: 60, desc: '精選香甜果泥搭配清爽氣泡水，黃金微糖微冰，清甜爽口', icon: '飲' }
];

interface MobilePreviewProps {
  store: FoodStore | null;
  onAddReservation?: (storeId: string, name: string, phone: string, people: number) => void;
  onToggleFavorite?: (id: string) => void;
  isFavorited?: boolean;
  onNavigateClick?: (id: string) => void;
}

export default function MobilePreview({ 
  store, 
  onAddReservation,
  onToggleFavorite,
  isFavorited = false,
  onNavigateClick
}: MobilePreviewProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'menu' | 'waitlist'>('info');
  const [simulatedCalling, setSimulatedCalling] = useState(false);
  const [waitlistName, setWaitlistName] = useState('');
  const [waitlistPhone, setWaitlistPhone] = useState('');
  const [waitlistPeople, setWaitlistPeople] = useState('2');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!store) {
    return (
      <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-[650px]" id="empty-preview-wrapper">
        <div className="text-4xl mb-4">📱</div>
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">無選定店家</h3>
        <p className="text-xs text-zinc-500 max-w-[200px] mt-2">請從左側列表選擇一間食品店家，即可在此即時預覽顧客手機端看見的畫面。</p>
      </div>
    );
  }

  const selectedTheme = FOOD_THEMES.find(t => t.id === store.imageCategory) || FOOD_THEMES[0];
  const statusDetails = STATUS_LABELS[store.status];

  const handleCall = () => {
    setSimulatedCalling(true);
    setTimeout(() => {
      setSimulatedCalling(false);
    }, 3000);
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistName || !waitlistPhone) return;
    
    if (onAddReservation) {
      onAddReservation(store.id, waitlistName, waitlistPhone, parseInt(waitlistPeople, 10) || 2);
    }

    setWaitlistSuccess(true);
    setTimeout(() => {
      setWaitlistSuccess(false);
      setWaitlistName('');
      setWaitlistPhone('');
      setWaitlistPeople('2');
    }, 4000);
  };

  const handleCopy = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col items-center" id="mobile-preview-container">
      {/* Label and Link Info */}
      <div className="w-full max-w-[340px] mb-3 flex items-center justify-between text-xs text-zinc-500">
        <span className="flex items-center gap-1 font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> 顧客手機端 Live 預覽
        </span>
        <button 
          onClick={handleCopy}
          className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded-sm"
        >
          <Share2 className="w-3 h-3" />
          {copiedLink ? '已複製!' : '複製公開網址'}
        </button>
      </div>

      {/* Smartphone Outer Shell */}
      <div 
        id="phone-frame"
        className="w-[340px] h-[670px] bg-zinc-900 border-[10px] border-zinc-800 rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col"
      >
        {/* Notch details for high fidelity */}
        <div className="absolute top-0 inset-x-0 h-7 bg-zinc-900 z-50 flex justify-center items-center">
          <div className="w-24 h-4 bg-zinc-950 rounded-b-xl flex items-center justify-between px-3">
            <span className="text-[9px] font-medium text-zinc-400 font-mono scale-90">12:30</span>
            <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full border border-zinc-800"></div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-1 bg-zinc-400 rounded-xs"></div>
              <div className="w-2.5 h-1.5 bg-zinc-400 rounded-xs"></div>
            </div>
          </div>
        </div>

        {/* Smartphone Screen Content */}
        <div className="flex-1 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 pt-7 flex flex-col overflow-y-auto no-scrollbar">
          
          {/* Header Image Category */}
          <div className="relative h-44 w-full bg-zinc-200 overflow-hidden shrink-0">
            <img 
              referrerPolicy="no-referrer"
              src={store.customImage || selectedTheme.image} 
              alt={store.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            
            {/* 收藏愛心按鈕 */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFavorite) {
                  onToggleFavorite(store.id);
                }
              }}
              className="absolute top-3 left-3 bg-zinc-950/60 hover:bg-zinc-950/80 text-white p-2 rounded-full cursor-pointer transition-all active:scale-95 flex items-center justify-center z-10"
              title="將這家店加入收藏"
            >
              <Heart className={`w-3.5 h-3.5 transition-transform ${isFavorited ? 'fill-rose-500 text-rose-500 scale-110' : 'text-zinc-300'}`} />
            </button>

            <div className="absolute top-3 right-3 bg-zinc-900/40 backdrop-blur-xs text-[10px] text-white px-2 py-1 rounded-full font-mono">
              {store.customImage ? '📸 自訂照片' : `${selectedTheme.label} ${selectedTheme.icon}`}
            </div>

            {/* Quick Status Pill Overlay */}
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <div>
                <h4 className="text-white text-lg font-bold tracking-tight leading-tight">{store.name}</h4>
                <p className="text-zinc-300 text-[10px] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-400" /> {store.address.split('區')[1] || store.address}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Bar inside the Mock App */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[11px] shrink-0">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3 text-center font-semibold transition-colors border-b-2 ${
                activeTab === 'info' 
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              即時空位
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`flex-1 py-3 text-center font-semibold transition-colors border-b-2 ${
                activeTab === 'menu' 
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              美味菜單
            </button>
            <button
              onClick={() => {
                setActiveTab('waitlist');
                setWaitlistSuccess(false);
              }}
              className={`flex-1 py-3 text-center font-semibold transition-colors border-b-2 ${
                activeTab === 'waitlist' 
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              線上候位
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 p-4 flex flex-col">
            <AnimatePresence mode="wait">
              {activeTab === 'info' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 flex-1 flex flex-col"
                >
                  {/* HERO STATUS BANNER */}
                  <div className={`p-4 rounded-2xl border ${statusDetails.bg} ${statusDetails.border} flex flex-col items-center text-center shadow-xs relative overflow-hidden`}>
                    
                    {/* Breathing circle decoration */}
                    <span className="absolute top-2 right-2 flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusDetails.bullet}`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${statusDetails.bullet}`}></span>
                    </span>

                    <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">當前空位狀態</span>
                    <span className={`text-2xl font-black mt-1 tracking-wider ${statusDetails.color}`}>
                      {statusDetails.label}
                    </span>

                    {/* ✅ Seat Count Information */}
                    {store.availableSeats !== undefined && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        <span>剩餘空位：</span>
                        <span className="px-1.5 py-0.5 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 text-amber-600 dark:text-amber-400 rounded-md font-mono font-bold">
                          {store.availableSeats}
                        </span>
                        <span>個空位</span>
                      </div>
                    )}

                    {/* Fun description tag */}
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2 px-2 leading-relaxed">
                      {store.status === 'available' && '🎉 現場目前有充裕座位，推薦立刻前往用餐！'}
                      {store.status === 'almost-full' && '⚡ 座位僅餘零星席次，出發前建議點擊下方通話，好位不等人！'}
                      {store.status === 'full' && '⌛ 當前人數較多需要排隊，點選上方「線上預約」即可先拿取號碼牌！'}
                    </p>

                    {/* ✅ Wait Time Estimation when Full */}
                    {store.status === 'full' && store.estimatedWaitMinutes !== undefined && store.estimatedWaitMinutes > 0 && (
                      <div className="mt-2 w-full max-w-[280px] bg-red-100/60 dark:bg-red-950/40 border border-red-200/50 dark:border-red-900/40 rounded-xl px-3 py-1.5 text-[11px] text-red-800 dark:text-red-300 font-bold flex items-center justify-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>客滿！現場預估等候：<span className="text-sm font-black font-mono text-red-650 dark:text-red-400">{store.estimatedWaitMinutes}</span> 分鐘</span>
                      </div>
                    )}

                    {/* Last updated timestamp inside mobile app */}
                    <div className="mt-3 text-[10px] bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 py-1 px-2.5 rounded-full text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      最後更新：{store.lastUpdated || '剛剛'}
                    </div>
                  </div>

                  {/* RESTAURANT INFO CARD */}
                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 space-y-3 shadow-xs">
                    <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">營業及聯絡資訊</h5>
                    
                    <div className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">營業時間</p>
                        <p className="text-zinc-500 mt-0.5">{store.businessHours || '尚無提供'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                      <Phone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">聯絡電話</p>
                        <p className="text-zinc-500 mt-0.5">{store.phone || '尚無提供'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                      <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">店家地址</p>
                        <p className="text-zinc-500 mt-0.5 leading-normal">{store.address || '尚無提供'}</p>
                      </div>
                    </div>

                    {store.notes && (
                      <div className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 border-t border-zinc-100 dark:border-zinc-900 pt-3 mt-1">
                        <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-zinc-500">店家特別公告</p>
                          <p className="text-zinc-650 dark:text-zinc-400 mt-0.5 italic">{store.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* QUICK ACTIONS FOR CONSUMERS */}
                  <div className="grid grid-cols-2 gap-3 shrink-0 mt-auto">
                    <button 
                      onClick={handleCall}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" /> 撥號致電
                    </button>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.name + ' ' + store.address)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (onNavigateClick) onNavigateClick(store.id);
                      }}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 font-semibold text-xs rounded-xl transition-all shadow-xs"
                    >
                      <Compass className="w-3.5 h-3.5" /> 開啟導航
                    </a>
                  </div>
                </motion.div>
              )}

              {activeTab === 'menu' && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 flex-1 flex flex-col"
                >
                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 shadow-xs flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2 mb-3">
                        <span className="text-xs font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-1.5">
                          <span>🍽️ 店家精選美味菜單</span>
                        </span>
                        <span className="text-[10px] bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded">
                          人氣推薦
                        </span>
                      </div>

                      <div className="space-y-3">
                        {((store.imageCategory && THEME_MENUS[store.imageCategory]) || DEFAULT_MENU).map((item, idx) => (
                          <div 
                            key={idx} 
                            className="bg-zinc-50/50 dark:bg-zinc-900/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-850 flex items-start gap-2.5 hover:border-amber-200/55 dark:hover:border-amber-900/55 transition-all group"
                          >
                            <span className="text-2.5xl pt-0.5 group-hover:scale-110 transition-all select-none shrink-0">
                              {item.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h6 className="text-[11px] font-black text-zinc-900 dark:text-zinc-50 truncate">
                                  {item.name}
                                </h6>
                                <span className="text-[11px] font-black font-mono text-amber-600 dark:text-amber-400 shrink-0">
                                  ${item.price}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-[9px] text-zinc-400 dark:text-zinc-550 text-center leading-normal mt-4">
                      ※ 實際品項與價格依現場提供及最新公告為準。
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'waitlist' && (
                <motion.div
                  key="waitlist"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col flex-1"
                >
                  {waitlistSuccess ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-2xl">
                      <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                      </div>
                      <h4 className="font-bold text-zinc-900 dark:text-white text-lg">預約號碼領取成功！</h4>
                      <p className="text-zinc-500 text-xs mt-2 max-w-[220px]">您的候位號碼為 <strong>A-07</strong>。目前現場尚有 2 組候位中，請耐心等候簡訊通知。</p>
                      
                      <div className="mt-5 w-full bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50 space-y-1.5 text-left text-[11px]">
                        <p className="text-zinc-500">用餐商家：<span className="text-zinc-900 dark:text-white font-medium">{store.name}</span></p>
                        <p className="text-zinc-500">預約名稱：<span className="text-zinc-900 dark:text-white font-medium">{waitlistName} 先生/小姐</span></p>
                        <p className="text-zinc-500">用餐人數：<span className="text-zinc-900 dark:text-white font-medium">{waitlistPeople} 人</span></p>
                        <p className="text-zinc-500">登記電話：<span className="text-zinc-900 dark:text-white font-medium">{waitlistPhone}</span></p>
                      </div>

                      <button 
                        onClick={() => setWaitlistSuccess(false)}
                        className="mt-6 text-xs text-amber-500 font-medium hover:underline"
                      >
                        再次登記/修改預約
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 shadow-xs flex-1 flex flex-col">
                      <div className="mb-4">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">線上遠端取號</h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5">預約成功後，將提供即時排隊進度，並能收到簡訊或 Line 自動通知。</p>
                      </div>

                      <form onSubmit={handleWaitlistSubmit} className="space-y-3.5 flex-1 flex flex-col">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400 mb-1">顧客姓名</label>
                          <input 
                            type="text" 
                            required
                            placeholder="請輸入姓名"
                            value={waitlistName}
                            onChange={(e) => setWaitlistName(e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-850 rounded-xl bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400 mb-1">行動電話</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="如: 0912345678"
                            value={waitlistPhone}
                            onChange={(e) => setWaitlistPhone(e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-850 rounded-xl bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400 mb-1">用餐人數</label>
                          <select 
                            value={waitlistPeople}
                            onChange={(e) => setWaitlistPeople(e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-850 rounded-xl bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-900 dark:text-white"
                          >
                            <option value="1">1 人 (個人餐座)</option>
                            <option value="2">2 人 (雙人座)</option>
                            <option value="3">3 人</option>
                            <option value="4">4 人 (家庭聚餐)</option>
                            <option value="5">5 人以上 (多人桌)</option>
                          </select>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-100 dark:border-amber-900/50 flex gap-2 text-[10px] text-amber-700 dark:text-amber-300 leading-normal mt-auto shrink-0">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p>
                            {store.status === 'full' 
                              ? '⚠️ 提示：目前店內「已客滿」，取號後預計需排隊等候，若叫號到場未到，將自動失效。'
                              : '💡 提示：目前店內「有空位/快客滿」，取號後請於 10 分鐘內到場報到。'
                            }
                          </p>
                        </div>

                        <button 
                          type="submit"
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0"
                        >
                          立即登記排隊
                        </button>
                      </form>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer of mock app */}
          <div className="p-3 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-center text-[10px] text-zinc-500 shrink-0">
            Powered by Veyra
          </div>
        </div>

        {/* Home indicator bar */}
        <div className="absolute bottom-1 inset-x-0 flex justify-center z-50">
          <div className="w-28 h-1 bg-zinc-700 dark:bg-zinc-400 rounded-full"></div>
        </div>

        {/* Simulated calling dialog overlay */}
        <AnimatePresence>
          {simulatedCalling && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-white z-55"
            >
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-pulse text-3xl mb-4">
                📞
              </div>
              <h4 className="text-xl font-bold">{store.name}</h4>
              <p className="text-sm text-green-400 mt-1 font-mono">撥號通話中...</p>
              <p className="text-xs text-zinc-400 mt-1">{store.phone}</p>
              <button 
                onClick={() => setSimulatedCalling(false)}
                className="mt-16 px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-full tracking-wide transition-all"
              >
                結束通話
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
