import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Plus, Trash2, Tag, Clock, DollarSign, Sparkles, Package, ImageIcon, Loader2, Layers, Edit, Save } from 'lucide-react';
import { Consumable, CourseDefinition, Service } from '../types';
import { generateServiceImage } from '../services/geminiService';

const ServicesPage: React.FC = () => {
  const { services, addService, updateService, deleteService, inventory, courseDefinitions, addCourse, updateCourse, deleteCourse } = useClinic();
  
  // State
  const [activeTab, setActiveTab] = useState<'services' | 'courses'>('services');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // Unified Form State
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    durationMinutes: 30, // Service only
    totalUnits: 1,       // Course only
    description: '',     // Course only
    category: 'General', // Service only
    imageUrl: '',        // Service only
  });
  const [consumables, setConsumables] = useState<Consumable[]>([]);

  const categories = ['Lifting', 'Injection', 'Wellness', 'Laser', 'Treatment', 'Other'];

  const resetForm = () => {
      setFormData({ name: '', price: 0, durationMinutes: 30, totalUnits: 1, description: '', category: 'General', imageUrl: '' });
      setConsumables([]);
      setIsEditing(false);
      setEditingId(null);
  };

  const openAddModal = () => {
      resetForm();
      setIsModalOpen(true);
  };

  const openEditService = (s: Service) => {
      setIsEditing(true);
      setEditingId(s.id);
      setFormData({
          name: s.name,
          price: s.price,
          durationMinutes: s.durationMinutes,
          totalUnits: 0,
          description: '',
          category: s.category,
          imageUrl: s.imageUrl || ''
      });
      setConsumables(s.consumables || []);
      setActiveTab('services');
      setIsModalOpen(true);
  };

  const openEditCourse = (c: CourseDefinition) => {
      setIsEditing(true);
      setEditingId(c.id);
      setFormData({
          name: c.name,
          price: c.price,
          durationMinutes: 0,
          totalUnits: c.totalUnits,
          description: c.description,
          category: '',
          imageUrl: ''
      });
      setConsumables(c.consumables || []);
      setActiveTab('courses');
      setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'services') {
        const payload = {
            name: formData.name,
            price: formData.price,
            durationMinutes: formData.durationMinutes,
            category: formData.category,
            consumables: consumables,
            imageUrl: formData.imageUrl
        };
        if (isEditing && editingId) {
            await updateService(editingId, payload);
        } else {
            await addService(payload);
        }
    } else {
        const payload = {
            name: formData.name,
            price: formData.price,
            totalUnits: formData.totalUnits,
            description: formData.description,
            consumables: consumables
        };
        if (isEditing && editingId) {
            await updateCourse(editingId, payload);
        } else {
            await addCourse(payload);
        }
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
      if (!window.confirm('ยืนยันการลบรายการนี้?')) return;
      if (activeTab === 'services') {
          await deleteService(id);
      } else {
          await deleteCourse(id);
      }
  };

  const addConsumableRow = () => {
      if (inventory.length === 0) {
          alert('ไม่มีสินค้าในสต็อก กรุณาเพิ่มสินค้าก่อน');
          return;
      }
      setConsumables([...consumables, { inventoryItemId: inventory[0].id, quantityUsed: 1 }]);
  };

  const updateConsumable = (index: number, field: keyof Consumable, value: any) => {
      const updated = [...consumables];
      updated[index] = { ...updated[index], [field]: value };
      setConsumables(updated);
  };

  const removeConsumable = (index: number) => {
      setConsumables(consumables.filter((_, i) => i !== index));
  }

  const handleGenerateImage = async (serviceId: string, serviceName: string, category: string) => {
    setGeneratingId(serviceId);
    const base64Image = await generateServiceImage(serviceName, category);
    if (base64Image) {
      await updateService(serviceId, { imageUrl: base64Image });
    } else {
      alert('Failed to generate image. Please ensure API Key is valid.');
    }
    setGeneratingId(null);
  };

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">จัดการบริการและคอร์ส</h2>
            <p className="text-gray-500 text-sm mt-1">เพิ่ม ลบ แก้ไข รายการบริการและแพ็กเกจ</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl hover:bg-rose-600 transition shadow-md shadow-rose-200 w-full md:w-auto justify-center"
        >
          <Plus size={20} />
          {activeTab === 'services' ? 'เพิ่มบริการ' : 'เพิ่มคอร์ส'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-1">
           <button 
                onClick={() => setActiveTab('services')}
                className={`px-6 py-2 rounded-t-lg font-medium transition flex items-center gap-2 ${activeTab === 'services' ? 'bg-white border-x border-t border-gray-200 text-rose-600 border-b-white -mb-px' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <Sparkles size={18} /> บริการรายครั้ง (Services)
            </button>
            <button 
                onClick={() => setActiveTab('courses')}
                className={`px-6 py-2 rounded-t-lg font-medium transition flex items-center gap-2 ${activeTab === 'courses' ? 'bg-white border-x border-t border-gray-200 text-purple-600 border-b-white -mb-px' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <Layers size={18} /> คอร์สแพ็กเกจ (Courses)
            </button>
      </div>

      {/* SERVICES GRID */}
      {activeTab === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition duration-200 group overflow-hidden flex flex-col">
                {/* Image Section */}
                <div className="relative h-48 bg-gray-100 w-full overflow-hidden flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                    {service.imageUrl ? (
                        <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-gray-300">
                             <ImageIcon size={40} />
                        </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                         <button 
                            onClick={() => handleGenerateImage(service.id, service.name, service.category)}
                            disabled={generatingId === service.id}
                            className="bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 flex items-center gap-2"
                         >
                            {generatingId === service.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-purple-500" />}
                            {service.imageUrl ? 'เปลี่ยนรูป (AI)' : 'สร้างรูป (AI)'}
                         </button>
                    </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-800">{service.name}</h3>
                        <div className="flex gap-1">
                             <button onClick={() => openEditService(service)} className="text-gray-300 hover:text-blue-500 p-1" title="แก้ไข"><Edit size={18} /></button>
                             <button onClick={() => handleDelete(service.id)} className="text-gray-300 hover:text-red-500 p-1" title="ลบ"><Trash2 size={18} /></button>
                        </div>
                    </div>
                    
                    <div className="space-y-3 flex-1">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Tag size={16} /> <span>หมวดหมู่</span>
                            </div>
                            <span className="font-medium text-gray-700">{service.category}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Clock size={16} /> <span>ระยะเวลา</span>
                            </div>
                            <span className="font-medium text-gray-700">{service.durationMinutes} นาที</span>
                        </div>
                        
                        {/* Consumables Preview */}
                        {service.consumables && service.consumables.length > 0 && (
                            <div className="py-2 border-t border-dashed border-gray-100 mt-2">
                                 <p className="text-xs text-gray-400 mb-1">ตัดสต็อก:</p>
                                 <div className="flex flex-wrap gap-1">
                                     {service.consumables.map((c, i) => {
                                         const item = inventory.find(inv => inv.id === c.inventoryItemId);
                                         return (
                                             <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                                 {item?.name} ({c.quantityUsed})
                                             </span>
                                         )
                                     })}
                                 </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-50 mt-4">
                        <div className="flex items-center gap-2 text-gray-500"><DollarSign size={16} /><span>ราคา</span></div>
                        <span className="font-bold text-xl text-rose-600">฿{service.price.toLocaleString()}</span>
                    </div>
                </div>
              </div>
            ))}
             {services.length === 0 && <div className="col-span-3 text-center py-10 text-gray-400">ยังไม่มีข้อมูลบริการ</div>}
          </div>
      )}

      {/* COURSES GRID */}
      {activeTab === 'courses' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courseDefinitions.map((course) => (
                     <div key={course.id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition duration-200 flex flex-col p-6 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500 rounded-l-xl"></div>
                        <div className="flex justify-between items-start mb-3 pl-2">
                            <h3 className="text-lg font-bold text-gray-800">{course.name}</h3>
                            <div className="flex gap-1">
                                <button onClick={() => openEditCourse(course)} className="text-gray-300 hover:text-blue-500 p-1" title="แก้ไข"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(course.id)} className="text-gray-300 hover:text-red-500 p-1" title="ลบ"><Trash2 size={18} /></button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-4 pl-2 flex-1">{course.description || 'ไม่มีรายละเอียด'}</p>
                        
                        <div className="pl-2 space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm bg-purple-50 p-2 rounded-lg">
                                <span className="text-purple-700">จำนวนครั้ง</span>
                                <span className="font-bold text-purple-900">{course.totalUnits} ครั้ง</span>
                            </div>
                             {course.consumables && course.consumables.length > 0 && (
                                <div className="text-xs text-gray-400 mt-2">
                                     <span className="block mb-1">ตัดสต็อกต่อครั้ง:</span>
                                     <div className="flex flex-wrap gap-1">
                                        {course.consumables.map((c, i) => {
                                            const item = inventory.find(inv => inv.id === c.inventoryItemId);
                                            return <span key={i} className="bg-gray-100 px-1.5 py-0.5 rounded">{item?.name} x{c.quantityUsed}</span>
                                        })}
                                     </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-50 mt-auto pl-2">
                             <span className="text-gray-500">ราคาคอร์ส</span>
                             <span className="font-bold text-xl text-purple-600">฿{course.price.toLocaleString()}</span>
                        </div>
                     </div>
                ))}
                {courseDefinitions.length === 0 && <div className="col-span-3 text-center py-10 text-gray-400">ยังไม่มีข้อมูลคอร์ส</div>}
           </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 text-gray-800">
                {isEditing ? 'แก้ไขข้อมูล' : (activeTab === 'services' ? 'เพิ่มบริการใหม่' : 'เพิ่มคอร์สใหม่')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อรายการ</label>
                <input
                  type="text" required
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (บาท)</label>
                    <input
                        type="number" required min="0"
                        className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                    />
                </div>
                {activeTab === 'services' ? (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">เวลา (นาที)</label>
                        <input
                            type="number" required min="5" step="5"
                            className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500"
                            value={formData.durationMinutes}
                            onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value) || 0})}
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนครั้ง (Units)</label>
                        <input
                            type="number" required min="1"
                            className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500"
                            value={formData.totalUnits}
                            onChange={e => setFormData({...formData, totalUnits: parseInt(e.target.value) || 1})}
                        />
                    </div>
                )}
              </div>

              {activeTab === 'services' ? (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                    <select
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none bg-white"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
              ) : (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดคอร์ส</label>
                    <textarea
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 h-20"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                </div>
              )}

              {/* Link Inventory Logic (Consumables) */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <Package size={16} /> ตัดสต็อกอัตโนมัติ {activeTab === 'courses' && '(ต่อครั้ง)'}
                      </label>
                      <button type="button" onClick={addConsumableRow} className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">
                          + เพิ่มสินค้า
                      </button>
                  </div>
                  
                  <div className="space-y-2">
                      {consumables.map((con, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                              <select 
                                className="flex-1 text-sm border p-2 rounded bg-white"
                                value={con.inventoryItemId}
                                onChange={e => updateConsumable(idx, 'inventoryItemId', e.target.value)}
                              >
                                  {inventory.map(inv => (
                                      <option key={inv.id} value={inv.id}>{inv.name} ({inv.unit})</option>
                                  ))}
                              </select>
                              <input 
                                type="number" 
                                className="w-20 text-sm border p-2 rounded" 
                                placeholder="จำนวน"
                                step="0.1"
                                value={con.quantityUsed}
                                onChange={e => updateConsumable(idx, 'quantityUsed', parseFloat(e.target.value))}
                              />
                              <button type="button" onClick={() => removeConsumable(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                  <Trash2 size={14} />
                              </button>
                          </div>
                      ))}
                      {consumables.length === 0 && <p className="text-xs text-gray-400 text-center italic">ไม่มีการตัดสต็อก</p>}
                  </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium shadow-lg flex items-center justify-center gap-2"
                >
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

export default ServicesPage;