import React from 'react';
import { motion } from 'framer-motion';

const Cases = () => {
  const clients = ["惠普（HP）", "中远集团", "安博地产", "木林森电子", "味千拉面", "哈根达斯", "滔博运动"];
  const industries = ["制造", "互联网/IT", "物流运输", "教育培训", "餐饮服务", "美业", "医疗健康", "房地产", "零售连锁"];

  return (
    <section id="cases" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gradient inline-block">成功案例</h2>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-10 rounded-3xl bg-brand-gray border border-white/5"
          >
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-brand-blue rounded-full" />
              标杆客户
            </h3>
            <div className="flex flex-wrap gap-4">
              {clients.map((client, i) => (
                <span key={i} className="px-6 py-3 rounded-xl bg-white/5 text-gray-300 border border-white/10 hover:border-brand-blue/30 transition-colors cursor-default">
                  {client}
                </span>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-10 rounded-3xl bg-brand-gray border border-white/5"
          >
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-brand-blue rounded-full" />
              行业覆盖
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {industries.map((industry, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 text-center text-gray-400 text-sm border border-white/5 hover:bg-brand-blue/10 hover:text-white transition-all">
                  {industry}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Cases;
