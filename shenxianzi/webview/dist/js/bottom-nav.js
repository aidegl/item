// 底部导航组件
class BottomNav {
  constructor() {
    this.navItems = [
      {
        id: 'ai',
        label: '智能体',
        icon: './assets/agent1.png',
        href: './ai.html'
      },
      {
        id: 'patients',
        label: '患者库',
        icon: './assets/huanzheku0.png',
        href: './patients.html'
      },
      {
        id: 'records',
        label: '备忘录',
        icon: './assets/beiwanglu0.png',
        href: './records.html'
      },
      {
        id: 'settings',
        label: '设置',
        icon: './assets/shezhi0.png',
        href: './settings.html'
      }
    ];

    this.container = document.getElementById('bottom-nav');
    this.init();
  }

  init() {
    if (!this.container) {
      console.error('BottomNav container not found');
      return;
    }

    this.render();
    this.setActiveItem();
    this.bindEvents();
  }

  render() {
    // 创建底部导航容器
    const nav = document.createElement('nav');
    nav.className = 'bottom-nav';

    // 渲染导航项
    this.navItems.forEach(item => {
      const navItem = document.createElement('a');
      navItem.className = 'bottom-nav-item';
      navItem.id = `nav-${item.id}`;
      navItem.href = item.href;
      navItem.innerHTML = `
        <span class="bottom-nav-item-icon bottom-nav-item-icon-mask" style="--nav-icon-url: url('${item.icon}')"></span>
        <img src="${item.icon}" class="bottom-nav-item-icon bottom-nav-item-icon-img" alt="">
        <span class="bottom-nav-item-text">${item.label}</span>
      `;
      nav.appendChild(navItem);
    });

    this.container.appendChild(nav);
  }

  setActiveItem() {
    // 获取当前页面路径
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop();

    this.navItems.forEach(item => {
      const navItem = document.getElementById(`nav-${item.id}`);
      if (navItem) {
        const itemPage = item.href.split('/').pop();
        if (itemPage === currentPage) {
          navItem.classList.add('active');
        }
      }
    });
  }

  bindEvents() {
    // 可以在这里添加导航项的点击事件处理
  }
}

// 页面加载完成后初始化底部导航
document.addEventListener('DOMContentLoaded', () => {
  new BottomNav();
});
