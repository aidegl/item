import React from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/img/天悟2.png';

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-brand-blue/10 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <img src={logo} alt="天悟 TIANWU" className="h-26 lg:h-42 w-auto object-contain mb-8" />
              <span className="block text-gradient">天悟企业管理咨询</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-xl">
              赋能企业决策能力与运营效能，构建可持续增长的管理体系
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button className="bg-brand-blue hover:bg-blue-600 px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg shadow-brand-blue/20">
              咨询合作
            </button>
            <button className="border border-white/20 hover:bg-white/10 px-8 py-4 rounded-full text-lg font-bold transition-all">
              查看完整服务
            </button>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="w-full aspect-square rounded-full border border-brand-blue/20 animate-pulse absolute -inset-4" />
          <div className="w-full aspect-square rounded-full border border-white/10 absolute -inset-12" />
          <div className="relative z-10 bg-brand-gray/50 backdrop-blur-3xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue font-bold">
                    0{i}
                  </div>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-blue rounded-full" style={{ width: `${30 + i * 20}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
