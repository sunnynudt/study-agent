/**
 * Prompt 模板集合 - 数学学科
 */

const MATH_PROMPTS = {
  // 系统 Prompt
  system: `你是数学小老师，负责帮助小学生学习数学。

## 年级重点
2年级：100以内加减法、乘法口诀、认识图形
3年级：加减乘除混合运算、分数初步、图形面积
4年级：大数运算、小数认识、几何图形
5年级：分数运算、小数运算、百分数初步

## 出题原则
- 2-3年级：计算题为主，题目简短，答案控制在个位数
- 4-5年级：可加入应用题，需要读题理解

## 教学方法
- 用生活例子讲解（如分水果、分蛋糕）
- 鼓励验算
- 循序渐进，由易到难`,

  // 出题模板
  generate: {
    calculation: (grade, count) => 
      `请出${count}道${grade}年级数学计算题，包括加减乘除，难度适中，附带答案。`,
    
    fraction: (grade, count) => 
      `请出${count}道${grade}年级分数相关练习题，适合初步学习分数的学生，附带答案和简要讲解。`,
    
    application: (grade, count) =>
      `请出${count}道${grade}年级数学应用题，情境贴近生活，让小朋友用数学解决实际问题，附带答案和解析。`,
    
    geometry: (grade, count) =>
      `请出${count}道${grade}年级几何图形题，包括图形识别、简单计算，附带答案。`
  },

  // 答疑模板
  answer: {
    concept: (concept, grade) =>
      `请用${grade}年级小学生能理解的方式解释"${concept}"，用生活例子说明。`,
    
    question: (question, grade) =>
      `请帮${grade}年级小学生讲解这道数学题怎么做：${question}，请分步骤说明。`,
    
    mistake: (question, answer, correctAnswer) =>
      `小朋友的答案是${answer}，正确答案是${correctAnswer}，请温和地指出错误并讲解正确方法。`
  },

  // 讲解模板
  explain: {
    stepByStep: (title, steps) =>
      `## ${title}\n\n让我们一步一步来理解：\n\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n\n')}`,
    
    example: (concept, example) =>
      `**概念理解**\n${concept}\n\n**举个例子**\n${example}`
  }
};

// 预设练习题模板
const MATH_EXERCISES = {
  grade2: {
    addition: [
      { question: '15 + 27 = ?', answer: '42', difficulty: 'easy' },
      { question: '33 + 48 = ?', answer: '81', difficulty: 'easy' },
      { question: '56 + 19 = ?', answer: '75', difficulty: 'medium' }
    ],
    multiplication: [
      { question: '7 × 8 = ?', answer: '56', difficulty: 'medium' },
      { question: '6 × 9 = ?', answer: '54', difficulty: 'medium' },
      { question: '5 × 7 = ?', answer: '35', difficulty: 'easy' }
    ]
  },
  grade3: {
    mixed: [
      { question: '24 + 36 ÷ 6 = ?', answer: '30', difficulty: 'medium' },
      { question: '(15 + 25) × 2 = ?', answer: '80', difficulty: 'medium' }
    ],
    fraction: [
      { question: '把一个蛋糕分成8块，吃了2块，吃了几分之几？', answer: '2/8 = 1/4', difficulty: 'easy' }
    ]
  }
};

module.exports = {
  MATH_PROMPTS,
  MATH_EXERCISES
};
