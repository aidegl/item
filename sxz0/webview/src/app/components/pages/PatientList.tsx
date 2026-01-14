import { Search, Plus, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { PatientDetail } from './PatientDetail';
import { AddPatient } from './AddPatient';

interface Patient {
  id: string;
  name: string;
  gender: '男' | '女';
  age: number;
  mainSymptom: string;
}

const mockPatients: Patient[] = [
  { id: '1', name: '如果', gender: '男', age: 1, mainSymptom: '没什么' },
  { id: '2', name: '张小梅', gender: '男', age: 57, mainSymptom: '类风湿性关节炎3年' },
  { id: '3', name: '刘圣', gender: '男', age: 36, mainSymptom: '动心痛10年' },
  { id: '4', name: '马天宇', gender: '男', age: 68, mainSymptom: '无症任病史' },
  { id: '5', name: '王思涵', gender: '女', age: 55, mainSymptom: '糖尿病3年' },
  { id: '6', name: '林哲', gender: '男', age: 34, mainSymptom: '2023年骨折康复中' },
];

export function PatientList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [patients, setPatients] = useState(mockPatients);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.includes(searchQuery) ||
      patient.mainSymptom.includes(searchQuery)
  );

  const handleSavePatient = (newPatient: any) => {
    const patient = {
      id: String(patients.length + 1),
      name: newPatient.name,
      gender: newPatient.gender as '男' | '女',
      age: parseInt(newPatient.age),
      mainSymptom: newPatient.mainSymptom || '暂无症状描述',
    };
    setPatients([...patients, patient]);
    setShowAddPatient(false);
  };

  if (showAddPatient) {
    return (
      <AddPatient
        onBack={() => setShowAddPatient(false)}
        onSave={handleSavePatient}
      />
    );
  }

  if (selectedPatient) {
    return (
      <PatientDetail
        patientId={selectedPatient}
        onBack={() => setSelectedPatient(null)}
        onStartConsultation={() => {
          setSelectedPatient(null);
          // TODO: Navigate to consultation start
        }}
      />
    );
  }

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索姓名或疾病"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowAddPatient(true)}
            className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            onClick={() => setSelectedPatient(patient.id)}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{patient.name}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs ${
                    patient.gender === '男'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-pink-100 text-pink-600'
                  }`}
                >
                  {patient.gender}{patient.age}岁
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-blue-500 mt-0.5">💙</span>
              <div>
                <span className="text-blue-500">主要状况：</span>
                <span className="text-gray-700">{patient.mainSymptom}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}