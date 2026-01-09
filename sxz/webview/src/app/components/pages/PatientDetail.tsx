import { ArrowLeft, Phone, Calendar, AlertCircle, Edit, Plus } from 'lucide-react';
import { useState } from 'react';
import { ConsultationFlow } from '../ConsultationFlow';

interface PatientDetailProps {
  patientId: string;
  onBack: () => void;
  onStartConsultation: () => void;
}

export function PatientDetail({ patientId, onBack, onStartConsultation }: PatientDetailProps) {
  const [showConsultationFlow, setShowConsultationFlow] = useState(false);

  // Mock data - in real app, fetch from database
  const patient = {
    id: patientId,
    name: '张小梅',
    gender: '男',
    age: 57,
    phone: '138****8888',
    allergies: '青霉素过敏',
    mainSymptom: '类风湿性关节炎3年',
    medicalHistory: [
      { date: '2024-12-10', type: '复诊', status: '已完成' },
      { date: '2024-11-15', type: '首诊', status: '已完成' },
    ],
  };

  if (showConsultationFlow) {
    return (
      <ConsultationFlow
        patient={patient}
        onComplete={() => {
          setShowConsultationFlow(false);
          onBack();
        }}
        onCancel={() => setShowConsultationFlow(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl flex-1">患者档案</h1>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
            <Edit className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 基本信息 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl">
              {patient.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{patient.name}</span>
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                  {patient.gender} {patient.age}岁
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{patient.phone}</span>
              </div>
            </div>
          </div>

          {/* 过敏提醒 */}
          {patient.allergies && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <div className="text-red-700 mb-1">药物过敏史</div>
                <div className="text-red-600 text-sm">{patient.allergies}</div>
              </div>
            </div>
          )}
        </div>

        {/* 核心症状 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-4">核心症状</h3>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">💙</span>
            <div className="text-gray-700">{patient.mainSymptom}</div>
          </div>
        </div>

        {/* 就诊记录 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3>就诊记录</h3>
            <button className="text-blue-500 text-sm">查看全部</button>
          </div>
          <div className="space-y-3">
            {patient.medicalHistory.map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm">{record.date}</div>
                    <div className="text-xs text-gray-500 mt-1">{record.type}</div>
                  </div>
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pb-6">
          <button
            onClick={() => setShowConsultationFlow(true)}
            className="flex-1 bg-blue-500 text-white py-4 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            开始新陪诊
          </button>
        </div>
      </div>
    </div>
  );
}