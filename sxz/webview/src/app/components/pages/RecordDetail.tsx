import { ArrowLeft, Calendar, FileText, Download } from 'lucide-react';

interface RecordDetailProps {
  recordId: string;
  onBack: () => void;
}

export function RecordDetail({ recordId, onBack }: RecordDetailProps) {
  // Mock data
  const record = {
    id: recordId,
    patientName: '张小梅',
    date: '2025-12-17',
    type: 'follow-up',
    status: 'completed',
    diagnosis: '类风湿性关节炎(稳定期)',
    treatment: '继续目前用药方案,加强功能锻炼',
    nextVisit: '3个月后复诊',
  };

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
          <h1 className="text-xl flex-1">就诊记录详情</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">
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
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-2">诊断结果</div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                {record.diagnosis}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-2">治疗建议</div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                {record.treatment}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-2">下次复诊</div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 text-sm">
                <span>📅</span>
                <span>{record.nextVisit}</span>
              </div>
            </div>
          </div>
        </div>

        <button className="w-full bg-blue-500 text-white py-4 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
          <FileText className="w-5 h-5" />
          查看完整报告
        </button>

        <button className="w-full bg-green-500 text-white py-4 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          导出PDF
        </button>
      </div>
    </div>
  );
}
