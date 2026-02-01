/**
 * 意图分类器 - 智能识别用户意图
 */

const INTENT_PATTERNS = {
  greeting: [
    /^(你好|hi|hello|嗨|在吗|在不在)/i,
    /(早安|晚安|早上好|下午好)/i,
    /^(hi|hey)/i
  ],
  
  generate_questions: [
    /出.*题|出.*道/,
    /做.*[题卷子练习]/,
    /练习.*题/,
    /我要.*题/,
    /给.*练习/,
    /来.*题/,
    /测试.*一下/
  ],
  
  answer_question: [
    /为什么/,
    /什么是/,
    /什么意思/,
    /怎么/,
    /为什么/,
    /解释/,
    /不懂/,
    /不理解/,
    /不明白/
  ],
  
  explain_concept: [
    /讲.*一下/,
    /教.*一下/,
    /教.*怎么/,
    /讲讲/,
    /说.*是什么/
  ],
  
  check_answer: [
    /对不对/,
    /正确吗/,
    /帮我.*看看/,
    /这样.*对吗/,
    /答案.*是/,
    /我.*得.*分/
  ],
  
  request_help: [
    /帮.*一下/,
    /帮帮我/,
    /救命/,
    /不会.*做/,
    /做.*不来/
  ],
  
  praise_encourage: [
    /做完了/,
    /做好了/,
    /完成了/,
    /对了/,
    /懂啦/
  ],
  
  change_subject: [
    /换.*科/,
    /换个.*学/,
    /学.*英语/,
    /学.*数学/,
    /学.*语文/
  ],
  
  feedback: [
    /太难了/,
    /太简单/,
    /没挑战/,
    /没意思/,
    /不喜欢/
  ]
};

const SUBJECT_KEYWORDS = {
  math: ['数学', '计算', '加减乘除', '分数', '几何', '应用题', '乘法', '除法', '小数', '百分数'],
  english: ['英语', 'english', '单词', ' vocabulary', '阅读', '听力', '语法', '句子', '字母', '作文'],
  chinese: ['语文', '阅读', '作文', '生字', '古诗', '背诵', '词语', '成语', '默写', '写字']
};

/**
 * 分类用户意图
 */
function classifyIntent(message) {
  const lower = message.toLowerCase();
  
  // 按优先级检查
  if (matchAny(message, INTENT_PATTERNS.greeting)) return 'greeting';
  if (matchAny(message, INTENT_PATTERNS.generate_questions)) return 'generate_questions';
  if (matchAny(message, INTENT_PATTERNS.answer_question)) return 'answer_question';
  if (matchAny(message, INTENT_PATTERNS.explain_concept)) return 'explain_concept';
  if (matchAny(message, INTENT_PATTERNS.check_answer)) return 'check_answer';
  if (matchAny(message, INTENT_PATTERNS.request_help)) return 'request_help';
  if (matchAny(message, INTENT_PATTERNS.praise_encourage)) return 'praise_encourage';
  if (matchAny(message, INTENT_PATTERNS.change_subject)) return 'change_subject';
  if (matchAny(message, INTENT_PATTERNS.feedback)) return 'feedback';
  
  return 'general';
}

/**
 * 提取年级信息
 */
function extractGrade(message) {
  const gradeMap = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6,
    '一年级': 1, '二年级': 2, '三年级': 3, '四年级': 4, '五年级': 5, '六年级': 6
  };
  
  // 匹配模式：二年级、3年级、3 年级
  const patterns = [
    /([一二三四五六])年级/,
    /(\d)\s*年级/,
    /(\d)年级/
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      const grade = gradeMap[match[1]] || parseInt(match[1]);
      if (grade >= 2 && grade <= 5) return grade;
    }
  }
  
  return null;
}

/**
 * 提取学科信息
 */
function extractSubject(message) {
  const lower = message.toLowerCase();
  
  for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return subject;
    }
  }
  
  return null;
}

/**
 * 提取题目数量
 */
function extractQuestionCount(message) {
  const match = message.match(/(\d+)\s*道?/);
  return match ? parseInt(match[1]) : 5;
}

/**
 * 提取知识点
 */
function extractKnowledgePoint(message) {
  const knowledgePoints = {
    // 数学
    '加减法': ['加法', '减法', '加减', '运算'],
    '乘法': ['乘法', '乘', '口诀'],
    '除法': ['除法', '除', '除以'],
    '分数': ['分数', '几分之几'],
    '小数': ['小数', '小数点'],
    '几何': ['图形', '面积', '周长', '三角形', '正方形'],
    // 英语
    '词汇': ['单词', '词汇', '背单词'],
    '语法': ['语法', '时态', '词性'],
    '阅读': ['阅读', '读文章'],
    '写作': ['写作', '作文', '写句子'],
    // 语文
    '生字': ['生字', '识字', '写字'],
    '阅读理解': ['阅读理解', '理解'],
    '作文': ['作文', '写作文', '写话'],
    '古诗': ['古诗', '古诗词', '背诵']
  };
  
  for (const [point, keywords] of Object.entries(knowledgePoints)) {
    if (keywords.some(kw => message.includes(kw))) {
      return point;
    }
  }
  
  return null;
}

/**
 * 匹配任意模式
 */
function matchAny(text, patterns) {
  return patterns.some(pattern => pattern.test(text));
}

module.exports = {
  classifyIntent,
  extractGrade,
  extractSubject,
  extractQuestionCount,
  extractKnowledgePoint,
  INTENT_PATTERNS,
  SUBJECT_KEYWORDS
};
