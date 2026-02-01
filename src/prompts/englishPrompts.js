/**
 * Prompt 模板集合 - 英语学科
 */

const ENGLISH_PROMPTS = {
  // 系统 Prompt
  system: `你是英语小老师，负责帮助小学生学习英语。

## 年级重点
2-3年级：26个字母、日常单词、简单对话
4年级：词汇积累、简单阅读理解、基础语法
5年级：阅读理解、写作入门、语法巩固

## 教学方法
- 多用图片联想记忆
- 鼓励大声朗读
- 结合生活场景练习
- 从听说读写四个方面全面学习`,

  // 出题模板
  generate: {
    vocabulary: (grade, count) =>
      `请出${count}道${grade}年级英语词汇练习题（看图写词、英汉互译等），适合当前水平，附带答案。`,
    
    reading: (grade, wordCount) =>
      `请提供一篇适合${grade}年级学生的英语阅读材料（约${wordCount}词），并附上3-5道理解题目和答案。`,
    
    grammar: (grade, count) =>
      `请出${count}道${grade}年级英语语法练习题（选择题或填空题），涵盖当前所学语法点，附带答案和简要解释。`,
    
    listening: (grade, count) =>
      `请设计${count}道适合${grade}年级学生的英语听力练习题（听写、跟读或理解题），提供听力材料和答案。`,
    
    writing: (grade, wordCount) =>
      `请给${grade}年级学生出一个英语写作题目，要求约${wordCount}词，并提供写作提示和范文。`
  },

  // 答疑模板
  answer: {
    vocabulary: (word, grade) =>
      `请用简单有趣的方式向${grade}年级小学生解释这个英语单词"${word}"，包括发音、意思和例句。`,
    
    grammar: (grammar, grade) =>
      `请用${grade}年级能理解的方式讲解英语语法点"${grammar}"，给出简单例句。`,
    
    sentence: (sentence, grade) =>
      `请帮${grade}年级小学生分析和造句：${sentence}，请分步骤讲解。`
  },

  // 讲解模板
  explain: {
    word: (word, meaning, example) =>
      `**单词**: ${word}\n\n**意思**: ${meaning}\n\n**例句**: ${example}`,
    
    dialogue: (situation, example) =>
      `**情境**: ${situation}\n\n**对话示例**:\n${example}\n\n**练习建议**: 跟着读几遍，尝试改写对话！`
  }
};

// 预设词汇表
const ENGLISH_VOCABULARY = {
  grade2: {
    colors: ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink', 'black', 'white', 'brown'],
    animals: ['cat', 'dog', 'bird', 'fish', 'rabbit', 'hamster', 'turtle', 'parrot'],
    numbers: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
  },
  grade3: {
    family: ['father', 'mother', 'brother', 'sister', 'grandfather', 'grandmother', 'uncle', 'aunt'],
    body: ['head', 'face', 'eye', 'nose', 'mouth', 'hand', 'arm', 'leg', 'foot'],
    actions: ['run', 'jump', 'swim', 'dance', 'sing', 'read', 'write', 'draw']
  },
  grade4: {
    food: ['breakfast', 'lunch', 'dinner', 'vegetable', 'fruit', 'hamburger', 'sandwich', 'noodles'],
    transport: ['bus', 'taxi', 'train', 'subway', 'bicycle', 'motorcycle', 'airplane', 'ship'],
    places: ['school', 'hospital', 'supermarket', 'restaurant', 'library', 'park', 'museum']
  },
  grade5: {
    adjectives: ['beautiful', 'expensive', 'delicious', 'comfortable', 'wonderful', 'fantastic'],
    time: ['yesterday', 'today', 'tomorrow', 'morning', 'afternoon', 'evening', 'weekend', 'holiday']
  }
};

module.exports = {
  ENGLISH_PROMPTS,
  ENGLISH_VOCABULARY
};
