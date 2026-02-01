/**
 * 题库模块 - 管理和生成练习题
 */

const { randomPick, shuffle } = require('../utils/helpers');

/**
 * 题库管理器
 */
class QuestionBank {
  constructor() {
    this.banks = {
      math: new MathQuestionBank(),
      english: new EnglishQuestionBank(),
      chinese: new ChineseQuestionBank()
    };
  }

  /**
   * 获取题目
   */
  getQuestions(subject, options = {}) {
    const { grade = 3, count = 5, type = 'mixed', difficulty = 'medium' } = options;
    
    const bank = this.banks[subject];
    if (!bank) {
      throw new Error(`Unknown subject: ${subject}`);
    }

    return bank.getQuestions({ grade, count, type, difficulty });
  }

  /**
   * 检查答案
   */
  checkAnswer(subject, question, userAnswer) {
    const bank = this.banks[subject];
    if (!bank) return { correct: false, feedback: '不支持的学科' };
    
    return bank.checkAnswer(question, userAnswer);
  }
}

/**
 * 数学题库
 */
class MathQuestionBank {
  constructor() {
    this.questions = this.loadQuestions();
  }

  loadQuestions() {
    // 从知识库加载或使用预设题目
    return {
      2: {
        addition: [
          { q: '15 + 27 = ?', a: '42', type: 'calculation', difficulty: 'easy' },
          { q: '33 + 48 = ?', a: '81', type: 'calculation', difficulty: 'easy' },
          { q: '56 + 19 = ?', a: '75', type: 'calculation', difficulty: 'medium' }
        ],
        multiplication: [
          { q: '7 × 8 = ?', a: '56', type: 'calculation', difficulty: 'medium' },
          { q: '6 × 9 = ?', a: '54', type: 'calculation', difficulty: 'medium' },
          { q: '5 × 7 = ?', a: '35', type: 'calculation', difficulty: 'easy' }
        ],
        application: [
          { 
            q: '小明有25颗糖，分给3个小朋友，每人分到7颗，还剩几颗？', 
            a: '25 - 21 = 4颗', 
            type: 'application', 
            difficulty: 'medium' 
          }
        ]
      },
      3: {
        mixed: [
          { q: '24 + 36 ÷ 6 = ?', a: '30', type: 'mixed', difficulty: 'medium' },
          { q: '(15 + 25) × 2 = ?', a: '80', type: 'mixed', difficulty: 'medium' }
        ],
        fraction: [
          { 
            q: '把一个蛋糕分成8块，吃了2块，吃了几分之几？', 
            a: '2/8 = 1/4', 
            type: 'fraction', 
            difficulty: 'easy' 
          }
        ]
      },
      4: {
        decimal: [
          { q: '3.5 + 2.8 = ?', a: '6.3', type: 'decimal', difficulty: 'easy' },
          { q: '7.2 - 4.5 = ?', a: '2.7', type: 'decimal', difficulty: 'medium' }
        ],
        application: [
          { 
            q: '一本书有120页，小红第一天看了35页，第二天看了40页，还剩多少页？', 
            a: '120 - 35 - 40 = 45页', 
            type: 'application', 
            difficulty: 'medium' 
          }
        ]
      },
      5: {
        fraction: [
          { q: '1/2 + 1/4 = ?', a: '3/4', type: 'fraction', difficulty: 'medium' },
          { q: '3/5 - 1/5 = ?', a: '2/5', type: 'fraction', difficulty: 'easy' }
        ],
        percentage: [
          { q: '100的20%是多少？', a: '20', type: 'percentage', difficulty: 'easy' }
        ]
      }
    };
  }

  getQuestions({ grade, count, type, difficulty }) {
    const gradeQuestions = this.questions[grade] || this.questions[3];
    let pool = [];
    
    // 根据类型筛选
    if (type === 'mixed') {
      Object.values(gradeQuestions).forEach(arr => pool.push(...arr));
    } else {
      pool = gradeQuestions[type] || [];
    }
    
    // 根据难度筛选
    if (difficulty !== 'mixed') {
      pool = pool.filter(q => q.difficulty === difficulty);
    }
    
    // 随机选择
    pool = shuffle(pool);
    return pool.slice(0, count).map((q, i) => ({
      id: i + 1,
      ...q,
      subject: 'math',
      grade
    }));
  }

  checkAnswer(question, userAnswer) {
    const correct = question.a === userAnswer || 
                   question.a.includes(userAnswer) ||
                   this.normalizeAnswer(userAnswer) === this.normalizeAnswer(question.a);
    
    return {
      correct,
      correctAnswer: question.a,
      feedback: correct ? '太棒了！完全正确！🌟' : '再想一想，答案不完全对哦～'
    };
  }

  normalizeAnswer(ans) {
    return ans.replace(/\s/g, '').toLowerCase();
  }
}

/**
 * 英语题库
 */
class EnglishQuestionBank {
  constructor() {
    this.vocabulary = {
      2: ['red', 'blue', 'yellow', 'green', 'apple', 'banana', 'cat', 'dog'],
      3: ['father', 'mother', 'head', 'face', 'run', 'jump', 'swim', 'read'],
      4: ['breakfast', 'lunch', 'bus', 'train', 'school', 'hospital'],
      5: ['beautiful', 'expensive', 'yesterday', 'tomorrow', 'weekend']
    };
  }

  getQuestions({ grade, count, type }) {
    const words = this.vocabulary[grade] || this.vocabulary[3];
    const selected = shuffle(words).slice(0, count);
    
    return selected.map((word, i) => ({
      id: i + 1,
      q: `请写出单词 "${word}" 的中文意思`,
      a: this.getMeaning(word),
      type: 'vocabulary',
      difficulty: 'easy',
      subject: 'english',
      grade,
      extra: { word }
    }));
  }

  getMeaning(word) {
    const meanings = {
      red: '红色', blue: '蓝色', yellow: '黄色', green: '绿色',
      apple: '苹果', banana: '香蕉', cat: '猫', dog: '狗',
      father: '爸爸', mother: '妈妈', head: '头', face: '脸',
      run: '跑', jump: '跳', swim: '游泳', read: '读',
      breakfast: '早餐', lunch: '午餐', bus: '公共汽车',
      train: '火车', school: '学校', hospital: '医院',
      beautiful: '美丽的', expensive: '昂贵的',
      yesterday: '昨天', tomorrow: '明天', weekend: '周末'
    };
    return meanings[word] || word;
  }

  checkAnswer(question, userAnswer) {
    const correct = userAnswer.toLowerCase().includes(question.a.toLowerCase());
    return {
      correct,
      correctAnswer: question.a,
      feedback: correct ? '太棒了！拼写正确！🌟' : '加油，再想想这个单词的意思～'
    };
  }
}

/**
 * 语文题库
 */
class ChineseQuestionBank {
  constructor() {
    this.characters = {
      2: ['爸', '妈', '大', '小', '天', '地', '人', '口'],
      3: ['春', '秋', '夏', '冬', '花', '草', '树', '木'],
      4: ['学习', '朋友', '高兴', '认真', '美丽', '勤劳'],
      5: ['认真', '努力', '优秀', '成功', '友谊', '理想']
    };
    
    this.poems = {
      2: ['咏鹅', '静夜思', '春晓'],
      3: ['悯农', '鹿柴', '游子吟'],
      4: ['望庐山瀑布', '绝句', '江雪'],
      5: ['泊船瓜洲', '秋夜将晓出篱门迎凉有感']
    };
  }

  getQuestions({ grade, count, type }) {
    if (type === 'poem') {
      return this.getPoemQuestions(grade, count);
    }
    return this.getCharacterQuestions(grade, count);
  }

  getCharacterQuestions(grade, count) {
    const chars = this.characters[grade] || this.characters[3];
    const selected = shuffle(chars).slice(0, count);
    
    return selected.map((char, i) => ({
      id: i + 1,
      q: `请写出"${char}"的拼音`,
      a: this.getPinyin(char),
      type: 'vocabulary',
      difficulty: 'easy',
      subject: 'chinese',
      grade,
      extra: { char }
    }));
  }

  getPoemQuestions(grade, count) {
    const poems = this.poems[grade] || this.poems[3];
    const selected = shuffle(poems).slice(0, count);
    
    return selected.map((title, i) => ({
      id: i + 1,
      q: `请背诵古诗《${title》》的作者是谁？`,
      a: this.getAuthor(title),
      type: 'poem',
      difficulty: 'easy',
      subject: 'chinese',
      grade,
      extra: { title }
    }));
  }

  getPinyin(char) {
    const pinyin = {
      爸: 'bà', 妈: 'mā', 大: 'dà', 小: 'xiǎo',
      天: 'tiān', 地: 'dì', 人: 'rén', 口: 'kǒu',
      春: 'chūn', 秋: 'qiū', 夏: 'xià', 冬: 'dōng',
      花: 'huā', 草: 'cǎo', 树: 'shù', 木: 'mù',
      学: 'xí', 习: 'xí', 朋: 'péng', 友: 'yǒu',
      高: 'gāo', 兴: 'xìng', 认: 'rèn', 真: 'zhēn',
      美: 'měi', 丽: 'lì', 勤: 'qín', 劳: 'láo',
      努: 'nǔ', 力: 'lì', 优: 'yōu', 秀: 'xiù',
      成: 'chéng', 功: 'gōng', 友: 'yǒu', 谊: 'yì',
      理: 'lǐ', 想: 'xiǎng'
    };
    return pinyin[char] || char;
  }

  getAuthor(title) {
    const authors = {
      '咏鹅': '骆宾王', '静夜思': '李白', '春晓': '孟浩然',
      '悯农': '李绅', '鹿柴': '王维', '游子吟': '孟郊',
      '望庐山瀑布': '李白', '绝句': '杜甫', '江雪': '柳宗元',
      '泊船瓜洲': '王安石', '秋夜将晓出篱门迎凉有感': '陆游'
    };
    return authors[title] || '未知';
  }

  checkAnswer(question, userAnswer) {
    const correct = userAnswer.includes(question.a);
    return {
      correct,
      correctAnswer: question.a,
      feedback: correct ? '太棒了！回答正确！🌟' : '再想一想，答案不完全对哦～'
    };
  }
}

module.exports = { QuestionBank, MathQuestionBank, EnglishQuestionBank, ChineseQuestionBank };
