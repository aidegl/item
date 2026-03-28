import { ArrowLeft, Phone, Mic, CheckCircle, Loader } from 'lucide-react';
import { useState } from 'react';

interface PreConsultationProps {
  patientName: string;
  onBack: () => void;
  onComplete: (data: any) => void;
}

export function PreConsultation({ patientName, onBack, onComplete }: PreConsultationProps) {
  const [step, setStep] = useState<'questionnaire' | 'recording' | 'processing'>('questionnaire');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const questionnaireItems = [
    { 
      question: '目前最明显的症状是什么?', 
      hint: '如:头痛、发热、咳嗽等',
      example: '建议询问:"您现在最不舒服的是哪里呢?"'
    },
    { 
      question: '症状是什么时候开始的?', 
      hint: '尽量明确起病时间',
      example: '建议询问:"这个症状是从什么时候开始的?"'
    },
    { 
      question: '症状有什么变化规律吗?', 
      hint: '如:早上重、晚上轻',
      example: '建议询问:"症状一直都一样吗,还是有时候轻有时候重?"'
    },
    { 
      question: '做过哪些检查或治疗?', 
      hint: '是否有近期的检查报告',
      example: '建议询问:"之前有去医院看过吗?做过什么检查?"'
    },
    { 
      question: '本次就诊最想弄清楚的问题?', 
      hint: '患者的核心关切',
      example: '建议询问:"您这次最想让医生帮您解决什么问题?"'
    },
  ];

  const handleStartRecording = () => {
    setStep('recording');
    setIsRecording(true);
    // Mock recording timer
    const timer = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    // Auto-stop after demo
    setTimeout(() => {
      clearInterval(timer);
      setIsRecording(false);
      setStep('processing');
      
      // Mock AI processing
      setTimeout(() => {
        onComplete({
          recording: 'mock-recording-id',
          transcription: 'AI转写完成',
        });
      }, 2000);
    }, 5000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full">
          <Loader className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl mb-2">AI智能转写中...</h2>
          <p className="text-gray-600 text-sm">
            正在将通话内容转为文字并自动填充到就诊需求书
          </p>
        </div>
      </div>
    );
  }

  if (step === 'recording') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center p-4 text-white">
        <div className="mb-8">
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
            {isRecording ? (
              <Mic className="w-16 h-16 animate-pulse" />
            ) : (
              <Phone className="w-16 h-16" />
            )}
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">{formatTime(recordingTime)}</div>
            <div className="text-blue-100">通话录音中...</div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm mb-8 max-w-md w-full">
          <h3 className="mb-4 text-center">📋 话术提示</h3>
          <div className="space-y-2 text-sm">
            {questionnaireItems.map((item, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-3">
                <div className="mb-1">✓ {item.question}</div>
                <div className="text-xs text-blue-100">{item.example}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsRecording(false)}
          className="bg-white text-blue-600 px-8 py-4 rounded-full font-medium hover:bg-blue-50 transition-colors"
        >
          结束通话
        </button>
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
          <h1 className="text-xl flex-1">诊前沟通 - {patientName}</h1>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            智能采集说明
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">1.</span>
              <span>点击"开始通话"后,系统将自动录音</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">2.</span>
              <span>按照话术提示逐项询问患者</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">3.</span>
              <span>通话结束后,AI将自动转写并填充到《就诊需求书》</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="mb-4">📋 诊前问卷要点</h3>
          <div className="space-y-4">
            {questionnaireItems.map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">{item.question}</div>
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 mb-1">
                      💬 {item.example}
                    </div>
                    <div className="text-xs text-blue-600">💡 {item.hint}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleStartRecording}
          className="w-full bg-blue-500 text-white py-4 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Phone className="w-5 h-5" />
          开始诊前通话
        </button>
      </div>
    </div>
  );
}
