// 封装函数
const nppStore = (() => {
  // 数据库常量定义
  const DB_NAME = 'nppstore';
  const NPP_STORE = 'Npp';

  /**
  * JS文件校验
  * @param {string} url
  * @returns {Promise<boolean>} 文件校验
  */
  async function verifyJSUrl(url) {
    try {
      // 检查URL扩展名
      if (!url.endsWith('.js')) {
        return false;
      }

      // 获取文件元信息
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      });

      // 检查Content-Type(响应头)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/javascript')) {
        return true;
      }

      // 对支持Range请求的服务器，进行进一步验证
      const rangeResponse = await fetch(url, {
        method: 'GET',
        headers: { 'Range': 'bytes=0-1' },
        mode: 'cors',
        cache: 'no-cache'
      });

      const contentRange = rangeResponse.headers.get('content-range');
      return !!contentRange;
    } catch (error) {
      nitaiFarme.log('verifyJSURL', 'URL is not valid:' + error.message, 'error');
      // GET请求验证
      try {
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache'
        });

        // 调试日志
        nitaiFarme.log('verifyJSURL', `GET request status: ${response.status}`, 'info');
        const text = await response.text();
        nitaiFarme.log('verifyJSURL', `Response content: ${text.substring(0, 100)}`, 'info');

        return response.ok;
      } catch (getError) {
        nitaiFarme.log('verifyJSURL', `GET verification failed: ${getError}`, 'error');
        return false;

      }
    }
  }

  /**
  * 提取元数据
  * @param {string} url - JS文件URL
  * @returns {Object} 元数据
  */
  async function extractMetadata(url) {
    try {
      const response = await fetch(url);
      const scriptText = await response.text();

      // 提取元数据块
      const metadataBlockMatch = scriptText.match(/\/\/\s*==Npplication==\s*\n([\s\S]*?)\n\/\/\s*==\/Npplication==/);

      if (!metadataBlockMatch || !metadataBlockMatch[1]) {
        throw new Error('未找到元数据块');
      }

      // 解析元数据
      const metadataLines = metadataBlockMatch[1].split('\n');
      const metadata = {};

      for (const line of metadataLines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('// @')) {
          const [key, ...valueParts] = trimmedLine.replace('// @', '').trim().split(' ');
          const value = valueParts.join(' ').trim();

          if (key && value) {
            metadata[key] = value;
          }
        }
      }

      // 验证 名字/id/版本
      if (!metadata.name || !metadata.id || !metadata.version || !metadata.time) {
        throw new Error('缺少必要元数据字段');
      }

      // 验证 id 格式
      const idPattern = /^(\d{13})_[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
      const match = metadata.id.match(idPattern);
      if (!match) {
        throw new Error('错误的 ID 格式');
      }

      // 验证 id 有效性
      const timestamp = parseInt(match[1]);
      if (timestamp < 1749401460000) {
        throw new Error('ID 无效');
      }

      // 验证 加载时机
      if (!metadata.time || !['head', 'body'].includes(metadata.time.toLowerCase())) {
        metadata.time = 'body'; // 默认
      }

      return {
        name: metadata.name,
        id: metadata.id,
        version: metadata.version,
        description: metadata.description || '',
        author: metadata.author || '未知作者',
        time: metadata.time.toLowerCase()
      };
    } catch (error) {
      nitaiFarme.log('extractMetadata', 'Metadata not found:' + error.message, 'error');
      throw new Error(`无效的元数据格式: ${error.message}`);
    }
  }

  /**
   * 创建安装窗口
   * @param {Object} metadata - 元数据
   * @param {string} pluginUrl
   */
  function showInstallDialog(metadata, pluginUrl) {
    // 创建容器
    const dialog = document.createElement('div');
    dialog.className = 'install-dialog';

    // 内容
    dialog.innerHTML = `
        <div class="dialog-content">
        <h2>安装插件</h2>
        <div class="metadata">
        <p><strong>ID:</strong> ${metadata.id}</p>
        <p><strong>名称:</strong> ${metadata.name}</p>
        <p><strong>版本:</strong> ${metadata.version}</p>
        <p><strong>描述:</strong> ${metadata.description || '无描述'}</p>
        <p><strong>作者:</strong> ${metadata.author || '未知作者'}</p>
        <p><strong>加载时机:</strong> ${metadata.time}</p>
        </div>
        <div class="buttons">
        <button class="cancel-btn">取消</button>
        <button class="install-btn">安装</button>
        </div>
        </div>
    `;

    // 添加
    document.body.appendChild(dialog);

    // 事件绑定
    dialog.querySelector('.cancel-btn').addEventListener('click', () => {
      document.body.removeChild(dialog);
    });

    dialog.querySelector('.install-btn').addEventListener('click', async () => {
      try {
        // 调试日志
        nitaiFarme.log('NppInstallDialog', `Start the installation: ${metadata.id} ${pluginUrl}`, 'primary');
        // 保存元数据
        await savePluginMetadata(metadata);
        // 下载并保存
        await saveJSFile(metadata.id, pluginUrl);
        // 显示刷新提示
        showRefreshDialog();
        // 移除窗口
        document.body.removeChild(dialog);
      } catch (error) {
        nitaiFarme.log('NppInstallDialog', `Installation failed: ${error.message}`, 'error');
        // 显示错误窗口
        showErrorDialog(`安装失败: ${error.message}`);
      }
    });
  }

  /**
  * 创建错误窗口
  * @param {string} message - 错误信息
  */
  function showErrorDialog(message) {
    const dialog = document.createElement('div');
    dialog.className = 'error-dialog';

    dialog.innerHTML = `
        <div class="dialog-content">
        <h2>错误</h2>
        <p>${message}</p>
        <button class="close-btn">确定</button>
        </div>
    `;

    document.body.appendChild(dialog);

    dialog.querySelector('.close-btn').addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
  }

  /**
  * 保存元数据
  * @param {Object} metadata - 元数据
  */
  function savePluginMetadata(metadata) {
    return new Promise((resolve, reject) => {
      // 获取列表
      const plugins = JSON.parse(localStorage.getItem('npp_plugins') || '[]');

      // 在数据库查找NPP
      const existingIndex = plugins.findIndex(p => p.id === metadata.id);
      const existing = existingIndex > -1 ? plugins[existingIndex] : null;

      // 保留安装时间戳
      const installTime = existing?.installTime || Date.now();

      // 保存
      if (existing) {
        plugins[existingIndex] = {
          ...metadata,
          installTime
        };
      } else {
        plugins.push({
          ...metadata,
          installTime
        });
      }

      // 元数据保存
      localStorage.setItem('npp_plugins', JSON.stringify(plugins));
      resolve();
    });
  }

  /**
  * 下载并保存NPP
  * @param {string} id
  * @param {string} url
  */
  function saveJSFile(id, url) {
    return new Promise((resolve, reject) => {
      // 参数验证
      if (!id || !url) {
        reject('缺少必要参数: ' + (id ? '' : 'id ') + (url ? '' : 'url'));
        return;
      }

      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
          }
          return response.blob();
        })
        .then(blob => {
          const reader = new FileReader();
          reader.onload = () => {
            // 数据库
            const request = indexedDB.open(DB_NAME, 1);

            request.onsuccess = (event) => {
              const db = event.target.result;
              const transaction = db.transaction(NPP_STORE, 'readwrite');
              const store = transaction.objectStore(NPP_STORE);

              // 存储文件
              const putRequest = store.put({ id, content: reader.result });

              putRequest.onsuccess = () => {
                nitaiFarme.log('NppInstallDialog', `Successful download`, 'success');
                resolve();
              };

              putRequest.onerror = (event) => {
                reject('文件下载失败');
              };
            };
          };

          reader.onerror = () => reject('文件读取失败');
          reader.readAsArrayBuffer(blob);
        })
        .catch(error => {
          nitaiFarme.log('NppInstallDialog', `Download failed: ${error.message}`, 'error');
          reject(`下载失败: ${error.message}`);
        });
    });
  }

  // 版本比对
  function showVersionDialog(existingVersion, newVersion, metadata, url) {
    const dialogContent = `
        <div class="dialog-content">
        <h2>${existingVersion === newVersion ? '覆盖安装此 NPP ?' : '该 NPP 有更新!'}</h2>
        <div class="metadata-comparison">
            <p><strong>ID:</strong> ${metadata.id}</p>
            <div class="version-comparison">
            <p><strong>本地版本:</strong> ${existingVersion}</p>
            <p><strong>新版本:</strong> ${newVersion}</p>
        </div>
            <p><strong>名称:</strong> ${metadata.name}</p>
            <p><strong>描述:</strong> ${metadata.description || '无描述'}</p>
        </div>
        <div class="buttons">
            <button class="cancel-btn">取消</button>
            <button class="confirm-btn">${existingVersion === newVersion ? '覆盖' : '更新'}</button>
        </div>
        </div>
        `;

    const dialog = document.createElement('div');
    dialog.className = 'install-dialog';
    dialog.innerHTML = dialogContent;
    document.body.appendChild(dialog);

    dialog.querySelector('.confirm-btn').addEventListener('click', async () => {
      document.body.removeChild(dialog);

      try {
        // 下载元数据
        await savePluginMetadata(metadata);
        // 下载文件
        await saveJSFile(metadata.id, url);
        nitaiFarme.log('NppInstallDialog', `Successful download: ${error.message}`, 'success');
      } catch (error) {
        nitaiFarme.log('NppInstallDialog', `The download failed: ${error.message}`, 'error');
        showErrorDialog(`失败: ${error.message}`);
      }
    });
  }

  /**
  * 注入 NPP
  * @param {string} id
  * @param {string} time - 加载时机 (head/body)
  */
  function loadTime(id, time) {
    const request = indexedDB.open(DB_NAME, 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const store = db.transaction(NPP_STORE, 'readonly').objectStore(NPP_STORE);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const fileRecord = getRequest.result;
        if (!fileRecord) return;

        const blob = new Blob([fileRecord.content], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);

        const script = document.createElement('script');
        script.src = url;
        script.type = 'text/javascript';
        script.dataset.nppId = id; // 添加数据属性

        // 插入至 body 末
        if (time === 'head') {
          document.head.appendChild(script);
        } else if (time === 'body') {
          // 插入
          const bodyScript = document.createElement('script');
          bodyScript.src = url;
          bodyScript.type = 'text/javascript';
          bodyScript.dataset.nppId = id;
          document.body.appendChild(bodyScript);
        } else {
          nitaiFarme.log('loadTime', `Invalid loading time: ${time}`, 'error');
          showErrorDialog('加载时机无效');
        }
      };
    };

    request.onerror = (event) => {
      reject(`数据库打开失败: ${event.target.error.message}`);
    };
  }

  // 刷新提示
  function showRefreshDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'install-dialog';

    dialog.innerHTML = `
        <div class="dialog-content">
        <h2>需要刷新</h2>
        <p>为了使更新生效，需要刷新页面</p>
        <div class="buttons">
        <button class="refresh-btn">更新</button>
        <button class="later-btn">稍后</button>
        </div>
        </div>
        `;

    document.body.appendChild(dialog);

    // 事件绑定
    dialog.querySelector('.later-btn').addEventListener('click', () => {
      document.body.removeChild(dialog);
    });

    dialog.querySelector('.refresh-btn').addEventListener('click', () => {
      document.body.removeChild(dialog);
      window.location.reload(true);
    });
  }

  // 公共接口
  return {
    // 加载 NPP
    loadNpp: function () {
      const plugins = JSON.parse(localStorage.getItem('npp_plugins') || '[]');

      // 倒序加载
      plugins.slice().reverse().forEach(plugin => {
        if (plugin.id && plugin.time) {
          loadTime(plugin.id, plugin.time);
        }
      });
    },

    /**
    * 主安装函数
    * @param {string} url - JS文件URL
    */
    installNpplication: async function (url) {
      try {
        // 验证URL
        if (!await verifyJSUrl(url)) {
          showErrorDialog('无效的JS文件URL');
          return;
        }

        // 提取新元数据
        const newMetadata = await extractMetadata(url);

        // 获取现有插件列表
        const plugins = JSON.parse(localStorage.getItem('npp_plugins') || '[]');
        const existing = plugins.find(p => p.id === newMetadata.id);

        // 通用对比对话框
        const createDialog = (actionType) => {
          // 使用现有元数据或默认值
          const currentVersion = existing?.version || '未安装';
          const currentName = existing?.name || '未知名称';
          const currentDescription = existing?.description || '无描述';
          const currentAuthor = existing?.author || '未知作者';

          const dialogContent = `
                    <div class="dialog-content">
                    <h2>${actionType === 'overwrite' ? '覆盖安装此 NPP ?' : '此 NPP 有更新!'}</h2>
                    <div class="metadata-comparison">
                        <p><strong>ID:</strong> ${newMetadata.id}</p>
                        <div class="version-comparison">
                        <p><strong>现有版本:</strong> ${currentVersion}</p>
                        <p><strong>新版本:</strong> ${newMetadata.version}</p>
                        </div>
                        <p><strong>名称:</strong> ${currentName} → ${newMetadata.name}</p>
                        <p><strong>描述:</strong> ${currentDescription} → ${newMetadata.description || '无描述'}</p>
                        <p><strong>作者:</strong> ${currentAuthor} → ${newMetadata.author || '未知作者'}</p>
                    </div>
                    <div class="buttons">
                        <button class="cancel-btn">取消</button>
                        <button class="confirm-btn">${actionType === 'overwrite' ? '覆盖' : '更新'}</button>
                    </div>
                    </div>
                    `;

          const dialog = document.createElement('div');
          dialog.className = 'install-dialog';
          dialog.innerHTML = dialogContent;
          document.body.appendChild(dialog);

          dialog.querySelector('.confirm-btn').addEventListener('click', async () => {
            document.body.removeChild(dialog);
            try {
              // 元数据下载
              await savePluginMetadata(newMetadata);
              // 文件下载
              await saveJSFile(newMetadata.id, url);
              // 刷新提示
              showRefreshDialog();
              // 回调
              window.postMessage({ type: 'NPP_INSTALLATION_SUCCESS', id: newMetadata.id }, '*');
            } catch (error) {
              nitaiFarme.log('NppInstallDialog', `The download failed: ${error.message}`, 'error');
              window.postMessage({ type: 'NPP_INSTALLATION_FAILED', error: error.message }, '*');
            }
          });
        };

        // 版本比对
        if (existing) {
          if (existing.version === newMetadata.version) {
            createDialog('overwrite');
          } else {
            createDialog('update');
          }
          return;
        }

        // 验证加载时机
        if (!['head', 'body'].includes(newMetadata.time)) {
          showErrorDialog('无有效的加载时机');
          return;
        }

        // 显示安装窗口
        showInstallDialog(newMetadata, url);
      } catch (error) {
        nitaiFarme.log('NppInstallDialog', `Installation failed: ${error.message}`, 'error');
        showErrorDialog(`安装失败: ${error.message}`);
        window.postMessage({ type: 'NPP_INSTALLATION_FAILED', error: error.message }, '*');
      }
    },

    /**
    * 数据库初始化
    * @returns {Promise<void>} 初始化完成
    */
    initializaNppDB: function () {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(NPP_STORE)) {
            db.createObjectStore(NPP_STORE, { keyPath: 'id' });
          }
          nitaiFarme.log('initiazation', 'Successful database initialization', 'success');
        };

        request.onsuccess = (event) => {
          const db = event.target.result;
          // 验证
          if (!db.objectStoreNames.contains(NPP_STORE)) {
            reject(`缺少必要的对象存储: ${NPP_STORE}`);
            return;
          }

          db.close();
          resolve();
        };

        request.onerror = (event) => {
          reject(`数据库初始化失败: ${event.target.error.message}`);
        };
      });
    },

    // 拖动排序配置页面
    showOrderConfigDialog: function () {
      const plugins = JSON.parse(localStorage.getItem('npp_plugins') || '[]');
      if (plugins.length === 0) {
        showErrorDialog('没有可配置的插件');
        return;
      }

      // 创建对话框
      const dialog = document.createElement('div');
      dialog.className = 'install-dialog order-config-dialog';

      // 生成拖动列表
      const list = document.createElement('ul');
      list.className = 'plugin-list';

      // 拖放变量
      let dragSrcEl = null;

      // 创建列表项
      const items = plugins.map(plugin => {
        const li = document.createElement('li');
        li.className = 'plugin-item';
        li.setAttribute('draggable', true);
        li.dataset.id = plugin.id;

        li.innerHTML = `
                <div class="drag-handle">☰</div>
                <div class="plugin-info">
                <strong>${plugin.name || '无名称'}</strong>
                <p>ID: ${plugin.id}</p>
                <p>版本: ${plugin.version || '未知'}</p>
                </div>
                `;

        // 拖放
        li.addEventListener('dragstart', (e) => {
          dragSrcEl = li;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/html', li.innerHTML);
        });

        li.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          return false;
        });

        li.addEventListener('dragenter', () => {
          li.classList.add('over');
        });

        li.addEventListener('dragleave', () => {
          li.classList.remove('over');
        });

        li.addEventListener('drop', (e) => {
          e.preventDefault();
          if (dragSrcEl !== li) {
            list.insertBefore(dragSrcEl, li);
          }
          return false;
        });

        li.addEventListener('dragend', () => {
          // 传递event对象
          [].forEach.call(list.querySelectorAll('.plugin-item'), el => {
            el.classList.remove('over');
          });
        });

        return li;
      });

      // 所有项添加
      items.forEach(item => list.appendChild(item));

      // 创建按钮
      const buttons = document.createElement('div');
      buttons.className = 'buttons';

      const saveBtn = document.createElement('button');
      saveBtn.className = 'save-btn';
      saveBtn.textContent = '保存';

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'cancel-btn';
      cancelBtn.textContent = '取消';

      buttons.appendChild(saveBtn);
      buttons.appendChild(cancelBtn);

      // 组装对话框
      dialog.innerHTML = '<div class="dialog-content"><h2>插件加载顺序配置</h2></div>';
      dialog.querySelector('.dialog-content').appendChild(list);
      dialog.querySelector('.dialog-content').appendChild(buttons);

      document.body.appendChild(dialog);

      // 事件绑定
      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(dialog);
      });

      saveBtn.addEventListener('click', () => {
        // 收集排序
        const newOrder = Array.from(list.querySelectorAll('.plugin-item')).map(
          item => item.dataset.id
        );

        // 更新排序
        const updatedPlugins = JSON.parse(localStorage.getItem('npp_plugins') || '[]');
        const pluginMap = updatedPlugins.reduce((acc, plugin) => {
          acc[plugin.id] = plugin;
          return acc;
        }, {});

        // 重组列表
        const orderedPlugins = newOrder
          .map(id => pluginMap[id])
          .filter(plugin => plugin);

        // 保留未选中的插件
        const remainingPlugins = updatedPlugins.filter(
          plugin => !newOrder.includes(plugin.id)
        );

        // 合并所有插件
        const finalPlugins = [...orderedPlugins, ...remainingPlugins];

        // 保存至localStorage
        localStorage.setItem('npp_plugins', JSON.stringify(finalPlugins));

        // 关闭对话框
        document.body.removeChild(dialog);

        // 提示
        const successDialog = document.createElement('div');
        successDialog.className = 'install-dialog';
        successDialog.innerHTML = `
                <div class="dialog-content">
                <h2>保存成功</h2>
                <p>插件加载顺序已更新。刷新页面后生效。</p>
                <button class="refresh-btn">立即刷新</button>
                </div>
                `;

        document.body.appendChild(successDialog);

        // 刷新
        successDialog.querySelector('.refresh-btn').addEventListener('click', () => {
          document.body.removeChild(successDialog);
          window.location.reload(true);
        });
      });
    }
  };
})();