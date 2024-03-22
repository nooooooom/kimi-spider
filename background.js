// Copyright 2021 Google LLC
//
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file or at
// https://developers.google.com/open-source/licenses/bsd

// Initialize the demo on install

// =============================
// 无感创建窗口测试
// =============================

// ❌ 创建新窗口（最小化） -> 新窗口会闪动
chrome.windows.create({
  focused: false,
  state: 'minimized'
})

// ❌ 创建新窗口（大小设置为 0） -> 新窗口大小值最低为 100，新窗口会闪动
chrome.windows.create({
  focused: false,
  width: 0,
  height: 0
})

// ❌ 创建新窗口（位置溢出隐藏） -> 新窗口位置值最低为 100，新窗口会闪动
chrome.windows.create({
  focused: false,
  top: -9999,
  left: -9999
})

// =============================
// 无感创建页签测试
// =============================

// ❌ 创建新页签 -> 页签创建比较显眼
chrome.tabs.create({
  active: false
})

// ❌ 创建新页签 -> 需要依赖现有窗口
chrome.tabs.create({
  active: false,
  windowId: 1
})
