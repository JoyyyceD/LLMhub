import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Rocket, LogOut, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: '模型选择', path: '/' },
    { name: '性能榜单', path: '/leaderboard' },
    { name: '性能对比', path: '/compare' },
    { name: '社区', path: '/community' },
    { name: '开发者生态', path: '/ecosystem' },
    { name: '关于我们', path: '/about' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <Rocket className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">Token Galaxy</span>
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
                      : "text-slate-500 hover:text-primary"
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
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/review/new"
                  className="inline-flex bg-primary text-white text-sm font-black px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-all"
                >
                  写点评
                </Link>
                <Link to="/account" className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-bold text-slate-700 max-w-[120px] truncate">
                    {user.user_metadata?.username ?? user.email?.split('@')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
                  title="退出登录"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/review/new"
                  className="inline-flex bg-primary text-white text-sm font-black px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-all"
                >
                  写点评
                </Link>
                <Link
                  to="/login"
                  className="bg-slate-900 text-white text-sm font-black px-7 py-3 rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  登录/注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <Rocket className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Token Galaxy</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              致力于为AI使用者提供最客观、真实、实时的 LLM 和多模态模型选型建议与性能评测数据。
            </p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6">开发者资源</h4>
            <ul className="space-y-3">
              <li><Link to="/ecosystem" className="text-sm text-slate-600 hover:text-primary transition-colors">开发者生态入口</Link></li>
            </ul>
          </div>
          <div className="hidden md:block">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6">社区生态</h4>
            <ul className="space-y-3">
              <li><Link to="/community" className="text-sm text-slate-600 hover:text-primary transition-colors">模型讨论</Link></li>
              <li><Link to="/compare" className="text-sm text-slate-600 hover:text-primary transition-colors">评测对比</Link></li>
              <li><Link to="/community" className="text-sm text-slate-600 hover:text-primary transition-colors">开发者沙龙</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6">订阅更新</h4>
            <p className="text-xs text-slate-400 mb-4 tracking-wide">每周获取最新的模型性能报告与降价通知。</p>
            <div className="flex gap-2">
              <input
                type="email"
                className="bg-slate-100 border border-slate-200 rounded-lg text-sm w-full focus:ring-1 focus:ring-primary px-4 py-2 text-slate-900 placeholder:text-slate-400"
                placeholder="邮箱地址"
              />
              <button className="bg-primary text-white p-2.5 rounded-lg hover:bg-primary/90 transition-all">
                <Rocket className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest gap-4">
          <p>© 2024 Token Galaxy</p>
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
