
import React, { useState } from 'react';
import { supabase, resetConfiguration } from '../lib/supabaseClient';
import { Sparkles, Lock, Mail, Loader2, UserPlus, LogIn, RefreshCw } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user && data.session) {
            // Auto login success (if email confirm is disabled)
             setMessage('สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...');
        } else if (data.user && !data.session) {
            // Email confirmation required
            setMessage('สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลของท่านเพื่อยืนยันตัวตนก่อนเข้าสู่ระบบ');
            setMode('login'); // Switch back to login view
        }
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      if (err.message === 'Failed to fetch') {
          setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต หรือกดปุ่มรีเซ็ตด้านล่าง');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/50 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Patricia Clinic Manager</h1>
            <p className="text-gray-500 text-sm">
              {mode === 'login' ? 'เข้าสู่ระบบจัดการคลินิก' : 'ลงทะเบียนผู้ดูแลระบบใหม่'}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล (Email)</label>
            <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                    type="email"
                    required
                    className="w-full pl-10 p-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="doctor@patriciaclinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน (Password)</label>
            <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-700" size={20} />
                <input
                    type="password"
                    required
                    className="w-full pl-10 p-3 border bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="••••••••"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            {mode === 'register' && <p className="text-xs text-gray-400 mt-1">รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร</p>}
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                <span>⚠️</span> {error === 'Invalid login credentials' ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2 border border-green-100">
                <span>✅</span> {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-700 text-white rounded-xl hover:bg-gray-800 font-medium shadow-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : mode === 'login' ? (
              <>เข้าสู่ระบบ <LogIn size={18}/></>
            ) : (
              <>สมัครสมาชิก <UserPlus size={18}/></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
                {mode === 'login' ? 'ยังไม่มีบัญชีผู้ใช้?' : 'มีบัญชีอยู่แล้ว?'}
            </p>
            <button 
                onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setError('');
                    setMessage('');
                }}
                className="text-blue-600 font-semibold hover:underline mt-1 text-sm"
            >
                {mode === 'login' ? 'ลงทะเบียนผู้ใช้งานใหม่' : 'กลับไปหน้าเข้าสู่ระบบ'}
            </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-3">
            <p className="text-xs text-gray-400">Secured by Supabase Authentication</p>
            
            <button 
                onClick={resetConfiguration}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition bg-gray-50 px-3 py-1.5 rounded-lg"
                title="ล้างการตั้งค่าการเชื่อมต่อที่ผิดพลาด"
            >
                <RefreshCw size={12} />
                รีเซ็ตการเชื่อมต่อฐานข้อมูล (Reset Connection)
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
