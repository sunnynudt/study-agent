/**
 * 数学学科 Agent 模块
 */

async function* handle(message, grade = 3, context = {}) {
  const lower = message.toLowerCase();
  
  if (lower.includes('出题') || lower.includes('练习') || lower.includes('做题')) {
    const countMatch = message.match(/(\d+)道/);
    const count = countMatch ? parseInt(countMatch[1]) : 5;
    
    yield {
      role: 'user',
      content: `请出${count}道${grade}年级的数学练习题，难度适中，附带答案和简要解析。`
    };
  } else {
    yield {
      role: 'user',
      content: `请用小学生能理解的方式解释：${message}`
    };
  }
}

module.exports = { handle };
