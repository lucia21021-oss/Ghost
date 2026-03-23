(function() {
    'use strict';

    // 1. 防止在 iframe 中重复执行
    if (window.self !== window.top) {
        return;
    }

    // ==========================================
    // 【诊断工具】证明代码真的跑起来了！
    // ==========================================
    setTimeout(() => {
        if (typeof toastr !== 'undefined') {
            toastr.success('True Hide 插件已成功激活！', '系统提示');
            console.log('[True Hide] 插件已成功运行！');
        }
    }, 3000); // 进网页 3 秒后弹出绿色提示框

    // ==========================================
    // 【防线一：静态 CSS 暴力隐藏】
    // 涵盖了你找来的代码中的 is_system="true"，以及所有可能的隐藏类名
    // ==========================================
    let staticStyle = document.createElement('style');
    staticStyle.textContent = `
        /* 隐藏系统消息、隐藏消息、被标记的隐藏类 */
        .mes[is_system="true"],
        .mes[is_hidden="true"],
        .mes.mes_hidden,
        .mes.sys-mes {
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
        }
        /* 消除相邻隐藏消息的间距 */
        .mes[is_system="true"] + .mes,
        .mes[is_hidden="true"] + .mes {
            margin-top: 0 !important;
        }
    `;
    document.head.appendChild(staticStyle);

    // ==========================================
    // 【防线二：动态扫描底层数据】
    // 无论酒馆怎么变，只要底层数据标记了隐藏，统统干掉
    // ==========================================
    let dynamicStyle = document.createElement('style');
    document.head.appendChild(dynamicStyle);
    let lastHiddenIds = "";

    function updateHiddenCSS() {
        let chatArray = null;
        
        // 获取聊天数据
        if (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) {
            chatArray = SillyTavern.getContext().chat;
        } else if (typeof chat !== 'undefined' && Array.isArray(chat)) {
            chatArray = chat;
        }

        if (!chatArray || !Array.isArray(chatArray)) return;

        const hiddenIds = [];
        chatArray.forEach((msg, index) => {
            // 只要满足任何一种隐藏条件（is_hidden 或 is_system），统统抓出来
            if (msg.is_hidden === true || msg.is_system === true || msg.mes_hidden === true) {
                hiddenIds.push(index);
            }
        });

        const currentHiddenIds = hiddenIds.join(',');
        if (currentHiddenIds !== lastHiddenIds) {
            lastHiddenIds = currentHiddenIds;
            
            if (hiddenIds.length === 0) {
                dynamicStyle.textContent = ''; 
            } else {
                const cssSelectors = hiddenIds.map(id => `#chat .mes[mesid="${id}"]`).join(',\n');
                dynamicStyle.textContent = `${cssSelectors} { 
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

    // 每 500 毫秒扫描一次，确保万无一失
    setInterval(updateHiddenCSS, 500);

})();
