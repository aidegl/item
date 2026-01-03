(function() {
  var version = "v1.0.0"; // 第一期，版本0，修改0
  console.log("App Version: " + version);
  var versionEl = document.getElementById('app-version');
  if (versionEl) {
    versionEl.innerText = version;
  }

  // 测试按钮点击事件
  var btn = document.getElementById('test-btn');
  var result = document.getElementById('test-result');
  if (btn) {
    btn.addEventListener('click', function() {
      result.innerText = '正在请求...';
      result.style.color = '#333';
      
      // 假设这里调用 MingdaoArray.js 中的某个方法进行测试
      // 由于不知道具体 API，先尝试调用一个通用的获取信息方法，或者只是模拟
      // 这里我们先检查 MingdaoArray 是否存在
      if (typeof window.MingdaoArray !== 'undefined') {
         // 尝试调用一个可能存在的方法，或者打印对象查看
         console.log('MingdaoArray 对象:', window.MingdaoArray);
         result.innerText = 'MingdaoArray 对象已加载，请查看控制台详情。\n' + JSON.stringify(window.MingdaoArray, null, 2);
         result.style.color = 'green';
      } else {
         result.innerText = '错误: MingdaoArray 未定义';
         result.style.color = 'red';
      }
    });
  }
})();