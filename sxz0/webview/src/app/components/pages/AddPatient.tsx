import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';

interface AddPatientProps {
  onBack: () => void;
  onSave: (patient: any) => void;
}

export function AddPatient({ onBack, onSave }: AddPatientProps) {
  const [formData, setFormData] = useState({
    name: '',
    gender: '男',
    age: '',
    phone: '',
    allergies: '',
    mainSymptom: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
          <h1 className="text-xl flex-1">添加患者</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
          {/* 姓名 */}
          <div>
            <label className="block text-sm mb-2 text-gray-700">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入患者姓名"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 性别和年龄 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                性别 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: '男' })}
                  className={`flex-1 py-3 rounded-xl border-2 transition-colors ${
                    formData.gender === '男'
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  男
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: '女' })}
                  className={`flex-1 py-3 rounded-xl border-2 transition-colors ${
                    formData.gender === '女'
                      ? 'border-pink-500 bg-pink-50 text-pink-600'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  女
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                年龄 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="年龄"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 联系方式 */}
          <div>
            <label className="block text-sm mb-2 text-gray-700">
              联系方式 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="请输入手机号"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 药物过敏史 */}
          <div>
            <label className="block text-sm mb-2 text-gray-700">药物过敏史</label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="如：青霉素过敏(无则留空)"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-orange-600 mt-2 flex items-start gap-1">
              <span>⚠️</span>
              <span>请务必仔细确认,此信息将在所有就诊记录中高亮显示</span>
            </p>
          </div>

          {/* 主要症状 */}
          <div>
            <label className="block text-sm mb-2 text-gray-700">主要症状/病史</label>
            <textarea
              value={formData.mainSymptom}
              onChange={(e) => setFormData({ ...formData, mainSymptom: e.target.value })}
              placeholder="简要描述患者主要病情或症状"
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-4 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          保存患者信息
        </button>
      </form>
    </div>
  );
}
