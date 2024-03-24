## 探索前端在浏览器插件中爬取网页内容的可行性研究

### 问题提出

能否使用前端技术利用用户的登录状态来访问和获取页面内容，增强 AI 联网查询服务中服务端对内容访问受限网站（如小红书）的抓取能力，并在一定程度上减轻服务器的负担。

### 问题分析

由于涉及到跨域网站的内容访问与数据传输，考虑到浏览器的安全限制问题，需要在应用层进行功能实施。因此将**浏览器插件开发**作为主要开发架构，并验证以下关键点的可行性：

1. **模拟用户登录状态访问网站，并解读网站内容**。
2. **已获取内容的传输**：最终需要将爬取到的内容传输至服务端交给模型解析。

### 方案调研

#### 模拟用户登录状态访问网站，并解读网站内容 ✅

- 浏览器中通常使用 **IFrame**、**创建页签**或**创建窗口**的方式访问网页。[经尝试](./iframe.html)， IFrame 在进行接口请求时，会受到浏览器同源策略的限制，导致无法模拟用户的登录状态。然而创建页签或窗口的方式与用户手动打开页面的模式一致，不会受到安全策略的约束，具体如下：

  - 创建页签：通过 [chrome.tabs.create](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-create) 创建页签。如果要实现无感创建 ❔，需要具体考察 `active`、`windowId` 两个属性所带来的表现形式。
  - 创建窗口：通过 [chrome.window.create](https://developer.chrome.com/docs/extensions/reference/api/windows#method-create) 创建新窗口：如果要实现无感创建 ❔，需要具体考察 `focused`、`width`、`height`、`left`、`top`、`state` 几个属性的所带来的表现形式。

- 通过注入内容脚本以及监听网络请求的形式获取网站内容，具体如下：

  - 注入内容脚本：对于数据请求加密的网站或者静态页面，通过配置 [content_scripts](https://developer.chrome.com/docs/extensions/get-started/tutorial/scripts-on-every-tab#step-3) 注入页面的自定义脚本，实时监听 DOM 加载，并通过 DOM 选择器、节点权重分析等方式获取目标内容。
  - 监听网络请求：对于数据请求未加密的网站，可以通过 [chrome.devtools.network.onRequestFinished](https://developer.chrome.com/docs/extensions/reference/api/devtools/network#event-onRequestFinished) 在插件中监听内容数据的请求。

#### 已获取内容的传输 ✅

浏览器插件支持页面与插件进行通信，以及跨页签消息传递，结合两者便能将获取到内容传送至服务端：

- 页面与插件通信：通过设置[externally_connectable](https://developer.chrome.com/docs/extensions/develop/concepts/messaging?hl=zh-cn#external-webpage)，内容脚本通过 [runtime.sendMessage()](https://developer.chrome.com/docs/extensions/reference/api/runtime?hl=zh-cn#method-sendMessage) 向插件传递 JSON 序列化内容。
- 跨页签消息传递：插件通过 [chrome.tabs.sendMessage](https://developer.chrome.com/docs/extensions/reference/api/tabs?hl=zh-cn#method-sendMessage) 向指定页签传递 JSON 序列化内容。

### 方案实施

如[插件代码](./background.js)、[页面内容脚本代码](./scripts/content.js)。

### 结论

尽管进行了深入的研究和尝试，但最终得出的结论是，使用前端技术替代服务端进行网页内容爬取的方案在实际应用中存在诸多问题:

1. **用户体验差**：无法达到无感创建页签/窗口的效果，用户体验差。
2. **效率低，并且难以优化**：爬取效率受用户网络和硬件配置影响，且难以优化。
3. **流程繁琐，容易受到用户环境影响**：获取的数据需传输至服务端，增加了服务端负担，且容易受用户环境影响。
4. **用户体验不一致**：Kimi 目前支持通过续流的方式恢复突然中断的对话，但在页面关闭后前端的爬取能力将会受影响，这会在一定程度上导致两次对话的结果存在较大差别。
5. **用户隐私难以保证**：搜索引擎可能涉及用户画像，影响用户在其他产品的使用体验。

因此，我认为这一方案不适合在生产环境中使用。在 AI 联网查询服务中，仍然需要以服务端爬取为主，同时可以探索其他技术手段来优化爬取效率和用户体验。
