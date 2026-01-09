import { Plus, Calendar, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { RecordDetail } from './RecordDetail';

interface MedicalRecord {
  id: string;
  patientName: string;
  date: string;
  type: 'first' | 'follow-up';
  status: 'completed' | 'in-progress' | 'scheduled';
}

const mockRecords: MedicalRecord[] = [
  {
    id: '1',
    patientName: '张小梅',
    date: '2025-12-17',
    type: 'follow-up',
    status: 'completed',
  },
  {
    id: '2',
    patientName: '刘圣',
    date: '2025-12-16',
    type: 'first',
    status: 'in-progress',
  },
  {
    id: '3',
    patientName: '马天宇',
    date: '2025-12-15',
    type: 'follow-up',
    status: 'scheduled',
  },
];

export function RecordsList() {
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);

  if (selectedRecord) {
    return (
      <RecordDetail
        recordId={selectedRecord}
        onBack={() => setSelectedRecord(null)}
      />
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl">备忘录</h1>
        <button className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-3">
        {mockRecords.map((record) => (
          <div
            key={record.id}
            onClick={() => setSelectedRecord(record.id)}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">
                    {record.patientName.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-lg">{record.patientName}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{record.date}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        record.type === 'first'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {record.type === 'first' ? '首诊' : '复诊'}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            {record.status === 'completed' && (
              <div className="bg-green-50 rounded-lg p-3 text-sm text-green-700 border border-green-100">
                ✓ 已完成诊后报告
              </div>
            )}
            {record.status === 'in-progress' && (
              <div className="bg-yellow-50 rounded-lg p-3 text-sm text-yellow-700 border border-yellow-100">
                ⏱ 进行中
              </div>
            )}
            {record.status === 'scheduled' && (
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700 border border-blue-100">
                📅 已预约
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}