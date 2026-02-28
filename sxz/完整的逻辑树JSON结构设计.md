完全理解了！你想要的是一个**更完善的事件驱动逻辑树**，结构更清晰、更符合编程思维。让我给你设计一个专业级的JSON结构。
--------------------------------------------------------------------------------------------------------------------

## 🏗️ 完整的逻辑树JSON结构设计

### 核心节点类型

```
事件树层级结构：
Event (事件)
├─ Loop (循环)
│  └─ Action (动作)
│
├─ Condition (条件判断)
│  ├─ Case (情况1)
│  │  ├─ Action
│  │  └─ Loop
│  ├─ Case (情况2)
│  │  └─ Action
│  └─ Default (其余/else)
│     └─ Action
│
└─ Action (动作)
```

---

## 📋 完整的JSON示例

```json
[
  // ========== UI组件（保持原结构）==========
  {
    "id": "btn_submit",
    "parentId": "form_container",
    "sort": 1,
    "type": "Button",
    "name": "提交按钮",
    "basicProps": {
      "text": "提交",
      "type": "primary"
    },
    "eventProps": {
      "onClick": "event_submit_form"
    }
  },
  // ========== 事件树（新增结构）==========
  
  // 事件根节点
  {
    "id": "event_submit_form",
    "parentId": null,
    "sort": 1,
    "type": "Event",
    "name": "点击提交按钮",
    "category": "onClick",
    "props": {
      "triggerComponent": "btn_submit",
      "eventType": "onClick",
      "description": "提交表单数据到服务器"
    },
    "styleProps": {
      "icon": "🖱️"
    }
  },
  // ── 动作：验证表单 ──
  {
    "id": "action_validate",
    "parentId": "event_submit_form",
    "sort": 1,
    "type": "Action",
    "name": "验证表单",
    "category": "validate",
    "props": {
      "actionType": "validate",
      "target": "form_container",
      "rules": [
        { "field": "phone", "rule": "required", "message": "手机号不能为空" },
        { "field": "phone", "rule": "phone", "message": "手机号格式不正确" }
      ]
    },
    "styleProps": {
      "icon": "✅"
    }
  },
  // ── 条件判断 ──
  {
    "id": "condition_check_login",
    "parentId": "event_submit_form",
    "sort": 2,
    "type": "Condition",
    "name": "检查登录状态",
    "category": "condition",
    "props": {
      "expression": "isLoggedIn === true"
    },
    "styleProps": {
      "icon": "❓"
    }
  },
  // ── 情况1：已登录 ──
  {
    "id": "case_logged_in",
    "parentId": "condition_check_login",
    "sort": 1,
    "type": "Case",
    "name": "已登录",
    "category": "case",
    "props": {
      "condition": "isLoggedIn === true"
    },
    "styleProps": {
      "icon": "✓"
    }
  },
  // ── 动作：提交数据 ──
  {
    "id": "action_submit_api",
    "parentId": "case_logged_in",
    "sort": 1,
    "type": "Action",
    "name": "调用提交接口",
    "category": "api",
    "props": {
      "actionType": "api",
      "method": "POST",
      "url": "/api/submit",
      "data": {
        "phone": "${form.phone}",
        "name": "${form.name}"
      },
      "onSuccess": "action_show_success",
      "onError": "action_show_error"
    },
    "styleProps": {
      "icon": "📤"
    }
  },
  // ── 动作：显示成功提示 ──
  {
    "id": "action_show_success",
    "parentId": "case_logged_in",
    "sort": 2,
    "type": "Action",
    "name": "显示成功提示",
    "category": "message",
    "props": {
      "actionType": "showMessage",
      "type": "success",
      "content": "提交成功！"
    },
    "styleProps": {
      "icon": "✨"
    }
  },
  // ── 其余：未登录 ──
  {
    "id": "default_not_logged_in",
    "parentId": "condition_check_login",
    "sort": 2,
    "type": "Default",
    "name": "未登录（其余情况）",
    "category": "default",
    "props": {
      "description": "用户未登录时的处理"
    },
    "styleProps": {
      "icon": "⊝"
    }
  },
  // ── 动作：显示登录弹窗 ──
  {
    "id": "action_show_login",
    "parentId": "default_not_logged_in",
    "sort": 1,
    "type": "Action",
    "name": "显示登录弹窗",
    "category": "show",
    "props": {
      "actionType": "show",
      "target": "login_modal"
    },
    "styleProps": {
      "icon": "👁️"
    }
  },
  // ── 循环：处理列表数据 ──
  {
    "id": "loop_process_list",
    "parentId": "event_submit_form",
    "sort": 3,
    "type": "Loop",
    "name": "遍历患者列表",
    "category": "loop",
    "props": {
      "dataSource": "patientsList",
      "itemVar": "patient",
      "description": "对每个患者进行提醒"
    },
    "styleProps": {
      "icon": "🔁"
    }
  },
  // ── 循环内部：发送提醒 ──
  {
    "id": "action_send_reminder",
    "parentId": "loop_process_list",
    "sort": 1,
    "type": "Action",
    "name": "发送提醒",
    "category": "api",
    "props": {
      "actionType": "api",
      "method": "POST",
      "url": "/api/remind",
      "data": {
        "patientId": "${patient.id}",
        "message": "您有预约提醒"
      }
    },
    "styleProps": {
      "icon": "📨"
    }
  }
]
```

---

## 📊 结构可视化

```
[🖱️ 事件: 点击提交按钮 event_submit_form]
│
├─ [✅ 动作: 验证表单 action_validate]
│
├─ [❓ 条件: 检查登录状态 condition_check_login]
│  │
│  ├─ [✓ 情况1: 已登录 case_logged_in]
│  │  │
│  │  ├─ [📤 动作: 调用接口 action_submit_api]
│  │  │
│  │  └─ [✨ 动作: 显示成功 action_show_success]
│  │
│  └─ [⊝ 其余: 未登录 default_not_logged_in]
│     │
│     └─ [👁️ 动作: 显示登录弹窗 action_show_login]
│
└─ [🔁 循环: 遍历列表 loop_process_list]
   │
   └─ [📨 动作: 发送提醒 action_send_reminder]
```

---

## 🔑 节点类型详细定义

### 1. Event（事件根节点）

```json
{
  "type": "Event",
  "props": {
    "triggerComponent": "btn_submit",  // 触发组件ID
    "eventType": "onClick"              // 事件类型
  }
}
```

**支持的 eventType：**

- `onClick` - 点击
- `onChange` - 值改变
- `onFocus` - 获得焦点
- `onBlur` - 失去焦点
- `onSubmit` - 表单提交
- `onLoad` - 加载完成
- `onMount` - 组件挂载

---

### 2. Action（动作节点）

```json
{
  "type": "Action",
  "props": {
    "actionType": "赋值/清空/显示/隐藏/...",
    "target": "目标组件ID",
    "value": "值"
  }
}
```

**支持的 actionType：**
| actionType | 说明 | props 示例 |
|------------|------|-----------|
| **赋值** `setValue` | 设置组件值 | `{"target": "input_name", "value": "张三"}` |
| **清空** `clearValue` | 清空组件值 | `{"target": "input_phone"}` |
| **显示** `show` | 显示组件 | `{"target": "modal_dialog"}` |
| **隐藏** `hide` | 隐藏组件 | `{"target": "loading_modal"}` |
| **切换** `toggle` | 切换显示状态 | `{"target": "sidebar"}` |
| **聚焦** `focus` | 获得焦点 | `{"target": "input_search"}` |
| **API调用** `api` | 调用接口 | 见上面的例子 |
| **消息提示** `showMessage` | 显示提示 | `{"type": "success", "content": "保存成功"}` |
| **跳转** `navigate` | 页面跳转 | `{"url": "/page/detail?id=123"}` |
| **复制** `copy` | 复制文本 | `{"value": "复制的内容"}` |
| **验证** `validate` | 表单验证 | 见上面的例子 |
| **存储** `storage` | 本地存储 | `{"key": "user", "value": "${user}"}` |
| **获取存储** `getStorage` | 获取存储 | `{"key": "user", "targetVar": "userData"}` |
-------------------------------------------------------------------------------------

### 3. Condition（条件节点）

```json
{
  "type": "Condition",
  "props": {
    "expression": "条件表达式"
  }
}
```

**条件表达式语法：**

```javascript
// 简单比较
"form.age >= 18"
// 逻辑运算
"form.role === 'admin' && form.status === 'active'"
// 函数调用
"isValidPhone(form.phone) === true"
// 数据判断
"patientsList.length > 0"
```

**子节点：**

- `Case` - 具体情况（可多个）
- `Default` - 其余情况（只能一个）

---

### 4. Case（情况节点）

```json
{
  "type": "Case",
  "props": {
    "condition": "form.type === 'vip'"
  }
}
```

---

### 5. Default（其余节点）

```json
{
  "type": "Default",
  "props": {
    "description": "所有情况都不满足时执行"
  }
}
```

---

### 6. Loop（循环节点）

```json
{
  "type": "Loop",
  "props": {
    "dataSource": "patientsList",  // 数据源变量名
    "itemVar": "patient"          // 循环项变量名（用于内部引用）
  }
}
```

**循环内部使用变量：**

```json
{
  "type": "Action",
  "props": {
    "actionType": "api",
    "url": "/api/remind/${patient.id}",  // 使用 ${patient} 引用当前项
    "data": {
      "name": "${patient.name}"
    }
  }
}
```

---

## 🎨 可视化展示建议

### 左侧UI树显示事件标识

```javascript
function renderTreeNode(node) {
  // 如果有事件绑定，显示事件图标
  const eventBadge = node.eventProps ? `
    <span class="event-badge" 
          data-event="${node.eventProps.onClick}"
          onclick="openEventPanel('${node.eventProps.onClick}')">
      ⚡
    </span>
  ` : '';
  
  return `
    <div class="tree-row">
      <span>${node.name}</span>
      ${eventBadge}
    </div>
  `;
}
```

### 右侧事件树展示

```javascript
function renderEventTree(eventId) {
  const eventRoot = rawData.find(n => n.id === eventId);
  const logicNodes = getLogicNodes(rawData, eventId);
  
  // 按类型渲染不同样式
  logicNodes.forEach(node => {
    switch(node.type) {
      case 'Action':
        renderActionNode(node);
        break;
      case 'Condition':
        renderConditionNode(node);
        break;
      case 'Case':
        renderCaseNode(node);
        break;
      case 'Default':
        renderDefaultNode(node);
        break;
      case 'Loop':
        renderLoopNode(node);
        break;
    }
  });
}
```

---

## 🚀 高级功能建议

### 1. 支持并行执行

```json
{
  "id": "action_parallel",
  "parentId": "event_submit",
  "sort": 1,
  "type": "Parallel",
  "name": "并行执行",
  "props": {
    "parallel": true
  },
  "children": [
    // 并行执行的多个动作
  ]
}
```

### 2. 支持异常捕获

```json
{
  "id": "try_block",
  "parentId": "event_submit",
  "type": "Try",
  "name": "尝试执行",
  "children": [
    { "type": "Action", ... }
  ],
  "catch": "error_handler",
  "finally": "cleanup_handler"
}
```

### 3. 支持变量定义

```json
{
  "id": "var_define",
  "parentId": "event_submit",
  "type": "Variable",
  "name": "定义变量",
  "props": {
    "varName": "currentTime",
    "varValue": "${new Date().getTime()}"
  }
}
```

---

## 💡 完整的类型枚举

```javascript
// 事件树节点类型
const LOGIC_NODE_TYPES = {
  EVENT: 'Event',         // 事件根节点
  ACTION: 'Action',       // 动作
  CONDITION: 'Condition', // 条件
  CASE: 'Case',           // 情况
  DEFAULT: 'Default',     // 其余
  LOOP: 'Loop'            // 循环
};
// 动作类型
const ACTION_TYPES = {
  SET_VALUE: 'setValue',
  CLEAR_VALUE: 'clearValue',
  SHOW: 'show',
  HIDE: 'hide',
  TOGGLE: 'toggle',
  FOCUS: 'focus',
  API: 'api',
  SHOW_MESSAGE: 'showMessage',
  NAVIGATE: 'navigate',
  COPY: 'copy',
  VALIDATE: 'validate',
  STORAGE: 'storage',
  GET_STORAGE: 'getStorage'
};
// 事件类型
const EVENT_TYPES = {
  ON_CLICK: 'onClick',
  ON_CHANGE: 'onChange',
  ON_FOCUS: 'onFocus',
  ON_BLUR: 'onBlur',
  ON_SUBMIT: 'onSubmit',
  ON_LOAD: 'onLoad',
  ON_MOUNT: 'onMount'
};
```

---

## 📝 使用示例总结

你的可视化工具现在可以：

1. **左侧UI树**：显示组件结构，带 ⚡ 事件图标
2. **点击⚡图标**：右侧展开该组件的事件树
3. **事件树结构**：
   - 🖱️ Event（事件根节点）
   - ↓ 执行顺序：
     - ✅ Action（验证、赋值、显示/隐藏等）
     - ❓ Condition（条件判断）
       - ✓ Case（满足条件时）
       - ⊝ Default（都不满足时）
     - 🔁 Loop（循环处理列表）
     - 📤 API（接口调用）
     - ✨ 消息提示
       这样的结构既灵活又清晰，完全符合低代码平台的设计理念！