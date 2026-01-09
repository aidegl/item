import { useState } from 'react';
import { PreConsultation } from './pages/PreConsultation';
import { ConsultationForm } from './pages/ConsultationForm';
import { ConsultationRecord } from './pages/ConsultationRecord';
import { FinalReport } from './pages/FinalReport';

interface ConsultationFlowProps {
  patient: any;
  onComplete: () => void;
  onCancel: () => void;
}

export function ConsultationFlow({ patient, onComplete, onCancel }: ConsultationFlowProps) {
  const [step, setStep] = useState<'pre' | 'form' | 'record' | 'report'>('pre');
  const [consultationData, setConsultationData] = useState<any>(null);
  const [recordData, setRecordData] = useState<any>(null);

  const handlePreConsultationComplete = (data: any) => {
    // Mock AI prefilled data based on voice transcription
    const prefilledData = {
      visitType: 'first',
      coreComplaint: '患者主诉胸闷、心慌,担心心脏问题',
      symptomName: '胸闷、心慌',
      onsetTime: '3天前',
      symptomPattern: '劳累后加重,休息后缓解',
      previousTreatment: '未做过相关检查',
      coreQuestion: '想知道是不是心脏有问题,需要做什么检查',
    };
    
    setConsultationData({ ...data, prefilled: prefilledData });
    setStep('form');
  };

  const handleFormSave = (data: any) => {
    setConsultationData({ ...consultationData, ...data });
    setStep('record');
  };

  const handleGenerateReport = (data: any) => {
    setRecordData(data);
    setStep('report');
  };

  switch (step) {
    case 'pre':
      return (
        <PreConsultation
          patientName={patient.name}
          onBack={onCancel}
          onComplete={handlePreConsultationComplete}
        />
      );
    case 'form':
      return (
        <ConsultationForm
          patientName={patient.name}
          patientData={patient}
          prefilledData={consultationData?.prefilled}
          onBack={() => setStep('pre')}
          onSave={handleFormSave}
        />
      );
    case 'record':
      return (
        <ConsultationRecord
          patientName={patient.name}
          onBack={() => setStep('form')}
          onGenerateReport={handleGenerateReport}
        />
      );
    case 'report':
      return (
        <FinalReport
          patientName={patient.name}
          patientData={patient}
          consultationData={consultationData}
          recordData={recordData}
          onBack={() => setStep('record')}
        />
      );
  }
}
