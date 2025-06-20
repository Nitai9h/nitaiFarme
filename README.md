<div align="center">

<img src="./favicon.webp" width="150" height="150" />

# 拟态框架

### 一个简单的网页框架

![license](https://img.shields.io/github/license/nitai9h/nitaifarme?color=FF5531)

📢 网站: [在线网页](https://farme.nitai.us.kg)

</div>

![NitaiFarme 宣传图](https://nitai-images.pages.dev/nitaifarme/NitaiFarme_poster(1400x560).webp)

---

## 注意事项

在线版可能因浏览器缓存原因，无法及时预览最新效果

可通过清除浏览器缓存与 `Ctrl + F5` 来刷新页面

## 本地部署

```shell
# 安装 node（这里不再过多赘述）

node -v

# 安装 http-server

npm install http-server -g

http-server -v

# 进入文件夹（更换 /nitaifarme 为你自己的路径）

cd /nitaifarme

# 启动服务

# -p 指定端口 -o 立即打开浏览器
http-server -p 11123 -o
```

## 一键部署到 Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Nitai9h/nitaifarme)

## 一键部署到 Vercel

[![Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/Nitai9h/nitaifarme)

##### 用到的库

* [js-cookie](https://github.com/js-cookie/js-cookie)
* [color-thief](https://lokeshdhakar.com/projects/color-thief/)
