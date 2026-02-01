/**
 * Study Agent 测试套件
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

// 导入模块
const { 
  classifyIntent, 
  extractGrade, 
  extractSubject, 
  extractQuestionCount,
  INTENT_PATTERNS,
  SUBJECT_KEYWORDS
} = require('../src/core/intentClassifier');
const ContextManager = require('../src/core/contextManager');
const { QuestionBank, MathQuestionBank, EnglishQuestionBank, ChineseQuestionBank } = require('../src/bank/questionBank');
const ProgressTracker = require('../src/progress/progressTracker');
const AchievementSystem = require('../src/achievements/achievementSystem');

// 测试用例集合
const testCases = {
  // 意图识别测试
  intentClassification: [
    { input: '你好', expected: 'greeting', desc: '打招呼' },
    { input: '在吗', expected: 'greeting', desc: '询问是否在线' },
    { input: '帮我出5道数学题', expected: 'generate_questions', desc: '出数学题' },
    { input: '我想做英语练习', expected: 'generate_questions', desc: '做英语练习' },
    { input: '什么是分数？', expected: 'answer_question', desc: '询问概念' },
    { input: '这道题怎么做', expected: 'answer_question', desc: '请求帮助' },
    { input: '帮我检查一下', expected: 'request_help', desc: '检查答案' },
    { input: '换英语吧', expected: 'general', desc: '切换学科' },
    { input: '太难了', expected: 'feedback', desc: '反馈太难' },
    { input: '我做完了', expected: 'praise_encourage', desc: '完成表扬' },
    { input: '查看进度', expected: 'general', desc: '查看进度' },
    { input: '我的成就', expected: 'general', desc: '查看成就' },
  ],

  // 年级提取测试
  gradeExtraction: [
    { input: '二年级', expected: 2, desc: '二年级' },
    { input: '三年级', expected: 3, desc: '三年级' },
    { input: '四年级', expected: 4, desc: '四年级' },
    { input: '五年级', expected: 5, desc: '五年级' },
    { input: '帮我出3年级的题', expected: 3, desc: '数字3年级' },
    { input: '我想做数学题', expected: null, desc: '无年级信息' },
  ],

  // 学科提取测试
  subjectExtraction: [
    { input: '数学', expected: 'math', desc: '数学' },
    { input: '英语', expected: 'english', desc: '英语' },
    { input: '语文', expected: 'chinese', desc: '语文' },
    { input: '我想做计算题', expected: 'math', desc: '计算题' },
    { input: '背单词', expected: 'english', desc: '背单词' },
    { input: '古诗词', expected: 'chinese', desc: '古诗词' },
  ],

  // 题目数量测试
  questionCount: [
    { input: '出5道题', expected: 5, desc: '5道题' },
    { input: '出3道计算题', expected: 3, desc: '3道计算题' },
    { input: '出题', expected: 5, desc: '默认5道' },
  ]
};

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('🧪 开始运行 Study Agent 测试...\n');
  console.log('='.repeat(50));
  
  let passed = 0;
  let failed = 0;

  // 1. 意图分类测试
  console.log('\n📌 1. 意图分类测试:');
  for (const { input, expected, desc } of testCases.intentClassification) {
    try {
      const result = classifyIntent(input);
      assert.strictEqual(result, expected, `${desc} 失败`);
      console.log(`  ✅ ${desc}: "${input}"`);
      passed++;
    } catch (err) {
      console.log(`  ❌ ${desc}: ${err.message}`);
      failed++;
    }
  }

  // 2. 年级提取测试
  console.log('\n📌 2. 年级提取测试:');
  for (const { input, expected, desc } of testCases.gradeExtraction) {
    try {
      const result = extractGrade(input);
      assert.strictEqual(result, expected, `${desc} 失败`);
      console.log(`  ✅ ${desc}: "${input}" -> ${result}`);
      passed++;
    } catch (err) {
      console.log(`  ❌ ${desc}: ${err.message}`);
      failed++;
    }
  }

  // 3. 学科提取测试
  console.log('\n📌 3. 学科提取测试:');
  for (const { input, expected, desc } of testCases.subjectExtraction) {
    try {
      const result = extractSubject(input);
      assert.strictEqual(result, expected, `${desc} 失败`);
      console.log(`  ✅ ${desc}: "${input}" -> ${result}`);
      passed++;
    } catch (err) {
      console.log(`  ❌ ${desc}: ${err.message}`);
      failed++;
    }
  }

  // 4. 题目数量测试
  console.log('\n📌 4. 题目数量测试:');
  for (const { input, expected, desc } of testCases.questionCount) {
    try {
      const result = extractQuestionCount(input);
      assert.strictEqual(result, expected, `${desc} 失败`);
      console.log(`  ✅ ${desc}: "${input}" -> ${result}`);
      passed++;
    } catch (err) {
      console.log(`  ❌ ${desc}: ${err.message}`);
      failed++;
    }
  }

  // 5. ContextManager 测试
  console.log('\n📌 5. ContextManager 测试:');
  try {
    const manager = new ContextManager({ maxHistory: 10 });
    
    const summary1 = manager.getSummary('testUser');
    assert.strictEqual(summary1.userId, 'testUser', '创建上下文失败');
    assert.strictEqual(summary1.grade, 3, '默认年级错误');
    console.log('  ✅ 创建上下文');
    passed++;

    manager.setSubject('testUser', 'math');
    const summary2 = manager.getSummary('testUser');
    assert.strictEqual(summary2.subject, 'math', '设置学科失败');
    console.log('  ✅ 设置学科');
    passed++;

    manager.addToHistory('testUser', { role: 'user', content: '你好' });
    const summary3 = manager.getSummary('testUser');
    assert.strictEqual(summary3.messageCount, 1, '添加历史失败');
    console.log('  ✅ 添加历史记录');
    passed++;

    manager.reset('testUser');
    const summary4 = manager.getSummary('testUser');
    assert.strictEqual(summary4.messageCount, 0, '重置失败');
    console.log('  ✅ 重置上下文');
    passed++;

  } catch (err) {
    console.log(`  ❌ ContextManager 测试失败: ${err.message}`);
    failed++;
  }

  // 6. 题库模块测试
  console.log('\n📌 6. 题库模块测试:');
  try {
    const bank = new QuestionBank();
    
    // 数学题库
    const mathQuestions = bank.getQuestions('math', { grade: 3, count: 5, type: 'mixed' });
    assert(mathQuestions.length > 0, '数学题数量错误');
    assert(mathQuestions[0].subject === 'math', '学科标记错误');
    console.log(`  ✅ 数学题库出题 (${mathQuestions.length}题)`);
    passed++;

    // 英语题库
    const englishQuestions = bank.getQuestions('english', { grade: 3, count: 5 });
    assert(englishQuestions.length > 0, '英语题数量错误');
    console.log(`  ✅ 英语题库出题 (${englishQuestions.length}题)`);
    passed++;

    // 检查答案
    const result = bank.checkAnswer('math', mathQuestions[0], mathQuestions[0].a);
    assert(result.correct === true, '正确答案应该通过');
    console.log('  ✅ 答案检查功能');
    passed++;

    const wrongResult = bank.checkAnswer('math', mathQuestions[0], 'wrong');
    assert(wrongResult.correct === false, '错误答案应该不通过');
    console.log('  ✅ 错误答案识别');
    passed++;

  } catch (err) {
    console.log(`  ❌ 题库模块测试失败: ${err.message}`);
    failed++;
  }

  // 7. 进度追踪测试
  console.log('\n📌 7. 进度追踪测试:');
  try {
    const tracker = new ProgressTracker();
    const testUserId = 'test_user_' + Date.now();
    
    // 记录答题
    tracker.recordAnswer(testUserId, 'math', true, { q: '1+1=?', a: '2' }, 'addition');
    tracker.recordAnswer(testUserId, 'math', false, { q: '2+2=?', a: '4' }, 'addition');
    tracker.recordAnswer(testUserId, 'english', true, { q: 'apple中文', a: '苹果' }, 'vocabulary');
    
    const summary = tracker.getSummary(testUserId);
    assert.strictEqual(summary.totalQuestions, 3, '总题数错误');
    assert.strictEqual(summary.correctAnswers, 2, '正确数错误');
    assert(summary.accuracy === '67%', '正确率计算错误');
    console.log('  ✅ 记录答题');
    passed++;

    // 获取弱项
    const weakPoints = tracker.getWeakPoints(testUserId);
    assert(weakPoints.length > 0, '应该检测到弱项');
    console.log('  ✅ 弱项分析');
    passed++;

    // 获取错题本
    const wrongQuestions = tracker.getWrongQuestions(testUserId);
    assert.strictEqual(wrongQuestions.length, 1, '错题数量错误');
    console.log('  ✅ 错题本');
    passed++;

    // 生成报告
    const report = tracker.generateReport(testUserId);
    assert(report.title === '📊 学习报告', '报告标题错误');
    assert(report.summary, '报告缺少摘要');
    console.log('  ✅ 生成学习报告');
    passed++;

  } catch (err) {
    console.log(`  ❌ 进度追踪测试失败: ${err.message}`);
    failed++;
  }

  // 8. 成就系统测试
  console.log('\n📌 8. 成就系统测试:');
  try {
    const achievements = new AchievementSystem();
    
    // 创建测试进度
    const testProgress = {
      totalQuestions: 15,
      correctAnswers: 12,
      streak: 3,
      subjects: {
        math: { questions: 10, correct: 8, topics: {} },
        english: { questions: 3, correct: 2, topics: {} },
        chinese: { questions: 2, correct: 2, topics: {} }
      },
      wrongQuestions: [{ q: 'test', a: 'a' }]
    };
    
    // 检查成就
    const earnedAchievements = achievements.checkAchievements(testProgress);
    assert(earnedAchievements.length > 0, '应该获得成就');
    console.log('  ✅ 成就检查');
    passed++;

    // 获取成就列表
    const allAchievements = achievements.getAllAchievements(testProgress);
    assert(allAchievements.total > 0, '总成就数错误');
    assert(allAchievements.earned >= 0, '已获得成就数错误');
    console.log('  ✅ 成就列表');
    passed++;

    // 庆祝消息
    const celebration = achievements.celebrateNewAchievement({
      id: 'test',
      name: '测试成就',
      description: '测试描述'
    });
    assert(celebration.includes('测试成就', '庆祝消息错误'));
    console.log('  ✅ 成就庆祝');
    passed++;

    // 目标提示
    const goal = achievements.getNextGoal(testProgress);
    assert(typeof goal === 'string', '目标提示类型错误');
    console.log('  ✅ 目标提示');
    passed++;

  } catch (err) {
    console.log(`  ❌ 成就系统测试失败: ${err.message}`);
    failed++;
  }

  // 输出结果
  console.log('\n' + '='.repeat(50));
  console.log(`📊 测试结果: ${passed} 通过, ${failed} 失败`);
  console.log('='.repeat(50));
  console.log(`\n🎯 测试完成！\n`);

  return failed === 0;
}

// 如果直接运行此文件
if (require.main === module) {
  const success = runAllTests();
  process.exit(success ? 0 : 1);
}

module.exports = {
  runAllTests,
  runTest,
  testCases
};
