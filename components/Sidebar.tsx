import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Sparkles, ShoppingCart, Package, LogOut, Tag, X, PanelLeftClose, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { signOut, user } = useAuth();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
      isActive ? 'bg-rose-100 text-rose-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <div className="h-full bg-white flex flex-col w-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-200">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight truncate">Patricia Clinic</h1>
            </div>
            {/* Close/Collapse Button */}
            <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
                title="Close Sidebar"
            >
                <X size={24} className="md:hidden" />
                <PanelLeftClose size={24} className="hidden md:block" />
            </button>
        </div>

        <nav className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-200px)]">
          <NavLink to="/" className={navClass} onClick={() => window.innerWidth < 768 && onClose?.()}>
            <LayoutDashboard size={20} />
            <span>ภาพรวม (Dashboard)</span>
          </NavLink>
          <NavLink to="/appointments" className={navClass} onClick={() => window.innerWidth < 768 && onClose?.()}>
            <Calendar size={20} />
            <span>นัดหมาย (Schedule)</span>
          </NavLink>
          <NavLink to="/customers" className={navClass} onClick={() => window.innerWidth < 768 && onClose?.()}>
            <Users size={20} />
            <span>ลูกค้า (CRM)</span>
          </NavLink>
           <NavLink to="/pos" className={navClass} onClick={() => window.innerWidth < 768 && onClose?.()}>
            <ShoppingCart size={20} />
            <span>การขาย (POS)</span>
          </NavLink>
           <NavLink to="/inventory" className={navClass} onClick={() => window.innerWidth < 768 && onClose?.()}>
            <Package size={20} />
            <span>คลังสินค้า (Stock)</span>
          </NavLink>
          <NavLink to="/services" className={navClass} onClick={() => window.innerWidth < 768 && onClose?.()}>
            <Tag size={20} />
            <span>บริการ (Services)</span>
          </NavLink>
          <NavLink to="/ai-consultant" className={navClass} onClick={() => window.innerWidth < 768 && onClose?.()}>
            <Sparkles size={20} />
            <span>ผู้ช่วย AI (AI Assistant)</span>
          </NavLink>
          <NavLink to="/settings" className={navClass} onClick={() => window.innerWidth < 768 && onClose?.()}>
            <Settings size={20} />
            <span>ตั้งค่า (Settings)</span>
          </NavLink>
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                {user?.email?.charAt(0).toUpperCase() || 'D'}
            </div>
            <div className="overflow-hidden min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
                <p className="text-xs text-gray-500">Staff / Admin</p>
            </div>
        </div>
        <button 
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-red-600 w-full transition-colors rounded-lg hover:bg-red-50"
        >
            <LogOut size={18} />
            <span>ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;