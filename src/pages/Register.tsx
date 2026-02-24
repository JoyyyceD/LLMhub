import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Rocket, Mail, Lock, ArrowRight, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 8) {
      setError('密码至少需要 8 位字符');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { username: formData.name },
      },
    });
    setLoading(false);
    if (error) {
      if (error.message.includes('already registered')) {
        setError('该邮箱已被注册，请直接登录');
      } else {
        setError(error.message);
      }
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 shadow-xl">
            <div className="inline-flex items-center justify-center p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">注册成功！</h2>
            <p className="text-slate-500 mb-8">
              我们已向 <span className="font-bold text-slate-700 dark:text-slate-300">{formData.email}</span> 发送了验证邮件，请点击邮件中的链接完成验证。
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              前往登录
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-primary rounded-2xl text-white mb-6 shadow-xl shadow-primary/20">
            <Rocket className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">创建新账号</h1>
          <p className="text-slate-500">加入 Token Galaxy 社区，开启您的模型探索之旅</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
          {error && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">用户名</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 ring-primary/20 transition-all"
                  placeholder="您的称呼"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">电子邮箱</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 ring-primary/20 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 ring-primary/20 transition-all"
                  placeholder="至少 8 位字符"
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-start gap-3 mb-6">
                <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" onChange={() => {}} />
                <p className="text-xs text-slate-500 leading-relaxed">
                  我已阅读并同意 <Link to="/about#terms" className="font-bold text-primary hover:underline">服务条款</Link> 与 <Link to="/about#privacy" className="font-bold text-primary hover:underline">隐私政策</Link>。
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? '注册中...' : (<>创建账号 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>)}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-slate-500">
          已经有账号了? <Link to="/login" className="font-bold text-primary hover:underline">立即登录</Link>
        </p>
      </motion.div>
    </div>
  );
};
