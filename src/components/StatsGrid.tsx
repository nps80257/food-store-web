import { FoodStore } from '../types';

interface StatsGridProps {
  stores: FoodStore[];
}

export default function StatsGrid({ stores }: StatsGridProps) {
  const total = stores.length;
  const available = stores.filter(s => s.status === 'available').length;
  const almostFull = stores.filter(s => s.status === 'almost-full').length;
  const full = stores.filter(s => s.status === 'full').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid-container">
      {/* Total Card */}
      <div 
        id="stat-card-total"
        className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs flex items-center justify-between transition-all hover:shadow-md"
      >
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">全部店家數量</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{total}</p>
        </div>
        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-xl">
          🏪
        </div>
      </div>

      {/* Available Card */}
      <div 
        id="stat-card-available"
        className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs flex items-center justify-between transition-all hover:shadow-md border-l-4 border-l-emerald-500"
      >
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">有空位店家</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{available}</p>
        </div>
        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center text-xl">
          🟢
        </div>
      </div>

      {/* Almost Full Card */}
      <div 
        id="stat-card-almost-full"
        className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs flex items-center justify-between transition-all hover:shadow-md border-l-4 border-l-amber-500"
      >
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">快客滿店家</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{almostFull}</p>
        </div>
        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/25 rounded-xl flex items-center justify-center text-xl">
          🟡
        </div>
      </div>

      {/* Full Card */}
      <div 
        id="stat-card-full"
        className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs flex items-center justify-between transition-all hover:shadow-md border-l-4 border-l-rose-500"
      >
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">已客滿店家</p>
          <p className="text-3xl font-bold text-rose-600 dark:text-rose-400 mt-1">{full}</p>
        </div>
        <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/25 rounded-xl flex items-center justify-center text-xl">
          🔴
        </div>
      </div>
    </div>
  );
}
