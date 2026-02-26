# MingdaoYunRecordAPI - 明道云记录表 API

## 概述
用于小程序端记录用户行为数据到明道云 `jilubiao` 表，支持登录、观看、评论、点赞、下单等场景。

## 功能特性
- 支持多种记录类型（登录、观看、评论、点赞、下单等）
- 自动处理网络错误重试
- 完整的错误处理和日志输出
- 灵活的字段配置，支持可选字段

## 使用方法

### 1. 引入模块
```javascript
const MingdaoYunRecordAPI = require('../../utils/MingdaoYunRecordAPI');
```

### 2. 创建实例
```javascript
const recordApi = new MingdaoYunRecordAPI();
```

### 3. 添加记录

#### 基础用法
```javascript
const result = await recordApi.addRecord({
  openId: '用户openId',
  leixing: '小程序登录',
  dlfs: '微信授权登录'
});

console.log('记录结果:', result);
```

#### 完整参数
```javascript
const result = await recordApi.addRecord({
  openId: '用户openId',           // 必填：用户 openId
  leixing: '观看',                  // 必填：记录类型
  dlfs: '微信授权登录',             // 可选：登录方式（仅登录记录需要）
  yonghu: '用户rowid',             // 可选：用户 rowid
  neirong: '内容rowid',            // 可选：内容 rowid（观看、评论、点赞等）
  tupian: 'https://example.com/image.jpg'  // 可选：图片链接
});
```

## 参数说明

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|--------|------|--------|
| openId | String | 是 | 用户 openId | 'oABC123...' |
| leixing | String | 是 | 记录类型 | '小程序登录'、'观看'、'评论'、'点赞'、'下单' |
| dlfs | String | 否 | 登录方式（仅登录记录需要） | '微信授权登录'、'手机一键登录'、'手机验证码' |
| yonghu | String | 否 | 用户 rowid | '698826f3b35652a8d4f60e21' |
| neirong | String | 否 | 内容 rowid（观看、评论、点赞等） | '529d0821-ea31-4588-9eea-cd5e0c98bc42' |
| tupian | String | 否 | 图片链接 | 'https://example.com/image.jpg' |

## 返回值

```javascript
{
  success: true,           // 是否成功
  data: { ... },          // 明道云返回的数据
  error_msg: '',         // 错误信息
  error_code: 1          // 错误代码
}
```

## 使用场景

### 1. 登录记录
```javascript
// 微信授权登录
await recordApi.addRecord({
  openId: 'oABC123...',
  leixing: '小程序登录',
  dlfs: '微信授权登录'
});

// 手机一键登录
await recordApi.addRecord({
  openId: 'oABC123...',
  leixing: '小程序登录',
  dlfs: '手机一键登录'
});

// 手机验证码登录
await recordApi.addRecord({
  openId: 'oABC123...',
  leixing: '小程序登录',
  dlfs: '手机验证码'
});
```

### 2. 观看记录
```javascript
await recordApi.addRecord({
  openId: 'oABC123...',
  leixing: '观看',
  neirong: '529d0821-ea31-4588-9eea-cd5e0c98bc42'
});
```

### 3. 评论记录
```javascript
await recordApi.addRecord({
  openId: 'oABC123...',
  leixing: '评论',
  neirong: '529d0821-ea31-4588-9eea-cd5e0c98bc42',
  yonghu: '698826f3b35652a8d4f60e21'
});
```

### 4. 点赞记录
```javascript
await recordApi.addRecord({
  openId: 'oABC123...',
  leixing: '点赞',
  neirong: '529d0821-ea31-4588-9eea-cd5e0c98bc42'
});
```

### 5. 收藏记录
```javascript
await recordApi.addRecord({
  openId: 'oABC123...',
  leixing: '收藏',
  neirong: '529d0821-ea31-4588-9eea-cd5e0c98bc42'
});
```

### 6. 下单记录
```javascript
await recordApi.addRecord({
  openId: 'oABC123...',
  leixing: '下单',
  yonghu: '698826f3b35652a8d4f60e21'
});
```

## 错误处理

```javascript
const result = await recordApi.addRecord({
  openId: 'oABC123...',
  leixing: '小程序登录'
});

if (result.success) {
  console.log('记录成功:', result.data);
} else {
  console.error('记录失败:', result.error_msg);
  console.error('错误代码:', result.error_code);
}
```

## 注意事项

1. **必填字段**：`openId` 和 `leixing` 是必填字段
2. **登录方式**：`dlfs` 仅在登录记录时需要
3. **内容关联**：`neirong` 用于关联具体的内容（观看、评论、点赞等）
4. **网络重试**：接口调用失败时会自动重试一次
5. **超时设置**：请求超时时间为 5 秒
6. **日志输出**：所有操作都会输出详细日志，便于调试

## 日志说明

- `[记录表] 添加记录，数据:` - 记录传入的参数
- `[记录表] 准备调用明道云接口，请求体:` - 记录请求体
- `[记录表] 明道云接口返回结果:` - 记录明道云返回
- `[记录表] 返回数据:` - 记录最终返回结果
- `[记录表] 调用异常:` - 记录异常信息

## 配置说明

当前使用固定配置：
- appKey: `59c7bdc2cdf74e5e`
- sign: `YTkzMjE4NGE3YThmYTE1Nzc4ODE5YTYxYzg3ZGM0YTZhZGMxZWJkMDU4ZTA0MzIwOWE5NDMzOTQ2MTRhNTk2Ng==`
- worksheetId: `jilubiao`

如需修改配置，请在文件中更新对应的常量。
