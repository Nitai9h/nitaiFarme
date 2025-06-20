var farmeStyle = farmeStyle || {}; // 定义一个命名空间

// 淡入
farmeStyle.fadeIn = function (id, duration = 1000, delay = 0, direction = '') {
    const referenceId = document.getElementById(id);
    if (!referenceId) {
        nitaiFarme.log('fadeIn', `Element with id "${id}" not found`, 'error');
        return;
    }

    referenceId.classList.remove('fade-in', 'fade-in.show', 'fade-out', 'fade-out.hide');

    // 方向
    let transformStyle = '';
    switch (direction) {
        case 'top': transformStyle = 'translateY(-42%)'; break;
        case 'bottom': transformStyle = 'translateY(42%)'; break;
        case 'left': transformStyle = 'translateX(-38%)'; break;
        case 'right': transformStyle = 'translateX(38%)'; break;
        case 'center': transformStyle = 'scale(0.7)'; break;
        default: transformStyle = 'translate(0)';
    }

    // 应用初始变换
    referenceId.style.transform = transformStyle;
    
    // 初始化
    referenceId.classList.add('fadeHidden');

    // 持续时间
    referenceId.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;

    void referenceId.offsetWidth;

    setTimeout(() => {
        referenceId.classList.remove('fadeHidden');
    }, delay);
};

// 淡出
farmeStyle.fadeOut = function (id, duration = 1000, delay = 0, direction = '') {
    const referenceId = document.getElementById(id);
    if (!referenceId) {
        nitaiFarme.log('fadeOut', `Element with id "${id}" not found`, 'error');
        return;
    }

    referenceId.classList.remove('fade-in', 'fade-in.show', 'fade-out', 'fade-out.hide');

    // 初始化
    referenceId.classList.remove('fadeHidden');

    // 持续时间
    referenceId.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;

    void referenceId.offsetWidth;

    setTimeout(() => {
        let transformStyle = '';
        switch (direction) {
            case 'top': transformStyle = 'translateY(-42%)'; break;
            case 'bottom': transformStyle = 'translateY(42%)'; break;
            case 'left': transformStyle = 'translateX(-38%)'; break;
            case 'right': transformStyle = 'translateX(38%)'; break;
            case 'center': transformStyle = 'scale(0.7)'; break;
            default: transformStyle = 'translate(0)';
        }

        // 监听过渡结束事件
        const handleTransitionEnd = () => {
            referenceId.classList.add('fadeHidden');
            referenceId.removeEventListener('transitionend', handleTransitionEnd);
        };
        referenceId.addEventListener('transitionend', handleTransitionEnd);

        // 应用变换和透明度
        referenceId.style.transform = transformStyle;
        referenceId.style.opacity = '0';
    }, delay);
};

// 置顶
farmeStyle.zTop = function (id) {
    const target = document.getElementById(id);
    if (!target) {
        nitaiFarme.log('zTop', `Element with id "${id}" not found`, 'error');
        return;
    }

    // 遍历并找出 z-index 最大值
    let maxZIndex = 0;
    document.querySelectorAll('*').forEach(el => {
        const zIndex = window.getComputedStyle(el).zIndex;
        if (zIndex !== 'auto') {
            const z = parseInt(zIndex, 10);
            if (!isNaN(z) && z > maxZIndex) {
                maxZIndex = z;
            }
        }
    });

    target.style.zIndex = maxZIndex + 1;
};

// 遮罩
farmeStyle.blackCover = function (id, opacityParam, colorParam) {
    farmeStyle.zTop(id);

    let cover = document.getElementById('blackCover');
    if (cover) {
        nitaiFarme.log('blackCover', 'There is already a mask, wait for it to be destroyed before creating it again', 'warn');
        return;
    }

    // 透明度
    let opacity;
    if (typeof opacityParam === 'number' && opacityParam >= 0 && opacityParam <= 100) {
        opacity = opacityParam / 100;
    } else {
        const blackCover = Cookies.get('blackCover');
        opacity = blackCover ? parseInt(blackCover) / 100 : 0.5;
    }

    // 颜色
    let isWhite;
    if (colorParam === 'white' || colorParam === 'black') {
        isWhite = (colorParam === 'white');
    } else {
        const colorCover = Cookies.get('colorCover');
        isWhite = colorCover ? colorCover.toLowerCase() === 'white' : false;
    }

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
farmeStyle.guassianCover = function (id, blurParam, opacityParam) {
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

    // 模糊度
    let blur;
    if (typeof blurParam === 'number' && blurParam >= 0) {
        blur = `${blurParam}px`;
    } else {
        blur = Cookies.get('gaussianBlur') || '5px';
    }

    // 透明度
    let opacity;
    if (typeof opacityParam === 'number' && opacityParam >= 0 && opacityParam <= 1) {
        opacity = opacityParam;
    } else {
        opacity = Cookies.get('gaussianOpacity') || '0.5';
    }

    // 设置样式
    Object.assign(cover.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '998',
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur})`,
        pointerEvents: 'none',
        transition: 'opacity 0.3s ease, filter 0.3s ease'
    });
};

// 创建 Loading
farmeStyle.createLoading = function () {
    const loadingId = 'loading';
    let loading = document.getElementById(loadingId);
    if (loading) {
        nitaiFarme.log('createLoading', 'Loading element already exists', 'warn');
        return false;
    }

    loading = document.createElement('div');
    loading.id = loadingId;
    Object.assign(loading.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        opacity: 1,
    });

    document.body.appendChild(loading)

    this.loaderLoading(loading);

    return;
};

// 加载 Loading
farmeStyle.loaderLoading = function (loading) {

    // 创建遮罩
    this.blackCover('loading');
    this.guassianCover('loading', 15, 0.2);

    const loader = document.createElement('div');
    loader.className = 'loader';

    // 设置样式
    Object.assign(loader.style, {
        position: 'relative',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'linear-gradient(#14ffe9, #ffeb3b, #ff00e0)',
        animation: 'animate 0.8s linear infinite'
    });

    // 内圆
    const center = document.createElement('div');
    Object.assign(center.style, {
        position: 'absolute',
        top: '10px',
        left: '10px',
        right: '10px',
        bottom: '10px',
        background: '#240229',
        borderRadius: '50%'
    });

    // 外圆
    for (let i = 0; i < 4; i++) {
        const span = document.createElement('span');
        Object.assign(span.style, {
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'linear-gradient(#14ffe9, #ffeb3b, #ff00e0)',
            animation: 'animate 0.8s linear infinite'
        });
        loader.appendChild(span);
    }

    const spans = loader.querySelectorAll('span');
    spans[0].style.filter = 'blur(5px)';
    spans[1].style.filter = 'blur(10px)';
    spans[2].style.filter = 'blur(25px)';
    spans[3].style.filter = 'blur(50px)';

    // 动画
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes animate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(styleSheet);

    loader.appendChild(center);
    loading.appendChild(loader);

    // 淡入
    this.fadeIn('loading', 650, 0, 'center');
    this.fadeIn('blackCover', 650, 0);
    this.fadeIn('guassianCover', 650, 0);
};

// 移除 Loading
farmeStyle.removeLoading = function () {
    const loading = document.getElementById('loading');
    if (!loading) {
        nitaiFarme.log('removeLoading', `Loading element with id "loading" not found`, 'error');
        return;
    }

    // 淡出
    this.fadeOut('loading', 800, 0, 'center');
    this.fadeOut('blackCover', 800, 0);
    this.fadeOut('guassianCover', 800, 0);

    setTimeout(() => {
        removeElement('loading');
        removeElement('blackCover');
        removeElement('guassianCover');

    }, 800);
};