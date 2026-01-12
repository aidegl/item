import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Globe, 
  Search, 
  Workflow, 
  RefreshCcw 
} from 'lucide-react';

const Methodology = () => {
  const principles = [
    {
      title: "客观思考",
      desc: "以科学流程分析问题，拒绝经验代替思考，基于数据与事实决策；",
      icon: Brain,
      delay: 0.1
    },
    {
      title: "全局为重",
      desc: "立足企业整体效益最大化，兼顾局部利益与长期发展；",
      icon: Globe,
      delay: 0.2
    },
    {
      title: "治标治本",
      desc: "既解决具体问题，更搭建底层决策与管理框架，从根源规避重复问题；",
      icon: Search,
      delay: 0.3
    },
    {
      title: "人企合一",
      desc: "方案贴合企业实际情况与发展阶段，确保员工认可、落地可行；",
      icon: Workflow,
      delay: 0.4
    },
    {
      title: "持续优化",
      desc: "建立定期评估与改进机制，根据业务发展与市场变化动态调整方案。",
      icon: RefreshCcw,
      delay: 0.5
    }
  ];

  return (
    <section id="methodology" className="py-32 bg-brand-blue/5 relative overflow-hidden">
      {/* 装饰性背景 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-sm font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
            Tianwu Methodology
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-6xl font-bold text-white mb-6"
          >
            天悟<span className="text-gradient">工作法</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-2xl mx-auto text-lg"
          >
            沉淀多年管理咨询经验，形成一套科学、严谨、可落地的实战方法论
          </motion.p>
        </div>
        
        <div className="grid lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {principles.map((principle, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: principle.delay }}
              className="relative p-8 rounded-3xl bg-brand-dark/50 border border-white/5 hover:border-brand-blue/30 transition-all duration-500 text-center group overflow-hidden"
            >
              {/* 背景装饰 */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl group-hover:bg-brand-blue/10 transition-colors" />
              
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-brand-blue/5 flex items-center justify-center text-brand-blue mx-auto mb-8 group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white transition-all duration-500 shadow-xl shadow-brand-blue/5">
                  <principle.icon className="w-10 h-10" />
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-white group-hover:text-brand-blue transition-colors">
                  {principle.title}
                </h3>
                
                <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {principle.desc}
                </p>
              </div>

              {/* 连接线 (仅在桌面端显示) */}
              {index < principles.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-[1px] bg-gradient-to-r from-brand-blue/20 to-transparent z-0" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Methodology;
