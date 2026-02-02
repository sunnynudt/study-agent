# Study Agent

🎓 面向上海市小学二、三、四、五年级学生的 AI 辅导 Agent

## 功能特性

- 🎯 **智能意图识别** - 自动识别出题、答疑、讲解等需求
- 📚 **三科全覆盖** - 数学、英语、语文独立模块
- 📏 **年级适配** - 2-5 年级难度自动调整
- 💬 **上下文记忆** - 记住对话历史，提供连续性交互
- 📝 **题库模块** - 内置练习题，支持出题和答案检查
- 📊 **进度追踪** - 记录学习数据，分析掌握情况
- 🏆 **成就系统** - 勋章激励，增强学习动力
- 🌟 **鼓励式教育** - 表扬鼓励，增强学习信心
- 🧠 **大模型驱动** - 使用 MiniMax M2.1 模型
- 🎮 **挑战系统** - 趣味挑战模式（新增）
- 🦖 **学习伙伴** - 宠物养成系统（新增）
- 🎯 **智能出题** - 个性化自适应出题（新增）
- 👨‍👩‍👧 **家长报告** - 详细学习报告（新增）
- 👥 **学习小队** - 协作学习系统（新增）

## 快速开始

### 安装依赖

```bash
cd study-agent
npm install
```

### 运行测试

```bash
npm test
```

### 启动开发模式

```bash
npm run dev
```

## 项目结构

```
study-agent/
├── README.md
├── package.json
├── config.yaml
├── .gitignore
├── CHANGELOG.md
├── data/                      # 用户数据存储
├── src/
│   ├── index.js              # 入口，OpenClaw Agent Wrapper
│   ├── agent.js              # Agent 核心逻辑（完整版）
│   ├── core/
│   │   ├── agentCore.js      # 核心 Agent 类
│   │   ├── intentClassifier.js # 意图识别模块
│   │   └── contextManager.js   # 上下文管理
│   ├── subjects/
│   │   ├── math.js           # 数学模块
│   │   ├── english.js        # 英语模块
│   │   └── chinese.js        # 语文模块
│   ├── bank/
│   │   └── questionBank.js   # 题库模块
│   ├── services/
│   │   └── interactionService.js # 交互服务
│   ├── progress/             # 进度追踪
│   │   └── progressTracker.js
│   ├── achievements/         # 成就系统
│   │   └── achievementSystem.js
│   ├── tasks/                # 每日任务 ⭐
│   │   └── dailyTasks.js
│   ├── knowledgeGraph/       # 知识图谱 ⭐
│   │   └── knowledgeGraph.js
│   ├── challenges/           # 挑战系统 🎮 (NEW!)
│   │   └── challengeSystem.js
│   ├── pet/                  # 学习伙伴 🦖 (NEW!)
│   │   └── learningPet.js
│   ├── engine/               # 智能出题引擎 🎯 (NEW!)
│   │   └── smartQuestionEngine.js
│   ├── report/               # 家长端报告 👨‍👩‍👧 (NEW!)
│   │   └── parentReport.js
│   ├── prompts/              # Prompt 模板
│   │   ├── mathPrompts.js
│   │   ├── englishPrompts.js
│   │   └── chinesePrompts.js
│   └── utils/
│       └── helpers.js        # 工具函数
├── knowledge/
│   ├── math/curriculum.md    # 数学课程知识
│   ├── english/curriculum.md # 英语课程知识
│   └── chinese/curriculum.md # 语文课程知识
└── tests/
    └── index.test.js         # 测试用例
```

## 使用方法

### 基本对话

```javascript
// 示例对话
"你好"                    // 欢迎语
"我是二年级"              // 设置年级
"出5道数学题"             // 出数学题（使用题库）
"答案是25"                // 检查答案
"查看进度"                // 查看学习报告
"我的成就"                // 查看成就勋章
"错题本"                  // 查看错题复习
"今日任务"                // 查看每日任务
"知识图谱"                // 查看知识掌握情况
"本周统计"                // 查看本周学习统计
```

### 题库功能

Agent 内置题库，支持出题和答案检查：

```javascript
// 出题
"出5道数学题"             // 从题库随机出5道
"出3道英语词汇题"         // 出英语词汇题
"出2道语文古诗题"         // 出语文古诗题

// 检查答案
"答案是42"                // 检查上一题答案
"我算出来是25"            // 检查答案并得到反馈
```

### 进度追踪

Agent 自动记录学习数据：

```javascript
// 查看学习报告
"查看进度"                // 显示总题数、正确率、连续学习天数
"学习报告"                // 详细报告

// 查看错题本
"错题本"                  // 显示最近错题
"复习错题"                // 复习错题
```

### 成就系统

通过做题获得成就勋章：

| 成就 | 条件 | 描述 |
|------|------|------|
| 🎯 初露锋芒 | 完成1道题 | 第一次答题 |
| 📝 十题达人 | 完成10道题 | 完成10道题目 |
| 🔥 三天打鱼 | 连续学习3天 | 连续学习 |
| 💯 满分高手 | 一次全对 | 一次练习全部正确 |
| 🎓 三科全能 | 每科各10题 | 三科都有学习 |

```javascript
// 查看成就
"我的成就"                // 显示已获得勋章
"有什么成就"              // 查看成就列表
```

### 每日任务

设置和追踪每日学习目标：

```javascript
// 查看今日任务
"今日任务"                // 显示各科任务进度
"每日任务"                // 查看每日任务

// 设置任务
"设置数学每日5道题"       // 设置数学每日任务
"英语每天10道"            // 设置英语每日任务
```

### 知识图谱

查看知识掌握情况和学习建议：

```javascript
// 查看知识图谱
"知识图谱"                // 以ASCII图展示掌握情况
"掌握情况"                // 查看各知识点掌握度
"学习情况"                // 查看整体学习情况

// 查看统计
"本周统计"                // 查看本周各天学习统计
```

### 弱项分析

自动分析薄弱知识点：

```javascript
// 查看弱项
"有什么薄弱点"             // 查看需要加强的知识点
"推荐复习"                // 根据弱项推荐复习
```

### 意图识别

Agent 自动识别以下意图：

| 意图 | 示例 | 说明 |
|------|------|------|
| greeting | "你好"、"在吗" | 打招呼 |
| generate_questions | "出5道数学题" | 出练习题（题库） |
| answer_question | "什么是分数" | 答疑解惑 |
| check_answer | "答案是25" | 检查答案（题库） |
| change_subject | "换英语吧" | 切换学科 |
| view_progress | "查看进度" | 查看学习报告 |
| view_achievements | "我的成就" | 查看成就勋章 |
| view_wrong_questions | "错题本" | 查看错题 |

### 学科识别

自动识别用户想学习的学科：

- **数学** - 关键词：数学、计算、分数、几何等
- **英语** - 关键词：英语、单词、阅读、语法等
- **语文** - 关键词：语文、阅读、作文、古诗等

### 年级提取

自动从对话中提取年级：

- "二年级"、"三年级"、"四年级"、"五年级"
- 默认为 3 年级

## 配置

在 `config.yaml` 中修改：

```yaml
agent:
  name: "学习小助手"
  personality: "亲切、有耐心、鼓励式教育"
  model: "minimax/MiniMax-M2.1"

grades:
  min: 2
  max: 5

conversation:
  max_history: 20
  context_window: 64000

safety:
  content_filter: true
  max_response_length: 2000
```

## 测试

运行所有测试：

```bash
npm test
```

测试覆盖：
- 意图分类准确率
- 年级提取
- 学科识别
- 上下文管理
- 题库功能

## 题库模块

### 支持的题目类型

| 学科 | 题目类型 | 说明 |
|------|----------|------|
| 数学 | calculation, fraction, decimal, percentage, application | 计算、应用题 |
| 英语 | vocabulary, grammar, reading | 词汇、语法、阅读 |
| 语文 | vocabulary, poem, idiom | 词汇、古诗、成语 |

### 使用题库

```javascript
const { QuestionBank } = require('./src/bank/questionBank');

const bank = new QuestionBank();

// 出题
const questions = bank.getQuestions('math', { 
  grade: 3, 
  count: 5, 
  type: 'mixed' 
});

// 检查答案
const result = bank.checkAnswer('math', questions[0], '42');
console.log(result.correct); // true 或 false
```

### 扩展题库模块

支持更多题目，覆盖更多知识点：

```javascript
const { ExtendedQuestionBank } = require('./src/bank/extendedQuestionBank');

const extendedBank = new ExtendedQuestionBank();

// 获取题目数量
console.log(extendedBank.getTotalCount('math')); // 数学题总数

// 出题
const questions = extendedBank.getQuestions('math', {
  grade: 3,
  count: 10,
  type: 'mixed'
});
```

## 进度追踪模块

### 功能

- 记录答题数量和正确率
- 追踪各学科学习情况
- 记录连续学习天数
- 自动收集错题（最多20题）
- 生成学习报告

### 使用

```javascript
const ProgressTracker = require('./src/progress/progressTracker');

const tracker = new ProgressTracker();

// 记录答题
tracker.recordAnswer(userId, 'math', true, { q: '1+1=?', a: '2' }, 'addition');

// 获取统计
const summary = tracker.getSummary(userId);
// { totalQuestions: 1, correctAnswers: 1, accuracy: '100%', ... }

// 获取弱项分析
const weakPoints = tracker.getWeakPoints(userId);

// 生成报告
const report = tracker.generateReport(userId);
```

## 成就系统模块

### 功能

- 15+ 种成就勋章
- 实时检测解锁
- 成就庆祝动画
- 目标提示

### 成就列表

| 成就名称 | 解锁条件 |
|---------|---------|
| 🎯 初露锋芒 | 完成第1道题 |
| 📝 十题达人 | 完成10道题 |
| 📚 学富五车 | 完成50道题 |
| 🏆 百题斩 | 完成100道题 |
| 🔥 三天打鱼 | 连续学习3天 |
| 🌟 一周坚持 | 连续学习7天 |
| 💪 月度学习者 | 连续学习30天 |
| 🎯 80%准确率 | 正确率达到80% |
| 🌟 90%准确率 | 正确率达到90% |
| 💯 满分高手 | 一次练习全对 |
| 🔢 数学小达人 | 完成20道数学题 |
| 📖 英语小达人 | 完成20道英语题 |
| 📕 语文小达人 | 完成20道语文题 |
| 🎓 三科全能 | 每科各完成10题 |
| 📖 错题本 | 记录5道错题 |

## 知识点结构

参考 `knowledge/` 目录下的课程大纲：

- `math/curriculum.md` - 数学 2-5 年级知识树
- `english/curriculum.md` - 英语 2-5 年级知识树
- `chinese/curriculum.md` - 语文 2-5 年级知识树

参考 `prompts/` 目录下的 Prompt 模板：

- `mathPrompts.js` - 数学 Prompt 模板
- `englishPrompts.js` - 英语 Prompt 模板
- `chinesePrompts.js` - 语文 Prompt 模板

## 技术栈

- **运行时**: Node.js
- **框架**: OpenClaw
- **模型**: MiniMax M2.1
- **测试**: Node.js assert
- **数据存储**: JSON 文件

## 数据存储

用户数据保存在 `data/` 目录：

- `progress_{userId}.json` - 用户学习进度

## 版本更新

参考 `CHANGELOG.md` 了解最新更新。

## 下一步

- [x] 题库模块
- [x] 进度追踪
- [x] 成就系统
- [x] 每日学习任务
- [x] 知识点图谱
- [ ] 语音交互（TTS/ASR）
- [ ] 微信/小程序接入
- [ ] 家长端报告
- [ ] 多端数据同步

## ✨ 新增功能（v1.1.0）

### 🎮 挑战系统
```
"今日挑战"                # 查看可用挑战列表
"开始挑战 闪电计算"       # 开始挑战
"完成挑战 闪电计算 8/10"  # 结算挑战结果
"挑战成就"                # 查看挑战成就
"挑战排行"                # 查看排行榜
```

### 🦖 学习伙伴（宠物养成）
```
"我的伙伴"                # 查看/领取宠物
"我要小恐龙"              # 选择宠物
"喂水果"                  # 喂食宠物
"宠物状态"                # 查看宠物状态
"加油"                    # 获取宠物鼓励
```

### 🎯 智能出题引擎
```
"复习错题"                # 针对错题强化训练
"智能出题"                # 查看出题模式菜单
"挑战题目"                # 获取高难度题目
```

### 👨‍👩‍👧 家长端报告
```
"家长报告"                # 每日报告
"周报告"                  # 周度报告
"月报告"                  # 月度报告
```

### 👥 学习小队
```
"学习小队"                # 查看/创建小队
"创建小队"                # 创建学习小队
"加入小队 ABC123"         # 通过邀请码加入
"小队排行"                # 队内排行榜
"团队任务"                # 查看团队任务
"小队加油"                # 获取团队鼓励
```

### 🏆 扩展成就
```
"成就进度"                # 查看成就进度条
"总积分"                  # 查看成就总积分
```

## License

MIT
