/**
 * 交互服务 - 欢迎语、引导流程、用户反馈
 */

const { extractGrade, extractSubject } = require('../core/intentClassifier');

/**
 * 欢迎语配置
 */
const WELCOME_MESSAGES = {
  default: [
    '你好呀！我是学习小助手 🍬',
    '很高兴见到你！我是你的学习小伙伴',
    '嗨！准备好学习了吗？让我们一起加油吧！'
  ],
  
  morning: [
    '早上好！新的一天，从学习开始！☀️',
    '早安！今天想学点什么有趣的内容呢？'
  ],
  
  afternoon: [
    '下午好！午休后的大脑最清醒啦～',
    '下午好！来点有趣的学习吧！'
  ],
  
  evening: [
    '晚上好！今天学习辛苦了～',
    '晚间学习时光，一起加油吧！🌙'
  ]
};

/**
 * 引导流程配置
 */
const GUIDANCE_FLOWS = {
  first_time: {
    greeting: '你好！我可以帮助你学习数学、英语和语文。你现在几年级了？',
    no_grade: '告诉我你几年级，我可以给你出适合的题目哦！',
    with_grade: (grade) => `好的！${grade}年级的小朋友，让我们开始学习吧！`,
    suggest_subject: '你想先学哪一科？数学、英语还是语文？'
  },
  
  returning: {
    welcome_back: (name) => `回来啦！${name || '小朋友'}，今天想学点什么？`,
    continue_subject: (subject) => `好的，继续学习${subject}！`,
    suggest_practice: '要不要来做几道练习题巩固一下？'
  }
};

/**
 * 表扬鼓励语
 */
const ENCOURAGEMENT = {
  correct: [
    '太棒了！完全正确！🌟',
    '答对了！继续保持哦！',
    '厉害！这就是正确答案！',
    '完全正确！你的学习能力很强！',
    '答对啦！给自己鼓掌吧！👏'
  ],
  
  incorrect: [
    '没关系，这道题有点难，我们再想一想～',
    '差一点就对了！再试一次吧！',
    '不要灰心，错误是学习的一部分哦！',
    '没关系，让我们看看正确答案是什么～',
    '很接近了！再想想看？'
  ],
  
  attempt: [
    '勇于尝试就是进步！👍',
    '没关系，我们一起看看怎么做好吗？',
    '你已经很努力了！让我们一起学习！',
    '没关系，每一次尝试都是进步！',
    '别担心，错了也是学习的过程！'
  ],
  
  complete: [
    '全部完成！你太厉害了！🎉',
    '太棒了！今天的任务全部完成！',
    '全部做完啦！给自己一个大大的赞！',
    '完成得很好！你很认真！',
    '全部正确！你是学习小明星！⭐'
  ],
  
  encouragement: [
    '你一定可以的！相信自己能行！💪',
    '慢慢来，不着急～',
    '学习就是需要一点一点积累的！',
    '你很棒，只是需要多一点时间！',
    '没关系，每个人都是从不会到会的！'
  ]
};

/**
 * 交互服务类
 */
class InteractionService {
  constructor(options = {}) {
    this.name = options.name || '学习小助手';
    this.userProfiles = new Map(); // userId -> profile
  }

  /**
   * 获取欢迎语
   */
  getWelcomeMessage(timeOfDay = 'default', isFirstTime = true) {
    const messages = WELCOME_MESSAGES[timeOfDay] || WELCOME_MESSAGES.default;
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    if (isFirstTime) {
      return message + '\n\n你可以告诉我：\n📚 "出5道数学题"\n📖 "我想做英语阅读"\n✍️ "帮我解释一下这个概念"';
    }
    
    return message;
  }

  /**
   * 获取引导回复
   */
  getGuidanceReply(flow, context) {
    const { flowType, grade, subject, name } = context;
    
    switch (flowType) {
      case 'greeting':
        if (grade) {
          return GUIDANCE_FLOWS.first_time.with_grade(grade);
        }
        return GUIDANCE_FLOWS.first_time.no_grade;
        
      case 'welcome_back':
        return GUIDANCE_FLOWS.returning.welcome_back(name);
        
      case 'suggest_subject':
        return GUIDANCE_FLOWS.first_time.suggest_subject;
        
      case 'continue_subject':
        return GUIDANCE_FLOWS.returning.continue_subject(subject);
        
      case 'suggest_practice':
        return GUIDANCE_FLOWS.returning.suggest_practice;
        
      default:
        return '你好！想学点什么？';
    }
  }

  /**
   * 获取表扬语
 */
  getEncouragement(type = 'correct') {
    const messages = ENCOURAGEMENT[type] || ENCOURAGEMENT.correct;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * 生成学习建议
   */
  getStudySuggestion(subject, grade) {
    const suggestions = {
      math: [
        '要不要来做几道计算题练练手？',
        '今天学了什么新知识？需要我帮你出题巩固吗？',
        '数学要多练习才能熟能生巧哦！'
      ],
      english: [
        '背几个新单词怎么样？',
        '要不要读一篇英语小短文？',
        '英语要多听多说才能进步！'
      ],
      chinese: [
        '想不想读一个有趣的故事？',
        '今天学新字了吗？需要练习吗？',
        '多阅读可以提高语文水平哦！'
      ]
    };

    const subjectSuggestions = suggestions[subject] || suggestions.math;
    return subjectSuggestions[Math.floor(Math.random() * subjectSuggestions.length)];
  }

  /**
   * 解析时间获取时段
  */
  getTimeOfDay() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  }

  /**
   * 构建帮助信息
   */
  getHelpInfo() {
    return `
📚 **我可以帮你做的事情：**

🎯 **出题练习**
- "出5道数学题"
- "我想做英语阅读理解"
- "来点语文练习"

💡 **答疑解惑**
- "分数是什么意思？"
- "这道题怎么做？"
- "帮我解释一下"

📖 **学习指导**
- "教我背单词"
- "给我讲讲这个知识点"
- "我想学古诗"

🌟 **其他**
- "换一科"
- "换个话题"
- "我需要帮助"

有什么想问的或者想学的，尽管告诉我吧！
`;
  }

  /**
   * 解析用户回复，提取信息
   */
  parseUserResponse(message) {
    return {
      grade: extractGrade(message),
      subject: extractSubject(message),
      isAffirmative: this.isAffirmative(message),
      isNegative: this.isNegative(message),
      needsHelp: this.needsHelp(message)
    };
  }

  /**
   * 判断肯定回复
   */
  isAffirmative(msg) {
    const positive = ['好', '可以', '行', '要', '想', '好的', '好啊', '嗯', '对对'];
    return positive.some(p => msg.includes(p));
  }

  /**
   * 判断否定回复
   */
  isNegative(msg) {
    const negative = ['不', '没', '不要', '不行', '不想', '没有'];
    return negative.some(n => msg.includes(n));
  }

  /**
   * 判断需要帮助
   */
  needsHelp(msg) {
    return msg.includes('帮') || msg.includes('不会') || msg.includes('不懂');
  }

  /**
   * 获取每日学习提示
   */
  getDailyTip() {
    const tips = [
      '📝 每天坚持练习一点点，积少成多！',
      '📖 读书时遇到不懂的要及时问哦！',
      '✏️ 做题前先读清楚题目要求～',
      '🧠 学过的知识要经常复习才能记得更牢！',
      '💪 遇到困难不要放弃，坚持就是胜利！',
      '🎯 学习要有计划，每天定一个小目标！',
      '🌟 认真听讲，积极思考，学习效率更高！'
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }
}

module.exports = InteractionService;
