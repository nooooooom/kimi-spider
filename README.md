## 探索前端在浏览器插件中爬取网页内容的可行性研究

### 问题提出

传统的 AI 联网查询服务中，服务端通常负责执行爬虫机制——通过解析查询语句并在互联网上搜索相关信息。然而部分网站的内容访问受限于用户的登录状态，例如小红书。因此需要探究能否通过前端利用用户的登录状态来访问和获取页面内容，以增强联网查询功能，并在一定程度上减轻服务器的负担。

### 问题分析

由于涉及到跨域网站的内容访问与数据传输，考虑到浏览器的安全限制，解决方案需要在应用层实现。于是将**浏览器插件开发**作为主要开发架构，并验证以下关键点的可行性：

1. **跨域网站访问与内容解读**：如何实现跨域网站的访问和内容解析，并将其传输至服务端。
2. **模拟登录**：如何模拟用户的登录状态以访问仅限登录用户的内容。

### 方案调研

经分析，前端通常使用 **内嵌 IFrame**、**创建页签**或**创建窗口**的方式访问网页。通过小型 demo 验证以及对浏览器插件开发文档的搜寻，调研出以下结果：

- ❌ 内嵌 IFrame：通过[ demo 验证](./iframe.html)，发现受浏览器同源策略的影响，IFrame 内的网站在请求时无法携带用户的 cookie，然而大部分网站都是通过 cookie 来校验用户登录状态的。

- ✅ 创建页签/窗口：与用户手动打开页面的模式一致，因此不存在安全限制问题。

  - 通过 [chrome.tabs.create](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-create) 创建页签。如果要实现无感创建 ❔，需要具体考察 `active`、`windowId` 两个属性所带来的表现形式。
  - 通过 [chrome.window.create](https://developer.chrome.com/docs/extensions/reference/api/windows#method-create) 创建新窗口：如果要实现无感创建 ❔，需要具体考察 `focused`、`width`、`height`、`left`、`top`、`state` 几个属性的所带来的表现形式。

- ✅ 访问网站内容：

  - 监听网络请求：对于数据请求未加密的网站，可以通过 [chrome.devtools.network.onRequestFinished](https://developer.chrome.com/docs/extensions/reference/api/devtools/network#event-onRequestFinished) 在插件中监听内容数据的请求。
  - 向页面注入脚本：对于数据请求加密的网站或者静态页面，通过配置 [content_scripts](https://developer.chrome.com/docs/extensions/get-started/tutorial/scripts-on-every-tab#step-3) 注入页面的自定义脚本，实时监听 DOM 加载，并通过 DOM 选择器、节点权重分析等方式获取目标内容。

- ✅ 跨页签/窗口通信，以及数据传输至服务端：

  - 页面与插件通信：通过设置[externally_connectable](https://developer.chrome.com/docs/extensions/develop/concepts/messaging?hl=zh-cn#external-webpage)，内容脚本通过 [runtime.sendMessage()](https://developer.chrome.com/docs/extensions/reference/api/runtime?hl=zh-cn#method-sendMessage) 向插件传递 JSON 序列化内容。
  - 跨页签消息传递：插件通过 [chrome.tabs.sendMessage](https://developer.chrome.com/docs/extensions/reference/api/tabs?hl=zh-cn#method-sendMessage) 向指定页签传递 JSON 序列化内容。

  结合两者可以达到跨页签/窗口通信效果，以此实现将爬取内容传送至服务端。

### 方案实施

如[插件代码](./background.js)、[页面内容脚本代码](./scripts/content.js)。

### 结论

前端替代服务端爬取网页内容的方案难以实现，具体体现在以下方面：

1. **用户体验差**：无法达到无感创建页签/窗口的效果，用户体验差。
2. **效率低，并且难以优化**：爬取效率受用户网络和硬件配置影响，难以优化。
3. **流程繁琐，容易受到用户环境影响**：爬取后的数据需传输至服务端，增加了服务端负担，且容易受用户环境影响。
4. **用户隐私难以保证**：搜索引擎可能涉及用户画像，影响用户在其他产品的使用体验。
