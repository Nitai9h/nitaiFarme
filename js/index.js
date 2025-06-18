// Cookie 检验
function checkCookie(cookieName) {
    var cookies = document.cookie.split("; ");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].split("=");
        if (cookie[0] === cookieName) {
            return true;
        }
    }
    return false;
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
