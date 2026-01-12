import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  const points = [
    "成立于2008年，聚焦企业决策、运营、销售三大核心体系赋能，深耕高净值企业服务；",
    "服务宗旨：“授人以鱼不如授人以渔”，不仅解决当下问题，更助力企业建立长效决策与管理机制；",
    "核心目标：让客户“体健不求医”，摆脱对外部咨询依赖，实现自主可持续发展；",
    "服务理念：以客户需求为核心，提供个性化解决方案，追求客户满意度与长期价值共赢。"
  ];

  return (
    <section id="about" className="py-24 bg-brand-gray/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl lg:text-5xl font-bold mb-12 text-center text-gradient">关于天悟</h2>
          <div className="grid gap-8">
            {points.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-blue/30 transition-all group"
              >
                <div className="text-4xl font-bold text-brand-blue/20 group-hover:text-brand-blue/50 transition-colors">
                  0{index + 1}
                </div>
                <p className="text-lg text-gray-300 leading-relaxed pt-1">
                  {point}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
