import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Package, AlertTriangle, Plus, Minus, Search, Edit, Trash2, Save } from 'lucide-react';
import { InventoryItem } from '../types';

const InventoryPage: React.FC = () => {
  const { inventory, updateStock, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [itemForm, setItemForm] = useState({ name: '', quantity: 0, unit: 'ชิ้น', minLevel: 10, pricePerUnit: 0 });

  // Safe access to .name property
  const filteredInventory = inventory.filter(item => 
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
      setIsEditing(false);
      setEditingId(null);
      setItemForm({ name: '', quantity: 0, unit: 'ชิ้น', minLevel: 10, pricePerUnit: 0 });
      setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
      setIsEditing(true);
      setEditingId(item.id);
      setItemForm({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          minLevel: item.minLevel,
          pricePerUnit: item.pricePerUnit
      });
      setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isEditing && editingId) {
          await updateInventoryItem(editingId, itemForm);
      } else {
          await addInventoryItem(itemForm);
      }
      setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
      if(window.confirm('ยืนยันการลบสินค้านี้?')) {
          await deleteInventoryItem(id);
      }
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="text-rose-500" />
                คลังสินค้าและยา (Inventory)
            </h2>
            <p className="text-gray-500 text-sm mt-1">จัดการสต็อกยา เวชภัณฑ์ และอุปกรณ์ต่างๆ</p>
        </div>
        <button 
            onClick={openAddModal}
            className="bg-rose-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-rose-600 shadow-md w-full md:w-auto justify-center"
        >
            <Plus size={18} />
            เพิ่มสินค้า
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex gap-2 w-full md:max-w-md">
         <Search className="text-gray-400" />
         <input 
            type="text" 
            placeholder="ค้นหาชื่อสินค้า..." 
            className="w-full outline-none text-gray-900"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                      <th className="p-4 text-gray-500 font-medium">ชื่อสินค้า</th>
                      <th className="p-4 text-gray-500 font-medium text-center">คงเหลือ</th>
                      <th className="p-4 text-gray-500 font-medium text-center">หน่วย</th>
                      <th className="p-4 text-gray-500 font-medium text-center">สถานะ</th>
                      <th className="p-4 text-gray-500 font-medium text-center">จัดการสต็อก</th>
                      <th className="p-4 text-gray-500 font-medium text-right">เครื่องมือ</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{item.name}</td>
                    <td className="p-4 text-center">
                       <span className={`font-bold ${item.quantity < item.minLevel ? 'text-red-500' : 'text-gray-700'}`}>
                         {item.quantity}
                       </span>
                    </td>
                    <td className="p-4 text-center text-gray-500">{item.unit}</td>
                    <td className="p-4 text-center">
                        {item.quantity < item.minLevel ? (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-medium">
                                <AlertTriangle size={12} /> ต่ำกว่าเกณฑ์
                            </span>
                        ) : (
                            <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-xs font-medium">ปกติ</span>
                        )}
                    </td>
                    <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <button 
                                onClick={() => updateStock(item.id, -1)}
                                className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
                            >
                                <Minus size={16} />
                            </button>
                            <button 
                                onClick={() => updateStock(item.id, 1)}
                                className="p-1 bg-rose-50 hover:bg-rose-100 rounded text-rose-600"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </td>
                     <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                             <button 
                                onClick={() => openEditModal(item)}
                                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded"
                            >
                                <Edit size={18} />
                            </button>
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </td>
                  </tr>
                ))}
                {filteredInventory.length === 0 && (
                    <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">ไม่พบสินค้า</td>
                    </tr>
                )}
              </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
                <h3 className="text-xl font-bold mb-4 text-gray-800">{isEditing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="text" placeholder="ชื่อสินค้า (เช่น Botox, เข็มฉีดยา)" 
                        className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                        required
                        value={itemForm.name}
                        onChange={e => setItemForm({...itemForm, name: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">จำนวน</label>
                            <input 
                                type="number" placeholder="จำนวน" 
                                className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                                required
                                min="0"
                                value={itemForm.quantity}
                                onChange={e => setItemForm({...itemForm, quantity: parseInt(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">หน่วย</label>
                            <input 
                                type="text" placeholder="หน่วย (เช่น ชิ้น)" 
                                className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                                required
                                value={itemForm.unit}
                                onChange={e => setItemForm({...itemForm, unit: e.target.value})}
                            />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">จุดสั่งซื้อ (Min Level)</label>
                            <input 
                                type="number"
                                className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                                required
                                min="0"
                                value={itemForm.minLevel}
                                onChange={e => setItemForm({...itemForm, minLevel: parseInt(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">ราคาต่อหน่วย (บาท)</label>
                            <input 
                                type="number" 
                                className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                                min="0"
                                value={itemForm.pricePerUnit}
                                onChange={e => setItemForm({...itemForm, pricePerUnit: parseFloat(e.target.value)})}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">ยกเลิก</button>
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

export default InventoryPage;