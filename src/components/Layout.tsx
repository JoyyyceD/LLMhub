import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Rocket, Search, Moon, Sun, Menu, X, Brain } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Header = () => {
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const navLinks = [
    { name: '模型选择', path: '/' },
    { name: '性能榜单', path: '/leaderboard' },
    { name: '社区', path: '/community' },
    { name: '关于我们', path: '/about' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <Rocket className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">ModelHub</span>
            </Link>
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-[15px] font-bold transition-all py-2 relative group",
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-slate-500 dark:text-slate-400 hover:text-primary"
                  )}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.div 
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-2.5 gap-3 border border-slate-200 dark:border-slate-700 focus-within:ring-4 ring-primary/10 transition-all w-72">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="bg-transparent border-none focus:ring-0 text-sm w-full p-0 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                placeholder="搜索模型或厂商..."
              />
            </div>
            <button
              onClick={toggleDark}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link
              to="/login"
              className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-sm font-black px-7 py-3 rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg shadow-slate-200 dark:shadow-none"
            >
              登录/控制台
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <Rocket className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LLM 智能筛选</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              致力于为中国开发者提供最客观、真实、实时的 LLM 模型选型建议与性能评测数据。
            </p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-6">开发者资源</h4>
            <ul className="space-y-3">
              <li><Link to="/resources#benchmarks" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">行业评测基准</Link></li>
              <li><Link to="/resources#status" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">厂商 API 状态</Link></li>
              <li><Link to="/resources#docs" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">接入文档指南</Link></li>
            </ul>
          </div>
          <div className="hidden md:block">
            {/* Empty space to maintain grid layout after removing Model Comparison */}
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-6">订阅更新</h4>
            <p className="text-xs text-slate-400 mb-4 tracking-wide">每周获取最新的模型性能报告与降价通知。</p>
            <div className="flex gap-2">
              <input
                type="email"
                className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm w-full focus:ring-1 focus:ring-primary px-4 text-slate-900 dark:text-white"
                placeholder="邮箱地址"
              />
              <button className="bg-primary text-white p-2.5 rounded-lg hover:bg-primary/90 transition-all">
                <Rocket className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest gap-4">
          <p>© 2024 LLM Selector Inc. 沪ICP备88888888号</p>
          <div className="flex gap-8">
            <Link to="/about#privacy" className="hover:text-primary transition-colors">隐私政策</Link>
            <Link to="/about#terms" className="hover:text-primary transition-colors">服务条款</Link>
            <Link to="/about#contact" className="hover:text-primary transition-colors">联系我们</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};
