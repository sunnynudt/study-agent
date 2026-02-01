/**
 * 核心功能模块 - 意图识别 + 上下文记忆
 */

const { classifyIntent, extractGrade, extractSubject } = require('./intentClassifier');
const ContextManager = require('./contextManager');

/**
 * 增强版 Agent 核心
 */
class StudyAgentCore {
  constructor(options = {}) {
    this.name = options.name || '学习小助手';
    this.model = options.model || 'minimax/MiniMax-M2.1';
    this.contextManager = new ContextManager({
      maxHistory: options.maxHistory || 20,
      maxContextLength: options.maxContextLength || 8000
    });
    
    // 学科处理器
    this.subjectHandlers = {
      math: require('../subjects/math'),
      english: require('../subjects/english'),
      chinese: require('../subjects/chinese')
    };
  }

  /**
   * 处理用户消息
   */
  async* process(userMessage, metadata = {}) {
    const { grade = 3, userId = 'default' } = metadata;

    // 获取上下文
    const context = this.contextManager.getContext(userId);
    
    // 分析消息
    const analysis = {
      intent: classifyIntent(userMessage),
      grade: extractGrade(userMessage) || grade,
      subject: extractSubject(userMessage),
      isGreeting: this.isGreeting(userMessage),
      isHelpRequest: this.isHelpRequest(userMessage),
      needsEncouragement: this.needsEncouragement(userMessage)
    };

    // 更新上下文
    this.contextManager.addToHistory(userId, {
      role: 'user',
      content: userMessage,
      analysis
    });

    // 生成系统 Prompt
    const systemPrompt = this.buildSystemPrompt(analysis, context);

    // 构建消息
    const messages = [
      { role: 'system', content: systemPrompt },
      ...context.history.slice(-5), // 最近5轮历史
      { role: 'user', content: userMessage }
    ];

    // 路由到对应处理器
    yield* this.routeToHandler(analysis, userMessage, messages);
  }

  /**
   * 构建系统 Prompt
   */
  buildSystemPrompt(analysis, context) {
    const { intent, grade, subject } = analysis;
    
    const gradeGuidance = this.getGradeGuidance(grade);
    const subjectGuidance = this.getSubjectGuidance(subject, grade);
    
    return `你是${this.name} 🍬，上海市小学${grade}年级学习小助手。

## 核心定位
帮助小学生快乐学习，培养学习兴趣，提高学习成绩。

## 年级适配指南
${gradeGuidance}

## 学科指导
${subjectGuidance}

## 对话策略
- 用户打招呼 → 热情回应，询问学习需求
- 出题请求 → 按年级出题，控制数量（3-5题）
- 答疑请求 → 耐心解释，用例子说明
- 回答正确 → 表扬鼓励
- 回答错误 → 温和纠正，鼓励再试
- 困惑不解 → 拆分步骤，循序渐进

## 当前任务
${this.getTaskDescription(intent, subject)}

记住：你是在帮助小朋友学习，要让他们感到自信和快乐！`;
  }

  /**
   * 获取年级指导
   */
  getGradeGuidance(grade) {
    const guidance = {
      2: '低年级小朋友，语言要极其简单，多用口语化表达，多用"比如"、"就像"等词汇',
      3: '低年级，保持亲切简单，可以稍微增加一点词汇量',
      4: '中高年级，语言可以稍微正式一些，可以解释稍复杂的概念',
      5: '高年级，可以当作小大人来对话，语言可以更丰富，培养独立思考'
    };
    return guidance[grade] || guidance[3];
  }

  /**
   * 获取学科指导
   */
  getSubjectGuidance(subject, grade) {
    const guidance = {
      math: this.getMathGuidance(grade),
      english: this.getEnglishGuidance(grade),
      chinese: this.getChineseGuidance(grade)
    };
    return guidance[subject] || '友好回复，询问用户想学习什么';
  }

  getMathGuidance(grade) {
    const map = {
      2: '重点：20以内加减法、乘法口诀。题目要短，答案控制在个位数',
      3: '重点：表内乘除法、简单分数。可以用分水果、分蛋糕等生活例子',
      4: '重点：小数运算、简单几何。适当加入应用题情境',
      5: '重点：分数运算、百分数。可以讲解解题思路，培养逻辑思维'
    };
    return map[grade] || map[3];
  }

  getEnglishGuidance(grade) {
    const map = {
      2: '重点：26个字母、颜色/动物等基础单词。可以用图片联想记忆',
      3: '重点：日常单词、简单句型。鼓励大声朗读，多练习对话',
      4: '重点：阅读短文、基础语法。培养语感，积累词汇',
      5: '重点：阅读理解、写作入门。可以分析文章结构，鼓励写小短文'
    };
    return map[grade] || map[3];
  }

  getChineseGuidance(grade) {
    const map = {
      2: '重点：生字词、看图写话。多鼓励，表扬创意',
      3: '重点：阅读理解、成语故事。引导思考，讲述故事',
      4: '重点：阅读技巧、作文框架。提供范例，循序渐进',
      5: '重点：阅读分析、文言启蒙。引导深入思考，培养鉴赏能力'
    };
    return map[grade] || map[3];
  }

  getTaskDescription(intent, subject) {
    const tasks = {
      'greeting': '热情打招呼，了解用户学习需求',
      'generate_questions': '出练习题，让小朋友练习',
      'answer_question': '解答疑问，帮助理解',
      'explain': '讲解知识点，用简单方式说明',
      'check_answer': '检查答案，给予反馈',
      'general': '友好交流，适时引导学习'
    };
    return tasks[intent] || tasks['general'];
  }

  /**
   * 路由到对应处理器
   */
  async* routeToHandler(analysis, userMessage, messages) {
    const { intent, subject, grade } = analysis;
    
    // 如果是出题，调用对应学科
    if (intent === 'generate_questions' && subject && this.subjectHandlers[subject]) {
      yield* this.subjectHandlers[subject].handle(userMessage, grade, {});
    } else {
      // 直接交给大模型处理
      yield { role: 'user', content: userMessage };
    }
  }

  // 辅助判断方法
  isGreeting(msg) {
    const greetings = ['你好', 'hi', 'hello', '在吗', '早', '晚安', '早安'];
    return greetings.some(g => msg.toLowerCase().includes(g.toLowerCase()));
  }

  isHelpRequest(msg) {
    return msg.includes('帮助') || msg.includes('不会') || msg.includes('不懂');
  }

  needsEncouragement(msg) {
    return msg.includes('不会') || msg.includes('不懂') || msg.includes('好难') || msg.includes('不会做');
  }
}

module.exports = StudyAgentCore;
