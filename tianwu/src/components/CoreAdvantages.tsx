import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, BookOpen, Cpu, CheckCircle2 } from 'lucide-react';

const CoreAdvantages = () => {
  const advantages = [
    {
      title: "长期赋能模式",
      desc: "覆盖咨询、培训、IT系统支持及中长期跟踪辅导，带来根本性、持续性收益；",
      icon: Award
    },
    {
      title: "顶尖实战团队",
      desc: "顾问平均20年+企业管理经验，曾服务惠普、中远集团、安博地产等知名企业；",
      icon: Users
    },
    {
      title: "深厚理论支撑",
      desc: "融合多学科管理理论，著有《不管理决策，等于没管理企业》等专业著作；",
      icon: BookOpen
    },
    {
      title: "科学独创方法",
      desc: "以“天悟工作法”为核心，量身定制方案，拒绝经验主义与模板化服务；",
      icon: Cpu
    },
    {
      title: "全流程落地保障",
      desc: "从战略规划到执行落地，配套培训、制度、工具，确保方案可落地、可复制。",
      icon: CheckCircle2
    }
  ];

  return (
    <section id="advantages" className="py-24 relative overflow-hidden">
      {/* 背景点缀 */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brand-blue/5 blur-[120px] rounded-full -z-10" />

      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="text-brand-blue font-bold tracking-widest uppercase text-sm">Why Choose Us</div>
            <h2 className="text-4xl lg:text-6xl font-bold text-white">
              <span className="text-gradient">核心优势</span> 定制化赋能
            </h2>
          </div>
          <p className="text-gray-400 max-w-sm border-l-2 border-brand-blue pl-6 py-2">
            我们不提供模版化的建议，而是通过深度调研与科学方法，为您的企业构建坚实的技术底座。
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-10 rounded-[32px] bg-brand-gray/50 border border-white/5 hover:bg-brand-gray transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-8 group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white transition-all duration-500 shadow-lg shadow-brand-blue/5">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-brand-blue transition-colors">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  {item.desc}
                </p>
              </div>
              
              {/* 装饰性数字 */}
              <div className="absolute top-8 right-8 text-4xl font-bold text-white/5 group-hover:text-brand-blue/10 transition-colors">
                0{index + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreAdvantages;
