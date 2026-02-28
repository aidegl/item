import { Plus, Calendar, Bell, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export function AIAssistant() {
  const [selectedDate, setSelectedDate] = useState('2025-12-17');

  const upcomingReminders = [
    { id: '1', patientName: '老王', date: '2025-12-17', type: '复诊', completed: true },
    { id: '2', patientName: '李阿姨', date: '2025-12-18', type: '首诊', completed: false },
    { id: '3', patientName: '张伯伯', date: '2025-12-19', type: '复查', completed: false },
  ];

  return (
    <div className="p-4 pb-20">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 mb-4 border border-blue-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg">
            ⚡
          </div>
          <div className="flex-1">
            <h2 className="text-lg mb-2">每诊提醒助手</h2>
            <p className="text-sm text-gray-600">
              自动记录患者年病青复诊信息,帮助您及时提醒患者复诊
            </p>
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-500" />
            <span className="text-gray-900">{selectedDate}</span>
          </div>
          <button className="bg-red-500 text-white px-4 py-1 rounded-full text-sm">
            今天
          </button>
        </div>

        <div className="space-y-3">
          {upcomingReminders
            .filter((r) => r.date === selectedDate)
            .map((reminder) => (
              <div
                key={reminder.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  reminder.completed ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    reminder.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {reminder.completed ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-blue-500">👤</span>
                  <span className="text-gray-900">{reminder.patientName}</span>
                  <span className="text-xs text-gray-500">{reminder.type}</span>
                </div>
                {reminder.completed && (
                  <span className="ml-auto bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">
                    已复诊
                  </span>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Upcoming Reminders */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h3 className="mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-500" />
          <span>即将到来的提醒</span>
        </h3>
        <div className="space-y-2">
          {upcomingReminders
            .filter((r) => !r.completed && r.date > selectedDate)
            .map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100"
              >
                <div className="flex items-center gap-2">
                  <span>{reminder.patientName}</span>
                  <span className="text-xs text-gray-500">{reminder.type}</span>
                </div>
                <span className="text-xs text-orange-600">{reminder.date}</span>
              </div>
            ))}
        </div>
      </div>

      <button className="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}