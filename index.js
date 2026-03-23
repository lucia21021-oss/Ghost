(function() {
    'use strict';

    // 1. 确保只在顶层窗口运行，避免在 iframe 中重复执行
    if (window.self !== window.top) {
        return;
    }

    // 2. 植入一个专属的“黑洞”样式表
    let styleEl = document.getElementById('true-hide-style');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'true-hide-style';
        document.head.appendChild(styleEl);
    }

    let lastHiddenIds = "";

    // 3. 获取酒馆上下文的安全方法
    function getContext() {
        if (typeof SillyTavern === 'object' && SillyTavern.getContext) {
            return SillyTavern.getContext();
        }
        return null;
    }

    // 4. 核心逻辑：读取底层数据，瞬间生成隐藏 CSS
    function updateHiddenCSS() {
        let chatArray = null;
        const context = getContext();
        
        // 兼容不同的酒馆版本获取聊天数据
        if (context && context.chat) {
            chatArray = context.chat;
        } else if (typeof chat !== 'undefined' && Array.isArray(chat)) {
            chatArray = chat;
        }

        if (!chatArray || !Array.isArray(chatArray)) return;

        const hiddenIds = [];
        chatArray.forEach((msg, index) => {
            if (msg.is_hidden === true) {
                hiddenIds.push(index);
            }
        });

        const currentHiddenIds = hiddenIds.join(',');

        // 只有隐藏状态改变时才更新，绝对不卡顿
        if (currentHiddenIds !== lastHiddenIds) {
            lastHiddenIds = currentHiddenIds;
            
            if (hiddenIds.length === 0) {
                styleEl.textContent = ''; 
            } else {
                // 精准生成 CSS，例如：#chat .mes[mesid="14"]
                const cssSelectors = hiddenIds.map(id => `#chat .mes[mesid="${id}"]`).join(',\n');
                styleEl.textContent = `${cssSelectors} { 
                    display: none !important; 
                    visibility: hidden !important;
                    opacity: 0 !important;
                    height: 0 !important;
                    min-height: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    position: absolute !important;
                    pointer-events: none !important;
                    z-index: -9999 !important;
                }`;
            }
        }
    }

    // 5. 初始化与事件绑定
    function tryInit(retry = 0) {
        try {
            // 绑定酒馆原生事件：切换聊天、隐藏、取消隐藏时瞬间触发
            if (window.eventSource && window.event_types) {
                window.eventSource.on(window.event_types.CHAT_CHANGED, updateHiddenCSS);
                window.eventSource.on(window.event_types.MESSAGE_HIDDEN, updateHiddenCSS);
                window.eventSource.on(window.event_types.MESSAGE_UNHIDDEN, updateHiddenCSS);
            }
            
            // 兜底检查：每 200 毫秒静默扫描一次数组（消耗极低，不卡顿）
            setInterval(updateHiddenCSS, 200);
            
            console.log('[True Hide] 完美隐藏扩展加载成功！');
        } catch (error) {
            if (retry < 20) {
                setTimeout(() => tryInit(retry + 1), 250);
            } else {
                console.error('[True Hide] 初始化失败:', error);
            }
        }
    }

    // 启动！
    tryInit();
})();
