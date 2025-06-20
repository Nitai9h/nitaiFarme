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
    nitaiFarme.log('createElement', `Element with id "${options.id}" created`, 'info');

    return typeElement;
}

// 指定 Id 删除元素
function removeElement(id) {
    // 参数检查
    if (!id) {
        nitaiFarme.log('removeElement', `Parameter id not found`, 'warn');
        return;
    }

    // 根据 ID 获取元素
    const element = document.getElementById(id);
    if (!element) {
        nitaiFarme.log('removeElement', `Element with id "${id}" not found`, 'warn');
        return;
    }

    // 移除元素
    element.parentNode.removeChild(element);

    nitaiFarme.log('removeElement', `Element with id "${id}" removed successfully`, 'success');
}