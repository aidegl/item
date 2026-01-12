import React from 'react';
import { motion } from 'framer-motion';

const ManagementSystem = () => {
  const systems = [
    {
      title: "战略规划体系",
      desc: "明确企业愿景与目标，分解战略执行路径，优化资源配置，确保各层级目标协同一致；"
    },
    {
      title: "组织架构设计",
      desc: "遵循精简高效、灵活调整、合理分工原则，搭建跨部门协同机制，明确权责划分标准；"
    },
    {
      title: "团队管理实践",
      desc: "构建人才梯队（培养计划+接班人制度+多岗位轮换），设计绩效激励体系与内部沟通渠道；"
    },
    {
      title: "流程标准化建设",
      desc: "梳理核心业务流程，优化重组冗余环节，制定操作规范，配套培训普及与效率评估机制；"
    },
    {
      title: "风险管控体系",
      desc: "建立风险识别分类框架（按来源/性质/影响程度分类），制定应急预案，规范合规性审查流程；"
    },
    {
      title: "文化传承创新",
      desc: "推动核心价值观落地（理念渗透+制度保障+评估改进），构建学习型组织，配套变革管理实施。"
    }
  ];

  return (
    <section id="management" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gradient inline-block">天悟核心管理体系</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {systems.map((system, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-3xl bg-brand-gray/40 border border-white/5 hover:bg-brand-gray/60 transition-all flex gap-6 items-start"
            >
              <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0 font-bold">
                {index + 1}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-white">{system.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {system.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ManagementSystem;
