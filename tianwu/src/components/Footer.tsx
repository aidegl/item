import React from 'react';
import logo from '../assets/img/天悟2.png';

const Footer = () => {
  return (
    <footer id="contact" className="py-24 bg-brand-dark border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-24 mb-24">
          <div className="space-y-12">
            <div className="space-y-6">
              <img src={logo} alt="天悟 TIANWU" className="h-12 w-auto" />
              <p className="text-gray-400 max-w-md leading-relaxed">
                与企业共创长期价值，携手构建高效管理体系，实现可持续增长。
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <h4 className="text-white font-bold mb-4">合作咨询</h4>
                <ul className="space-y-2 text-gray-500 text-sm">
                  <li>电话：[预留占位符]</li>
                  <li>微信：[预留占位符]</li>
                  <li>邮箱：[预留占位符]</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">快速导航</h4>
                <ul className="space-y-2 text-gray-500 text-sm">
                  <li><a href="#home" className="hover:text-brand-blue transition-colors">首页</a></li>
                  <li><a href="#about" className="hover:text-brand-blue transition-colors">关于天悟</a></li>
                  <li><a href="#services" className="hover:text-brand-blue transition-colors">核心服务</a></li>
                  <li><a href="#cases" className="hover:text-brand-blue transition-colors">成功案例</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-brand-gray/50 rounded-3xl p-10 border border-white/5">
            <h3 className="text-2xl font-bold mb-8 text-white">立即开始您的管理升级</h3>
            <form className="space-y-4">
              <input 
                type="text" 
                placeholder="您的姓名" 
                className="w-full bg-brand-dark border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-brand-blue transition-all"
              />
              <input 
                type="email" 
                placeholder="联系邮箱" 
                className="w-full bg-brand-dark border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-brand-blue transition-all"
              />
              <textarea 
                placeholder="咨询内容" 
                rows={4}
                className="w-full bg-brand-dark border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-brand-blue transition-all"
              />
              <button className="w-full bg-brand-blue hover:bg-blue-600 py-4 rounded-xl font-bold transition-all">
                提交咨询
              </button>
            </form>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5 text-gray-600 text-sm">
          <p>天悟——让企业决策更科学，管理更高效，发展更稳健。</p>
          <p>© {new Date().getFullYear()} 天悟 TIANWU. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
