### 前端开发结构
``` json
{
  "首页":{
    "title":"首页",
    "desc":"这是首页"
  },
  "分类":{
    "title":"分类",
    "desc":"这是分类页"
  },
  "标签":{
    "title":"标签",
    "desc":"这是标签页"
  }
}
```

### 技术路线
##### 前端
凯撒角度考虑附件是的接口
##### 后端
深刻理解打开链接发

### 通用数据调用
#### 文章
- 数据表别名：wenzhang
- 明道云过滤条件：
```json
  [
      {
        'controlId': 'mid',
        'dataType': 2,
        'spliceType': 1,
        'filterType': 2,
        'value': merchantId || '{商家ID}'
      },
      {
        'controlId': 'use',
        'dataType': 2,
        'spliceType': 1,
        'filterType': 2,
        'value': '1'
      },
      {
        'controlId': 'nrbq',
        'dataType': 2,
        'spliceType': 1,
        'filterType': 24,
        'value': 'rowid'
      }
    ]
```
