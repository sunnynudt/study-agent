/**
 * Agent 核心逻辑 - 完整版（集成进度追踪 + 成就系统 + 每日任务 + 挑战系统 + 学习伙伴）
 */

const { classifyIntent, extractGrade, extractSubject, extractQuestionCount } = require('./core/intentClassifier');
const ContextManager = require('./core/contextManager');
const { QuestionBank } = require('./bank/questionBank');
const InteractionService = require('./services/interactionService');
const ProgressTracker = require('./progress/progressTracker');
const AchievementSystem = require('./achievements/achievementSystem');
const DailyTasks = require('./tasks/dailyTasks');
const KnowledgeGraph = require('./knowledgeGraph/knowledgeGraph');
const ChallengeSystem = require('./challenges/challengeSystem');
const LearningPet = require('./pet/learningPet');
const SmartQuestionEngine = require('./engine/smartQuestionEngine');
const ParentReportSystem = require('./report/parentReport');
const { gradeToChinese } = require('./utils/helpers');

// 实例化新模块
const questionBank = new QuestionBank();
const interaction = new InteractionService();
const progressTracker = new ProgressTracker();
const achievementSystem = new AchievementSystem();
const dailyTasks = new DailyTasks();
const knowledgeGraph = new KnowledgeGraph();
const challengeSystem = new ChallengeSystem();
const learningPet = new LearningPet();
const smartEngine = new SmartQuestionEngine();
const parentReport = new ParentReportSystem();

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
  
  // ========== 🎮 挑战系统 ==========
  if (message.includes('挑战') || message.includes('今日挑战') || message.includes('挑战列表')) {
    const challengeList = challengeSystem.formatChallengeList(grade);
    yield { role: 'assistant', content: challengeList };
    return;
  }
  
  if (message.includes('开始挑战')) {
    const challengeMap = {
      '闪电计算': 'speed_math',
      '智慧数学': 'mind_math',
      '单词大王': 'word_master',
      '口语之星': 'speaking_star',
      '诗词达人': 'poetry_master',
      '故事大王': 'story_teller',
      '每日boss': 'daily_boss',
      '周末冠军': 'weekend_champion'
    };
    
    for (const [name, id] of Object.entries(challengeMap)) {
      if (message.includes(name)) {
        const result = challengeSystem.startChallenge(userId, id, grade);
        if (result.success) {
          let response = `🎮 **${result.challenge.name}**\n\n`;
          response += `${result.challenge.description}\n\n`;
          response += `📋 ${result.challenge.instructions}\n\n`;
          response += `💡 输入"完成挑战 ${name} [正确题数/总题数]"来结算！\n`;
          response += `例如："完成挑战 闪电计算 8/10"`;
          yield { role: 'assistant', content: response };
        } else {
          yield { role: 'assistant', content: result.message };
        }
        return;
      }
    }
  }
  
  if (message.includes('完成挑战')) {
    // 解析结果
    const match = message.match(/完成挑战.*?(\d+)\/(\d+)/);
    if (match) {
      const correct = parseInt(match[1]);
      const total = parseInt(match[2]);
      const isPerfect = correct === total;
      
      // 默认使用第一个挑战
      const challengeId = 'speed_math';
      const result = challengeSystem.completeChallenge(userId, challengeId, {
        correct,
        total,
        isPerfect,
        timeSpent: 60
      });
      
      let response = `🎉 挑战完成！\n\n`;
      response += `得分：${result.score.basePoints} + ${result.score.bonusPoints} = ${result.score.total}分\n`;
      response += `🔥 连续满分：${result.streak}次\n`;
      
      if (result.newAchievements.length > 0) {
        response += `\n🏆 新成就解锁：${result.newAchievements[0].name}！`;
      }
      
      yield { role: 'assistant', content: response };
      return;
    }
  }
  
  if (message.includes('挑战成就') || message.includes('挑战勋章')) {
    const achievementList = challengeSystem.formatAchievements(userId);
    yield { role: 'assistant', content: achievementList };
    return;
  }
  
  if (message.includes('挑战排行') || message.includes('排行榜')) {
    const leaderboard = challengeSystem.formatLeaderboard(userId);
    yield { role: 'assistant', content: leaderboard };
    return;
  }
  
  // ========== 🦖 学习伙伴 ==========
  if (message.includes('我的伙伴') || message.includes('我的宠物') || message.includes('小恐龙') || message.includes('小猫咪')) {
    // 检查是否已有宠物
    const petData = learningPet.getPetData(userId);
    if (petData.type) {
      const status = learningPet.getPetStatus(userId);
      yield { role: 'assistant', content: status.message };
    } else {
      const selection = learningPet.formatPetSelection();
      yield { role: 'assistant', content: selection };
    }
    return;
  }
  
  if (message.includes('我要小')) {
    const petMap = {
      '小恐龙': 'dino',
      '小猫咪': 'cat',
      '小狗': 'dog',
      '小熊猫': 'panda',
      '小龙人': 'dragon'
    };
    
    for (const [name, type] of Object.entries(petMap)) {
      if (message.includes(name)) {
        const result = learningPet.selectPet(userId, type);
        yield { role: 'assistant', content: result.message };
        return;
      }
    }
  }
  
  if (message.includes('喂') && (message.includes('吃') || message.includes('食'))) {
    const foodMap = {
      '水果': '水果',
      '糖果': '糖果',
      '骨头': '骨头',
      '竹子': '竹子',
      '肉': '肉',
      '星星': '星星'
    };
    
    for (const [name, food] of Object.entries(foodMap)) {
      if (message.includes(name)) {
        const result = learningPet.feedPet(userId, food);
        yield { role: 'assistant', content: result.message };
        return;
      }
    }
  }
  
  if (message.includes('宠物状态') || message.includes('伙伴状态')) {
    const status = learningPet.getPetStatus(userId);
    yield { role: 'assistant', content: status.message };
    return;
  }
  
  if (message.includes('宠物技能') || message.includes('伙伴技能')) {
    const pet = learningPet.getPetData(userId);
    const skills = learningPet.formatPetSkills(pet);
    yield { role: 'assistant', content: skills };
    return;
  }
  
  if (message.includes('加油') || message.includes('鼓励') || message.includes('打气')) {
    const encouragement = learningPet.getEncouragement(userId);
    yield { role: 'assistant', content: encouragement };
    return;
  }
  
  // ========== 🎯 智能出题 ==========
  if (message.includes('复习错题') || message.includes('错题练习')) {
    const userProgress = progressTracker.getProgress(userId);
    const result = smartEngine.generateFromWrongQuestions(userProgress, subject || 'math', grade, 5);
    let response = `${result.message}\n\n`;
    
    result.questions.forEach((q, i) => {
      response += `**第${i + 1}题** ${q.q}\n\n`;
    });
    
    response += `💡 做完后告诉我答案，我来检查！`;
    yield { role: 'assistant', content: response };
    return;
  }
  
  if (message.includes('智能出题') || message.includes('个性化出题')) {
    const userProgress = progressTracker.getProgress(userId);
    const menu = smartEngine.formatQuestionMenu(userProgress, grade);
    yield { role: 'assistant', content: menu };
    return;
  }
  
  if (message.includes('挑战题目') || message.includes('有难度')) {
    const userProgress = progressTracker.getProgress(userId);
    const questions = smartEngine.generateSmartQuestions(userProgress, {
      subject: subject || 'math',
      grade,
      count: 5,
      mode: 'challenge'
    });
    
    let response = `🔥 **挑战模式** - 准备好了吗？\n\n`;
    questions.forEach((q, i) => {
      response += `**第${i + 1}题** ${q.q}\n\n`;
    });
    response += `💪 加油！这些题目可能有点难度哦！`;
    yield { role: 'assistant', content: response };
    return;
  }
  
  // ========== 👨‍👩‍👧 家长端报告 ==========
  if (message.includes('家长报告') || message.includes('给我看报告') || message.includes('详细报告')) {
    const report = parentReport.generateDailyReport(userId);
    const formatted = parentReport.formatReport(report);
    yield { role: 'assistant', content: formatted };
    return;
  }
  
  if (message.includes('周报告') || message.includes('本周报告')) {
    const report = parentReport.generateWeeklyReport(userId);
    const formatted = parentReport.formatReport(report);
    yield { role: 'assistant', content: formatted };
    return;
  }
  
  if (message.includes('月报告') || message.includes('月度报告') || message.includes('本月总结')) {
    const report = parentReport.generateMonthlyReport(userId);
    const formatted = parentReport.formatReport(report);
    yield { role: 'assistant', content: formatted };
    return;
  }
  
  // 默认回复
  yield { role: 'user', content: message };
}

module.exports = { agent };
