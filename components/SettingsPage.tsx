import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Database, Download, RefreshCcw, Trash2, CheckCircle, Server, Shield, FileJson } from 'lucide-react';
import { resetConfiguration } from '../lib/supabaseClient';

const SettingsPage: React.FC = () => {
  const { exportToSQL, resetDatabase, isLoadingData } = useClinic();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const sql = await exportToSQL();
      const blob = new Blob([sql], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patricia_clinic_backup_${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Server className="text-rose-500" /> ตั้งค่าและฐานข้อมูล (Settings & Database)
      </h2>

      <div className="grid grid-cols-1 gap-8">
        {/* Database Status */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
           <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
               <Database size={20} className="text-blue-500"/> สถานะการเชื่อมต่อ (Connection Status)
           </h3>
           <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
               <div className="flex items-center gap-3">
                   <div className="p-2 bg-green-100 rounded-full text-green-600">
                       <CheckCircle size={24} />
                   </div>
                   <div>
                       <p className="font-bold text-green-800">Connected to Supabase (PostgreSQL)</p>
                       <p className="text-sm text-green-600">เชื่อมต่อฐานข้อมูลสำเร็จ พร้อมใช้งาน</p>
                   </div>
               </div>
               <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">Online</div>
           </div>
           <p className="text-gray-500 text-sm mt-4 leading-relaxed">
               หมายเหตุ: ระบบนี้ใช้ <strong>Supabase (PostgreSQL)</strong> เป็นฐานข้อมูลหลักซึ่งมีความปลอดภัยและความเร็วสูงเทียบเท่าหรือดีกว่า MySQL สำหรับ Web Application สมัยใหม่ <br/>
               (Note: This system uses Supabase/PostgreSQL which is optimized for modern web apps, offering superior security compared to direct MySQL connections from frontend.)
           </p>
        </div>

        {/* Export / Backup */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
               <Download size={20} className="text-purple-500"/> สำรองข้อมูล (Data Export)
           </h3>
           <p className="text-gray-600 mb-6">
               คุณสามารถดาวน์โหลดข้อมูลทั้งหมดในระบบออกมาเป็นไฟล์ SQL เพื่อนำไป Import ลงในฐานข้อมูล MySQL หรือ MariaDB อื่นๆ ได้
           </p>
           <button 
                onClick={handleExport}
                disabled={exporting}
                className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition shadow-lg flex items-center gap-2"
           >
               {exporting ? <RefreshCcw className="animate-spin" size={20} /> : <FileJson size={20} />}
               ดาวน์โหลดไฟล์ SQL (Backup for MySQL)
           </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
             <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
               <Shield size={20} /> พื้นที่อันตราย (Danger Zone)
           </h3>
           
           <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-red-200 pb-4">
                    <div>
                        <p className="font-bold text-gray-800">รีเซ็ตการเชื่อมต่อ (Reset Connection)</p>
                        <p className="text-sm text-gray-500">ลบค่า API Key และ URL ที่บันทึกไว้ในเครื่องนี้</p>
                    </div>
                    <button onClick={resetConfiguration} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                        Reset Config
                    </button>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div>
                        <p className="font-bold text-red-700">ล้างข้อมูลในฐานข้อมูล (Clear Database)</p>
                        <p className="text-sm text-red-500">ลบลูกค้า, สต็อก และประวัติทั้งหมด (กู้คืนไม่ได้)</p>
                    </div>
                    <button 
                        onClick={resetDatabase}
                        disabled={isLoadingData}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm flex items-center gap-2"
                    >
                        <Trash2 size={16} /> ลบข้อมูลทั้งหมด
                    </button>
                </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;