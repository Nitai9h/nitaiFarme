var farmeStyle = farmeStyle || {}; // 定义一个命名空间

// 淡入
farmeStyle.fadeIn = function (id, duration = 1000, delay = 0) {
    const referenceId = document.getElementById(id);
    if (!referenceId) {
        nitaiFarme.log('fadeIn', `Element with id "${id}" not found`, 'error');
        return;
    }

    referenceId.classList.remove('fade-in', 'fade-in.show', 'fade-out', 'fade-out.hide');

    // 持续时间
    referenceId.style.transition = `opacity ${duration}ms ease`;

    referenceId.classList.add('fade-in');

    // 延迟触发
    setTimeout(() => {
        referenceId.classList.add('fade-in.show');
    }, delay);
};

// 淡出
farmeStyle.fadeOut = function (id, duration = 1000, delay = 0) {
    const referenceId = document.getElementById(id);
    if (!referenceId) {
        nitaiFarme.log('fadeOut', `Element with id "${id}" not found`, 'error');
        return;
    }

    referenceId.classList.remove('fade-in', 'fade-in.show', 'fade-out', 'fade-out.hide');

    // 持续时间
    referenceId.style.transition = `opacity ${duration}ms ease`;

    referenceId.classList.add('fade-out');

    // 延迟触发
    setTimeout(() => {
        referenceId.classList.add('fade-out.hide');
    }, delay);
};

// 置顶
farmeStyle.zTop = function (id) {
    const target = document.getElementById(id);
    if (!target) {
        nitaiFarme.log('zTop', `Element with id "${id}" not found`, 'error');
        return;
    }

    target.style.zIndex = '1000';

    document.querySelectorAll('*').forEach(el => {
        if (el !== target) {
            el.style.zIndex = '0';
        }
    });
};

// 遮罩
farmeStyle.blackCover = function (id) {
    farmeStyle.zTop(id);

    let cover = document.getElementById('blackCover');
    if (cover) {
        nitaiFarme.log('blackCover', 'There is already a mask, wait for it to be destroyed before creating it again', 'warn');
        return;
    }

    // 获取透明度
    const blackCover = getCookie('blackCover');
    let opacity = blackCover ? parseInt(blackCover) / 100 : 0.5; // 默认[0.5]

    // 获取颜色
    const colorCover = getCookie('colorCover');
    let isWhite = colorCover ? colorCover.toLowerCase() === 'white' : false; // 默认[黑色]

    // 创建遮罩
    cover = document.createElement('div');
    cover.id = 'blackCover';
    cover.classList.add('fade-out', 'fade-out.hide');
    document.body.appendChild(cover);

    // 设置样式
    Object.assign(cover.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '999',
        backgroundColor: `rgba(${isWhite ? '255,255,255' : '0,0,0'}, ${opacity})`,
        pointerEvents: 'none'
    });
};

// 高斯模糊遮罩
farmeStyle.guassianCover = function (id) {
    farmeStyle.zTop(id);

    let cover = document.getElementById('guassianCover');
    if (cover) {
        nitaiFarme.log('guassianCover', 'There is already a Gaussian mask, wait for it to be destroyed before creating it again', 'warn');
        return;
    }

    // 创建遮罩
    cover = document.createElement('div');
    cover.id = 'guassianCover';
    cover.classList.add('fade-out', 'fade-out.hide');
    document.body.appendChild(cover);

    // 获取模糊参数（示例从cookie读取，可扩展参数）
    const blurRadius = getCookie('gaussianBlur') || '5px';
    const opacity = getCookie('gaussianOpacity') || '0.5';

    // 设置样式
    Object.assign(cover.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '998',
        backgroundColor: `rgba(0, 0, 0, ${opacity})`,
        filter: `blur(${blurRadius})`,
        pointerEvents: 'none',
        transition: 'opacity 0.3s ease, filter 0.3s ease'
    });
};
