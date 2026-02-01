/**
 * Study Agent 测试套件
 */

const assert = require('assert');
const { 
  classifyIntent, 
  extractGrade, 
  extractSubject, 
  extractQuestionCount,
  INTENT_PATTERNS,
  SUBJECT_KEYWORDS
} = require('../src/core/intentClassifier');
const ContextManager = require('../src/core/contextManager');

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
    { input: '帮我检查一下', expected: 'check_answer', desc: '检查答案' },
    { input: '换英语吧', expected: 'change_subject', desc: '切换学科' },
    { input: '太难了', expected: 'feedback', desc: '反馈太难' },
    { input: '我做完了', expected: 'praise_encourage', desc: '完成表扬' },
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
  console.log('🧪 开始运行测试...\n');
  
  let passed = 0;
  let failed = 0;

  // 意图分类测试
  console.log('📌 意图分类测试:');
  for (const { input, expected, desc } of testCases.intentClassification) {
    try {
      const result = classifyIntent(input);
      assert.strictEqual(result, expected, `${desc} 失败: 输入"${input}"，期望"${expected}"，得到"${result}"`);
      console.log(`  ✅ ${desc}: "${input}"`);
      passed++;
    } catch (err) {
      console.log(`  ❌ ${desc}: ${err.message}`);
      failed++;
    }
  }

  // 年级提取测试
  console.log('\n📌 年级提取测试:');
  for (const { input, expected, desc } of testCases.gradeExtraction) {
    try {
      const result = extractGrade(input);
      assert.strictEqual(result, expected, `${desc} 失败: 输入"${input}"，期望"${expected}"，得到"${result}"`);
      console.log(`  ✅ ${desc}: "${input}" -> ${result}`);
      passed++;
    } catch (err) {
      console.log(`  ❌ ${desc}: ${err.message}`);
      failed++;
    }
  }

  // 学科提取测试
  console.log('\n📌 学科提取测试:');
  for (const { input, expected, desc } of testCases.subjectExtraction) {
    try {
      const result = extractSubject(input);
      assert.strictEqual(result, expected, `${desc} 失败: 输入"${input}"，期望"${expected}"，得到"${result}"`);
      console.log(`  ✅ ${desc}: "${input}" -> ${result}`);
      passed++;
    } catch (err) {
      console.log(`  ❌ ${desc}: ${err.message}`);
      failed++;
    }
  }

  // 题目数量测试
  console.log('\n📌 题目数量测试:');
  for (const { input, expected, desc } of testCases.questionCount) {
    try {
      const result = extractQuestionCount(input);
      assert.strictEqual(result, expected, `${desc} 失败: 输入"${input}"，期望"${expected}"，得到"${result}"`);
      console.log(`  ✅ ${desc}: "${input}" -> ${result}`);
      passed++;
    } catch (err) {
      console.log(`  ❌ ${desc}: ${err.message}`);
      failed++;
    }
  }

  // ContextManager 测试
  console.log('\n📌 ContextManager 测试:');
  try {
    const manager = new ContextManager({ maxHistory: 10 });
    
    // 测试创建上下文
    const summary1 = manager.getSummary('testUser');
    assert.strictEqual(summary1.userId, 'testUser', '创建上下文失败');
    assert.strictEqual(summary1.grade, 3, '默认年级错误');
    console.log('  ✅ 创建上下文');
    passed++;

    // 测试设置学科
    manager.setSubject('testUser', 'math');
    const summary2 = manager.getSummary('testUser');
    assert.strictEqual(summary2.subject, 'math', '设置学科失败');
    console.log('  ✅ 设置学科');
    passed++;

    // 测试添加历史
    manager.addToHistory('testUser', { role: 'user', content: '你好' });
    const summary3 = manager.getSummary('testUser');
    assert.strictEqual(summary3.messageCount, 1, '添加历史失败');
    console.log('  ✅ 添加历史记录');
    passed++;

    // 测试重置
    manager.reset('testUser');
    const summary4 = manager.getSummary('testUser');
    assert.strictEqual(summary4.messageCount, 0, '重置失败');
    console.log('  ✅ 重置上下文');
    passed++;

  } catch (err) {
    console.log(`  ❌ ContextManager 测试失败: ${err.message}`);
    failed++;
  }

  // 输出结果
  console.log('\n' + '='.repeat(40));
  console.log(`📊 测试结果: ${passed} 通过, ${failed} 失败`);
  console.log('='.repeat(40));

  return failed === 0;
}

/**
 * 运行单个测试
 */
function runTest(category, testName) {
  const tests = testCases[category];
  if (!tests) {
    console.log(`❌ 未找到测试类别: ${category}`);
    return false;
  }

  const test = tests.find(t => t.desc === testName || t.input === testName);
  if (!test) {
    console.log(`❌ 未找到测试: ${testName}`);
    return false;
  }

  console.log(`运行测试: ${test.desc}`);
  try {
    const result = classifyIntent(test.input);
    console.log(`  输入: "${test.input}"`);
    console.log(`  期望: "${test.expected}"`);
    console.log(`  结果: "${result}"`);
    console.log(`  ${result === test.expected ? '✅ 通过' : '❌ 失败'}`);
    return result === test.expected;
  } catch (err) {
    console.log(`  ❌ 错误: ${err.message}`);
    return false;
  }
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
