/**
 * 语文学科 Agent 模块
 */

async function* handle(message, grade = 3, context = {}) {
  const lower = message.toLowerCase();
  
  if (lower.includes('出题') || lower.includes('练习')) {
    yield {
      role: 'user',
      content: `请出适合${grade}年级学生的语文练习题（阅读或词汇）。`
    };
  } else if (lower.includes('阅读') || lower.includes('短文')) {
    yield {
      role: 'user',
      content: `请提供一篇适合${grade}年级学生的阅读材料，并附上理解题目。`
    };
  } else if (lower.includes('古诗') || lower.includes('背诵')) {
    yield {
      role: 'user',
      content: `请推荐适合${grade}年级学习的古诗词，并附上理解和背诵指导。`
    };
  } else {
    yield {
      role: 'user',
      content: `请用小朋友能理解的方式解释：${message}`
    };
  }
}

module.exports = { handle };
