# 小程序组件开发 Skill

## 🎯 用途

本 Skill 用于指导开发者创建可在 merchantDashboard 装修页面拖拽使用的小程序组件。

---

## 📁 文件结构

```
miniprogram-component/
├── SKILL.md              # 技能规范文档
├── README.md             # 使用说明（本文件）
├── component-template.js # 组件开发模板
└── examples/             # 示例组件（待添加）
    └── shop-info.js
```

---

## 🚀 快速开始

### 1. 复制模板

```bash
cd /home/admin/.openclaw/workspace/item/fsj/merchantDashboard/components
cp ../../../../skillshop/miniprogram-component/component-template.js shop-info.js
```

### 2. 修改组件配置

编辑 `shop-info.js`，修改以下内容：

```javascript
module.exports = {
  name: '店铺信息',  // 改成你的组件名
  type: '商家端专属组件',
  
  getDefaultProperties() {
    return {
      // 你的组件属性
    };
  },
  
  // ... 其他方法
};
```

### 3. 测试组件

1. 访问 merchantDashboard 门店装修页面
2. 在组件库中找到新组件
3. 拖拽到预览区域
4. 配置属性
5. 点击"打包小程序"
6. 下载 ZIP 导入微信开发者工具测试

---

## 📋 开发检查清单

开发完成后逐项检查：

- [ ] 组件名称使用中文
- [ ] 字段命名使用拼音缩写
- [ ] 图片字段正确解析（JSON.parse）
- [ ] 支持主题色占位符 `{主题色}`
- [ ] 系统级组件实现 `loadData()` 方法
- [ ] 所有必须方法都已实现
- [ ] 错误处理完善
- [ ] 代码有注释

---

## 🔧 常见问题

### Q: 组件在组件库中不显示？

**A:** 检查 `name` 属性是否使用中文，必须与装修页面中显示的名称一致。

### Q: 打包后小程序报错？

**A:** 检查：
1. `generateHTML()` 是否返回有效 WXML
2. `generateCSS()` 是否返回有效 WXSS
3. `generateJS()` 是否返回有效 JS

### Q: 图片不显示？

**A:** 明道云的图片字段是 JSON 字符串，需要解析：

```javascript
const imgArray = JSON.parse(row.fengmian);
const imgUrl = imgArray[0]?.large_thumbnail_full_path;
```

---

## 📚 参考文档

- [SKILL.md](./SKILL.md) - 完整开发规范
- [component-template.js](./component-template.js) - 组件模板

---

**版本：** 1.0.0
**创建时间：** 2026-03-01
**维护者：** 风 (Feng)
