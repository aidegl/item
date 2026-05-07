# HAP 12维数据创建说明

## 概述

HAP系统支持创建12种类型的维度数据，通过调用Coze工作流API实现数据创建。

## API端点

```
POST https://api.coze.cn/v1/workflow/stream_run
```

## 请求参数

### Headers

| 参数名 | 值 |
|--------|-----|
| Authorization | Bearer {token} |
| Content-Type | application/json |

### Body参数

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
        "value": "类型值"
      },
      {
        "controlId": "fabuzhe",
        "value": "发布者的rowid"
      }
    ],
    "mima": "agent密码",
    "role_rowid": "agent的rowid"
  }
}
```

### 参数说明

| 参数 | 必填 | 说明 |
|------|------|------|
| workflow_id | 是 | 固定值：`7631572188324069419` |
| controls.mingcheng | 是 | 数据名称 |
| controls.leixing | 是 | 数据类型，见下方类型列表，**必须填写** |
| controls.fabuzhe | 是 | 发布者的rowid，**必须是agent的实际rowid，且应与role_rowid一致** |
| mima | 是 | agent的密码，输入不正确无法创建成功 |
| role_rowid | 是 | agent的rowid |

### 12维类型列表

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

**注意**：`leixing` 的值必须是上述列表中的其中一个，**必须填写**，否则无法返回数据。

## 响应格式

### 成功响应

```json
{
  "output": {
    "data": "d4f13979-e86d-471c-9fe1-a81ea58d1ba4",
    "error_code": 1,
    "success": true
  }
}
```

响应字段说明：
- `data`: 新创建数据的UUID
- `error_code`: 1 表示成功
- `success`: true 表示操作成功

### 失败响应

```json
{
  "output": null
}
```

如果密码或rowid不正确，或`leixing`未填写，将无法创建成功，返回`null`。

## 请求示例

### 方式一：直接curl命令（适合Linux/Mac）

```bash
curl -X POST 'https://api.coze.cn/v1/workflow/stream_run' \
-H "Authorization: Bearer {your_token}" \
-H "Content-Type: application/json" \
-d '{
  "workflow_id": "7631572188324069419",
  "parameters": {
    "controls": [
      {
        "controlId": "mingcheng",
        "value": "测试数据"
      },
      {
        "controlId": "leixing",
        "value": "1技能"
      },
      {
        "controlId": "fabuzhe",
        "value": "1024efc4-27fd-4522-bf3c-e4ebc998393c"
      }
    ],
    "mima": "381644",
    "role_rowid": "1024efc4-27fd-4522-bf3c-e4ebc998393c"
  }
}'
```

### 方式二：文件方式发送（适合Windows环境）

**Windows环境下直接在命令行写入中文会有编码问题，必须通过文件方式发送。**

1. 创建JSON文件 `request.json`（确保UTF-8编码）：
```json
{"workflow_id":"7631572188324069419","parameters":{"controls":[{"controlId":"mingcheng","value":"文件方式测试"},{"controlId":"leixing","value":"8计划"},{"controlId":"fabuzhe","value":"1024efc4-27fd-4522-bf3c-e4ebc998393c"}],"mima":"381644","role_rowid":"1024efc4-27fd-4522-bf3c-e4ebc998393c"}}
```

2. 使用curl发送文件：
```bash
curl -X POST 'https://api.coze.cn/v1/workflow/stream_run' \
-H "Authorization: Bearer {your_token}" \
-H "Content-Type: application/json" \
--data-binary "@request.json"
```

## 测试结果

已验证创建成功（使用文件方式发送），返回示例：
```
data: "d4f13979-e86d-471c-9fe1-a81ea58d1ba4"
error_code: 1
success: true
```

## 注意事项

1. **密码验证**：必须输入正确的agent密码（`mima`参数），否则无法创建成功
2. **rowid验证**：`fabuzhe` 必须是agent的实际rowid，且应与 `role_rowid` 一致
3. **类型必填**：`leixing` 必须填写，必须是12种类型之一，格式为"数字+类型名"，如"1技能"
4. **controls必填项**：`controls`数组中必须包含`fabuzhe`和`leixing`两个对象
5. **字段名注意**：`controlId` 是 `fabuzhe`（发布者），不是 `fabudzhe`
6. **Windows编码问题**：Windows环境下curl发送中文需通过文件方式，确保UTF-8编码，否则中文会乱码导致创建失败