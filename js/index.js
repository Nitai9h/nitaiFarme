// 隐藏右键菜单
document.oncontextmenu = function (e) {
    e.preventDefault();
}

// i18n
i18next
    .use(i18nextHttpBackend)
    .use(i18nextBrowserLanguageDetector)
    .init({
        fallbackLng: 'zh-CN',
        debug: true,
        backend: {
            loadPath: '.././json/i18n/{{lng}}.json'
        }
    }, function (err, t) {
        // 更新页面内容
        jqueryI18next.init(i18next, $);
        $('[data-i18n]').localize();
    });