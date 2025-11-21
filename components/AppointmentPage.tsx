import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Status } from '../types';
import { Clock, Calendar as CalendarIcon, User, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';

const AppointmentPage: React.FC = () => {
  const { appointments, customers, services, updateAppointmentStatus, addAppointment, deleteAppointment } = useClinic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newApt, setNewApt] = useState({
    customerId: '',
    serviceId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    doctorName: 'หมอฟ้า'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newApt.customerId && newApt.serviceId) {
      addAppointment({
        ...newApt,
        status: Status.PENDING
      });
      setIsModalOpen(false);
    }
  };
  
  const handleDelete = (id: string) => {
      if (window.confirm('ต้องการลบนัดหมายนี้ออกจากระบบ?')) {
          deleteAppointment(id);
      }
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">ตารางนัดหมาย (Appointments)</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition shadow-md shadow-rose-200 w-full md:w-auto justify-center"
        >
          <Plus size={20} />
          สร้างนัดหมาย
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-medium text-gray-500">เวลา</th>
                <th className="p-4 font-medium text-gray-500">ลูกค้า</th>
                <th className="p-4 font-medium text-gray-500">บริการ</th>
                <th className="p-4 font-medium text-gray-500">แพทย์ผู้ดูแล</th>
                <th className="p-4 font-medium text-gray-500">สถานะ</th>
                <th className="p-4 font-medium text-gray-500">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => {
                const customer = customers.find(c => c.id === apt.customerId);
                const service = services.find(s => s.id === apt.serviceId);

                return (
                  <tr key={apt.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-700">
                          <Clock size={16} className="text-gray-400" />
                          {apt.date} {apt.time}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-900">{customer?.name}</td>
                    <td className="p-4 text-gray-600">{service?.name}</td>
                    <td className="p-4 text-gray-600">{apt.doctorName}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        apt.status === Status.CONFIRMED ? 'bg-green-50 text-green-700 border-green-200' :
                        apt.status === Status.PENDING ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                          {apt.status === Status.PENDING && (
                             <button
                               onClick={() => updateAppointmentStatus(apt.id, Status.CONFIRMED)}
                               className="p-1 hover:bg-green-100 text-green-600 rounded"
                               title="Confirm"
                             >
                               <CheckCircle size={20} />
                             </button>
                          )}
                          <button
                              onClick={() => updateAppointmentStatus(apt.id, Status.CANCELLED)}
                              className="p-1 hover:bg-amber-100 text-amber-600 rounded"
                              title="Cancel Status"
                          >
                              <XCircle size={20} />
                          </button>
                           <button
                              onClick={() => handleDelete(apt.id)}
                              className="p-1 hover:bg-red-100 text-red-600 rounded ml-2"
                              title="Delete Permanently"
                          >
                              <Trash2 size={20} />
                          </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {appointments.length === 0 && (
                  <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">ยังไม่มีการนัดหมาย</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-gray-800">เพิ่มการนัดหมายใหม่</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ลูกค้า</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900"
                  value={newApt.customerId}
                  onChange={e => setNewApt({...newApt, customerId: e.target.value})}
                  required
                >
                  <option value="">เลือกลูกค้า</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">บริการ</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900"
                  value={newApt.serviceId}
                  onChange={e => setNewApt({...newApt, serviceId: e.target.value})}
                  required
                >
                  <option value="">เลือกบริการ</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.price}฿)</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันที่</label>
                    <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg p-2 text-gray-900"
                        value={newApt.date}
                        onChange={e => setNewApt({...newApt, date: e.target.value})}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เวลา</label>
                    <input
                        type="time"
                        className="w-full border border-gray-300 rounded-lg p-2 text-gray-900"
                        value={newApt.time}
                        onChange={e => setNewApt({...newApt, time: e.target.value})}
                        required
                    />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 shadow-md shadow-rose-200"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentPage;