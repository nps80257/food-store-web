import React, { useState, useRef } from 'react';
import { FoodStore, SeatStatus, FOOD_THEMES } from '../types';
import { 
  Key, 
  Lock, 
  User, 
  Upload, 
  Trash2, 
  ShieldAlert, 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  MessageSquare, 
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  UserPlus
} from 'lucide-react';

interface LoginOrRegisterProps {
  stores: FoodStore[];
  onLoginSuccess: (storeId: string) => void;
  onRegisterSuccess: (newStore: FoodStore) => void;
}

export default function LoginOrRegister({ stores, onLoginSuccess, onRegisterSuccess }: LoginOrRegisterProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // --- LOGIN STATES ---
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- REGISTER STATES ---
  const [regName, setRegName] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBusinessHours, setRegBusinessHours] = useState('11:00 - 21:00');
  const [regNotes, setRegNotes] = useState('');
  const [regImageCategory, setRegImageCategory] = useState('ramen');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCustomImage, setRegCustomImage] = useState<string>('');
  const [regMaxSeats, setRegMaxSeats] = useState<number>(15);
  
  // Interaction/Upload States
  const [isDragging, setIsDragging] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [regError, setRegError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOGIN SUBMIT ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const matchedStore = stores.find(
      s => s.ownerUsername?.toLowerCase() === loginUsername.trim().toLowerCase() && 
           s.ownerPassword === loginPassword
    );

    if (matchedStore) {
      onLoginSuccess(matchedStore.id);
    } else {
      setLoginError('❌ 帳號或密碼錯誤！請再次確認您的輸入。');
    }
  };

  // --- AUTO GENERATE CREDENTIALS ---
  const handleAutoCredentials = () => {
    if (!regName.trim()) {
      alert('請先填寫店名，才能為您產生專屬帳號。');
      return;
    }
    const generatedUser = 'owner_' + Math.floor(Math.random() * 900 + 100);
    const generatedPass = Math.floor(Math.random() * 900000 + 100000).toString();
    setRegUsername(generatedUser);
    setRegPassword(generatedPass);
  };

  // --- IMAGE COMPRESSION WORKFLOW ---
  const compressAndSetImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('僅支援上傳圖片檔案格式！');
      return;
    }

    setCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 700; // Optimal sizing
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.72); // compressed
          setRegCustomImage(dataUrl);
        }
        setCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      compressAndSetImage(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      compressAndSetImage(files[0]);
    }
  };

  const handleDeleteImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRegCustomImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --- REGISTER SUBMIT ---
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    // Validations
    if (!regName.trim() || !regAddress.trim() || !regPhone.trim() || !regBusinessHours.trim()) {
      setRegError('❌ 請確實填寫所有必填欄位 (店名、地址、電話、營業時間)！');
      return;
    }

    const usernameInput = regUsername.trim();
    const passwordInput = regPassword.trim();
    if (!usernameInput || !passwordInput) {
      setRegError('❌ 請填寫您偏好的管理員登入帳號及密碼，或點擊「自動產生帳密」！');
      return;
    }

    // Check account duplication
    const isDuplicate = stores.some(
      s => s.ownerUsername?.toLowerCase() === usernameInput.toLowerCase()
    );
    if (isDuplicate) {
      setRegError('❌ 註冊失敗！此帳號名稱已被其他店家使用，請換一個。');
      return;
    }

    // Build store object
    const newStore: FoodStore = {
      id: 'store-' + Date.now(),
      name: regName.trim(),
      address: regAddress.trim(),
      phone: regPhone.trim(),
      businessHours: regBusinessHours.trim(),
      status: 'available', // Defaults to green
      notes: regNotes.trim() ? regNotes.trim() : '✨ 歡迎光臨！我們期待為您提供優質的現場服務。',
      imageCategory: regImageCategory,
      ownerUsername: usernameInput,
      ownerPassword: passwordInput,
      customImage: regCustomImage,
      maxSeats: regMaxSeats,
      availableSeats: regMaxSeats, // initially defaults to all seats free
      estimatedWaitMinutes: 15,
      todayImpressions: 1,
      todayClicks: 0,
      favoritesCount: 0,
      navigationCount: 0,
      hourlyViews: {
        '11:00': 0,
        '12:00': 0,
        '18:00': 0,
        '19:00': 0,
        '20:00': 0,
        'other': 0
      },
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setIsSuccess(true);
    setTimeout(() => {
      onRegisterSuccess(newStore);
      setIsSuccess(false);
      // Clean up fields
      setRegName('');
      setRegAddress('');
      setRegPhone('');
      setRegNotes('');
      setRegUsername('');
      setRegPassword('');
      setRegCustomImage('');
      setRegMaxSeats(15);
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl transition-all" id="login-or-register-portal">
      
      {/* Visual Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-8 text-white relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 space-y-2">
          <span className="bg-amber-400/30 text-amber-100 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider">
            OWNER WORKSPACE · 店家獨立經營後台
          </span>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            🏪 歡迎來到店家專屬管理終端
          </h2>
          <p className="text-sm text-amber-50/90 max-w-lg leading-relaxed">
            透過您的店家帳號登入，即可極速更改座位空位率、上傳代表照並管理即時排隊預約。未加入？僅需 30 秒填寫即可在平台全自動開通上架！
          </p>
        </div>
      </div>

      {/* Tabs Controller */}
      <div className="flex border-b border-zinc-100 dark:border-zinc-800">
        <button
          onClick={() => {
            setActiveTab('login');
            setLoginError('');
            setRegError('');
          }}
          className={`flex-1 py-4 text-xs font-bold transition-all focus:outline-none flex items-center justify-center gap-2 relative ${
            activeTab === 'login'
              ? 'text-amber-500 bg-zinc-50/30 dark:bg-zinc-950/20'
              : 'text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>已有帳密？直接登入</span>
          {activeTab === 'login' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('register');
            setLoginError('');
            setRegError('');
          }}
          className={`flex-1 py-4 text-xs font-bold transition-all focus:outline-none flex items-center justify-center gap-2 relative ${
            activeTab === 'register'
              ? 'text-amber-500 bg-zinc-50/30 dark:bg-zinc-950/20'
              : 'text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>新店入駐？點此即時註冊</span>
          {activeTab === 'register' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></span>
          )}
        </button>
      </div>

      <div className="p-8">
        {/* TAB 1: OPERATOR LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && (
              <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 text-xs p-3.5 rounded-xl border border-rose-200/50 dark:border-rose-900/45 font-medium leading-relaxed">
                {loginError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-450 mb-1.5 uppercase tracking-wide">
                  店家管理帳號 (Username)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4.5 h-4.5 text-zinc-400" />
                  <input 
                    type="text"
                    required
                    placeholder="輸入註冊時或原有的帳號 (如 ramen123)"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full text-sm pl-11 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-805 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-zinc-900 dark:text-zinc-100 font-sans transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-450 mb-1.5 uppercase tracking-wide">
                  管理登入密碼 (Password)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4.5 h-4.5 text-zinc-400" />
                  <input 
                    type="password"
                    required
                    placeholder="輸入對應的經營密碼 (如 123)"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-sm pl-11 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-805 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-zinc-900 dark:text-zinc-100 font-mono transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Quick Helper for user feedback and fast tests */}
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 p-4 rounded-xl flex items-start gap-2.5 text-xs text-zinc-500">
              <ShieldAlert className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-zinc-700 dark:text-zinc-350">💡 平台測試用帳密提示：</span>
                <p className="leading-relaxed">
                  系統預留了幾家熱門店家的管理權限。您可以直接嘗試登入：<br />
                  一葉豚骨拉麵 帳密：<strong className="text-zinc-700 dark:text-zinc-200">ramen123 / 123</strong><br />
                  微光精品咖啡 帳密：<strong className="text-zinc-700 dark:text-zinc-200">coffee123 / 123</strong>
                </p>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-650 text-white font-bold text-sm rounded-xl tracking-wide shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>驗證並進入我的店家後台</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: STORE OWNER REGISTER FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-6">
            
            {regError && (
              <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 text-xs p-3.5 rounded-xl border border-rose-200/50 dark:border-rose-900/45 font-medium leading-relaxed">
                {regError}
              </div>
            )}

            {isSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 shadow-sm flex items-center gap-2 font-bold animate-pulse">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>恭喜您！店家註冊成功，系統即將為您自動跳轉並登入專屬工作台...</span>
              </div>
            )}

            {/* Sub-section 1: Credentials Setup */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>❶ 店家管理者登入帳密設定</span>
                </h4>
                <button
                  type="button"
                  onClick={handleAutoCredentials}
                  className="text-[10px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100/80 px-2 py-0.5 rounded-md font-extrabold transition-all"
                >
                  🎲 幫我隨機產生帳密
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">設定管理者帳號 <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                    <input 
                      type="text"
                      required
                      placeholder="例如: dahuapot_admin"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.trim())}
                      className="w-full text-xs pl-8 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">設定登入密碼 <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                    <input 
                      type="text" // Made visible so it's easier to verify when self-service registering
                      required
                      placeholder="最好 6 位數以上"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-section 2: Store basic details */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <Store className="w-3.5 h-3.5" />
                <span>❷ 美食店家與餐點基本資訊</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">美食店名 / 招牌餐點 <span className="text-rose-500">*</span></label>
                  <input 
                    type="text"
                    required
                    placeholder="例如：大華川味麻辣火鍋、微甜手作甜點"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">餐點大類類別 <span className="text-rose-500">*</span></label>
                  <select
                    value={regImageCategory}
                    onChange={(e) => setRegImageCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {FOOD_THEMES.map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.icon} {theme.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">店內總座位數 (硬體上限) <span className="text-rose-500">*</span></label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      required
                      min="1"
                      className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                      placeholder="例如: 15"
                      value={regMaxSeats}
                      onChange={(e) => setRegMaxSeats(Math.max(1, Number(e.target.value) || 0))}
                    />
                    <span className="text-xs text-zinc-400 shrink-0">席次</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-section 3: Contact & Business hours */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>❸ 聯絡地址、電話與营业時間</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">正真實體店面地址 <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                    <input 
                      type="text"
                      required
                      placeholder="例如：台北市信義區忠孝東路五段 500 號 1 樓"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">聯絡預約電話 <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                      <input 
                        type="text"
                        required
                        placeholder="例如：02-8765-4321"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">日常營業時間設定 <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                      <input 
                        type="text"
                        required
                        placeholder="例如：11:30 - 21:00 (每週一例休)"
                        value={regBusinessHours}
                        onChange={(e) => setRegBusinessHours(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-section 4: Upload Custom Image */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>❹ 上傳自訂宣傳照 (選填)</span>
              </h4>

              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center text-center relative overflow-hidden cursor-pointer ${
                  isDragging 
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/10' 
                    : regCustomImage 
                      ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/40'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-950'
                }`}
              >
                {regCustomImage ? (
                  <div className="w-full space-y-3">
                    <div className="w-full h-28 rounded-xl overflow-hidden relative group">
                      <img 
                        src={regCustomImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={handleDeleteImage}
                          className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-full transition-transform hover:scale-105 shadow"
                          title="移除此相片"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                        ✓ 已上傳相片並高度壓縮
                      </span>
                      <button 
                        type="button" 
                        onClick={handleDeleteImage}
                        className="text-rose-500 hover:underline font-bold"
                      >
                        清除並重選
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 py-1 w-full">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-950/40 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
                      <Upload className="w-4 h-4" />
                    </div>
                    {compressing ? (
                      <p className="text-xs text-amber-500 font-bold animate-pulse">正在進行壓縮中...</p>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          點擊或拖放照片，作為消費者地圖中的封面照
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          支援 PNG, JPG, WEBP。系統將自動最佳化圖片，提供最佳加載速度。
                        </p>
                      </>
                    )}
                  </div>
                )}

                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden" 
                />
              </div>
            </div>

            {/* Sub-section 5: Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-450 uppercase tracking-wide flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-zinc-400" /> 店家特色簡介 / 顧客公告 (選填)
              </label>
              <textarea 
                rows={2}
                placeholder="例如：歡迎外帶打折！/ 內座有限，客滿限時 90 分鐘。打卡分享送手作甜點一份！"
                value={regNotes}
                onChange={(e) => setRegNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
              />
            </div>

            {/* Platform rules assurance */}
            <div className="bg-zinc-50 dark:bg-zinc-950/40 p-4 border border-zinc-150 dark:border-zinc-800 rounded-xl flex gap-2 text-[10px] text-zinc-400">
              <span className="text-amber-500 font-bold shrink-0">🤝 承諾聲明：</span>
              <p className="leading-relaxed">
                本系統尊重店家自主，不收取任何上課開通費用。註冊即代表您同意本排隊狀態儀表板之使用條約，致力維護最即時的餐期現場空位。
              </p>
            </div>

            <button 
              type="submit"
              disabled={isSuccess}
              className={`w-full py-3 text-white font-bold text-sm rounded-xl tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isSuccess 
                  ? 'bg-emerald-600 cursor-not-allowed' 
                  : 'bg-amber-500 hover:bg-amber-650 transform hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-100" />
              <span>確認送出，立即開通我的店家與帳號</span>
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
