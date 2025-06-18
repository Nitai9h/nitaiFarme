var nitaiFarme = nitaiFarme || {}; // 定义一个命名空间

/**
 * @description 返回的颜色值
 * @param {String} type 样式名称 [ primary | success | warn | error | info ]
 */
function typeColor(type = 'default') {
    let color = '' // 定义
    switch (type) {
        case 'primary':
            color = '#2d8cf0'
            break
        case 'success':
            color = '#19be6b'
            break
        case 'info':
            color = '#909399'
            break
        case 'warn':
            color = '#ff9900'
            break
        case 'error':
            color = '#f03f14'
            break
        case 'default':
            color = '#35495E'
            break
        default:
            color = type
            break
    }
    return color
}

/**
 * 日志输出
 * @param title 标题来源
 * @param text 输出文本
 * @param type 输出样式(状态值/自定义颜色)
 */
nitaiFarme.log = function (title, text, type = 'primary') {
    console.log(
        `%c ${title} %c ${text} %c`,
        `background:${typeColor(type)};border:1px solid ${typeColor(type)}; padding: 1px; border-radius: 4px 0 0 4px; color: #fff;`,
        `border:1px solid ${typeColor(type)}; padding: 1px; border-radius: 0 4px 4px 0; color: ${typeColor(type)};`,
        'background:transparent'
    )
};

/**
 * 获取图片主色
 * @param {string|HTMLImageElement} source 图片地址/DOM元素
 * @param {number} [quality=5] 颜色数量[01-10]
 * @returns {Promise<string[]>} 颜色十六进制字符串数组
 */
nitaiFarme.getColors = async function (source, quality = 5) {
    return new Promise((resolve, reject) => {
        const colorThief = new ColorThief();

        // 参数验证
        if (typeof quality !== 'number' || quality < 1 || quality > 10) {
            nitaiFarme.log('getColors', 'The number of colors must be between 1-10', 'error');
            return reject();
        }

        const processImage = (img) => {
            try {
                // 获取颜色数据
                const colors = quality === 1 ? [colorThief.getColor(img)] : colorThief.getPalette(img, quality);

                // 转换为十六进制
                const hexColors = colors.map(color =>
                    `#${color.map(c => c.toString(16).padStart(2, '0')).join('')}`
                );

                resolve(hexColors);
            } catch (error) {
                nitaiFarme.log('getColors', `Color fetch failed: ${error.message}`, 'error');
                reject();
            }
        };

        // 处理
        if (typeof source === 'string') {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = source;
            img.onload = () => processImage(img);
            img.onerror = (e) => {
                nitaiFarme.log('getColors', `failed to load image: ${e.errorMsg}`, 'error');
                reject();
            };
        } else if (source instanceof HTMLImageElement) {
            processImage(source);
        } else {
            nitaiFarme.log('getColors', 'Invalid image source', 'error');
            reject();
        }
    });
};

/**
 * 莫奈色系转换
 * @param {string} color 传入颜色[HEX]
 * @returns {string} 输出颜色[HEX]
 */
nitaiFarme.turnToMonet = function (color) {
    // 转 RGB
    let r, g, b;
    if (color.startsWith('#')) {
        const hex = color.slice(1);

        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);

    } else {
        return '#000000';
    }

    // 转 HSL
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    // 参数调整
    s = Math.max(0, s - 0.3);
    l = Math.min(1, l + 0.2);

    // 转 RGB
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    const hueToRgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    let r2 = hueToRgb(p, q, h + 1 / 3);
    let g2 = hueToRgb(p, q, h);
    let b2 = hueToRgb(p, q, h - 1 / 3);

    // 转 HEX
    return `#${[r2, g2, b2].map(x => {
        const c = Math.round(x * 255).toString(16);
        return c.length === 1 ? '0' + c : c;
    }).join('')}`;
};

/**
 * 获取图片主色(莫奈色系)
 * @param {string|HTMLImageElement} source 图片地址/DOM元素
 * @param {number} [quality=5] 颜色数量[01-10]
 * @returns {Promise<string[]>} 莫奈风格颜色数组
 */
nitaiFarme.getMonetColors = async function (source, quality = 5) {
    try {
        const originalColors = await nitaiFarme.getColors(source, quality);
        return originalColors.map(color => nitaiFarme.turnToMonet(color));
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        nitaiFarme.log('getMonetColors', `Color processing failed: ${errorMessage}`, 'error');
        throw new Error(errorMessage);
    }
};
