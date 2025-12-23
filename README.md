
# 我记住了 (I Remembered)

这是一款帮助 GRE 考生通过“主动回忆”来背单词的 Web App。

## 🚀 功能特点

*   **本地存储优先**: 你的数据完全存储在本地浏览器中，安全且无需登录。
*   **Gemini AI 驱动**: 提供助记词生成 (Connection Hooks)、例句生成、发音合成和记忆漫画绘制。
*   **SRS 间隔重复**: 内置简易的 SM-2 算法，自动安排复习计划。
*   **批量导入**: 支持粘贴单词列表，AI 自动批量生成卡片。

## ⚙️ 为了使用 AI 功能，你需要一个 Google Gemini API Key。

1.  **获取 API Key**: 访问 [Google AI Studio](https://aistudio.google.com/) 免费申请。
2.  打开网页，点击左下角的 **"Settings / API Key"**。
3.  输入**自己的 Gemini API Key**。
4.  Key 会保存在你的浏览器的 LocalStorage 中
5.  可以使用 AI 功能啦

## 💡 常见问题 (FAQ)

**Q: 为什么 AI 生成（助记/图片/发音）没反应？**
A: 请检查左下角 "Settings" 是否配置了 API Key。

**Q: 数据会丢失吗？**
A: 数据存储在浏览器的 LocalStorage 中。如果清空缓存或更换设备，数据会丢失。建议定期在 "我的仓库" 页面点击 "Backup CSV" 导出数据备份。
