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
    //if (options.dataI18n) {
    //    typeElement.setAttribute('data-i18n', options.dataI18n);
    //}

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


// 三方库加载
// 已加载资源缓存
const loadedResources = new Set();

// 动态加载第三方资源
function loadExternalResource(url, type = 'js', callback = null) {
    // 参数检查
    if (!url) {
        consoleNotify('Parameter "url" not found', 'error', 'loadExternalResource');
        return;
    }

    // 检查是否已加载
    if (loadedResources.has(url)) {
        consoleNotify(`Resource "${url}" already loaded`, 'info', 'loadExternalResource');
        if (callback) callback();
        return;
    }

    const cookiedebug = Cookies.get('cookiedebug') === 'true';
    let element;

    if (type === 'js') {
        // 加载JS文件
        element = document.createElement('script');
        element.src = url;
        element.type = 'text/javascript';
        element.async = true;
        element.onload = () => {
            loadedResources.add(url);
            if (cookiedebug) {
                consoleNotify(`Successfully loaded JS: "${url}"`, 'info', 'loadExternalResource');
            }
            if (callback) callback();
        };
        element.onerror = () => {
            consoleNotify(`Failed to load JS: "${url}"`, 'error', 'loadExternalResource');
        };
    } else if (type === 'css') {
        // 加载CSS文件
        element = document.createElement('link');
        element.rel = 'stylesheet';
        element.href = url;
        element.onload = () => {
            loadedResources.add(url);
            if (cookiedebug) {
                consoleNotify(`Successfully loaded CSS: "${url}"`, 'info', 'loadExternalResource');
            }
            if (callback) callback();
        };
        element.onerror = () => {
            consoleNotify(`Failed to load CSS: "${url}"`, 'error', 'loadExternalResource');
        };
    } else {
        consoleNotify(`Unsupported resource type: "${type}"`, 'error', 'loadExternalResource');
        return;
    }

    // 添加到head
    document.head.appendChild(element);
}
