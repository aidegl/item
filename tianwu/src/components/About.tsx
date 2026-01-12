import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Flag, 
  Target, 
  Heart,
  Quote
} from 'lucide-react';

const About = () => {
  const points = [
    {
      text: "成立于2008年，聚焦企业决策、运营、销售三大核心体系赋能，深耕高净值企业服务；",
      icon: Calendar,
      label: "Establishment"
    },
    {
      text: "服务宗旨：“授人以鱼不如授人以渔”，不仅解决当下问题，更助力企业建立长效决策与管理机制；",
      icon: Flag,
      label: "Mission"
    },
    {
      text: "核心目标：让客户“体健不求医”，摆脱对外部咨询依赖，实现自主可持续发展；",
      icon: Target,
      label: "Goal"
    },
    {
      text: "服务理念：以客户需求为核心，提供个性化解决方案，追求客户满意度与长期价值共赢。",
      icon: Heart,
      label: "Philosophy"
    }
  ];

  return (
    <section id="about" className="py-32 bg-brand-gray/30 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-blue/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-sm font-medium">
                About Tianwu
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold mb-8 text-white">
                赋能企业<br />
                <span className="text-gradient">实现跨越式成长</span>
              </h2>
              <div className="relative">
                <Quote className="absolute -top-6 -left-8 w-16 h-16 text-brand-blue/10" />
                <p className="text-xl text-gray-400 leading-relaxed italic">
                  天悟不仅仅是一家咨询公司，更是您企业发展道路上的长期战略伙伴。
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-brand-blue/20 to-transparent border border-white/5 flex items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] opacity-20 mix-blend-overlay grayscale" />
                <div className="relative text-center">
                  <div className="text-7xl font-bold text-white mb-2">15+</div>
                  <div className="text-brand-blue font-medium tracking-widest uppercase">Years of Excellence</div>
                </div>
              </div>
              {/* 装饰性漂浮元素 */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-blue/20 rounded-2xl blur-2xl animate-pulse" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {points.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group flex gap-6 p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-brand-blue/30 transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-all duration-500">
                  <point.icon className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-blue/50 uppercase tracking-widest mb-2 group-hover:text-brand-blue transition-colors">
                    {point.label}
                  </div>
                  <p className="text-lg text-gray-300 leading-relaxed group-hover:text-white transition-colors">
                    {point.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
