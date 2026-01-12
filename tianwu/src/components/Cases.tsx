import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Globe, 
  Truck, 
  GraduationCap, 
  Utensils, 
  Sparkles, 
  Stethoscope, 
  ShoppingBag,
  Factory,
  Briefcase,
  Users2,
  CheckCircle2
} from 'lucide-react';

const Cases = () => {
  const clients = ["惠普（HP）", "中远集团", "安博地产", "木林森电子", "味千拉面", "哈根达斯", "滔博运动"];
  
  const industries = [
    { name: "制造", icon: Factory },
    { name: "互联网/IT", icon: Globe },
    { name: "物流运输", icon: Truck },
    { name: "教育培训", icon: GraduationCap },
    { name: "餐饮服务", icon: Utensils },
    { name: "美业", icon: Sparkles },
    { name: "医疗健康", icon: Stethoscope },
    { name: "房地产", icon: Building2 },
    { name: "零售连锁", icon: ShoppingBag }
  ];

  return (
    <section id="cases" className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-sm font-medium"
          >
            <Briefcase className="w-4 h-4" />
            Success Stories
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-6xl font-bold text-white mb-6"
          >
            成功<span className="text-gradient">案例</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-2xl mx-auto text-lg"
          >
            服务各行各业领军企业，积累了丰富的行业深度洞察与实战经验
          </motion.p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group p-10 rounded-[2.5rem] bg-brand-gray/30 border border-white/5 hover:border-brand-blue/30 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 blur-[100px] group-hover:bg-brand-blue/10 transition-colors" />
            
            <h3 className="text-2xl font-bold mb-10 flex items-center gap-4 text-white">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                <Users2 className="w-6 h-6" />
              </div>
              标杆客户
            </h3>
            
            <div className="flex flex-wrap gap-4">
              {clients.map((client, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-4 rounded-2xl bg-white/5 text-gray-300 border border-white/10 hover:border-brand-blue/30 hover:bg-brand-blue/5 hover:text-white transition-all cursor-default flex items-center gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-brand-blue" />
                  <span className="font-medium">{client}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group p-10 rounded-[2.5rem] bg-brand-gray/30 border border-white/5 hover:border-brand-blue/30 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[100px]" />
            
            <h3 className="text-2xl font-bold mb-10 flex items-center gap-4 text-white">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                <Building2 className="w-6 h-6" />
              </div>
              行业覆盖
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {industries.map((industry, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-2xl bg-white/5 text-center border border-white/5 hover:bg-brand-blue/10 hover:border-brand-blue/30 transition-all group/item"
                >
                  <industry.icon className="w-8 h-8 mx-auto mb-4 text-gray-500 group-hover/item:text-brand-blue transition-colors" />
                  <span className="text-gray-400 text-sm font-medium group-hover/item:text-white transition-colors">{industry.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Cases;
