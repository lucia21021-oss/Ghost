(function() {
    'use strict';
    if (window.self !== window.top) return;

    // 1. 第一道防线：基础 CSS 隐藏
    const style = document.createElement('style');
    style.textContent = `
        .mes[is_hidden="true"], 
        .mes[mes_hidden="true"], 
        .mes.mes_hidden,
        .mes[is_system="true"] { 
            display: none !important; 
        }
    `;
    document.head.appendChild(style);

    // 2. 第二道防线：JS 强行抹除（无视任何版本差异和美化冲突）
    function enforceHide() {
        // 获取底层聊天数据
        let chatArray = null;
        if (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) {
            chatArray = SillyTavern.getContext().chat;
        } else if (typeof chat !== 'undefined') {
            chatArray = chat;
        }
        if (!chatArray) return;

        // 遍历屏幕上的所有消息
        document.querySelectorAll('.mes').forEach(el => {
            const idStr = el.getAttribute('mesid') || el.getAttribute('data-mesid');
            if (!idStr) return;
            
            const id = parseInt(idStr, 10);
            const msg = chatArray[id];
            
            // 如果底层数据说它被隐藏了，强行让它消失！
            if (msg && (msg.is_hidden === true || msg.is_system === true)) {
                el.style.setProperty('display', 'none', 'important');
            } else {
                // 如果你用命令恢复了它，让它重新显示
                if (el.style.display === 'none') {
                    el.style.removeProperty('display');
                }
            }
        });
    }

    // 3. 实时监控：只要聊天框有任何风吹草动，立刻执行抹除
    const chatContainer = document.getElementById('chat');
    if (chatContainer) {
        new MutationObserver(enforceHide).observe(chatContainer, { childList: true, subtree: true });
    }
    
    // 兜底：每半秒检查一次，确保万无一失
    setInterval(enforceHide, 500);

})();
