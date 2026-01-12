import React from 'react';
import { motion } from 'framer-motion';

const Services = () => {
  const services = [
    {
      title: "咨询服务",
      direction: "核心方向：决策体系搭建、运营流程优化、销售体系升级",
      items: ["战略规划", "组织架构设计", "跨部门协同机制", "权责划分", "风险管控体系建设"]
    },
    {
      title: "培训服务",
      direction: "核心方向：员工素质提升、决策能力培养、团队协作赋能",
      items: ["沟通技能培训", "领导力培训", "跨部门协作培训", "流程规范培训"]
    },
    {
      title: "系统工具服务",
      direction: "核心方向：数字化管理赋能、决策效率提升",
      items: ["决策管理系统", "业务流程信息化工具", "数据共享平台搭建", "知识管理系统落地"]
    }
  ];

  return (
    <section id="services" className="py-24 bg-brand-gray/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gradient inline-block">核心服务</h2>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-12">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="flex flex-col h-full"
            >
              <div className="p-8 rounded-3xl bg-brand-dark border border-white/10 flex-1 flex flex-col hover:border-brand-blue/40 transition-all">
                <h3 className="text-2xl font-bold mb-4 text-brand-blue">{service.title}</h3>
                <p className="text-sm text-gray-500 mb-8 pb-4 border-b border-white/5">{service.direction}</p>
                <ul className="space-y-4 flex-1">
                  {service.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
