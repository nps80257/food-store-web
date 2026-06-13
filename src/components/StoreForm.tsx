import React, { useState, useEffect, useRef } from 'react';
import { FoodStore, SeatStatus, FOOD_THEMES } from '../types';
import { X, Save, Clock, MapPin, Phone, MessageSquare, Image as ImageIcon, Key, Lock, User, Upload, Trash2, ShieldAlert } from 'lucide-react';

interface StoreFormProps {
  store: FoodStore | null;
  onSave: (data: {
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
  }) => void;
  onCancel: () => void;
}

export default function StoreForm({ store, onSave, onCancel }: StoreFormProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [status, setStatus] = useState<SeatStatus>('available');
  const [notes, setNotes] = useState('');
  const [imageCategory, setImageCategory] = useState('ramen');
  
  // New States: Credentials
  const [ownerUsername, setOwnerUsername] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  // New States: Image Upload
  const [customImage, setCustomImage] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize fields if editing
  useEffect(() => {
    if (store) {
      setName(store.name || '');
      setAddress(store.address || '');
      setPhone(store.phone || '');
      setBusinessHours(store.businessHours || '');
      setStatus(store.status || 'available');
      setNotes(store.notes || '');
      setImageCategory(store.imageCategory || 'ramen');
      setOwnerUsername(store.ownerUsername || '');
      setOwnerPassword(store.ownerPassword || '');
      setCustomImage(store.customImage || '');
    } else {
      // Reset & pre-populate basic admin credentials
      setName('');
      setAddress('');
      setPhone('');
      setBusinessHours('11:00 - 21:00');
      setStatus('available');
      setNotes('');
      setImageCategory('ramen');
      setOwnerUsername('');
      setOwnerPassword('');
      setCustomImage('');
    }
  }, [store]);

  // Quick Preset Helper Buttons
  const applyHoursPreset = (preset: string) => setBusinessHours(preset);
  const applyAddressPreset = (preset: string) => setAddress(preset);

  // Auto generate credentials based on name / phone
  const handleAutoCredentials = () => {
    if (!name.trim()) {
      alert('請先填寫店名，才能為自動配對專屬帳號。');
      return;
    }
    // Simple transliteration check or Pinyin replacement, or just base name
    const generatedUser = 'store_' + Math.floor(Math.random() * 900 + 100);
    const generatedPass = Math.floor(Math.random() * 900000 + 100000).toString();
    setOwnerUsername(generatedUser);
    setOwnerPassword(generatedPass);
  };

  // Image compressor helper
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
        const MAX_WIDTH = 700; // Optimal web sizing
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
          // Compress to low-size high-speed JPEG (0.75 ratio)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setCustomImage(dataUrl);
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

  const handleDeleteImage = () => {
    setCustomImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !phone.trim() || !businessHours.trim()) {
      return alert('請確實填寫所有必填欄位 (店名、地址、電話、營業時間)！');
    }

    // Fallback account settings if not specified
    let finalUser = ownerUsername.trim();
    let finalPass = ownerPassword.trim();
    if (!finalUser || !finalPass) {
      // Auto assign simple phone digits if blank
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      finalUser = finalUser || 'user_' + (cleanPhone.slice(-4) || 'food');
      finalPass = finalPass || '123456';
    }

    onSave({
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      businessHours: businessHours.trim(),
      status,
      notes: notes.trim(),
      imageCategory,
      ownerUsername: finalUser,
      ownerPassword: finalPass,
      customImage,
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm" id="store-form-card">
      <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800/80 pb-4 mb-5">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50" id="form-title">
            {store ? '📝 編輯食品店家資料' : '✨ 建立新店家及帳號'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {store ? '修改現有店家的資訊、專屬登入帳號及相片' : '在您的平台增加一家新的美食店家與聯絡方式'}
          </p>
        </div>
        <button 
          onClick={onCancel}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200/40 dark:border-zinc-750"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" id="store-data-form">
        
        {/* SECTION 1: BASIC INFO */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
            <span>❶ 基本資料與餐點類型</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
                店名 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-zinc-400">🏪</span>
                <input 
                  type="text" 
                  required
                  placeholder="例如：六目拉麵、微光咖啡"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 dark:focus:border-amber-400 text-zinc-900 dark:text-zinc-50 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-400" /> 餐點大類 (未上傳相片時使用)
              </label>
              <select
                value={imageCategory}
                onChange={(e) => setImageCategory(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 dark:focus:border-amber-400 text-zinc-900 dark:text-zinc-50 transition-all"
              >
                {FOOD_THEMES.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.icon} {theme.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: PHOTO UPLOAD */}
        <div className="space-y-3 pt-1 border-t border-zinc-100 dark:border-zinc-800/40">
          <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
            <span>❷ 上傳特色店家照片</span>
          </h4>

          {/* Photo Uploader Component Frame */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center text-center relative overflow-hidden ${
              isDragging 
                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/10' 
                : customImage 
                  ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/30'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-950'
            }`}
          >
            {customImage ? (
              <div className="w-full space-y-3">
                <div className="w-full h-36 rounded-xl overflow-hidden relative group">
                  <img 
                    src={customImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="bg-red-500 hover:bg-red-650 text-white p-2.5 rounded-full transition-transform hover:scale-105 shadow-sm"
                      title="移除上傳的相片"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    ✓ 圖片已完美壓縮儲存 [Base64]
                  </span>
                  <button 
                    type="button" 
                    onClick={handleDeleteImage}
                    className="text-rose-500 hover:underline font-medium"
                  >
                    替換照片
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-3 cursor-pointer w-full" onClick={() => fileInputRef.current?.click()}>
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/40 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                {compressing ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-bold animate-pulse">正在進行極速壓縮中...</p>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      拖放店家宣傳照片，或 <span className="text-amber-500 hover:underline">瀏覽本機檔案</span>
                    </p>
                    <p className="text-[10px] text-zinc-400 max-w-[280px] mx-auto">
                      支援 PNG, JPG, WEBP。系統將自動縮圖優化，提供最高效的加載速度及續航快取。
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

        {/* SECTION 3: CONTACT & HOURS */}
        <div className="space-y-4 pt-1 border-t border-zinc-100 dark:border-zinc-800/40">
          <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
            <span>❸ 營業時間、電話與地址</span>
          </h4>

          {/* 地址 */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
              地址 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                required
                placeholder="例如：台北市大安區信義路二段 45 號"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-sm pl-9 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 dark:focus:border-amber-400 text-zinc-900 dark:text-zinc-50 transition-all"
              />
            </div>
            {/* Quick address suggestions */}
            <div className="mt-1.5 flex flex-wrap gap-1 items-center">
              {[
                '台北市信義區松壽路 12 號',
                '台中市西屯區台灣大道三段 301 號',
                '台南市中西區國華街三段 16 號'
              ].map((addr) => (
                <button
                  type="button"
                  key={addr}
                  onClick={() => applyAddressPreset(addr)}
                  className="text-[10px] bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-650 dark:text-zinc-300 py-0.5 px-2 rounded-md border border-zinc-200/50 dark:border-zinc-700/50 transition-all"
                >
                  {addr.substring(0, 6)}...
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: 電話與營業時間 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
                電話 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  required
                  placeholder="例如：02-2345-6789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 dark:focus:border-amber-400 text-zinc-900 dark:text-zinc-50 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide flex items-center justify-between">
                <span>營業時間 <span className="text-rose-500">*</span></span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  required
                  placeholder="例如：11:30 - 21:00"
                  value={businessHours}
                  onChange={(e) => setBusinessHours(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 dark:focus:border-amber-400 text-zinc-900 dark:text-zinc-50 transition-all font-sans"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: LOGIN ACCOUNT SETTING */}
        <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/40">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>❹ 店家經理專屬登入設定</span>
            </h4>
            <button
              type="button"
              onClick={handleAutoCredentials}
              className="text-[10px] bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 px-2 py-0.5 rounded-md font-semibold transition-all"
            >
              🎲 自動產生帳密
            </button>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl p-3.5 space-y-3">
            <div className="flex gap-2 text-[10px] text-zinc-500 items-start">
              <ShieldAlert className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
              <p className="leading-relaxed">
                本系統將為店家自動開啟「專屬前台管理模式」。店家經理可在本系統上方點選登入此帳密，即可獨立變更當前空位狀態 (有空位/快客滿/客滿)。
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-1">管理員登入帳號 (Username)</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-400" />
                  <input 
                    type="text"
                    placeholder="如: ramen_admin"
                    value={ownerUsername}
                    onChange={(e) => setOwnerUsername(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-900 dark:text-zinc-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-1">管理員登入密碼 (Password)</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-400" />
                  <input 
                    type="text" // Made readable for simpler admin usability preset
                    placeholder="如: 654321"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-900 dark:text-zinc-50 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 5: 空位狀態 */}
        <div className="space-y-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800/40">
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            ❺ 當前空位狀態
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Status Option Available */}
            <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center transition-all ${
              status === 'available'
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/70 text-emerald-800 dark:text-emerald-400 font-bold ring-2 ring-emerald-500/10'
                : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-550 dark:text-zinc-400'
            }`}>
              <input 
                type="radio" 
                name="status" 
                value="available"
                className="sr-only"
                checked={status === 'available'}
                onChange={() => setStatus('available')}
              />
              <span className="text-lg">🟢</span>
              <span className="text-xs mt-1">有空位</span>
            </label>

            {/* Status Option Almost Full */}
            <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center transition-all ${
              status === 'almost-full'
                ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/70 text-amber-800 dark:text-amber-400 font-bold ring-2 ring-amber-500/10'
                : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-550 dark:text-zinc-400'
            }`}>
              <input 
                type="radio" 
                name="status" 
                value="almost-full"
                className="sr-only"
                checked={status === 'almost-full'}
                onChange={() => setStatus('almost-full')}
              />
              <span className="text-lg">🟡</span>
              <span className="text-xs mt-1">快客滿</span>
            </label>

            {/* Status Option Full */}
            <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center transition-all ${
              status === 'full'
                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/70 text-rose-800 dark:text-rose-400 font-bold ring-2 ring-rose-500/10'
                : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-550 dark:text-zinc-400'
            }`}>
              <input 
                type="radio" 
                name="status" 
                value="full"
                className="sr-only"
                checked={status === 'full'}
                onChange={() => setStatus('full')}
              />
              <span className="text-lg">🔴</span>
              <span className="text-xs mt-1">客滿</span>
            </label>
          </div>
        </div>

        {/* 店家公告、行銷備註 */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-zinc-400" /> 特色簡介 / 顧客公告 (選填)
          </label>
          <textarea 
            rows={2}
            placeholder="例如：打卡送手工軟餅乾！/ 精緻拉麵、座位限制 8 席，客滿限時 1 小時。"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 dark:focus:border-amber-400 text-zinc-900 dark:text-zinc-50 transition-all resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-3 border-t border-zinc-150 dark:border-zinc-800/80">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 text-xs font-semibold text-zinc-650 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 transition-all text-center"
          >
            取消
          </button>
          <button 
            type="submit"
            className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> 儲存
          </button>
        </div>
      </form>
    </div>
  );
}
