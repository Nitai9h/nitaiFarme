// Cookie 检验
function checkCookie(cookieName) {
    const value = Cookies.get(cookieName);
    if (value) {
        nitaiFarme.log('checkCookie', `Cookie ${cookieName} found`, 'info');
        return true;
    }
    nitaiFarme.log('checkCookie', `Cookie ${cookieName} not found`, 'warn');
    return false;
}

// 获取 Cookie 值
function getCookie(name) {

    checkCookie(name);
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

// debug 检验
function checkDebug() {
    var cookieExists = checkCookie('cookiedebug');

    if (cookieExists) {
        const isDebug = Cookies.get('cookiedebug') === 'true';
        nitaiFarme.log('checkDebug', isDebug ? 'true' : 'false', isDebug ? 'info' : 'info');
    } else {
        nitaiFarme.log('checkDebug', 'cookiedebug not found', 'error');
    }
}

// 初始化数据库
window.addEventListener('DOMContentLoaded', async () => {
    try {
        await nppStore.initializaNppDB();
        nitaiFarme.log('initializaNppDB', 'The database initialization is successful', 'info');
        nppStore.loadNpp();
    } catch (error) {
        nitaiFarme.log('initializaNppDB', `The database initialization failed: ${error.message}`, 'error');
    }
});
