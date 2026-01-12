import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Zap, 
  Users, 
  ChevronRight,
  Library
} from 'lucide-react';

const Publications = () => {
  return (
    <section id="publications" className="py-32 bg-brand-gray/30 overflow-hidden relative">
      {/* 装饰性背景 */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-brand-blue/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-sm font-medium"
          >
            <Library className="w-4 h-4" />
            Thought Leadership
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-6xl font-bold text-white"
          >
            天悟<span className="text-gradient">著作</span>
          </motion.h2>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-brand-dark/50 rounded-[3rem] p-8 lg:p-16 border border-white/10 relative overflow-hidden backdrop-blur-sm"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/10 blur-[120px] -z-10" />
            
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, rotateY: 30, x: -50 }}
                whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
                viewport={{ once: true }}
                className="relative perspective-1000 group"
              >
                <div className="relative aspect-[3/4] bg-gradient-to-br from-brand-blue/40 to-brand-dark border border-white/20 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden transform-gpu transition-transform duration-700 group-hover:rotate-y-12">
                  <div className="p-12 text-center relative z-10">
                    <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-8" />
                    <div className="text-3xl lg:text-4xl font-bold mb-6 text-white leading-tight">《不管理决策，等于没管理企业》</div>
                    <div className="w-16 h-1.5 bg-brand-blue mx-auto rounded-full" />
                  </div>
                  {/* 书脊效果 */}
                  <div className="absolute top-0 left-0 w-4 h-full bg-black/20" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                </div>
                {/* 阴影装饰 */}
                <div className="absolute -bottom-10 inset-x-10 h-10 bg-black/50 blur-3xl -z-10" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-10"
              >
                <div>
                  <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-white">《不管理决策，等于没管理企业》</h3>
                  <div className="inline-block px-3 py-1 rounded bg-brand-blue text-white text-xs font-bold tracking-widest uppercase">
                    Management Guidebook
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                        <Zap className="w-4 h-4" />
                      </div>
                      <h4 className="text-gray-400 text-sm uppercase tracking-widest font-bold">核心价值 / Core Value</h4>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-xl pl-11">
                      剖析传统管理误区，系统阐述企业高质量决策的机制、方法与实用工具，是企业管理综合性工具书。
                    </p>
                  </div>
                  
                  <div className="group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                        <Users className="w-4 h-4" />
                      </div>
                      <h4 className="text-gray-400 text-sm uppercase tracking-widest font-bold">适用人群 / Target Audience</h4>
                    </div>
                    <div className="flex flex-wrap gap-3 pl-11">
                      {["企业创始人", "高管", "中层管理者", "核心决策人员"].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-sm border border-white/10 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-default">
                          <ChevronRight className="w-3 h-3 text-brand-blue" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-brand-blue text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
                >
                  了解著作详情
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Publications;
