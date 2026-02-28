(function () {
    var appScriptLoaded = false;
    var appScriptLoading = false;
    var pendingCallbacks = [];

    function loadAppScript(callback) {
        if (appScriptLoaded) {
            if (typeof callback === 'function') {
                callback();
            }
            return;
        }

        if (typeof callback === 'function') {
            pendingCallbacks.push(callback);
        }

        if (appScriptLoading) {
            return;
        }

        appScriptLoading = true;

        // 动态资源版本化：获取 URL 中的版本号并透传到 app.js
        var v = new URLSearchParams(window.location.search).get('v') || new Date().getTime();
        console.log('[app-core] 加载 app.js，版本号:', v);
        var script = document.createElement('script');
        script.src = './js/app.js?v=' + v;
        script.onload = function () {
            appScriptLoaded = true;
            appScriptLoading = false;

            var callbacks = pendingCallbacks.slice();
            pendingCallbacks.length = 0;

            for (var i = 0; i < callbacks.length; i++) {
                var cb = callbacks[i];
                if (typeof cb === 'function') {
                    try {
                        cb();
                    } catch (e) {
                        try {
                            console.error(e);
                        } catch (_) {
                        }
                    }
                }
            }
        };

        script.onerror = function () {
            appScriptLoading = false;
            pendingCallbacks.length = 0;
            var container = document.getElementById('main-content');
            if (container) {
                container.innerHTML = '<div style="padding:16px;font-size:14px;color:#ef4444;">页面加载失败，请稍后重试</div>';
            }
        };

        document.head.appendChild(script);
    }

    function callAfterLoaded(fnName, args) {
        loadAppScript(function () {
            var fn = window[fnName];
            // Prevent infinite recursion if app.js failed to override the function
            if (core[fnName] && fn === core[fnName]) {
                console.error('[app-core] Critical Error: ' + fnName + ' was not overridden by app.js. Possible syntax error in app.js.');
                return;
            }
            if (typeof fn === 'function') {
                fn.apply(window, args || []);
            }
        });
    }

    var core = {};

    core.switchTab = function (tab) {
        callAfterLoaded('switchTab', [tab]);
    };

    core.nextOnboardingStep = function () {
        callAfterLoaded('nextOnboardingStep', []);
    };

    core.closeOnboarding = function () {
        callAfterLoaded('closeOnboarding', []);
    };

    window.switchTab = core.switchTab;
    window.nextOnboardingStep = core.nextOnboardingStep;
    window.closeOnboarding = core.closeOnboarding;

    function showInitialPlaceholder() {
        var container = document.getElementById('main-content');
        if (container && !container.innerHTML) {
            container.innerHTML = '<div style="padding:16px;font-size:14px;color:#6b7280;">页面加载中...</div>';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            showInitialPlaceholder();
            loadAppScript();
        });
    } else {
        showInitialPlaceholder();
        loadAppScript();
    }
})();

