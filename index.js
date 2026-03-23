jQuery(() => {
    // 1. 在网页大脑里植入一个专属的“黑洞”样式表
    let styleEl = document.getElementById('ghost-hide-style');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'ghost-hide-style';
        document.head.appendChild(styleEl);
    }

    let lastHiddenIds = "";

    // 2. 核心函数：查阅底层数据，动态生成 CSS
    function updateHiddenCSS() {
        if (typeof chat === 'undefined' || !Array.isArray(chat)) return;

        // 找出所有被隐藏的楼层编号
        const hiddenIds = [];
        chat.forEach((msg, index) => {
            if (msg.is_hidden === true) {
                hiddenIds.push(index);
            }
        });

        const currentHiddenIds = hiddenIds.join(',');

        // 只有当隐藏列表发生变化时，才更新 CSS，消耗几乎为 0，绝对不卡顿！
        if (currentHiddenIds !== lastHiddenIds) {
            lastHiddenIds = currentHiddenIds;
            
            if (hiddenIds.length === 0) {
                styleEl.textContent = ''; // 没有隐藏的楼层，清空样式
            } else {
                // 精准生成 CSS 规则，例如：#chat .mes[mesid="14"]
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

    // 3. 监听酒馆的原生事件（当你切换聊天、隐藏/恢复时，瞬间触发，绝不闪烁）
    if (window.eventSource && window.event_types) {
        window.eventSource.on(window.event_types.CHAT_CHANGED, updateHiddenCSS);
        window.eventSource.on(window.event_types.MESSAGE_HIDDEN, updateHiddenCSS);
        window.eventSource.on(window.event_types.MESSAGE_UNHIDDEN, updateHiddenCSS);
    }

    // 4. 终极保险：每 200 毫秒静默检查一次（只比对一串数字，消耗 0.001 毫秒，绝对不卡）
    setInterval(updateHiddenCSS, 200);
});
