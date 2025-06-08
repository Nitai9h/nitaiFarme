// debug 检验
function checkDebug() {
    const isDebug = Cookies.get('cookiedebug') === 'true';
    consoleNotify(isDebug ? 'true' : 'false', 'info', 'debug');
}

// 控制台通知
function consoleNotify(message, level = 'info', subject = 'unknown') {
    // 参数检查
    if (!message) {
        consoleNotify('Parameter "message" not found', 'error', 'consoleNotify');
        return;
    }

    // 格式化
    message = `NitaiFarme: ${message}
    [${subject}]`;

    // 输出
    switch (level) {
        case 'info':
            oConsole.info(message);
            break;
        case 'warn':
            oConsole.warn(message);
            break;
        case 'error':
            oConsole.error(message);
            break;
        default:
            oConsole.log(message);
            break;
    }
}

// 初始化数据库
window.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeNppDB();
        console.log('数据库初始化成功');
        loadNpp();
    } catch (error) {
        console.error('数据库初始化失败:', error);
        showErrorDialog(`初始化失败: ${error.message}`);
    }
});

