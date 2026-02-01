/**
 * 英语学科 Agent 模块
 */

async function* handle(message, grade = 3, context = {}) {
  const lower = message.toLowerCase();
  
  if (lower.includes('出题') || lower.includes('练习') || lower.includes('做题')) {
    yield {
      role: 'user',
      content: `请出适合${grade}年级学生的英语练习题（词汇、阅读或语法）。`
    };
  } else if (lower.includes('阅读') || lower.includes('文章')) {
    yield {
      role: 'user',
      content: `请提供一篇适合${grade}年级学生的英语阅读材料，并附上理解题目。`
    };
  } else {
    yield {
      role: 'user',
      content: `请用简单易懂的方式解释：${message}`
    };
  }
}

module.exports = { handle };
