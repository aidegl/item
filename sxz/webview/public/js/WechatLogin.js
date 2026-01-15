class WechatLogin {
  constructor(options = {}) {
    this.config = {
      miniProgramLoginUrl: options.miniProgramLoginUrl || "/pages/login/index",
      miniProgramLogoutUrl: options.miniProgramLogoutUrl || "/pages/logout/index",
      mingdaoWorksheetId: options.mingdaoWorksheetId || "yonghu",
      openidField: options.openidField || "openId",
      // defaultAvatar: options.defaultAvatar || "dist/assets/img/morentouxiang.webp",
      defaultAvatar: options.defaultAvatar || "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2NjIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSI4IiByPSI0Ii8+PHBhdGggZD0iTTIwIDIxdi0yYTQgNCAwIDAgMC00LTRoLThhNCA0IDAgMCAwLTQgNHYyIi8+PC9zdmc+",
      ...options,
    };

    this.state = {
      isLoggedIn: false,
      userInfo: null,
      openid: null,
    };

    this.init();
  }

  init() {
    this.handleAuthLogic();
    window.addEventListener("hashchange", () => this.handleAuthLogic());

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.handleAuthLogic());
    }
  }

  emitChange(type) {
    try {
      window.dispatchEvent(
        new CustomEvent("wechatlogin:change", {
          detail: {
            type,
            isLoggedIn: this.state.isLoggedIn,
            openid: this.state.openid,
            userInfo: this.state.userInfo,
          },
        }),
      );
    } catch (e) {}
  }

  isInMiniProgram() {
    return (
      window.__wxjs_environment === "miniprogram" ||
      (window.wx && window.wx.miniProgram) ||
      /miniProgram/i.test(navigator.userAgent)
    );
  }

  ensureMiniProgramReady() {
    return new Promise((resolve) => {
      if (window.wx && window.wx.miniProgram) {
        resolve();
        return;
      }

      let tries = 0;
      const timer = setInterval(() => {
        tries += 1;
        if (window.wx && window.wx.miniProgram) {
          clearInterval(timer);
          resolve();
          return;
        }

        if (tries >= 20) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  }

  toWxLogin() {
    if (!this.isInMiniProgram()) {
      alert("请在微信小程序中打开");
      return;
    }

    this.ensureMiniProgramReady().then(() => {
      if (window.wx && window.wx.miniProgram && typeof wx.miniProgram.navigateTo === "function") {
        wx.miniProgram.navigateTo({ url: this.config.miniProgramLoginUrl });
        return;
      }

      if (window.wx && window.wx.miniProgram && typeof wx.miniProgram.postMessage === "function") {
        wx.miniProgram.postMessage({
          data: { action: "navigate", url: this.config.miniProgramLoginUrl },
        });
      }
    });
  }

  toWxLogout() {
    if (!this.isInMiniProgram()) {
      alert("请在微信小程序中打开");
      return;
    }

    this.ensureMiniProgramReady().then(() => {
      if (window.wx && window.wx.miniProgram && typeof wx.miniProgram.navigateTo === "function") {
        wx.miniProgram.navigateTo({ url: this.config.miniProgramLogoutUrl });
        return;
      }

      if (window.wx && window.wx.miniProgram && typeof wx.miniProgram.postMessage === "function") {
        wx.miniProgram.postMessage({
          data: { action: "navigate", url: this.config.miniProgramLogoutUrl },
        });
      }
    });
  }

  async loginWithOpenid(openid) {
    if (!openid) return false;
    if (!window.MingDaoYunArrayAPI) {
      this.error("错误: MingDaoYunArrayAPI 组件未加载");
      return false;
    }

    const filters = [
      {
        controlId: this.config.openidField,
        dataType: "2",
        spliceType: "1",
        filterType: "2",
        value: openid,
      },
      {
        controlId: "del",
        dataType: "2",
        spliceType: "1",
        filterType: "2",
        value: 0,
      },
    ];

    try {
      const api = new window.MingDaoYunArrayAPI();
      const res = await api.getData({
        worksheetId: this.config.mingdaoWorksheetId,
        filters: JSON.stringify(filters),
        pageSize: 1,
      });

      if (res && res.success && res.data && Array.isArray(res.data.rows) && res.data.rows.length > 0) {
        const userData = res.data.rows[0];
        const processedUserData = this.processUserData(userData);

        this.state.userInfo = processedUserData;
        this.state.isLoggedIn = true;
        this.state.openid = openid;

        localStorage.setItem("openid", openid);
        localStorage.setItem("userInfo", JSON.stringify(processedUserData));

        this.emitChange("login");
        return true;
      }

      return false;
    } catch (e) {
      this.error("错误: 调用过程异常", e && e.message);
      return false;
    }
  }

  processUserData(userData) {
    const name = userData.mingcheng || userData.nicheng || userData.name || userData["姓名"] || "用户";

    let avatarFromTouxiang = null;
    const touxiang = userData.touxiang;

    if (touxiang) {
      if (Array.isArray(touxiang)) {
        avatarFromTouxiang = touxiang[0] && touxiang[0].large_thumbnail_full_path;
      } else if (typeof touxiang === "string") {
        const trimmed = touxiang.trim();
        if (trimmed) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              avatarFromTouxiang = parsed[0] && parsed[0].large_thumbnail_full_path;
            }
          } catch (e) {}
        }
      }
    }

    return {
      name,
      avatar:
        avatarFromTouxiang ||
        userData.avatar ||
        userData["头像"] ||
        userData["头像1"] ||
        this.config.defaultAvatar,
      raw: userData,
    };
  }

  async handleAuthLogic() {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    const params = new URLSearchParams(hash);
    const openid = params.get("openid");

    if (openid) {
      if (!this.state.isLoggedIn || this.state.openid !== openid) {
        await this.loginWithOpenid(openid);
      }
      return;
    }

    // 检查是否有openid参数但值为空（表示退出登录）
    if (params.has("openid")) {
      // 清除本地存储
      localStorage.removeItem("openid");
      localStorage.removeItem("userInfo");
      
      // 重置登录状态
      if (this.state.isLoggedIn) {
        this.state.isLoggedIn = false;
        this.state.userInfo = null;
        this.state.openid = null;
        this.emitChange("logout");
      }
      return;
    }

    const stored = localStorage.getItem("openid");
    const storedUserInfo = localStorage.getItem("userInfo");

    if (stored && storedUserInfo) {
      if (!this.state.isLoggedIn || this.state.openid !== stored) {
        this.state.openid = stored;
        try {
          this.state.userInfo = JSON.parse(storedUserInfo);
        } catch (e) {
          this.state.userInfo = null;
        }
        this.state.isLoggedIn = true;
        this.emitChange("restore");
      }
      return;
    }

    if (this.state.isLoggedIn) {
      this.state.isLoggedIn = false;
      this.state.userInfo = null;
      this.state.openid = null;
      this.emitChange("logout");
    }
  }

  logout() {
    localStorage.removeItem("openid");
    localStorage.removeItem("userInfo");
    this.state.isLoggedIn = false;
    this.state.userInfo = null;
    this.state.openid = null;
    this.emitChange("logout");
  }

  isLoggedIn() {
    return this.state.isLoggedIn;
  }

  getUserInfo() {
    return this.state.isLoggedIn ? this.state.userInfo : null;
  }

  getOpenid() {
    return this.state.isLoggedIn ? this.state.openid : null;
  }

  log(...args) {
    console.log("[WechatLogin]", ...args);
  }

  error(...args) {
    console.error("[WechatLogin Error]", ...args);
  }

  debug() {
    this.log("当前状态:", {
      isLoggedIn: this.state.isLoggedIn,
      userInfo: this.state.userInfo,
      openid: this.state.openid,
    });
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = WechatLogin;
} else if (typeof window !== "undefined") {
  window.WechatLogin = WechatLogin;
}
