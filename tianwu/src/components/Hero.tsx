import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Target, ShieldCheck } from 'lucide-react';
import logo from '../assets/img/天悟2.png';

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* 动态背景装饰 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
      </div>
      
      {/* 网格背景语义 */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
              </span>
              <span className="text-sm font-medium text-gray-300 uppercase tracking-widest">赋能高净值企业增长</span>
            </div>

            <div className="space-y-6">
              <div className="relative inline-block">
                <img src={logo} alt="天悟 TIANWU" className="h-28 lg:h-44 w-auto object-contain mb-4 relative z-10" />
                <div className="absolute -bottom-2 -right-2 w-full h-full bg-brand-blue/5 blur-2xl -z-10" />
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="block text-gradient">天悟企业管理咨询</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-xl leading-relaxed">
                深度赋能企业<span className="text-white font-medium">决策能力</span>与<span className="text-white font-medium">运营效能</span>，
                致力于构建可持续增长的高端管理体系，让商业进化更具确定性。
              </p>
            </div>
            
            <div className="flex flex-wrap gap-5">
              <button className="group relative bg-brand-blue hover:bg-blue-600 px-10 py-5 rounded-xl text-lg font-bold transition-all overflow-hidden shadow-2xl shadow-brand-blue/20">
                <div className="absolute inset-0 w-1/2 h-full bg-white/10 -skew-x-12 -translate-x-full group-hover:translate-x-[250%] transition-transform duration-700" />
                <span className="flex items-center gap-2">
                  立即咨询合作 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button className="group bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-5 rounded-xl text-lg font-bold transition-all backdrop-blur-md">
                查看完整服务
              </button>
            </div>

            {/* 底部语义图标 */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/5">
              <div className="flex flex-col gap-2">
                <BarChart3 className="text-brand-blue w-6 h-6" />
                <span className="text-sm text-gray-500 uppercase tracking-tighter">增长驱动</span>
              </div>
              <div className="flex flex-col gap-2">
                <Target className="text-brand-blue w-6 h-6" />
                <span className="text-sm text-gray-500 uppercase tracking-tighter">精准决策</span>
              </div>
              <div className="flex flex-col gap-2">
                <ShieldCheck className="text-brand-blue w-6 h-6" />
                <span className="text-sm text-gray-500 uppercase tracking-tighter">体系保障</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* 抽象图形语义：代表管理体系的圆环 */}
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 border-2 border-brand-blue/20 rounded-full animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-12 border border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
              <div className="absolute inset-24 border border-brand-blue/5 rounded-full animate-[spin_10s_linear_infinite]" />
              
              {/* 中心主体卡片 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative z-10 bg-brand-gray/40 backdrop-blur-3xl rounded-[40px] p-12 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-transparent to-transparent opacity-50" />
                  <div className="relative space-y-10">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-3xl font-bold text-gradient">核心效能</span>
                        <span className="text-brand-blue font-mono">98.5%</span>
                      </div>
                      <div className="h-1.5 w-64 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "98.5%" }}
                          transition={{ duration: 2, delay: 1 }}
                          className="h-full bg-brand-blue shadow-[0_0_15px_rgba(0,122,255,0.5)]" 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <div className="text-gray-500 text-xs uppercase tracking-widest">管理指数</div>
                        <div className="text-2xl font-semibold">TIANWU-M1</div>
                      </div>
                      <div className="space-y-2 text-right">
                        <div className="text-gray-500 text-xs uppercase tracking-widest">战略对齐</div>
                        <div className="text-2xl font-semibold">100%</div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center shadow-lg shadow-brand-blue/30">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm text-gray-400 italic">"以结果为导向，以逻辑为基石"</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 漂浮的小元素 */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 -right-10 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500">增长率</div>
                    <div className="text-sm font-bold">+124%</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -left-10 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500">体系安全</div>
                    <div className="text-sm font-bold">稳定运行</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
