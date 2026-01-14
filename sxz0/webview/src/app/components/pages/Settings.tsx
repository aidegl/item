import { ChevronRight, User, ShoppingBag, Shield, FileText, UserCircle } from 'lucide-react';

export function Settings() {
  return (
    <div className="p-4 pb-20">
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <div className="text-lg mb-1">未登录</div>
              <div className="flex items-center gap-2">
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs">
                  待认证
                </span>
                <span className="text-gray-500 text-sm">ID:</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 mb-4 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg">AI咨询额度</span>
          <span className="text-sm">会员到期时间: 2025-11-11</span>
        </div>
        <div className="mb-4">
          <div className="text-3xl mb-2">
            325<span className="text-xl">/500次</span>
          </div>
          <div className="w-full bg-blue-300 rounded-full h-2">
            <div className="bg-white rounded-full h-2" style={{ width: '65%' }}></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 bg-white text-blue-600 py-2.5 rounded-lg font-medium">
            Token充值
          </button>
          <button className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg font-medium border border-white/30">
            订购套餐
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        <button className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <span>订单管理</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-500" />
            <span>隐私安全</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-purple-500" />
            <span>用户协议</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <UserCircle className="w-5 h-5 text-blue-500" />
            <span>优惠码</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <button className="w-full bg-white rounded-2xl p-4 shadow-sm border border-red-200 text-red-500 font-medium hover:bg-red-50 transition-colors">
        🚪 退出登录
      </button>

      <div className="text-center text-gray-400 text-sm mt-6">v1.0</div>
    </div>
  );
}
