// 保留原 console
const oConsole = console;

// 覆写 console
console = {};

// 隐藏右键菜单
document.oncontextmenu = function (e) {
    e.preventDefault();
}

// 加载网站标题
document.addEventListener('DOMContentLoaded', function () {
    updateTitleFromConfig();
});

// 加载 i18n
initializeI18next();