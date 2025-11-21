import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Search, ShoppingCart, Plus, X, CreditCard, Banknote, QrCode, Package, Sparkles, Check, Layers, Zap, ChevronDown, ChevronUp, UserPlus, Loader2 } from 'lucide-react';
import { CourseDefinition, Service } from '../types';

interface CartItem {
    id: string;
    type: 'service' | 'course';
    name: string;
    price: number;
    quantity: number;
}

const POSPage: React.FC = () => {
  const { customers, services, courseDefinitions, processSale, addCustomer } = useClinic();
  
  // State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit Card' | 'Transfer'>('Credit Card');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'services' | 'courses'>('courses');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  
  // Quick Add Customer Modal
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  
  // Animation State
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Derived
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (item: Service | CourseDefinition, type: 'service' | 'course') => {
      // Trigger Animation
      setJustAddedId(item.id);
      setTimeout(() => setJustAddedId(null), 500);

      const existing = cart.find(i => i.id === item.id && i.type === type);
      if (existing) {
          setCart(cart.map(i => i.id === item.id && i.type === type ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
          setCart([...cart, { id: item.id, type, name: item.name, price: item.price, quantity: 1 }]);
      }
  };

  const removeFromCart = (index: number) => {
      setCart(cart.filter((_, i) => i !== index));
  };

  const handleCheckout = () => {
      if (!selectedCustomerId) {
          alert('กรุณาเลือกลูกค้าก่อนชำระเงิน');
          return;
      }
      processSale(selectedCustomerId, cart, paymentMethod);
      setIsSuccess(true);
      setCart([]);
      setTimeout(() => setIsSuccess(false), 3000);
      setIsMobileCartOpen(false);
  };

  const handleQuickAddCustomer = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCustomerName || !newCustomerPhone) return;
      
      setIsAddingCustomer(true);
      const newCust = await addCustomer({
          name: newCustomerName,
          phone: newCustomerPhone,
          email: '',
          notes: 'Quick Add from POS',
          birthDate: '',
          address: ''
      });
      
      if (newCust) {
          setSelectedCustomerId(newCust.id);
          setIsAddCustomerOpen(false);
          setNewCustomerName('');
          setNewCustomerPhone('');
      }
      setIsAddingCustomer(false);
  };

  // Fix: Safe access to .name property
  const filteredItems = activeTab === 'services' 
      ? services.filter(s => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
      : courseDefinitions.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col lg:flex-row h-full bg-gray-50 relative">
      {/* Left: Product Catalog */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-24 lg:pb-6">
        <header className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">จุดชำระเงิน (POS)</h2>
            
            {/* Customer Selector */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                <label className="block text-sm font-medium text-gray-500 mb-2">ลูกค้า (Customer)</label>
                <div className="flex gap-2">
                    <select 
                        className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 text-gray-900"
                        value={selectedCustomerId}
                        onChange={e => setSelectedCustomerId(e.target.value)}
                    >
                        <option value="" className="text-gray-500">-- เลือกลูกค้า --</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id} className="text-gray-900">{c.name} ({c.phone})</option>
                        ))}
                    </select>
                    <button 
                        onClick={() => setIsAddCustomerOpen(true)}
                        className="bg-gray-900 text-white px-4 rounded-lg hover:bg-gray-800 transition flex items-center gap-2 whitespace-nowrap shadow-sm"
                        title="เพิ่มลูกค้าใหม่ด่วน"
                    >
                        <UserPlus size={20} />
                        <span className="hidden sm:inline">+ เพิ่มลูกค้าใหม่</span>
                    </button>
                </div>
                {customers.length === 0 && (
                    <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
                        <Sparkles size={12} /> ยังไม่มีข้อมูลลูกค้าในระบบ กรุณากดปุ่มเพิ่มลูกค้า
                    </p>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 md:gap-4 mb-4 overflow-x-auto pb-2">
                <button 
                    onClick={() => setActiveTab('courses')}
                    className={`px-4 md:px-6 py-2 rounded-full font-medium transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'courses' ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                >
                    <Layers size={18} /> คอร์สแพ็กเกจ
                </button>
                <button 
                    onClick={() => setActiveTab('services')}
                    className={`px-4 md:px-6 py-2 rounded-full font-medium transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'services' ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                >
                    <Zap size={18} /> บริการรายครั้ง
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="ค้นหารายการ..." 
                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 outline-none focus:border-rose-500 text-gray-900"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
                const isAdded = justAddedId === item.id;
                return (
                    <div 
                        key={item.id} 
                        onClick={() => addToCart(item as any, activeTab === 'courses' ? 'course' : 'service')}
                        className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all duration-200 group relative overflow-hidden ${
                            isAdded 
                            ? 'border-green-500 ring-2 ring-green-100 transform scale-95 bg-green-50' 
                            : 'border-gray-200 hover:border-rose-400 hover:shadow-md'
                        }`}
                    >
                        <h3 className="font-bold text-gray-800 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-500 mb-3 h-10 overflow-hidden text-ellipsis line-clamp-2">
                            {(item as CourseDefinition).description || (item as Service).category}
                        </p>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-rose-600">฿{item.price.toLocaleString()}</span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                                isAdded ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-rose-500 group-hover:text-white'
                            }`}>
                                {isAdded ? <Check size={18} /> : <Plus size={18} />}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Mobile Cart Toggle (Floating Action Button) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
          <button 
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl flex justify-between items-center shadow-lg"
          >
              <div className="flex items-center gap-2">
                  <div className="bg-rose-500 px-2 py-0.5 rounded text-xs font-bold">{totalItems}</div>
                  <span className="font-medium">ตะกร้าสินค้า</span>
              </div>
              <span className="font-bold">฿{total.toLocaleString()} <ChevronUp size={16} className="inline ml-1"/></span>
          </button>
      </div>

      {/* Right: Cart Sidebar */}
      <div className={`
        fixed inset-0 z-30 bg-black/50 transition-opacity lg:hidden
        ${isMobileCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `} onClick={() => setIsMobileCartOpen(false)} />

      <div className={`
         fixed inset-y-0 right-0 z-40 w-full md:w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-2xl transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:shadow-xl lg:z-auto
         ${isMobileCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 bg-gray-900 text-white flex justify-between items-center flex-shrink-0">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart size={24} />
                รายการขาย
            </h3>
            <div className="flex items-center gap-3">
                <span className="bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-300">{totalItems} items</span>
                <button onClick={() => setIsMobileCartOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                    <ChevronDown size={24} />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <ShoppingCart size={48} className="mb-4 opacity-20" />
                    <p>ยังไม่มีรายการสินค้า</p>
                    <p className="text-sm">เลือกรายการจากเมนูด้านซ้าย</p>
                </div>
            ) : (
                cart.map((item, idx) => {
                    const isCourse = item.type === 'course';
                    return (
                        <div key={`${item.id}-${idx}`} className="relative flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group animate-fadeIn">
                            {/* Type Indicator Strip */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${isCourse ? 'bg-purple-500' : 'bg-rose-500'}`}></div>
                            
                            <div className="flex items-center gap-3 pl-2 overflow-hidden">
                                <div className={`p-2 rounded-lg flex-shrink-0 ${isCourse ? 'bg-purple-50 text-purple-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {isCourse ? <Package size={20} /> : <Sparkles size={20} />}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-gray-800 truncate">{item.name}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0 ${
                                            isCourse ? 'border-purple-200 text-purple-600 bg-purple-50' : 'border-rose-200 text-rose-600 bg-rose-50'
                                        }`}>
                                            {isCourse ? 'Course' : 'Service'}
                                        </span>
                                        <p className="text-xs text-gray-500 whitespace-nowrap">x {item.quantity}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 pl-2 flex-shrink-0">
                                <span className="font-bold text-gray-900">฿{(item.price * item.quantity).toLocaleString()}</span>
                                <button 
                                    onClick={() => removeFromCart(idx)} 
                                    className="text-gray-300 hover:text-red-500 transition lg:opacity-0 group-hover:opacity-100 p-1"
                                    title="Remove"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-white flex-shrink-0">
            <div className="flex justify-between mb-4 items-end">
                <span className="text-gray-500 font-medium">ยอดรวมสุทธิ</span>
                <span className="text-3xl font-bold text-gray-900 tracking-tight">฿{total.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
                <button 
                    onClick={() => setPaymentMethod('Cash')}
                    className={`flex flex-col items-center p-2 md:p-3 rounded-xl border transition-all duration-200 ${paymentMethod === 'Cash' ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                    <Banknote size={20} className="mb-1" />
                    <span className="text-[10px] md:text-xs font-medium">เงินสด</span>
                </button>
                <button 
                    onClick={() => setPaymentMethod('Credit Card')}
                    className={`flex flex-col items-center p-2 md:p-3 rounded-xl border transition-all duration-200 ${paymentMethod === 'Credit Card' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                    <CreditCard size={20} className="mb-1" />
                    <span className="text-[10px] md:text-xs font-medium">บัตรเครดิต</span>
                </button>
                <button 
                    onClick={() => setPaymentMethod('Transfer')}
                    className={`flex flex-col items-center p-2 md:p-3 rounded-xl border transition-all duration-200 ${paymentMethod === 'Transfer' ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                    <QrCode size={20} className="mb-1" />
                    <span className="text-[10px] md:text-xs font-medium">โอนเงิน</span>
                </button>
            </div>

            <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || !selectedCustomerId}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center gap-2 ${
                    cart.length === 0 || !selectedCustomerId 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-xl'
                }`}
            >
                <ShoppingCart size={20} />
                ชำระเงิน (Checkout)
            </button>

            {isSuccess && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3 animate-bounce z-50 w-max">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                         <Check size={32} className="text-white" />
                    </div>
                    <span className="text-lg font-bold">บันทึกการขายสำเร็จ!</span>
                </div>
            )}
        </div>
      </div>

       {/* Quick Add Customer Modal */}
       {isAddCustomerOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl animate-fadeIn">
                  <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                      <UserPlus className="text-rose-500" size={20}/>
                      เพิ่มลูกค้าด่วน (Quick Add)
                  </h3>
                  <form onSubmit={handleQuickAddCustomer} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อลูกค้า</label>
                          <input 
                              type="text" required autoFocus
                              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-rose-500 outline-none text-gray-900"
                              placeholder="ชื่อ-นามสกุล"
                              value={newCustomerName}
                              onChange={e => setNewCustomerName(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                          <input 
                              type="tel" required
                              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-rose-500 outline-none text-gray-900"
                              placeholder="08x-xxx-xxxx"
                              value={newCustomerPhone}
                              onChange={e => setNewCustomerPhone(e.target.value)}
                          />
                      </div>
                      <div className="flex gap-3 mt-6">
                          <button 
                            type="button" 
                            onClick={() => setIsAddCustomerOpen(false)}
                            className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                          >
                              ยกเลิก
                          </button>
                          <button 
                            type="submit"
                            disabled={isAddingCustomer}
                            className="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
                          >
                              {isAddingCustomer ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                              เพิ่มและเลือก
                          </button>
                      </div>
                  </form>
              </div>
          </div>
       )}
    </div>
  );
};

export default POSPage;