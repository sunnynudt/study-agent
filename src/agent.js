/**
 * Agent 核心逻辑 - 完整版（集成进度追踪 + 成就系统 + 每日任务）
 */

const { classifyIntent, extractGrade, extractSubject, extractQuestionCount } = require('./core/intentClassifier');
const ContextManager = require('./core/contextManager');
const { QuestionBank } = require('./bank/questionBank');
const InteractionService = require('./services/interactionService');
const ProgressTracker = require('./progress/progressTracker');
const AchievementSystem = require('./achievements/achievementSystem');
const DailyTasks = require('./tasks/dailyTasks');
const KnowledgeGraph = require('./knowledgeGraph/knowledgeGraph');
const { gradeToChinese } = require('./utils/helpers');

const questionBank = new QuestionBank();
const interaction = new InteractionService();
const progressTracker = new ProgressTracker();
const achievementSystem = new AchievementSystem();
const dailyTasks = new DailyTasks();
const knowledgeGraph = new KnowledgeGraph();

const SYSTEM_PROMPT = `你是上海市小学学习小助手 🍬，专门帮助二、三、四、五年级的小学生学习数学、英语和语文。

## 你的特点
- 亲切、有耐心，用小朋友能理解的方式解释问题
- 善于鼓励，当小朋友做对题目时要表扬
- 讲解清晰，复杂的概念要拆分成简单步骤
- 对于 2-5 年级学生，内容难度要适中
- 会根据学习进度给予成就勋章

## 功能
1. **出题目**：根据年级和学科出练习题（使用题库）
2. **答疑问**：回答学习中的困惑
3. **讲解**：解释知识点和题目
4. **检查答案**：核对答案并给予反馈和进度记录
5. **查看进度**：可以查看学习报告和成就`;

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
    const welcome = interaction.getWelcomeMessage(interaction.getTimeOfDay(), false);
    yield { role: 'assistant', content: welcome };
    return;
  }
  
  // 查看进度/报告
  if (message.includes('进度') || message.includes('报告') || message.includes('统计')) {
    const report = progressTracker.generateReport(userId);
    let response = `📊 **学习报告**\n\n`;
    response += `📅 ${report.date}\n\n`;
    response += `**总览**\n`;
    response += `- 总题数：${report.summary.总题数}\n`;
    response += `- 正确数：${report.summary.正确数}\n`;
    response += `- 正确率：${report.summary.正确率}\n`;
    response += `- 连续学习：${report.summary.连续学习}\n\n`;
    response += `**各科统计**\n`;
    response += `- 数学：${report.subjects.数学}\n`;
    response += `- 英语：${report.subjects.英语}\n`;
    response += `- 语文：${report.subjects.语文}\n\n`;
    response += `**成就勋章**\n`;
    response += achievementSystem.formatAchievements(progressTracker.getProgress(userId));
    yield { role: 'assistant', content: response };
    return;
  }
  
  // 查看成就
  if (message.includes('成就') || message.includes('勋章')) {
    const achievements = achievementSystem.getAllAchievements(progressTracker.getProgress(userId));
    let response = `🏆 **我的成就** (${achievements.earned}/${achievements.total})\n\n`;
    response += achievementSystem.formatAchievements(progressTracker.getProgress(userId));
    response += `\n\n${achievementSystem.getNextGoal(progressTracker.getProgress(userId))}`;
    yield { role: 'assistant', content: response };
    return;
  }
  
  // 查看错题本
  if (message.includes('错题') || message.includes('复习')) {
    const wrongQuestions = progressTracker.getWrongQuestions(userId);
    if (wrongQuestions.length === 0) {
      yield { role: 'assistant', content: '📝 错题本是空的！说明你都很厉害，没有做错～继续保持！' };
    } else {
      let response = `📝 **错题本** (共${wrongQuestions.length}题)\n\n`;
      wrongQuestions.slice(-5).forEach((q, i) => {
        response += `**${i + 1}.** ${q.question}\n`;
        response += `   答案：${q.answer}\n`;
        response += `   学科：${q.subject}\n\n`;
      });
      response += `💡 经常复习错题，可以避免再犯同样的错误哦！`;
      yield { role: 'assistant', content: response };
    }
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
    
    response += `\n💡 做完后可以告诉我答案，我来帮你检查！\n`;
    response += `📊 完成答题后可以查看学习进度报告哦～`;
    
    // 保存题目到上下文
    cm.updateState(userId, { 
      inQuestionSession: true, 
      questions,
      currentQuestionIndex: 0,
      subject: targetSubject
    });
    
    yield { role: 'assistant', content: response };
    return;
  }
  
  // 检查答案
  if (intent === 'check_answer' || summary.state?.inQuestionSession) {
    const questions = summary.state?.questions || [];
    if (questions.length > 0) {
      const currentQ = questions[summary.state.currentQuestionIndex];
      const result = questionBank.checkAnswer(summary.state.subject || 'math', currentQ, message);
      
      // 记录答题
      progressTracker.recordAnswer(userId, summary.state.subject || 'math', result.correct, currentQ, topic);
      
      // 记录每日任务
      const targetSubject = summary.state.subject || 'math';
      dailyTasks.recordCompletion(userId, targetSubject, 1);
      
      if (result.correct) {
        yield { role: 'assistant', content: interaction.getEncouragement('correct') };
        
        // 检查新成就
        const newAchievements = achievementSystem.checkAchievements(progressTracker.getProgress(userId));
        if (newAchievements.length > 0) {
          yield { role: 'assistant', content: achievementSystem.celebrateNewAchievement(newAchievements[0]) };
        }
        
        // 下一题
        const nextIndex = summary.state.currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
          cm.updateState(userId, { currentQuestionIndex: nextIndex });
          yield { role: 'assistant', content: `下一题：**${questions[nextIndex].q}**` };
        } else {
          cm.updateState(userId, { inQuestionSession: false, currentQuestionIndex: 0 });
          const finalResponse = interaction.getEncouragement('complete');
          const goal = achievementSystem.getNextGoal(progressTracker.getProgress(userId));
          yield { role: 'assistant', content: `${finalResponse}\n\n${goal}` };
        }
      } else {
        yield { role: 'assistant', content: interaction.getEncouragement('incorrect') + `\n\n**答案是：${result.correctAnswer}**` };
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
    const newSubject = subject || 'math';
    yield { role: 'assistant', content: `好的！想学${subjectMap[newSubject]}吗？可以说"出${grade}道${subjectMap[newSubject]}题"或者直接问我问题！` };
    return;
  }
  
  // 查看每日任务
  if (message.includes('任务') || message.includes('今日任务') || message.includes('每日任务')) {
    const status = dailyTasks.getTaskStatus(userId);
    let response = `📋 **今日学习任务**\n\n`;
    status.status.forEach(s => { response += `${s}\n`; });
    response += `\n📊 总体进度：${status.overallPercentage}%\n`;
    response += `🔥 连续完成：${status.streak}天\n`;
    
    if (status.isComplete) {
      response += `\n🎉 太棒了！今天的任务全部完成！`;
    } else {
      response += `\n💪 继续加油！快完成今天的任务了！`;
    }
    
    yield { role: 'assistant', content: response };
    return;
  }
  
  // 设置每日任务
  if (message.includes('设置') && (message.includes('数学') || message.includes('英语') || message.includes('语文'))) {
    const count = extractQuestionCount(message) || 5;
    const targetSubject = subject || 'math';
    dailyTasks.updateDailyGoal(userId, targetSubject, count);
    const subjectMap = { math: '数学', english: '英语', chinese: '语文' };
    yield { role: 'assistant', content: `✅ 已设置${subjectMap[targetSubject]}每日任务：${count}道题` };
    return;
  }
  
  // 查看知识图谱
  if (message.includes('知识图谱') || message.includes('掌握情况') || message.includes('学习情况')) {
    const graphText = knowledgeGraph.formatAsciiGraph(userId);
    yield { role: 'assistant', content: graphText };
    return;
  }
  
  // 查看本周统计
  if (message.includes('本周') || message.includes('周统计')) {
    const stats = dailyTasks.getWeeklyStats(userId);
    let response = `📊 **本周学习统计**\n\n`;
    
    for (const day of stats.days) {
      const total = day.math + day.english + day.chinese;
      response += `${day.name}: ${total}题 `;
      response += `(数:${day.math} 英:${day.english} 语:${day.chinese})\n`;
    }
    
    response += `\n各科总计：\n`;
    for (const [name, count] of Object.entries(stats.subjects)) {
      response += `${name}: ${count}题\n`;
    }
    
    yield { role: 'assistant', content: response };
    return;
  }
  
  // 默认回复
  yield { role: 'user', content: message };
}

module.exports = { agent };
