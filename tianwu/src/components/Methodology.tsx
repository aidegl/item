import React from 'react';
import { motion } from 'framer-motion';

const Methodology = () => {
  const principles = [
    {
      title: "客观思考",
      desc: "以科学流程分析问题，拒绝经验代替思考，基于数据与事实决策；"
    },
    {
      title: "全局为重",
      desc: "立足企业整体效益最大化，兼顾局部利益与长期发展；"
    },
    {
      title: "治标治本",
      desc: "既解决具体问题，更搭建底层决策与管理框架，从根源规避重复问题；"
    },
    {
      title: "人企合一",
      desc: "方案贴合企业实际情况与发展阶段，确保员工认可、落地可行；"
    },
    {
      title: "持续优化",
      desc: "建立定期评估与改进机制，根据业务发展与市场变化动态调整方案。"
    }
  ];

  return (
    <section id="methodology" className="py-24 bg-brand-blue/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gradient inline-block">天悟工作法</h2>
        </div>
        
        <div className="grid lg:grid-cols-5 gap-6">
          {principles.map((principle, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-brand-dark/50 border border-white/10 hover:border-brand-blue/50 transition-all text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue mx-auto mb-6 group-hover:bg-brand-blue group-hover:text-white transition-all duration-500">
                <span className="text-xl font-bold">{index + 1}</span>
              </div>
              <h3 className="text-lg font-bold mb-4 text-white">{principle.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {principle.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Methodology;
