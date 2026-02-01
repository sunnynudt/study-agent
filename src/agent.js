/**
 * Agent 核心逻辑 - 集成版
 */

const { classifyIntent, extractGrade, extractSubject, extractQuestionCount } = require('./core/intentClassifier');
const ContextManager = require('./core/contextManager');
const { QuestionBank } = require('./bank/questionBank');
const InteractionService = require('./services/interactionService');
const { randomPick, gradeToChinese } = require('./utils/helpers');

const questionBank = new QuestionBank();
const interaction = new InteractionService();

const SYSTEM_PROMPT = `你是上海市小学学习小助手 🍬，专门帮助二、三、四、五年级的小学生学习数学、英语和语文。

## 你的特点
- 亲切、有耐心，用小朋友能理解的方式解释问题
- 善于鼓励，当小朋友做对题目时要表扬
- 讲解清晰，复杂的概念要拆分成简单步骤
- 对于 2-5 年级学生，内容难度要适中

## 功能
1. **出题目**：根据年级和学科出练习题（使用题库）
2. **答疑问**：回答学习中的困惑
3. **讲解**：解释知识点和题目
4. **检查答案**：核对答案并给予反馈`;

function extractTopic(message) {
  const topics = {
    '加减法': 'addition', '乘法': 'multiplication', '除法': 'division',
    '分数': 'fraction', '小数': 'decimal', '百分数': 'percentage',
    '词汇': 'vocabulary', '语法': 'grammar', '阅读': 'reading',
    '生字': 'vocabulary', '古诗': 'poem', '作文': 'composition'
  };
  
  for (const [key, value] of Object.entries(topics)) {
    if (message.includes(key)) return value;
  }
  return null;
}

async function* agent(input, context) {
  const { message, sessionId } = input;
  const userId = sessionId || 'default';
  const cm = new ContextManager();
  const summary = cm.getSummary(userId);
  
  const grade = extractGrade(message) || summary.grade || 3;
  const subject = extractSubject(message) || summary.subject;
  const intent = classifyIntent(message);
  const topic = extractTopic(message);
  
  // 更新上下文
  cm.setGrade(userId, grade);
  if (subject) cm.setSubject(userId, subject);
  
  // 打招呼
  if (intent === 'greeting') {
    yield { role: 'assistant', content: interaction.getWelcomeMessage(interaction.getTimeOfDay(), false) };
    return;
  }
  
  // 出题请求
  if (intent === 'generate_questions') {
    const subjectMap = { math: '数学', english: '英语', chinese: '语文' };
    const targetSubject = subject || 'math';
    const count = extractQuestionCount(message) || 5;
    
    // 从题库获取题目
    const questions = questionBank.getQuestions(targetSubject, { grade, count, type: topic || 'mixed' });
    
    let response = `📚 这里是${gradeToChinese(grade)}${subjectMap[targetSubject]}练习题，共${count}道：\n\n`;
    
    questions.forEach((q, i) => {
      response += `**第${i + 1}题** ${q.q}\n\n`;
    });
    
    response += `\n💡 做完后可以告诉我答案，我来帮你检查！`;
    
    // 保存题目到上下文
    cm.updateState(userId, { 
      inQuestionSession: true, 
      questions,
      currentQuestionIndex: 0 
    });
    
    yield { role: 'assistant', content: response };
    return;
  }
  
  // 检查答案
  if (intent === 'check_answer' || summary.state?.inQuestionSession) {
    const questions = summary.state?.questions || [];
    if (questions.length > 0) {
      // 用户在回答题目
      const result = questionBank.checkAnswer(subject || 'math', questions[summary.state.currentQuestionIndex], message);
      
      if (result.correct) {
        yield { role: 'assistant', content: interaction.getEncouragement('correct') };
        
        // 下一题
        const nextIndex = summary.state.currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
          cm.updateState(userId, { currentQuestionIndex: nextIndex });
          yield { role: 'assistant', content: `下一题：**${questions[nextIndex].q}**` };
        } else {
          cm.updateState(userId, { inQuestionSession: false, currentQuestionIndex: 0 });
          yield { role: 'assistant', content: interaction.getEncouragement('complete') };
        }
      } else {
        yield { role: 'assistant', content: interaction.getEncouragement('incorrect') + `\n\n答案是：${result.correctAnswer}` };
      }
      return;
    }
  }
  
  // 答疑请求
  if (intent === 'answer_question' || intent === 'explain_concept') {
    yield {
      role: 'user',
      content: `请用小学生能理解的方式解释：${message}`
    };
    return;
  }
  
  // 切换学科
  if (intent === 'change_subject') {
    const subjectMap = { math: '数学', english: '英语', chinese: '语文' };
    yield { role: 'assistant', content: `好的！想学${subjectMap[subject]}吗？可以说"出${grade}道${subjectMap[subject]}题"或者直接问我问题！` };
    return;
  }
  
  // 默认回复
  yield { role: 'user', content: message };
}

module.exports = { agent, classifyIntent, extractGrade, extractSubject };
