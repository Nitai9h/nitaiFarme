// 保留原 console
const oConsole = console;

// 覆写 console
console = {};

// 隐藏右键菜单
document.oncontextmenu = function (e) {
    e.preventDefault();
}

// 自托管地址
updateUrlToCookie();

document.addEventListener('DOMContentLoaded', function () {
    // 加载网站标题
    updateTitleFromConfig();
    // 加载 Bar
    loadingBar();
});

document.addEventListener('DOMContentLoaded', function () {
    // 加载 i18n
    initializeI18next('.././json/i18n/{{lng}}.json');
});

