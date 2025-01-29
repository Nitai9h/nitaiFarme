function updateTitleFromConfig() {
    fetch('./config/config.json')
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