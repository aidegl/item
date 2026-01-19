import React from 'react';
import logo from '../assets/img/天悟.png';

const Navbar = () => {
  const navItems = [
    { name: '首页', href: '#home' },
    { name: '关于天悟', href: '#about' },
    { name: '核心服务', href: '#services' },
    { name: '管理体系', href: '#management' },
    { name: '天悟工作法', href: '#methodology' },
    { name: '成功案例', href: '#cases' },
    { name: '天悟著作', href: '#publications' },
    { name: '联系我们', href: '#contact' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src={logo} alt="天悟 TIANWU" className="h-10 w-auto" />
        </div>
        <div className="hidden lg:flex space-x-8">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-brand-blue transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>
        <button className="hidden lg:block bg-brand-blue hover:bg-blue-600 px-6 py-2 rounded-full text-sm font-bold transition-all">
          立即咨询
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
