import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Network, 
  Users2, 
  ClipboardCheck, 
  ShieldAlert, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

const ManagementSystem = () => {
  const systems = [
    {
      title: "战略规划体系",
      desc: "明确企业愿景与目标，分解战略执行路径，优化资源配置，确保各层级目标协同一致；",
      icon: Target,
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      title: "组织架构设计",
      desc: "遵循精简高效、灵活调整、合理分工原则，搭建跨部门协同机制，明确权责划分标准；",
      icon: Network,
      color: "from-indigo-500/20 to-purple-500/20"
    },
    {
      title: "团队管理实践",
      desc: "构建人才梯队（培养计划+接班人制度+多岗位轮换），设计绩效激励体系与内部沟通渠道；",
      icon: Users2,
      color: "from-emerald-500/20 to-teal-500/20"
    },
    {
      title: "流程标准化建设",
      desc: "梳理核心业务流程，优化重组冗余环节，制定操作规范，配套培训普及与效率评估机制；",
      icon: ClipboardCheck,
      color: "from-orange-500/20 to-amber-500/20"
    },
    {
      title: "风险管控体系",
      desc: "建立风险识别分类框架（按来源/性质/影响程度分类），制定应急预案，规范合规性审查流程；",
      icon: ShieldAlert,
      color: "from-red-500/20 to-rose-500/20"
    },
    {
      title: "文化传承创新",
      desc: "推动核心价值观落地（理念渗透+制度保障+评估改进），构建学习型组织，配套变革管理实施。",
      icon: Sparkles,
      color: "from-violet-500/20 to-fuchsia-500/20"
    }
  ];

  return (
    <section id="management" className="py-32 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-sm font-medium"
          >
            Management Architecture
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-bold text-white mb-6"
          >
            天悟核心<span className="text-gradient">管理体系</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto text-lg"
          >
            全方位覆盖企业运营核心，构建高效、稳健、可持续发展的组织管理闭环
          </motion.p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {systems.map((system, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative p-8 rounded-[2rem] bg-brand-gray/30 border border-white/5 hover:border-brand-blue/30 transition-all duration-500"
            >
              {/* 悬浮背景渐变 */}
              <div className={`absolute inset-0 bg-gradient-to-br ${system.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]`} />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-8 group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white transition-all duration-500">
                  <system.icon className="w-7 h-7" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-brand-blue transition-colors">
                  {system.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed text-sm mb-6 group-hover:text-gray-300 transition-colors">
                  {system.desc}
                </p>

                <div className="flex items-center text-xs font-medium text-brand-blue opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                  <span>查看详细方案</span>
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </div>
              </div>

              {/* 装饰性数字 */}
              <div className="absolute top-8 right-8 text-4xl font-black text-white/5 group-hover:text-white/10 transition-colors">
                {String(index + 1).padStart(2, '0')}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ManagementSystem;
