# Remora

通过阅读文章来记忆英语单词的沉浸式阅读器。在真实语境中点击单词，即可查看释义、音标和例句——像鮣鱼（remora）附着在文章上学习语言。

## 功能特性

- **沉浸式阅读** — 内置精选英文文章（文学、词汇、游记等分类），在真实语境中学习单词
- **即点即查** — 点击/长按任意单词，弹出释义卡片，包含音标、词性、中文释义和例句
- **朗读发音** — 一键播放单词标准美式发音
- **划词翻译** — 选中任意句子或短语，即时显示中文翻译
- **自定义书库** — 导入自己的文章（支持多章节），存储在本地，无需账号
- **备份与恢复** — 书库数据可导出为 JSON 文件，跨设备迁移
- **PWA 支持** — 可安装至手机主屏，离线阅读

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| 音频 | Howler.js |
| 词典 | 有道词典 API（服务端代理） |
| 翻译 | `/api/translate` 代理 |
| 存储 | localStorage（纯客户端） |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

## 环境变量

翻译 API 需要配置密钥，在项目根目录创建 `.env.local`：

```env
# 翻译接口所需的密钥（根据 lib/translate.ts 中的实际实现填写）
TRANSLATE_API_KEY=your_key_here
```

词典与 TTS 接口通过有道公开 API 代理，无需额外配置。

## 项目结构

```
app/
├── page.tsx              # 书库首页
├── book/[id]/            # 书籍详情页
│   └── [chapter]/        # 章节阅读页
├── components/
│   ├── Reader.tsx         # 阅读器核心
│   ├── WordPopup.tsx      # 单词释义卡片
│   ├── SelectionPopup.tsx # 划词翻译弹窗
│   └── ImportModal.tsx    # 添加书籍弹窗
└── api/
    ├── lookup/           # 单词查询（有道词典）
    ├── translate/        # 句子翻译
    └── tts/              # 文字转语音

lib/
├── content.ts            # 内置书籍数据
├── userContent.ts        # 用户书库（localStorage）
├── categories.ts         # 书籍分类定义
└── translate.ts          # 翻译客户端
```

## 使用方式

**阅读内置书籍**：进入书库，选择任意书籍开始阅读。

**添加自定义文章**：点击「添加书籍」，填写书名和正文内容（支持多章节），也可从 `.txt` 文件导入章节文本。

**查词**：点击（桌面端）或长按（移动端）任意单词，弹出释义卡片后可点击喇叭图标播放发音。

**划词翻译**：用鼠标/手指选中一段文字，松开后自动弹出翻译。

**备份书库**：在「添加书籍」弹窗的「备份」标签页，可导出/导入 JSON 数据。

## 构建与部署

```bash
npm run build
npm run start
```

支持部署到 Vercel、Netlify 等任意 Next.js 兼容平台，无需数据库。

## License

MIT
