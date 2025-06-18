// 创建元素 (在指定 ID 后插入新元素)
function createElement(options, id, type = 'div') {
    // 参数检查
    if (!id) {
        nitaiFarme.log('createElement', `Parameter ${id} not found`, 'warn');
        return;
    }

    // 创建元素
    const typeElement = document.createElement(`${type}`);

    // 设置 Class
    if (options.classes && Array.isArray(options.classes)) {
        typeElement.classList.add(...options.classes);
    } else {
        nitaiFarme.log('createElement', `Option ${options.classes} not found or not an array`, 'error');
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
        nitaiFarme.log('createElement', `Reference element with id "${id}" not found`, 'warn');
        return;
    }

    // 插入
    referenceId.insertAdjacentElement('afterend', typeElement);
    const cookiedebug = Cookies.get('cookiedebug') === 'true';
    if (cookiedebug) {
        nitaiFarme.log('createElement', `Element with id "${options.id}" created`, 'info');
    }

    return typeElement;
}

// 修改元素 (添加/删除 指定Id 的 Class)
function updateElement(options, id) {
    // 参数检查
    if (!id) {
        nitaiFarme.log('updateElement', `Parameter ${id} not found`, 'warn');
        return;
    }

    // 根据 Id 选中元素
    const referenceId = document.getElementById(id);
    if (!referenceId) {
        nitaiFarme.log('updateElement', `Reference element with id "${id}" not found`, 'warn');
        return;
    }

    const cookiedebug = Cookies.get('cookiedebug') === 'true';

    // 添加 Class
    if (options.addClass) {
        referenceId.classList.add(...options.addClass);
        if (cookiedebug) {
            nitaiFarme.log('updateElement', `Successfully added class on "${id}"`, 'info');
        }
    } else {
        nitaiFarme.log('updateElement', `No class to add on "${id}"`, 'error');
    }

    // 删除 Class
    if (options.removeClass) {
        referenceId.classList.remove(...options.removeClass);
        if (cookiedebug) {
            nitaiFarme.log('updateElement', `Successfully removed class on "${id}"`, 'info');
        }
    } else {
        nitaiFarme.log('updateElement', `No class to remove on "${id}"`, 'error');
    }
}

// 指定 Id 删除元素
function removeElement(id) {
    // 参数检查
    if (!id) {
        nitaiFarme.log('removeElement', `Parameter ${id} not found`, 'error');
        return;
    }

    const referenceId = document.getElementById(id);
    const cookiedebug = Cookies.get('cookiedebug') === 'true';
    if (referenceId) {
        referenceId.parentNode.removeChild(referenceId);
        if (cookiedebug) {
            nitaiFarme.log('removeElement', `Successfully removed element with id="${id}"`, 'info');
        }
    } else {
        nitaiFarme.log('removeElement', `Element with id "${id}" not found`, 'error');
    }
}