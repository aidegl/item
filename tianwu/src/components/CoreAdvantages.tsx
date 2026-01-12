import React from 'react';
import { motion } from 'framer-motion';

const CoreAdvantages = () => {
  const advantages = [
    {
      title: "长期赋能模式",
      desc: "覆盖咨询、培训、IT系统支持及中长期跟踪辅导，带来根本性、持续性收益；"
    },
    {
      title: "顶尖实战团队",
      desc: "顾问平均20年+企业管理经验，曾服务惠普、中远集团、安博地产等知名企业；"
    },
    {
      title: "深厚理论支撑",
      desc: "融合多学科管理理论，著有《不管理决策，等于没管理企业》等专业著作；"
    },
    {
      title: "科学独创方法",
      desc: "以“天悟工作法”为核心，量身定制方案，拒绝经验主义与模板化服务；"
    },
    {
      title: "全流程落地保障",
      desc: "从战略规划到执行落地，配套培训、制度、工具，确保方案可落地、可复制。"
    }
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gradient inline-block">核心优势</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-3xl bg-brand-gray border border-white/5 hover:bg-brand-blue/5 hover:border-brand-blue/20 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold mb-6">
                {index + 1}
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreAdvantages;
