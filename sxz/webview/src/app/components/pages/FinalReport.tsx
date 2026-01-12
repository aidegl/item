import { ArrowLeft, Download, Share2 } from 'lucide-react';

interface FinalReportProps {
  patientName: string;
  patientData: any;
  consultationData: any;
  recordData: any;
  onBack: () => void;
}

export function FinalReport({
  patientName,
  patientData,
  consultationData,
  recordData,
  onBack,
}: FinalReportProps) {
  const currentDate = new Date().toLocaleDateString('zh-CN');

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
          <h1 className="text-xl flex-1">诊疗总结报告</h1>
          <button className="text-blue-500">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 pb-20">
        {/* 报告标题 */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 mb-4 shadow-lg">
          <h1 className="text-2xl mb-2 text-center">陪诊后患者诊疗总结报告</h1>
          <div className="text-center text-blue-100 text-sm">
            生成时间: {currentDate}
          </div>
        </div>

        {/* 患者基本信息 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
          <h2 className="text-lg mb-4 pb-3 border-b border-gray-100">
            📋 患者基本信息
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">姓名:</span>
              <span className="ml-2">{patientData.name}</span>
            </div>
            <div>
              <span className="text-gray-600">性别:</span>
              <span className="ml-2">{patientData.gender}</span>
            </div>
            <div>
              <span className="text-gray-600">年龄:</span>
              <span className="ml-2">{patientData.age}岁</span>
            </div>
            <div>
              <span className="text-gray-600">就诊类型:</span>
              <span className="ml-2">
                {consultationData.visitType === 'first' ? '首诊' : '复诊'}
              </span>
            </div>
          </div>
          {patientData.allergies && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <span className="text-red-700">⚠️ 药物过敏史:</span>
              <span className="ml-2 text-red-600">{patientData.allergies}</span>
            </div>
          )}
        </div>

        {/* 一、诊前核心信息回顾 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
          <h2 className="text-lg mb-4 pb-3 border-b border-gray-100">
            一、诊前核心信息回顾
          </h2>
          
          <div className="mb-4">
            <h3 className="text-sm mb-2">1. 就诊核心诉求</h3>
            <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-700">
              {consultationData.coreComplaint}
            </div>
          </div>

          <div>
            <h3 className="text-sm mb-2">2. 核心症状摘要</h3>
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-2">
              <div>
                <span className="text-gray-600">症状:</span>
                <span className="ml-2">{consultationData.symptomName}</span>
              </div>
              <div>
                <span className="text-gray-600">起病时间:</span>
                <span className="ml-2">{consultationData.onsetTime}</span>
              </div>
              {consultationData.symptomPattern && (
                <div>
                  <span className="text-gray-600">变化规律:</span>
                  <span className="ml-2">{consultationData.symptomPattern}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 二、诊中诊疗详情 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
          <h2 className="text-lg mb-4 pb-3 border-b border-gray-100">
            二、诊中诊疗详情
          </h2>

          <div className="mb-4">
            <h3 className="text-sm mb-2">(一) 最终诊疗详情</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
              <div className="text-yellow-800">{recordData.diagnosis}</div>
            </div>
          </div>

          {recordData.testReports && recordData.testReports.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm mb-2">(二) 检查项目与结果</h3>
              <div className="space-y-3">
                {recordData.testReports.map((report: any) => (
                  <div key={report.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm mb-2">{report.name}</div>
                    <div className="space-y-1">
                      {report.abnormalItems.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm bg-white p-2 rounded border border-red-100"
                        >
                          <span>{item.item}</span>
                          <span className="text-red-600">
                            {item.value} {item.unit} {item.flag}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-sm mb-2">(三) 医生治疗建议</h3>
            <div className="bg-green-50 rounded-lg p-4 text-sm whitespace-pre-line text-gray-700">
              {recordData.treatment}
            </div>
          </div>

          <div>
            <h3 className="text-sm mb-2">(四) 药物处方</h3>
            <div className="bg-blue-50 rounded-lg p-4 text-sm whitespace-pre-line text-gray-700">
              {recordData.medications}
            </div>
          </div>
        </div>

        {/* 三、后续注意事项 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
          <h2 className="text-lg mb-4 pb-3 border-b border-gray-100">
            三、后续注意事项
          </h2>

          <div className="mb-4">
            <h3 className="text-sm mb-2">1. 生活方式调整</h3>
            <div className="bg-purple-50 rounded-lg p-4 text-sm whitespace-pre-line text-gray-700">
              {recordData.lifestyle}
            </div>
          </div>

          <div>
            <h3 className="text-sm mb-2">2. 复诊安排</h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div className="text-sm text-orange-800">{recordData.followUpDate}</div>
            </div>
          </div>
        </div>

        {/* 四、其他补充信息 */}
        {recordData.voiceMemos && recordData.voiceMemos.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
            <h2 className="text-lg mb-4 pb-3 border-b border-gray-100">
              四、其他补充信息
            </h2>
            <div className="space-y-2">
              {recordData.voiceMemos.map((memo: string, idx: number) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                  • {memo}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 报告说明 */}
        <div className="bg-gray-100 rounded-2xl p-4 text-xs text-gray-600 mb-4">
          <div className="mb-2">📌 报告说明:</div>
          <ul className="space-y-1 ml-4">
            <li>• 本报告由陪诊师根据医生诊疗过程整理生成</li>
            <li>• 请妥善保管,复诊时可供医生参考</li>
            <li>• 如有疑问,请及时联系陪诊师或就诊医院</li>
          </ul>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button className="flex-1 bg-blue-500 text-white py-4 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            导出PDF
          </button>
          <button className="flex-1 bg-green-500 text-white py-4 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5" />
            发送患者
          </button>
        </div>
      </div>
    </div>
  );
}
