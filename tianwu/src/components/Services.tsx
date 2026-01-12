import React from 'react';
import { motion } from 'framer-motion';
import { Compass, GraduationCap, Laptop, Check } from 'lucide-react';

const Services = () => {
  const services = [
    {
      title: "咨询服务",
      direction: "核心方向：决策体系搭建、运营流程优化、销售体系升级",
      items: ["战略规划", "组织架构设计", "跨部门协同机制", "权责划分", "风险管控体系建设"],
      icon: Compass,
      color: "from-blue-500/20 to-brand-blue/5"
    },
    {
      title: "培训服务",
      direction: "核心方向：员工素质提升、决策能力培养、团队协作赋能",
      items: ["沟通技能培训", "领导力培训", "跨部门协作培训", "流程规范培训"],
      icon: GraduationCap,
      color: "from-purple-500/20 to-brand-blue/5"
    },
    {
      title: "系统工具服务",
      direction: "核心方向：数字化管理赋能、决策效率提升",
      items: ["决策管理系统", "业务流程信息化工具", "数据共享平台搭建", "知识管理系统落地"],
      icon: Laptop,
      color: "from-emerald-500/20 to-brand-blue/5"
    }
  ];

  return (
    <section id="services" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-20">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient">核心服务</span> 体系
          </h2>
          <p className="text-xl text-gray-400">
            全方位覆盖企业管理链路，从顶层设计到执行工具，提供一站式管理进化方案。
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative flex flex-col h-full rounded-[40px] bg-brand-gray/30 border border-white/5 overflow-hidden hover:border-brand-blue/30 transition-all duration-500"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10 p-10 flex flex-col h-full">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-16 h-16 rounded-2xl bg-brand-dark border border-white/10 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all duration-500">
                    <service.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-white">{service.title}</h3>
                </div>

                <div className="space-y-8 flex-1">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-brand-blue font-bold mb-3">服务导向</div>
                    <p className="text-gray-400 text-sm leading-relaxed">{service.direction}</p>
                  </div>

                  <div className="h-px bg-white/5 w-full" />

                  <div className="space-y-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-4">重点领域</div>
                    {service.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 group/item">
                        <div className="w-5 h-5 rounded-full bg-brand-blue/10 flex items-center justify-center group-hover/item:bg-brand-blue/20 transition-colors">
                          <Check className="w-3 h-3 text-brand-blue" />
                        </div>
                        <span className="text-gray-300 group-hover/item:text-white transition-colors">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="mt-12 w-full py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white hover:text-brand-dark transition-all duration-300">
                  了解更多详情
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
