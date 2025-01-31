function updateTitleFromConfig() {
    fetch('./json/config/config.json')
        .then(response => response.json())
        .then(data => {
            // 获取 i18n 标签
            const titleElement = document.getElementById('title');
            // 设置 i18n 标签
            titleElement.setAttribute('data-i18n', data.title);
        })
        .catch(error =>
            consoleNotify('Title update failed because: ' + error, 'error', 'updateTitleFromConfig'));
}

function updateUrlToCookie() {
    fetch('./json/config/config.json')
        .then(response => response.json())
        .then(data => {

            // 状态存储
            document.cookie = `updateMode=${encodeURIComponent(data.updateMode)};`;
            document.cookie = `updateBar=${encodeURIComponent(data.updateBar)};`;

            // 条件检查
            if (data.updateMode === "true") {
                // 存储 updateUrl
                document.cookie = `updateUrl=${encodeURIComponent(data.updateUrl)};`;
            }
            if (data.updateBar === "true") {
                // 存储 updateBarUrl
                document.cookie = `updateBarUrl=${encodeURIComponent(data.updateBarUrl)};`;
            }
        })
        .catch(error =>
            consoleNotify('Update Url to cookie failed because: ' + error, 'error', 'updateUrlToCookie'));
}