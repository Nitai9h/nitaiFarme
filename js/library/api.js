function checkDebug() {
    const isDebug = Cookies.get('cookiedebug') === 'true';
    consoleNotify(isDebug ? 'true' : 'false', 'info', 'debug');
}

// i18n 按需加载
function initializeI18next(url, fallbackLng = 'zh-CN') {
    const debugMode = Cookies.get('cookiedebug') === 'true';
    i18next
        .use(i18nextHttpBackend)
        .use(i18nextBrowserLanguageDetector)
        .init({
            fallbackLng: `${fallbackLng}`,
            debug: debugMode,
            backend: {
                loadPath: `${url}`
            }
        }, function (err, t) {
            // 更新页面内容
            jqueryI18next.init(i18next, $);
            $('[data-i18n]').localize();
        });
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

// 创建元素 (在指定 ID 后插入新元素)
function createElement(options, id, type = 'div') {
    // 参数检查
    if (!id) {
        consoleNotify('Parameter "id" not found', 'error', 'createElement');
        return;
    }

    // 创建元素
    const typeElement = document.createElement(`${type}`);

    // 设置 Class
    if (options.classes && Array.isArray(options.classes)) {
        typeElement.classList.add(...options.classes);
    } else {
        consoleNotify('Option "classes" not found or not an array', 'error', 'createElement');
        return;
    }

    // 设置 Id
    typeElement.id = options.id;

    // 设置 I18n (可选)
    if (options.dataI18n) {
        typeElement.setAttribute('data-i18n', options.dataI18n);
    }

    // 被插入 Id 寻找
    const referenceId = document.getElementById(id);
    if (!referenceId) {
        consoleNotify(`Element with id "${id}" not found`, 'error', 'createElement');
        return;
    }

    // 插入
    referenceId.insertAdjacentElement('afterend', typeElement);
    const cookiedebug = Cookies.get('cookiedebug') === 'true';
    if (cookiedebug) {
        consoleNotify(`Element with id "${options.id}" created`, 'info', 'createElement');
    }

    return typeElement;
}

// 修改元素 (添加/删除 指定Id 的 Class)
function updateElement(options, id) {
    // 参数检查
    if (!id) {
        consoleNotify('Parameter "id" not found', 'error', 'updateElement');
        return;
    }

    // 根据 Id 选中元素
    const referenceId = document.getElementById(id);
    if (!referenceId) {
        consoleNotify(`Element with id "${id}" not found`, 'error', 'updateElement');
        return;
    }

    const cookiedebug = Cookies.get('cookiedebug') === 'true';

    // 添加 Class
    if (options.addClass) {
        referenceId.classList.add(...options.addClass);
        if (cookiedebug) {
            consoleNotify(`Successfully added class on "${id}"`, 'info', 'updateElement');
        }
    } else {
        consoleNotify(`Failed to add class on "${id}"`, 'error', 'updateElement');
    }

    // 删除 Class
    if (options.removeClass) {
        referenceId.classList.remove(...options.removeClass);
        if (cookiedebug) {
            consoleNotify(`Successfully removed class on "${id}"`, 'info', 'updateElement');
        }
    } else {
        consoleNotify(`Failed to remove class on "${id}"`, 'error', 'updateElement');
    }
}

// 指定 Id 删除元素
function removeElement(id) {
    // 参数检查
    if (!id) {
        consoleNotify(`Parameter ${id} not found`, 'error', 'removeElement');
        return;
    }

    const referenceId = document.getElementById(id);
    const cookiedebug = Cookies.get('cookiedebug') === 'true';
    if (referenceId) {
        referenceId.parentNode.removeChild(referenceId);
        if (cookiedebug) {
            consoleNotify(`Successfully deleted the element with id="${id}".`, 'info', 'removeElement');
        }
    } else {
        console.log(`Element with id "${id}" not found.`);
        consoleNotify(`Failed to remove class on "${id}"`, 'error', 'removeElement');
    }
}

// i18n 修改
function updateElementI18n(i18n, id) {
    // 参数检查
    if (!id) {
        consoleNotify(`Parameter "${id}" not found`, 'error', 'updateElementI18n');
        return;
    }
    if (!i18n) {
        consoleNotify(`Parameter "${i18n}" not found`, 'error', 'updateElementI18n');
        return;
    }

    // 根据 Id 选中元素
    const referenceId = document.getElementById(id);
    if (!referenceId) {
        consoleNotify(`Element with id "${id}" not found`, 'error', 'updateElementI18n');
        return;
    }

    // 更新 i18n
    referenceId.setAttribute('data-i18n', i18n);

    const cookiedebug = Cookies.get('cookiedebug') === 'true';
    if (cookiedebug) {
        consoleNotify(`Successfully updated data-i18n on "${id}" to "${i18n}"`, 'info', 'updateElementI18n');
    }
}

// 加载 Bar 子元素
function loadingBarItem(barLocation, barId) {
    const barElement = document.getElementById(barId);
    const cookiedebug = Cookies.get('cookiedebug') === 'true';

    if (!barElement) {
        consoleNotify(`Element with id "${barId}" not found`, 'error', 'loadingBarItem');
        return;
    }

    if (Object.keys(barLocation).length > 0) {

        barElement.innerHTML = Object.values(barLocation).map(item => {
            if (item.type && item.id && item.class) {
                return `<${item.type} id="${item.id}" class="${item.class}" data-i18n="${item.i18n || '#'}"></${item.type}>`;
            }
            return '';
        }).join('');

        if (cookiedebug) {
            consoleNotify(`Bar:"${barLocation}" was loaded successfully.`, 'info', 'loadingBarItem');
        }

    } else {
        consoleNotify(`Invalid bar location object: ${JSON.stringify(barLocation)}`, 'warn', 'loadingBarItem');
    }
}

// 加载/重载 Bar 栏
function loadingBar(type = 'all') {
    fetch('./json/config/bar.json')
        .then(response => response.json())
        .then(data => {
            const topBar = data.topBar;
            const footerBar = data.footerBar;

            if (type === 'all') {

                loadingBarItem(topBar.left, 'topBar-left');
                loadingBarItem(topBar.center, 'topBar-center');
                loadingBarItem(topBar.right, 'topBar-right');
                loadingBarItem(footerBar.left, 'footerBar-left');
                loadingBarItem(footerBar.center, 'footerBar-center');
                loadingBarItem(footerBar.right, 'footerBar-right');

            } else if
                (type.startsWith('topBar.') || type.startsWith('footerBar.')) {

                const [section, position] = type.split('.');
                const barSection = section === 'topBar' ? topBar : footerBar;

                if (barSection && barSection[position]) {
                    loadingBarItem(barSection[position], `${section}-${position}`);
                } else {
                    consoleNotify(`Invalid bar location: ${type}`, 'error', 'loadingBar');
                }

            } else {
                consoleNotify(`Invalid bar type: ${type}`, 'error', 'loadingBar');
            }

        })
        .catch(error =>
            consoleNotify('Loading bar.json failed because: ' + error, 'error', 'loadingBar'));
}