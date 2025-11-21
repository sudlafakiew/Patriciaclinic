import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Search, Phone, Mail, UserPlus, ArrowLeft, Calendar, Package, Clock, Activity, Edit, Stethoscope, Trash2, Save } from 'lucide-react';
import { Customer, CustomerCourse } from '../types';

const CustomerPage: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, useCourse, courseDefinitions, inventory } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isUseCourseModalOpen, setIsUseCourseModalOpen] = useState(false);
  const [selectedCourseToUse, setSelectedCourseToUse] = useState<CustomerCourse | null>(null);

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [custForm, setCustForm] = useState({ name: '', phone: '', email: '', notes: '', birthDate: '', address: '' });
  const [usageForm, setUsageForm] = useState({
      units: 1,
      doctorName: 'หมอฟ้า',
      treatmentDetails: '',
      notes: ''
  });

  // Filter Logic
  const filtered = customers.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm)
  );

  const openAddModal = () => {
      setIsEditing(false);
      setEditingId(null);
      setCustForm({ name: '', phone: '', email: '', notes: '', birthDate: '', address: '' });
      setIsCustomerModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
      setIsEditing(true);
      setEditingId(customer.id);
      setCustForm({
          name: customer.name,
          phone: customer.phone,
          email: customer.email || '',
          notes: customer.notes || '',
          birthDate: customer.birthDate || '',
          address: customer.address || ''
      });
      setIsCustomerModalOpen(true);
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editingId) {
        await updateCustomer(editingId, custForm);
        if (selectedCustomer && selectedCustomer.id === editingId) {
            // Refresh local selected view if currently viewing this customer
             const updated = { ...selectedCustomer, ...custForm };
             setSelectedCustomer(updated);
        }
    } else {
        await addCustomer(custForm);
    }
    setIsCustomerModalOpen(false);
  };

  const handleDeleteCustomer = async (id: string) => {
      if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลลูกค้านี้? การลบจะไม่สามารถกู้คืนได้')) {
          await deleteCustomer(id);
          if (selectedCustomer?.id === id) setSelectedCustomer(null);
      }
  };

  const handleUseCourseSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedCustomer && selectedCourseToUse) {
          useCourse(selectedCustomer.id, selectedCourseToUse.id, usageForm.units, {
              treatmentName: selectedCourseToUse.courseName,
              doctorName: usageForm.doctorName,
              details: usageForm.treatmentDetails || 'ใช้บริการตามคอร์ส',
              photos: []
          });
          setIsUseCourseModalOpen(false);
      }
  };

  // --- Render Detail View ---
  if (selectedCustomer) {
      return (
        <div className="p-4 md:p-8 w-full max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => setSelectedCustomer(null)} className="flex items-center text-gray-500 hover:text-gray-800">
                    <ArrowLeft size={20} className="mr-2" />
                    กลับไปหน้ารายชื่อ
                </button>
                <div className="flex gap-2">
                     <button 
                        onClick={() => openEditModal(selectedCustomer)}
                        className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 shadow-sm"
                     >
                        <Edit size={16} /> แก้ไขข้อมูล
                     </button>
                     <button 
                        onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                        className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 shadow-sm"
                     >
                        <Trash2 size={16} /> ลบ
                     </button>
                </div>
            </div>

            {/* Header Profile */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 font-bold text-2xl md:text-3xl flex-shrink-0">
                        {(selectedCustomer.name || '?').charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{selectedCustomer.name}</h2>
                        <div className="flex flex-col gap-1 mt-2 text-gray-500 text-sm md:text-base">
                            <div className="flex items-center gap-2"><Phone size={16}/> {selectedCustomer.phone}</div>
                            <div className="flex items-center gap-2"><Mail size={16}/> {selectedCustomer.email || '-'}</div>
                            <div className="flex items-center gap-2"><Calendar size={16}/> วันเกิด: {selectedCustomer.birthDate || '-'}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 w-full md:max-w-xs">
                    <h4 className="font-semibold text-amber-800 text-sm mb-1">หมายเหตุ / แพ้ยา:</h4>
                    <p className="text-amber-700 text-sm">{selectedCustomer.notes || '-'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Active Courses */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Package className="text-rose-500" />
                        คอร์สคงเหลือ (Active Courses)
                    </h3>
                    
                    {selectedCustomer.activeCourses.filter(c => c.active).length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-400">
                            ไม่พบคอร์สที่ใช้งานได้
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedCustomer.activeCourses.filter(c => c.active).map(course => (
                                <div key={course.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-rose-300 transition relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-bl-lg">
                                        Active
                                    </div>
                                    <h4 className="font-bold text-lg text-gray-800 mb-1">{course.courseName}</h4>
                                    <p className="text-sm text-gray-500 mb-4">หมดอายุ: {course.expiryDate || 'ไม่มีวันหมดอายุ'}</p>
                                    
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase">คงเหลือ</p>
                                            <p className="text-2xl font-bold text-rose-600">{course.remainingUnits} <span className="text-sm text-gray-500 font-normal">/ {course.totalUnits} ครั้ง</span></p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setSelectedCourseToUse(course);
                                                setUsageForm({...usageForm, treatmentDetails: `ใช้บริการ ${course.courseName}`});
                                                setIsUseCourseModalOpen(true);
                                            }}
                                            className="bg-rose-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-rose-600 transition shadow-md"
                                        >
                                            ตัดคอร์ส
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mt-8">
                        <Activity className="text-rose-500" />
                        ประวัติการรักษา (Treatment History)
                    </h3>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 font-medium text-gray-500">วันที่</th>
                                    <th className="p-4 font-medium text-gray-500">รายการ</th>
                                    <th className="p-4 font-medium text-gray-500">รายละเอียด</th>
                                    <th className="p-4 font-medium text-gray-500">แพทย์</th>
                                    <th className="p-4 font-medium text-gray-500">การใช้งาน</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {selectedCustomer.treatmentHistory.map(rec => (
                                    <tr key={rec.id} className="hover:bg-gray-50">
                                        <td className="p-4 text-gray-600 text-sm">{rec.date.split('T')[0]}</td>
                                        <td className="p-4 font-medium text-gray-800">{rec.treatmentName}</td>
                                        <td className="p-4 text-gray-600 text-sm max-w-xs truncate">{rec.details}</td>
                                        <td className="p-4 text-gray-600 text-sm flex items-center gap-1">
                                            <Stethoscope size={14} /> {rec.doctorName}
                                        </td>
                                        <td className="p-4 text-rose-600 font-medium text-sm">-{rec.unitsUsed} ครั้ง</td>
                                    </tr>
                                ))}
                                {selectedCustomer.treatmentHistory.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-400">ยังไม่มีประวัติการรักษา</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                      </div>
                    </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200">
                         <h3 className="font-bold text-gray-800 mb-4">ข้อมูลการติดต่อ</h3>
                         <p className="text-sm text-gray-500 mb-1">ที่อยู่</p>
                         <p className="text-gray-800 mb-3">{selectedCustomer.address || '-'}</p>
                    </div>
                </div>
            </div>
            
             {/* Add/Edit Customer Modal (Reused here for editing in detail view) */}
            {isCustomerModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-md">
                    <h3 className="text-xl font-bold mb-6">{isEditing ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มข้อมูลลูกค้าใหม่'}</h3>
                    <form onSubmit={handleCustomerSubmit} className="space-y-4">
                    <input
                        placeholder="ชื่อ-นามสกุล"
                        className="w-full border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 outline-none"
                        value={custForm.name}
                        onChange={e => setCustForm({...custForm, name: e.target.value})}
                        required
                    />
                    <input
                        placeholder="เบอร์โทรศัพท์"
                        className="w-full border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 outline-none"
                        value={custForm.phone}
                        onChange={e => setCustForm({...custForm, phone: e.target.value})}
                        required
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="date"
                            className="w-full border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 outline-none"
                            value={custForm.birthDate}
                            onChange={e => setCustForm({...custForm, birthDate: e.target.value})}
                            placeholder="วันเกิด"
                        />
                        <input
                            placeholder="อีเมล"
                            className="w-full border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 outline-none"
                            value={custForm.email}
                            onChange={e => setCustForm({...custForm, email: e.target.value})}
                        />
                    </div>
                    <textarea
                        placeholder="ที่อยู่"
                        className="w-full border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 outline-none h-20"
                        value={custForm.address}
                        onChange={e => setCustForm({...custForm, address: e.target.value})}
                    />
                    <textarea
                        placeholder="หมายเหตุ / ประวัติแพ้ยา"
                        className="w-full border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 outline-none h-24"
                        value={custForm.notes}
                        onChange={e => setCustForm({...custForm, notes: e.target.value})}
                    />
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">ยกเลิก</button>
                        <button type="submit" className="flex-1 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 flex items-center justify-center gap-2">
                            <Save size={18} /> บันทึก
                        </button>
                    </div>
                    </form>
                </div>
                </div>
            )}

            {/* Use Course Modal */}
            {isUseCourseModalOpen && selectedCourseToUse && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="border-b pb-4 mb-4">
                            <h3 className="text-xl font-bold text-gray-800">ตัดคอร์ส: {selectedCourseToUse.courseName}</h3>
                            <p className="text-gray-500 text-sm">คงเหลือ: {selectedCourseToUse.remainingUnits} ครั้ง</p>
                        </div>
                        
                        <form onSubmit={handleUseCourseSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนครั้งที่ตัด</label>
                                    <input 
                                        type="number" min="1" max={selectedCourseToUse.remainingUnits}
                                        className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-rose-500"
                                        value={usageForm.units}
                                        onChange={e => setUsageForm({...usageForm, units: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">แพทย์ผู้ทำหัตถการ (DF)</label>
                                    <select 
                                        className="w-full border border-gray-300 p-2 rounded-lg bg-white focus:ring-2 focus:ring-rose-500 text-gray-900"
                                        value={usageForm.doctorName}
                                        onChange={e => setUsageForm({...usageForm, doctorName: e.target.value})}
                                    >
                                        <option value="หมอฟ้า">หมอฟ้า</option>
                                        <option value="หมอเอก">หมอเอก</option>
                                        <option value="หมอพิมพา">หมอพิมพา</option>
                                    </select>
                                </div>
                            </div>

                             {/* Inventory Impact Preview */}
                             <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Package size={14} /> รายการที่จะตัดสต็อกอัตโนมัติ:
                                </h4>
                                <ul className="space-y-1 text-gray-600">
                                    {(() => {
                                        const courseDef = courseDefinitions.find(cd => cd.id === selectedCourseToUse.courseId);
                                        if (!courseDef || !courseDef.consumables || courseDef.consumables.length === 0) {
                                            return <li className="italic text-gray-400">- ไม่มีการผูกสินค้ากับคอร์สนี้ -</li>;
                                        }
                                        return courseDef.consumables.map((con, idx) => {
                                            const item = inventory.find(inv => inv.id === con.inventoryItemId);
                                            const totalToDeduct = con.quantityUsed * usageForm.units;
                                            const isLowStock = (item?.quantity || 0) < totalToDeduct;
                                            return (
                                                <li key={idx} className={`flex justify-between ${isLowStock ? 'text-red-600 font-medium' : ''}`}>
                                                    <span>{item?.name}</span>
                                                    <span>
                                                        {totalToDeduct} {item?.unit} 
                                                        {isLowStock && <span className="ml-2 text-xs bg-red-100 px-1 rounded">สต็อกไม่พอ</span>}
                                                    </span>
                                                </li>
                                            );
                                        });
                                    })()}
                                </ul>
                             </div>

                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดการรักษา / บันทึก</label>
                                <textarea 
                                    className="w-full border border-gray-300 p-2 rounded-lg h-24 focus:ring-2 focus:ring-rose-500"
                                    value={usageForm.treatmentDetails}
                                    onChange={e => setUsageForm({...usageForm, treatmentDetails: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setIsUseCourseModalOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">ยกเลิก</button>
                                <button type="submit" className="flex-1 py-2 bg-rose-500 text-white rounded-lg shadow-md hover:bg-rose-600">ยืนยันการตัดคอร์ส</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
      );
  }

  // --- Render List View (Default) ---
  return (
    <div className="p-4 md:p-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">ทะเบียนลูกค้า (CRM)</h2>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ค้นหาชื่อ หรือ เบอร์โทร..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 text-gray-900"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={openAddModal}
            className="w-full md:w-auto bg-gray-900 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-md"
          >
            <UserPlus size={18} />
            <span className="whitespace-nowrap">เพิ่มลูกค้า</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div 
            key={c.id} 
            onClick={() => setSelectedCustomer(c)}
            className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition duration-200 cursor-pointer group relative"
          >
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 font-bold text-lg group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    {c.name ? c.name.charAt(0) : '?'}
                </div>
                {c.activeCourses.some(ac => ac.active) && (
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 font-medium">
                        มีคอร์ส
                    </span>
                )}
            </div>
            <h3 className="font-bold text-lg text-gray-800 mb-1">{c.name}</h3>
            <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone size={16} />
                    {c.phone}
                </div>
                 <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={16} />
                    ล่าสุด: {c.treatmentHistory[0]?.date.split('T')[0] || 'ไม่ระบุ'}
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                 <span className="text-xs text-gray-400 group-hover:text-rose-500">ดูรายละเอียด &gt;</span>
                 
                 {/* Quick Actions */}
                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button 
                        onClick={() => openEditModal(c)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                    >
                        <Edit size={16} />
                    </button>
                     <button 
                        onClick={() => handleDeleteCustomer(c.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                    >
                        <Trash2 size={16} />
                    </button>
                 </div>
            </div>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
              <p>ไม่พบข้อมูลลูกค้า</p>
          </div>
      )}

       {/* Add/Edit Customer Modal */}
       {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">{isEditing ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มข้อมูลลูกค้าใหม่'}</h3>
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <input
                placeholder="ชื่อ-นามสกุล"
                className="w-full border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 outline-none"
                value={custForm.name}
                onChange={e => setCustForm({...custForm, name: e.target.value})}
                required
              />
              <input
                placeholder="เบอร์โทรศัพท์"
                className="w-full border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 outline-none"
                value={custForm.phone}
                onChange={e => setCustForm({...custForm, phone: e.target.value})}
                required
              />
               <div className="grid grid-cols-2 gap-3">
                 <input
                    type="date"
                    className="w-full border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 outline-none"
                    value={custForm.birthDate}
                    onChange={e => setCustForm({...custForm, birthDate: e.target.value})}
                    placeholder="วันเกิด"
                 />
                 <input
                    placeholder="อีเมล"
                    className="w-full border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 outline-none"
                    value={custForm.email}
                    onChange={e => setCustForm({...custForm, email: e.target.value})}
                 />
               </div>
               <textarea
                placeholder="ที่อยู่"
                className="w-full border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 outline-none h-20"
                value={custForm.address}
                onChange={e => setCustForm({...custForm, address: e.target.value})}
              />
              <textarea
                placeholder="หมายเหตุ / ประวัติแพ้ยา"
                className="w-full border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 outline-none h-24"
                value={custForm.notes}
                onChange={e => setCustForm({...custForm, notes: e.target.value})}
              />
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">ยกเลิก</button>
                <button type="submit" className="flex-1 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 flex items-center justify-center gap-2">
                    <Save size={18} /> บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPage;