import { useState } from 'react';
import { ChevronRight, CheckCircle, Phone, Camera, FileText } from 'lucide-react';

interface OnboardingGuideProps {
  onComplete: () => void;
}

export function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Phone,
      title: '诊前沟通',
      description: '通过电话采集患者信息,AI自动转写并填充到就诊需求书',
      features: [
        '智能通话录音',
        'AI语音转文字',
        '自动提取关键信息',
        '话术提词器辅助',
      ],
      color: 'blue',
    },
    {
      icon: FileText,
      title: '就诊需求书',
      description: 'AI已自动填充部分内容,您只需核对补充即可',
      features: [
        '基本信息自动导入',
        'AI智能预填充',
        '上下文帮助提示',
        '一键保存',
      ],
      color: 'green',
    },
    {
      icon: Camera,
      title: '诊中记录',
      description: '拍摄病历和检查报告,OCR自动识别关键信息',
      features: [
        'OCR智能识别',
        '自动提取诊断',
        '异常指标高亮',
        '语音备忘录',
      ],
      color: 'purple',
    },
    {
      icon: CheckCircle,
      title: '诊后报告',
      description: '一键生成专业的诊疗总结报告,可导出分享',
      features: [
        '自动生成报告',
        '信息自动填充',
        'PDF导出',
        '微信分享',
      ],
      color: 'orange',
    },
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      icon: 'bg-blue-100 text-blue-600',
      button: 'bg-blue-500 hover:bg-blue-600',
    },
    green: {
      bg: 'from-green-500 to-green-600',
      icon: 'bg-green-100 text-green-600',
      button: 'bg-green-500 hover:bg-green-600',
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      icon: 'bg-purple-100 text-purple-600',
      button: 'bg-purple-500 hover:bg-purple-600',
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      icon: 'bg-orange-100 text-orange-600',
      button: 'bg-orange-500 hover:bg-orange-600',
    },
  };

  const colors = colorClasses[currentStepData.color as keyof typeof colorClasses];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className={`bg-gradient-to-br ${colors.bg} text-white p-8 flex-shrink-0`}>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className={`w-24 h-24 ${colors.icon} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Icon className="w-12 h-12" />
            </div>
            <h1 className="text-2xl mb-3">{currentStepData.title}</h1>
            <p className="text-white/90 text-sm">{currentStepData.description}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-md mx-auto w-full">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="mb-4">核心功能</h3>
          <ul className="space-y-3">
            {currentStepData.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-blue-500'
                  : index < currentStep
                  ? 'w-2 bg-green-500'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className={`w-full ${colors.button} text-white py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2`}
          >
            下一步
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onComplete}
            className={`w-full ${colors.button} text-white py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2`}
          >
            开始使用
            <CheckCircle className="w-5 h-5" />
          </button>
        )}

        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="w-full mt-3 text-gray-500 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
          >
            上一步
          </button>
        )}

        <button
          onClick={onComplete}
          className="w-full mt-2 text-gray-400 py-2 text-sm"
        >
          跳过引导
        </button>
      </div>
    </div>
  );
}
