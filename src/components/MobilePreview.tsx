import React, { useState } from 'react';
import { FoodStore, STATUS_LABELS, FOOD_THEMES } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, Clock, Share2, Compass, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';

interface MobilePreviewProps {
  store: FoodStore | null;
  onAddReservation?: (storeId: string, name: string, phone: string, people: number) => void;
}

export default function MobilePreview({ store, onAddReservation }: MobilePreviewProps) {
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
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs shrink-0">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3 text-center font-medium transition-colors border-b-2 ${
                activeTab === 'info' 
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              店家空位資訊
            </button>
            <button
              onClick={() => {
                setActiveTab('waitlist');
                setWaitlistSuccess(false);
              }}
              className={`flex-1 py-3 text-center font-medium transition-colors border-b-2 ${
                activeTab === 'waitlist' 
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              線上預約候位
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 p-4 flex flex-col">
            <AnimatePresence mode="wait">
              {activeTab === 'info' ? (
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

                    {/* Fun description tag */}
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2 px-2 leading-relaxed">
                      {store.status === 'available' && '🎉 現場目前有充裕座位，推薦立刻前往用餐！'}
                      {store.status === 'almost-full' && '⚡ 座位僅餘零星席次，出發前建議點擊下方通話，好位不等人！'}
                      {store.status === 'full' && '⌛ 當前人數較多需要排隊，點選上方「線上預約」即可先拿取號碼牌！'}
                    </p>

                    {/* Last updated timestamp inside mobile app */}
                    <div className="mt-3 text-[10px] bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 py-1 px-2.5 rounded-full text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      最後更新：{store.lastUpdated ? store.lastUpdated.split(' ')[1] || store.lastUpdated : '剛剛'}
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
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 font-semibold text-xs rounded-xl transition-all shadow-xs"
                    >
                      <Compass className="w-3.5 h-3.5" /> 開啟導航
                    </a>
                  </div>
                </motion.div>
              ) : (
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
            Powered by Food Store Status Platform
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
