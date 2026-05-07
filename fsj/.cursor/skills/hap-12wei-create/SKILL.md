---
name: hap-12wei-create
description: 创建HAP系统12维数据的技能。支持通过Coze工作流API创建12种类型的维度数据（技能、想法、项目、交流、规则、价值、目标、计划、信息、人脉、仓、复盘）。包含完整的字段定义、API调用规范和Windows环境编码处理方案。
---

# HAP 12维数据创建

此技能用于通过Coze工作流API创建HAP系统的12维数据。

## 使用场景

在以下情况下使用此技能：
- 需要创建HAP系统的12维数据
- 用户提到"创建12维"、"新增维度数据"、"发布技能/想法/项目"等关键词
- 需要批量创建或自动化创建维度数据

## 12维类型列表

| 类型值 | 含义 |
|--------|------|
| 1技能 | 技能维度 |
| 2想法 | 想法维度 |
| 3项目 | 项目维度 |
| 4交流 | 交流维度 |
| 5规则 | 规则维度 |
| 6价值 | 价值维度 |
| 7目标 | 目标维度 |
| 8计划 | 计划维度 |
| 9信息 | 信息维度 |
| 10人脉 | 人脉维度 |
| 11仓 | 仓维度 |
| 12复盘 | 复盘维度 |

## API信息

- **端点**: `POST https://api.coze.cn/v1/workflow/stream_run`
- **workflow_id**: `7631572188324069419`

## 完整字段定义模板

> **注意**：字段可能会随时增加，请以最新定义为准。

```json
[
  {
    "controlId": "mingcheng",
    "value": "文本"
  },
  {
    "controlId": "leixing",
    "value": "1技能 或 2想法 或 3项目 或 4交流 或 5规则 或 6价值 或 7目标 或 8计划 或 9信息 或 10人脉 或 11仓 或 12复盘",
    "valueType": "提交值类型，1=不增加选项，2=允许增加选项（默认为1，为1时匹配不到已有选项时传入空，为2时，匹配不到时会创建新选项并写入）"
  },
  {
    "controlId": "69e60acf1c2ab9d1e66835ab",
    "value": "记忆 或 选项2 或 选项3",
    "valueType": "提交值类型，1=不增加选项，2=允许增加选项（默认为1，为1时匹配不到已有选项时传入空，为2时，匹配不到时会创建新选项并写入）"
  },
  {
    "controlId": "quanzhong",
    "value": "666.66"
  },
  {
    "controlId": "guanjianci",
    "value": "rowid1,rowid2,rowid3"
  },
  {
    "controlId": "miaoshu",
    "value": "文本"
  },
  {
    "controlId": "neirong",
    "value": "文本"
  },
  {
    "controlId": "mzcs",
    "value": "666.66"
  },
  {
    "controlId": "readme",
    "value": "文本"
  },
  {
    "controlId": "kssj",
    "value": "2018-8-8 12:00:00"
  },
  {
    "controlId": "yjwcsj",
    "value": "2018-8-8 12:00:00"
  },
  {
    "controlId": "sjwcsj",
    "value": "2018-8-8 12:00:00"
  },
  {
    "controlId": "fu",
    "value": "rowid"
  },
  {
    "controlId": "fujian",
    "value": "https://www.mingdao.com/1.jpg,https://www.mingdao.com/2.jpg,https://www.mingdao.com/3.txt",
    "editType": "数据更新类型，0=覆盖，1=新增（默认0:覆盖，新建记录可不传该参数）",
    "valueType": "提交值类型，1=外部文件链接，2=文件流字节编码 base64格式 字符串 (默认1,为1时 外部链接放在value参数中，为2时 文件流base64信息放在controlFiles参数中 )",
    "controlFiles": [
      {
        "baseFile": "base64字符串（文件流字节编码）",
        "fileName": "文件名称，带后缀"
      }
    ]
  },
  {
    "controlId": "fabuzhe",
    "value": "rowid"
  },
  {
    "controlId": "duixiang",
    "value": "rowid"
  },
  {
    "controlId": "canyuzhe",
    "value": "rowid"
  },
  {
    "controlId": "zi",
    "value": "rowid1,rowid2,rowid3"
  },
  {
    "controlId": "_owner",
    "value": "ae75cf2e-0f73-4137-9e99-116d92c45a47"
  }
]
```

## 字段说明表

| controlId | 字段含义 | 类型 | 格式/说明 |
|-----------|---------|------|----------|
| mingcheng | 名称 | 文本 | 数据名称 |
| leixing | 类型 | 选项 | **必填**，12维类型，格式"数字+类型名" |
| 69e60acf1c2ab9d1e66835ab | 分类 | 选项 | 支持 valueType 参数 |
| quanzhong | 权重 | 数值 | 如 "666.66" |
| guanjianci | 关键词 | 关联 | 多个 rowid 用逗号分隔 |
| miaoshu | 描述 | 文本 | 描述内容 |
| neirong | 内容 | 文本 | 详细内容 |
| mzcs | - | 数值 | 数值类型 |
| readme | 说明 | 文本 | 说明文档 |
| kssj | 开始时间 | 日期 | 格式: "2018-8-8 12:00:00" |
| yjwcsj | 预计完成时间 | 日期 | 格式: "2018-8-8 12:00:00" |
| sjwcsj | 实际完成时间 | 日期 | 格式: "2018-8-8 12:00:00" |
| fu | 父级 | 关联 | 父级记录的 rowid |
| fujian | 附件 | 附件 | 支持 外部链接 或 base64 |
| fabuzhe | 发布者 | 成员 | **必填**，agent 的 rowid |
| duixiang | 对象 | 成员 | 成员 rowid |
| canyuzhe | 参与者 | 成员 | 成员 rowid |
| zi | 子级 | 关联 | 多个 rowid 用逗号分隔 |
| _owner | 所有者 | 成员 | 所有者 rowid |

## 选项字段的 valueType 参数

对于选项类型字段（如leixing、分类字段），支持额外的 valueType 参数：

| valueType | 说明 |
|-----------|------|
| 1 | 不增加选项（默认）。匹配不到已有选项时传入空 |
| 2 | 允许增加选项。匹配不到时会创建新选项并写入 |

```json
{
  "controlId": "leixing",
  "value": "1技能",
  "valueType": "1"
}
```

## 附件字段参数

附件字段支持多种提交方式：

| 参数 | 说明 |
|------|------|
| editType | 数据更新类型：0=覆盖（默认），1=新增 |
| valueType | 提交值类型：1=外部链接（默认），2=base64编码 |

### 外部链接方式

```json
{
  "controlId": "fujian",
  "value": "https://www.mingdao.com/1.jpg,https://www.mingdao.com/2.jpg",
  "editType": "0",
  "valueType": "1"
}
```

### Base64编码方式

```json
{
  "controlId": "fujian",
  "valueType": "2",
  "controlFiles": [
    {
      "baseFile": "base64字符串",
      "fileName": "文件名称.pdf"
    }
  ]
}
```

## 请求格式

### Headers

```
Authorization: Bearer {token}
Content-Type: application/json
```

### Body

```json
{
  "workflow_id": "7631572188324069419",
  "parameters": {
    "controls": [
      {
        "controlId": "mingcheng",
        "value": "名称文本"
      },
      {
        "controlId": "leixing",
        "value": "1技能"
      },
      {
        "controlId": "fabuzhe",
        "value": "{agent_rowid}"
      }
    ],
    "mima": "{agent_password}",
    "role_rowid": "{agent_rowid}"
  }
}
```

### 必填参数说明

| 参数 | 说明 |
|------|------|
| workflow_id | 固定值：`7631572188324069419` |
| controls[].controlId | 字段ID |
| controls[].value | 字段值 |
| mima | agent的密码，必须正确才能创建成功 |
| role_rowid | agent的rowid |

**关键约束**：
- `leixing` 必须填写，必须是12种类型之一
- `fabuzhe` 的 value 必须是实际的 rowid，且应与 `role_rowid` 一致
- 字段名是 `fabuzhe`（不是 `fabudzhe`）

## 响应格式

### 成功响应

```json
{
  "output": {
    "data": "uuid-of-created-record",
    "error_code": 1,
    "success": true
  }
}
```

### 失败响应

```json
{
  "output": null
}
```

## Windows 环境编码处理

**重要**：Windows环境下curl直接在命令行写入中文会有编码问题，导致创建失败。

### 解决方案：使用文件方式发送

1. 创建UTF-8编码的JSON文件：

```json
{"workflow_id":"7631572188324069419","parameters":{"controls":[{"controlId":"mingcheng","value":"测试数据"},{"controlId":"leixing","value":"1技能"},{"controlId":"fabuzhe","value":"1024efc4-27fd-4522-bf3c-e4ebc998393c"}],"mima":"381644","role_rowid":"1024efc4-27fd-4522-bf3c-e4ebc998393c"}}
```

2. 使用curl发送文件：

```bash
curl -X POST 'https://api.coze.cn/v1/workflow/stream_run' \
-H "Authorization: Bearer {token}" \
-H "Content-Type: application/json" \
--data-binary "@request.json"
```

### Node.js 实现示例

```javascript
const fs = require('fs');
const https = require('https');

/**
 * 创建12维数据
 * @param {Object} params - 创建参数
 * @param {string} params.token - API token
 * @param {string} params.password - agent密码
 * @param {string} params.agentRowid - agent的rowid
 * @param {Object} params.data - 数据内容
 * @returns {Promise<Object>} - 创建结果
 */
async function create12WeiData(params) {
  const { token, password, agentRowid, data } = params;

  // 构建请求体
  const requestBody = {
    workflow_id: "7631572188324069419",
    parameters: {
      controls: [
        { controlId: "mingcheng", value: data.name },
        { controlId: "leixing", value: data.type },
        { controlId: "fabuzhe", value: agentRowid }
      ],
      mima: password,
      role_rowid: agentRowid
    }
  };

  // 添加可选字段
  if (data.description) {
    requestBody.parameters.controls.push({
      controlId: "miaoshu",
      value: data.description
    });
  }
  if (data.content) {
    requestBody.parameters.controls.push({
      controlId: "neirong",
      value: data.content
    });
  }
  // ... 更多可选字段

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(requestBody);

    const options = {
      hostname: 'api.coze.cn',
      path: '/v1/workflow/stream_run',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        // 解析 SSE 格式响应
        const lines = data.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6);
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.content) {
                const content = JSON.parse(parsed.content);
                resolve(content.output);
              }
            } catch (e) {}
          }
        }
        resolve(null);
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// 使用示例
create12WeiData({
  token: 'your_token',
  password: '381644',
  agentRowid: '1024efc4-27fd-4522-bf3c-e4ebc998393c',
  data: {
    name: '测试技能',
    type: '1技能',
    description: '这是一个测试技能'
  }
}).then(result => {
  if (result && result.success) {
    console.log('创建成功，rowid:', result.data);
  } else {
    console.log('创建失败');
  }
});
```

### Python 实现示例

```python
import requests
import json

def create_12wei_data(token, password, agent_rowid, data):
    """
    创建12维数据

    Args:
        token: API token
        password: agent密码
        agent_rowid: agent的rowid
        data: 数据字典，包含name, type等字段

    Returns:
        创建结果，成功返回{'data': rowid, 'success': True}
    """

    # 构建controls数组
    controls = [
        {"controlId": "mingcheng", "value": data.get("name", "")},
        {"controlId": "leixing", "value": data.get("type", "1技能")},
        {"controlId": "fabuzhe", "value": agent_rowid}
    ]

    # 添加可选字段
    optional_fields = {
        "miaoshu": "description",
        "neirong": "content",
        "quanzhong": "weight",
        "kssj": "start_time",
        "yjwcsj": "expected_time",
        "sjwcsj": "actual_time"
    }

    for control_id, data_key in optional_fields.items():
        if data_key in data:
            controls.append({"controlId": control_id, "value": data[data_key]})

    # 构建请求体
    payload = {
        "workflow_id": "7631572188324069419",
        "parameters": {
            "controls": controls,
            "mima": password,
            "role_rowid": agent_rowid
        }
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        "https://api.coze.cn/v1/workflow/stream_run",
        headers=headers,
        data=json.dumps(payload, ensure_ascii=False).encode('utf-8')
    )

    # 解析 SSE 响应
    for line in response.text.split('\n'):
        if line.startswith('data: '):
            try:
                event_data = json.loads(line[6:])
                if event_data.get('content'):
                    content = json.loads(event_data['content'])
                    return content.get('output')
            except:
                pass

    return None

# 使用示例
result = create_12wei_data(
    token="your_token",
    password="381644",
    agent_rowid="1024efc4-27fd-4522-bf3c-e4ebc998393c",
    data={
        "name": "测试技能",
        "type": "1技能",
        "description": "这是一个测试技能"
    }
)

if result and result.get('success'):
    print(f"创建成功，rowid: {result['data']}")
else:
    print("创建失败")
```

## 工作检查清单

创建12维数据时，请确认：

- [ ] `leixing` 已填写，且是12种类型之一
- [ ] `fabuzhe` 的 value 是实际的 rowid（不是字符串"rowid")
- [ ] `fabuzhe` 与 `role_rowid` 一致
- [ ] `mima` 密码正确
- [ ] 字段名使用 `fabuzhe`（不是 `fabudzhe`）
- [ ] Windows环境下使用文件方式发送或确保UTF-8编码

## 常见问题

### Q: 创建返回 null 是什么原因？

可能原因：
1. 密码错误
2. rowid 不匹配（fabuzhe 与 role_rowid 不一致）
3. leixing 未填写或格式错误
4. 中文编码问题（Windows环境）

### Q: 如何处理中文编码问题？

Windows环境下：
- 使用文件方式发送请求（写入UTF-8编码的JSON文件）
- 或使用 Python/Node.js 等编程语言发送请求

### Q: valueType 参数何时需要使用？

当字段是选项类型且需要控制是否允许新增选项时使用：
- valueType=1：严格匹配现有选项
- valueType=2：允许创建新选项

## 相关文档

详细的API说明请查看：
- `.docs/HAP-12维数据创建说明.md` - 基础API说明