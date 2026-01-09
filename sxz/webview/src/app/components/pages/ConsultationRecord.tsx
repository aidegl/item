import { ArrowLeft, Camera, FileText, Mic, Save } from 'lucide-react';
import { useState } from 'react';

interface ConsultationRecordProps {
  patientName: string;
  onBack: () => void;
  onGenerateReport: (data: any) => void;
}

export function ConsultationRecord({
  patientName,
  onBack,
  onGenerateReport,
}: ConsultationRecordProps) {
  const [step, setStep] = useState<'scan' | 'review'>('scan');
  const [scannedData, setScannedData] = useState({
    medicalRecord: null as any,
    testReports: [] as any[],
    voiceMemos: [] as string[],
  });

  const [ocrData, setOcrData] = useState({
    diagnosis: '',
    treatment: '',
    medications: '',
    lifestyle: '',
    followUpDate: '',
  });

  const handleScanMedicalRecord = () => {
    // Mock OCR scanning
    setTimeout(() => {
      setOcrData({
        diagnosis: '冠状动脉供血不足',
        treatment: '1. 口服药物治疗\n2. 定期复查心电图',
        medications: '阿司匹林肠溶片 100mg 每日1次\n辛伐他汀片 20mg 每晚1次',
        lifestyle: '1. 建议静养,避免剧烈运动\n2. 清淡饮食,少油少盐\n3. 保持心情舒畅',
        followUpDate: '2周后复诊',
      });
      setStep('review');
    }, 1500);
  };

  const handleScanTestReport = () => {
    // Mock test report scanning
    const mockReport = {
      id: Date.now().toString(),
      name: '血常规检查',
      abnormalItems: [
        { item: '白细胞计数', value: '11.2', unit: '×10^9/L', flag: '↑' },
        { item: 'C反应蛋白', value: '15.3', unit: 'mg/L', flag: '↑' },
      ],
    };
    setScannedData({
      ...scannedData,
      testReports: [...scannedData.testReports, mockReport],
    });
  };

  const handleGenerateReport = () => {
    onGenerateReport({
      ...ocrData,
      testReports: scannedData.testReports,
      voiceMemos: scannedData.voiceMemos,
    });
  };

  if (step === 'review') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex items-center gap-3 p-4">
            <button
              onClick={() => setStep('scan')}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl flex-1">OCR识别结果</h1>
          </div>
        </div>

        <div className="p-4 pb-20 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="text-2xl">✨</div>
            <div className="flex-1 text-sm">
              <div className="text-green-700 mb-1">OCR识别完成</div>
              <div className="text-green-600 text-xs">
                已自动提取病历关键信息,请核对并修改
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="mb-4">最终诊断</h3>
            <textarea
              value={ocrData.diagnosis}
              onChange={(e) => setOcrData({ ...ocrData, diagnosis: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="mb-4">医生治疗建议</h3>
            <textarea
              value={ocrData.treatment}
              onChange={(e) => setOcrData({ ...ocrData, treatment: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="mb-4">药物处方</h3>
            <textarea
              value={ocrData.medications}
              onChange={(e) => setOcrData({ ...ocrData, medications: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="mb-4">生活方式调整</h3>
            <textarea
              value={ocrData.lifestyle}
              onChange={(e) => setOcrData({ ...ocrData, lifestyle: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="mb-4">下次复诊时间</h3>
            <input
              type="text"
              value={ocrData.followUpDate}
              onChange={(e) => setOcrData({ ...ocrData, followUpDate: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {scannedData.testReports.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="mb-4">检查报告异常项</h3>
              {scannedData.testReports.map((report) => (
                <div key={report.id} className="mb-4 last:mb-0">
                  <div className="text-sm text-gray-600 mb-2">{report.name}</div>
                  <div className="space-y-2">
                    {report.abnormalItems.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-100"
                      >
                        <span className="text-sm">{item.item}</span>
                        <span className="text-sm">
                          {item.value} {item.unit}{' '}
                          <span className="text-red-500">{item.flag}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleGenerateReport}
            className="w-full bg-blue-500 text-white py-4 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            生成诊后报告
          </button>
        </div>
      </div>
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
          <h1 className="text-xl flex-1">诊中记录 - {patientName}</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg mb-3 flex items-center gap-2">
            <span className="text-2xl">📸</span>
            OCR智能识别
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">1.</span>
              <span>拍摄门诊病历,AI自动提取诊断和医嘱</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">2.</span>
              <span>拍摄检查报告,自动识别异常指标</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">3.</span>
              <span>信息将自动填入诊后总结报告</span>
            </li>
          </ul>
        </div>

        {/* 门诊病历扫描 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2">
              <span>📋</span> 门诊病历
            </h3>
            {scannedData.medicalRecord ? (
              <span className="text-green-500 text-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                已扫描
              </span>
            ) : (
              <span className="text-gray-400 text-sm">未扫描</span>
            )}
          </div>
          <button
            onClick={handleScanMedicalRecord}
            className="w-full bg-blue-500 text-white py-4 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            拍摄门诊病历
          </button>
          <p className="text-xs text-gray-500 mt-3 text-center">
            💡 请确保字体清晰,光线充足,避免反光
          </p>
        </div>

        {/* 检查报告扫描 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2">
              <span>🔬</span> 检查/检验报告
            </h3>
            {scannedData.testReports.length > 0 && (
              <span className="text-green-500 text-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {scannedData.testReports.length}份
              </span>
            )}
          </div>
          <button
            onClick={handleScanTestReport}
            className="w-full bg-green-500 text-white py-4 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            拍摄检查报告
          </button>
          {scannedData.testReports.length > 0 && (
            <div className="mt-3 space-y-2">
              {scannedData.testReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-green-50 rounded-lg p-3 text-sm text-green-700 border border-green-100"
                >
                  ✓ {report.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 语音备忘录 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-4 flex items-center gap-2">
            <span>🎤</span> 语音备忘录
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            记录医生口头嘱咐但未写在病历上的细节
          </p>
          <button className="w-full bg-purple-500 text-white py-4 rounded-xl font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-2">
            <Mic className="w-5 h-5" />
            开始录音
          </button>
        </div>

        {/* 手动补充 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-4">📝 其他补充信息</h3>
          <textarea
            placeholder="手动输入其他需要记录的信息..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
