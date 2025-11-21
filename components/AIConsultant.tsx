import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { generateConsultationPlan } from '../services/geminiService';
import { Sparkles, Send, Loader2, Stethoscope, AlertCircle } from 'lucide-react';

const AIConsultant: React.FC = () => {
  const { customers, services } = useClinic();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ recommendation: string; recommendedServices: string[] } | null>(null);

  const handleAnalyze = async () => {
    if (!selectedCustomerId || !symptoms) return;

    setLoading(true);
    const customer = customers.find(c => c.id === selectedCustomerId);
    const res = await generateConsultationPlan(symptoms, services, customer?.name || 'Customer');
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-full mb-4">
            <Sparkles size={20} />
            <span className="font-semibold">AI Smart Consultant</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">ระบบช่วยประเมินและแนะนำบริการ</h2>
        <p className="text-gray-500">ให้ AI ช่วยวิเคราะห์ปัญหาผิวหน้าและแนะนำคอร์สที่เหมาะสมสำหรับลูกค้า</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">เลือกลูกค้า (Select Customer)</label>
                    <select
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-gray-50"
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                    >
                        <option value="">-- กรุณาเลือกลูกค้า --</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ความกังวล / ปัญหาที่ต้องการแก้ไข</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 h-40 bg-gray-50"
                        placeholder="เช่น ผิวหน้าหย่อนคล้อย มีริ้วรอยบริเวณหางตา อยากหน้าใส..."
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={loading || !selectedCustomerId || !symptoms}
                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all ${
                        loading || !selectedCustomerId || !symptoms
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg shadow-rose-200 hover:shadow-xl transform hover:-translate-y-1'
                    }`}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    {loading ? 'กำลังวิเคราะห์ข้อมูล...' : 'วิเคราะห์และแนะนำบริการ'}
                </button>
                
                {!process.env.API_KEY && (
                   <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                      <AlertCircle size={16} />
                      <span>Demo Mode: AI features require an API KEY in environment.</span>
                   </div>
                )}
            </div>
        </div>

        {/* Result Section */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm min-h-[500px] flex flex-col relative overflow-hidden">
            {!result ? (
                <div className="flex flex-col items-center justify-center flex-1 text-gray-300">
                    <Stethoscope size={64} className="mb-4 opacity-20" />
                    <p>ผลการวิเคราะห์จะแสดงที่นี่</p>
                </div>
            ) : (
                <div className="animate-fadeIn">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Sparkles className="text-purple-500" />
                        คำแนะนำจาก AI (Recommendation)
                    </h3>
                    
                    <div className="bg-rose-50/50 p-6 rounded-xl border border-rose-100 mb-6">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {result.recommendation}
                        </p>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-4">บริการที่แนะนำ (Suggested Services):</h4>
                    <div className="space-y-3">
                        {result.recommendedServices.map((svcName, idx) => {
                             // Find matching service details for nicer display
                             const svcDetails = services.find(s => s.name === svcName) || { price: 0, category: 'Service' };
                             return (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-rose-300 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{svcName}</p>
                                            <p className="text-xs text-gray-500">{svcDetails.category}</p>
                                        </div>
                                    </div>
                                    {svcDetails.price > 0 && (
                                        <span className="font-semibold text-rose-600">฿{svcDetails.price.toLocaleString()}</span>
                                    )}
                                </div>
                             );
                        })}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AIConsultant;
