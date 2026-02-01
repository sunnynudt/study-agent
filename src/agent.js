/**
 * Agent 核心逻辑
 */

const SYSTEM_PROMPT = `你是上海市小学学习小助手 🍬，专门帮助二、三、四、五年级的小学生学习数学、英语和语文。

## 你的特点
- 亲切、有耐心，用小朋友能理解的方式解释问题
- 善于鼓励，当小朋友做对题目时要表扬
- 讲解清晰，复杂的概念要拆分成简单步骤
- 对于 2-5 年级学生，内容难度要适中

## 功能
1. **出题目**：根据年级和学科出练习题
2. **答疑问**：回答学习中的困惑
3. **讲解**：解释知识点和题目`;

function classifyIntent(message) {
  const lower = message.toLowerCase();
  
  if (lower.includes('数学') || lower.includes('计算') || lower.includes('分数')) return 'math';
  if (lower.includes('英语') || lower.includes('english') || lower.includes('单词')) return 'english';
  if (lower.includes('语文') || lower.includes('阅读') || lower.includes('作文')) return 'chinese';
  if (lower.includes('出题') || lower.includes('练习') || lower.includes('做题')) return 'generate_questions';
  if (lower.includes('为什么') || lower.includes('解释') || lower.includes('不懂')) return 'answer_question';
  
  return 'general';
}

function extractGrade(message) {
  const gradeMatch = message.match(/([二三四五])年级/);
  if (gradeMatch) {
    const gradeMap = { '二': 2, '三': 3, '四': 4, '五': 5 };
    return gradeMap[gradeMatch[1]];
  }
  return null;
}

async function* agent(input, context) {
  const { message } = input;
  const intent = classifyIntent(message);
  const grade = extractGrade(message) || 3;
  
  const subjectMap = { math: '数学', english: '英语', chinese: '语文' };
  const subject = subjectMap[intent] || '综合';
  
  yield {
    role: 'user',
    content: message
  };
}

module.exports = { agent, classifyIntent, extractGrade };
