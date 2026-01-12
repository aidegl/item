import React from 'react';
import { motion } from 'framer-motion';

const Publications = () => {
  return (
    <section id="publications" className="py-24 bg-brand-gray/30 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gradient inline-block">天悟著作</h2>
        </div>
        
        <div className="max-w-5xl mx-auto bg-brand-dark rounded-[3rem] p-12 border border-white/10 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 blur-[100px] -z-10" />
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, rotateY: 30 }}
              whileInView={{ opacity: 1, rotateY: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[3/4] bg-gradient-to-br from-brand-blue/20 to-brand-dark border border-white/20 rounded-xl shadow-2xl flex items-center justify-center group"
            >
              <div className="p-8 text-center">
                <div className="text-3xl font-bold mb-4 text-gradient">《不管理决策，等于没管理企业》</div>
                <div className="w-12 h-1 bg-brand-blue mx-auto" />
              </div>
              <div className="absolute inset-0 bg-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold mb-4 text-white">《不管理决策，等于没管理企业》</h3>
                <div className="text-brand-blue font-medium mb-6">企业管理综合性工具书</div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-gray-500 text-sm uppercase tracking-widest mb-2">核心价值</h4>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    剖析传统管理误区，系统阐述企业高质量决策的机制、方法与实用工具，是企业管理综合性工具书。
                  </p>
                </div>
                
                <div>
                  <h4 className="text-gray-500 text-sm uppercase tracking-widest mb-2">适用人群</h4>
                  <ul className="flex flex-wrap gap-3">
                    {["企业创始人", "高管", "中层管理者", "核心决策人员"].map((item, i) => (
                      <li key={i} className="px-4 py-2 rounded-full bg-white/5 text-gray-400 text-sm border border-white/10">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Publications;
