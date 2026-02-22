import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    { name: '性能对比', path: '/compare' },
    { name: '社区', path: '/community' },
    { name: '关于我们', path: '/about' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <Rocket className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LLM 智能筛选</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-[15px] font-medium transition-colors py-5",
                    location.pathname === link.path
                      ? "text-primary border-b-2 border-primary"
                      : "text-slate-600 dark:text-slate-400 hover:text-primary"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-1.5 gap-2 border border-slate-200 dark:border-slate-700 focus-within:ring-2 ring-primary/20 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="bg-transparent border-none focus:ring-0 text-sm w-48 p-0 text-slate-900 dark:text-white"
                placeholder="搜索模型或厂商..."
              />
            </div>
            <button
              onClick={toggleDark}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-sm font-bold px-5 py-2 rounded-full hover:opacity-90 transition-all">
              登录
            </button>
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
              <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">行业评测基准</a></li>
              <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">厂商 API 状态</a></li>
              <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">接入文档指南</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-6">模型对比</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">DeepSeek vs Qwen</a></li>
              <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">智谱 GLM vs 百川</a></li>
              <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Claude vs GPT-4o</a></li>
            </ul>
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
            <a href="#" className="hover:text-primary transition-colors">隐私政策</a>
            <a href="#" className="hover:text-primary transition-colors">服务条款</a>
            <a href="#" className="hover:text-primary transition-colors">联系我们</a>
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
