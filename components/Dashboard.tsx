import React from 'react';
import { useClinic } from '../context/ClinicContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Calendar, DollarSign, Users, TrendingUp, FileText, Database, Download, Loader2 } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <h3 className="text-xl md:text-2xl font-bold text-gray-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${color} text-white`}>
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { appointments, services, customers, transactions, isLoadingData, seedDatabase, inventory } = useClinic();

  if (isLoadingData && customers.length === 0 && services.length === 0) {
      return <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-96 gap-4">
          <Loader2 className="animate-spin text-rose-500" size={48} />
          <p>กำลังโหลดข้อมูลหรือสร้างฐานข้อมูลตัวอย่าง...</p>
      </div>;
  }

  // --- Calculation Logic ---
  const today = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(a => a.date === today).length;
  
  // Total Revenue from Transactions
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  
  // Revenue by Day (Last 7 Days)
  const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
  });

  const revenueData = last7Days.map(date => {
      const dayTotal = transactions
          .filter(t => t.date.startsWith(date))
          .reduce((sum, t) => sum + t.totalAmount, 0);
      return {
          name: new Date(date).toLocaleDateString('th-TH', { weekday: 'short' }),
          revenue: dayTotal
      };
  });

  // Payment Method Stats
  const paymentMethods = transactions.reduce((acc, t) => {
      const method = t.paymentMethod || 'Other';
      acc[method] = (acc[method] || 0) + t.totalAmount;
      return acc;
  }, {} as Record<string, number>);
  
  const pieData = Object.keys(paymentMethods).map(key => ({ name: key, value: paymentMethods[key] }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Check if DB looks empty (No services AND No inventory)
  const isDbEmpty = services.length === 0 && inventory.length === 0 && !isLoadingData;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen w-full">
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">สวัสดี, คุณหมอ 👋</h2>
            <p className="text-gray-500">รายงานและภาพรวมของคลินิก (Database Connected)</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 shadow-sm w-fit">
            {new Date().toLocaleDateString('th-TH', { dateStyle: 'full' })}
        </div>
      </div>

      {isDbEmpty && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <Database size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-indigo-900 text-lg">เริ่มต้นใช้งาน (Setup Data)</h3>
                    <p className="text-indigo-700 text-sm md:text-base">ฐานข้อมูลของคุณยังว่างอยู่ ต้องการลงข้อมูลตัวอย่าง (ยา, บริการ, ลูกค้า) เพื่อทดสอบระบบหรือไม่?</p>
                </div>
            </div>
            <button
                onClick={seedDatabase}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2 whitespace-nowrap w-full md:w-auto justify-center"
            >
                <Download size={20} /> ลงข้อมูลตัวอย่าง
            </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          title="นัดหมายวันนี้"
          value={`${todayApts} ท่าน`}
          icon={<Calendar size={24} />}
          color="bg-blue-500"
        />
        <StatCard
          title="ยอดขายรวม (All Time)"
          value={`฿${totalRevenue.toLocaleString()}`}
          icon={<DollarSign size={24} />}
          color="bg-emerald-500"
        />
        <StatCard
          title="ฐานลูกค้า"
          value={`${customers.length} ท่าน`}
          icon={<Users size={24} />}
          color="bg-violet-500"
        />
        <StatCard
          title="จำนวนบิลขาย"
          value={`${transactions.length} ใบ`}
          icon={<FileText size={24} />}
          color="bg-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center gap-2">
             <TrendingUp size={20} className="text-rose-500" /> แนวโน้มรายได้ (7 วันล่าสุด)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip
                    formatter={(value) => `฿${Number(value).toLocaleString()}`}
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart & Recent Sales */}
        <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">สัดส่วนการชำระเงิน</h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `฿${Number(value).toLocaleString()}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {pieData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-1 text-xs text-gray-600">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            {entry.name}
                        </div>
                    ))}
                    {pieData.length === 0 && <p className="text-xs text-gray-400">ยังไม่มีข้อมูลการขาย</p>}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">ธุรกรรมล่าสุด</h3>
            <div className="space-y-4 overflow-y-auto max-h-60">
                {transactions.slice(0, 5).map(tx => {
                    const customer = customers.find(c => c.id === tx.customerId);
                    return (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">{customer?.name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleTimeString('th-TH', {hour: '2-digit', minute: '2-digit'})}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold text-emerald-600">+฿{tx.totalAmount.toLocaleString()}</p>
                                <span className="text-xs text-gray-400">{tx.paymentMethod}</span>
                            </div>
                        </div>
                    )
                })}
                {transactions.length === 0 && <p className="text-center text-gray-400 text-sm">ยังไม่มีรายการขาย</p>}
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;