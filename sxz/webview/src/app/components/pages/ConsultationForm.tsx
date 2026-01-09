import { ArrowLeft, Save, AlertCircle, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface ConsultationFormProps {
  patientName: string;
  patientData: any;
  prefilledData?: any;
  onBack: () => void;
  onSave: (data: any) => void;
}

export function ConsultationForm({
  patientName,
  patientData,
  prefilledData,
  onBack,
  onSave,
}: ConsultationFormProps) {
  const [formData, setFormData] = useState({
    visitType: prefilledData?.visitType || '',
    coreComplaint: prefilledData?.coreComplaint || '',
    symptomName: prefilledData?.symptomName || '',
    onsetTime: prefilledData?.onsetTime || '',
    symptomPattern: prefilledData?.symptomPattern || '',
    triggeringFactors: '',
    relievingFactors: '',
    previousTreatment: prefilledData?.previousTreatment || '',
    coreQuestion: prefilledData?.coreQuestion || '',
  });

  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const tooltips: Record<string, string> = {
    triggeringFactors: '询问患者什么情况下症状会加重,如:熬夜、吃冷饮、运动后等',
    relievingFactors: '询问患者做什么能让症状减轻,如:休息、服药、热敷等',
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
          <h1 className="text-xl flex-1">就诊需求书</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 pb-20 space-y-4">
        {/* 患者基本信息 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-4 flex items-center gap-2">
            <span>👤</span> 患者基本信息
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">姓名:</span>
              <span>{patientData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">性别/年龄:</span>
              <span>{patientData.gender} / {patientData.age}岁</span>
            </div>
            {patientData.allergies && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-red-700 text-xs mb-1">⚠️ 药物过敏史</div>
                  <div className="text-red-600">{patientData.allergies}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI自动填充提示 */}
        {prefilledData && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="text-2xl">✨</div>
            <div className="flex-1 text-sm">
              <div className="text-green-700 mb-1">AI已自动填充部分内容</div>
              <div className="text-green-600 text-xs">
                以下信息已根据诊前通话录音智能提取,请核对并补充
              </div>
            </div>
          </div>
        )}

        {/* 就诊类型 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <label className="block mb-3">
            就诊类型 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, visitType: 'first' })}
              className={`flex-1 py-3 rounded-xl border-2 transition-colors ${
                formData.visitType === 'first'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              □ 首诊
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, visitType: 'follow-up' })}
              className={`flex-1 py-3 rounded-xl border-2 transition-colors ${
                formData.visitType === 'follow-up'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              □ 复诊
            </button>
          </div>
        </div>

        {/* 核心诉求 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-4">一、就诊核心诉求</h3>
          <textarea
            value={formData.coreComplaint}
            onChange={(e) =>
              setFormData({ ...formData, coreComplaint: e.target.value })
            }
            placeholder="用1-2句话概括患者最想解决的问题"
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* 核心症状详情 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="mb-4">二、核心症状详情</h3>
          
          <div>
            <label className="block text-sm mb-2 text-gray-700">
              1. 症状名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.symptomName}
              onChange={(e) =>
                setFormData({ ...formData, symptomName: e.target.value })
              }
              placeholder="如:头痛、胸闷、咳嗽"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">
              2. 起病时间 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.onsetTime}
              onChange={(e) =>
                setFormData({ ...formData, onsetTime: e.target.value })
              }
              placeholder="如:3天前、1个月前、2023年5月"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">3. 症状变化规律</label>
            <textarea
              value={formData.symptomPattern}
              onChange={(e) =>
                setFormData({ ...formData, symptomPattern: e.target.value })
              }
              placeholder="如:早上严重,下午减轻;持续性疼痛;间歇性发作"
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="relative">
            <label className="block text-sm mb-2 text-gray-700 flex items-center gap-2">
              4. 诱发/加重因素
              <button
                type="button"
                onClick={() =>
                  setShowTooltip(
                    showTooltip === 'triggeringFactors' ? null : 'triggeringFactors'
                  )
                }
                className="text-blue-500"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </label>
            {showTooltip === 'triggeringFactors' && (
              <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                💡 {tooltips.triggeringFactors}
              </div>
            )}
            <input
              type="text"
              value={formData.triggeringFactors}
              onChange={(e) =>
                setFormData({ ...formData, triggeringFactors: e.target.value })
              }
              placeholder="如:劳累后、着凉、情绪激动"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <label className="block text-sm mb-2 text-gray-700 flex items-center gap-2">
              5. 缓解因素
              <button
                type="button"
                onClick={() =>
                  setShowTooltip(showTooltip === 'relievingFactors' ? null : 'relievingFactors')
                }
                className="text-blue-500"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </label>
            {showTooltip === 'relievingFactors' && (
              <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                💡 {tooltips.relievingFactors}
              </div>
            )}
            <input
              type="text"
              value={formData.relievingFactors}
              onChange={(e) =>
                setFormData({ ...formData, relievingFactors: e.target.value })
              }
              placeholder="如:休息后、服药后、热敷"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 既往诊疗情况 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-4">三、既往诊疗情况</h3>
          <textarea
            value={formData.previousTreatment}
            onChange={(e) =>
              setFormData({ ...formData, previousTreatment: e.target.value })
            }
            placeholder="描述患者之前做过的检查、治疗及效果"
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* 患者核心疑问 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-4">四、患者核心疑问</h3>
          <textarea
            value={formData.coreQuestion}
            onChange={(e) =>
              setFormData({ ...formData, coreQuestion: e.target.value })
            }
            placeholder="患者本次就诊最想弄清楚的问题"
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-4 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          保存就诊需求书
        </button>
      </form>
    </div>
  );
}
