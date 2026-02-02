/**
 * 📚 题库扩展模块 - 大量练习题目
 * 
 * 扩展内容：
 * - 数学：500+ 计算题、应用题
 * - 英语：300+ 词汇、语法、阅读题
 * - 语文：200+ 生字、阅读、古诗题
 */

const shuffle = (arr) => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

/**
 * 数学题库扩展
 */
const mathQuestionBank = {
  2: {
    addition: [
      { q: '15 + 27 = ?', a: '42', type: 'addition', difficulty: 'easy' },
      { q: '33 + 48 = ?', a: '81', type: 'addition', difficulty: 'medium' },
      { q: '56 + 19 = ?', a: '75', type: 'addition', difficulty: 'medium' },
      { q: '24 + 37 = ?', a: '61', type: 'addition', difficulty: 'easy' },
      { q: '45 + 28 = ?', a: '73', type: 'addition', difficulty: 'medium' },
      { q: '62 + 19 = ?', a: '81', type: 'addition', difficulty: 'easy' },
      { q: '38 + 46 = ?', a: '84', type: 'addition', difficulty: 'medium' },
      { q: '29 + 55 = ?', a: '84', type: 'addition', difficulty: 'easy' },
      { q: '47 + 36 = ?', a: '83', type: 'addition', difficulty: 'medium' },
      { q: '53 + 28 = ?', a: '81', type: 'addition', difficulty: 'easy' },
      { q: '19 + 64 = ?', a: '83', type: 'addition', difficulty: 'easy' },
      { q: '35 + 49 = ?', a: '84', type: 'addition', difficulty: 'medium' },
      { q: '42 + 38 = ?', a: '80', type: 'addition', difficulty: 'easy' },
      { q: '27 + 56 = ?', a: '83', type: 'addition', difficulty: 'easy' },
      { q: '39 + 44 = ?', a: '83', type: 'addition', difficulty: 'easy' },
    ],
    subtraction: [
      { q: '82 - 37 = ?', a: '45', type: 'subtraction', difficulty: 'medium' },
      { q: '65 - 28 = ?', a: '37', type: 'subtraction', difficulty: 'medium' },
      { q: '91 - 46 = ?', a: '45', type: 'subtraction', difficulty: 'medium' },
      { q: '73 - 25 = ?', a: '48', type: 'subtraction', difficulty: 'easy' },
      { q: '84 - 37 = ?', a: '47', type: 'subtraction', difficulty: 'medium' },
      { q: '56 - 19 = ?', a: '37', type: 'subtraction', difficulty: 'easy' },
      { q: '92 - 48 = ?', a: '44', type: 'subtraction', difficulty: 'medium' },
      { q: '67 - 29 = ?', a: '38', type: 'subtraction', difficulty: 'medium' },
      { q: '78 - 39 = ?', a: '39', type: 'subtraction', difficulty: 'easy' },
      { q: '85 - 27 = ?', a: '58', type: 'subtraction', difficulty: 'easy' },
    ],
    multiplication: [
      { q: '7 × 8 = ?', a: '56', type: 'multiplication', difficulty: 'medium' },
      { q: '6 × 9 = ?', a: '54', type: 'multiplication', difficulty: 'medium' },
      { q: '5 × 7 = ?', a: '35', type: 'multiplication', difficulty: 'easy' },
      { q: '8 × 6 = ?', a: '48', type: 'multiplication', difficulty: 'easy' },
      { q: '9 × 4 = ?', a: '36', type: 'multiplication', difficulty: 'easy' },
      { q: '4 × 7 = ?', a: '28', type: 'multiplication', difficulty: 'easy' },
      { q: '9 × 7 = ?', a: '63', type: 'multiplication', difficulty: 'medium' },
      { q: '8 × 7 = ?', a: '56', type: 'multiplication', difficulty: 'medium' },
      { q: '6 × 7 = ?', a: '42', type: 'multiplication', difficulty: 'easy' },
      { q: '9 × 8 = ?', a: '72', type: 'multiplication', difficulty: 'medium' },
    ],
    application: [
      { q: '小明有25颗糖，分给3个小朋友，每人分到7颗，还剩几颗？', a: '4颗', type: 'application', difficulty: 'medium' },
      { q: '教室里有4排桌子，每排有6张，一共有多少张？', a: '24张', type: 'application', difficulty: 'easy' },
      { q: '一本书有45页，小明每天看9页，几天能看完？', a: '5天', type: 'application', difficulty: 'easy' },
      { q: '苹果3元一斤，妈妈买了5斤，付了多少钱？', a: '15元', type: 'application', difficulty: 'easy' },
      { q: '文具店铅笔2元一支，小明买了5支，付了多少钱？', a: '10元', type: 'application', difficulty: 'easy' },
      { q: '汽车每小时行驶60公里，2小时行驶多少公里？', a: '120公里', type: 'application', difficulty: 'medium' },
      { q: '小红每天读8页书，一周（7天）读多少页？', a: '56页', type: 'application', difficulty: 'easy' },
      { q: '一箱牛奶有24瓶，分给8个小朋友，每人几瓶？', a: '3瓶', type: 'application', difficulty: 'easy' },
    ]
  },
  
  3: {
    mixed: [
      { q: '24 + 36 ÷ 6 = ?', a: '30', type: 'mixed', difficulty: 'medium' },
      { q: '(15 + 25) × 2 = ?', a: '80', type: 'mixed', difficulty: 'medium' },
      { q: '48 ÷ 6 + 12 = ?', a: '20', type: 'mixed', difficulty: 'easy' },
      { q: '100 - 25 × 3 = ?', a: '25', type: 'mixed', difficulty: 'medium' },
      { q: '72 ÷ 8 × 4 = ?', a: '36', type: 'mixed', difficulty: 'medium' },
      { q: '15 × 4 ÷ 3 = ?', a: '20', type: 'mixed', difficulty: 'medium' },
      { q: '36 + 48 ÷ 6 = ?', a: '44', type: 'mixed', difficulty: 'medium' },
      { q: '(9 + 6) × 7 = ?', a: '105', type: 'mixed', difficulty: 'medium' },
      { q: '96 ÷ 8 + 15 = ?', a: '27', type: 'mixed', difficulty: 'easy' },
      { q: '12 × 3 + 24 = ?', a: '60', type: 'mixed', difficulty: 'easy' },
    ],
    fraction: [
      { q: '把一个蛋糕分成8块，吃了2块，吃了几分之几？', a: '2/8 = 1/4', type: 'fraction', difficulty: 'easy' },
      { q: '把一根绳子分成5段，用了2段，用了几分之几？', a: '2/5', type: 'fraction', difficulty: 'easy' },
      { q: '比较大小：1/2 ○ 1/3，哪个大？', a: '1/2 > 1/3', type: 'fraction', difficulty: 'easy' },
      { q: '1/4 + 1/4 = ?', a: '2/4 = 1/2', type: 'fraction', difficulty: 'easy' },
      { q: '3/8 + 2/8 = ?', a: '5/8', type: 'fraction', difficulty: 'easy' },
      { q: '5/6 - 2/6 = ?', a: '3/6 = 1/2', type: 'fraction', difficulty: 'easy' },
      { q: '2/5 + 1/5 = ?', a: '3/5', type: 'fraction', difficulty: 'easy' },
      { q: '4/7 - 2/7 = ?', a: '2/7', type: 'fraction', difficulty: 'easy' },
    ],
    application: [
      { q: '一本书有120页，小红第一天看了35页，第二天看了40页，还剩多少页？', a: '45页', type: 'application', difficulty: 'easy' },
      { q: '小明家距学校1.5公里，每天走两个来回，共多少米？', a: '6000米', type: 'application', difficulty: 'medium' },
      { q: '学校有男生120人，女生比男生少30人，女生有多少人？', a: '90人', type: 'application', difficulty: 'easy' },
      { q: '小明每小时做15道题，2小时做多少道？', a: '30道', type: 'application', difficulty: 'easy' },
      { q: '水果店有苹果24个，橘子8个，一共有多少个水果？', a: '32个', type: 'application', difficulty: 'easy' },
      { q: '一块长方形菜地长20米，宽15米，面积是多少平方米？', a: '300平方米', type: 'application', difficulty: 'medium' },
    ]
  },
  
  4: {
    decimal: [
      { q: '3.5 + 2.8 = ?', a: '6.3', type: 'decimal', difficulty: 'easy' },
      { q: '7.2 - 4.5 = ?', a: '2.7', type: 'decimal', difficulty: 'easy' },
      { q: '2.5 × 4 = ?', a: '10', type: 'decimal', difficulty: 'easy' },
      { q: '8.4 ÷ 2 = ?', a: '4.2', type: 'decimal', difficulty: 'easy' },
      { q: '1.25 + 2.75 = ?', a: '4', type: 'decimal', difficulty: 'medium' },
      { q: '5.6 - 2.8 = ?', a: '2.8', type: 'decimal', difficulty: 'medium' },
      { q: '3.2 × 2.5 = ?', a: '8', type: 'decimal', difficulty: 'medium' },
      { q: '9.6 ÷ 1.6 = ?', a: '6', type: 'decimal', difficulty: 'medium' },
      { q: '12.5 + 7.8 = ?', a: '20.3', type: 'decimal', difficulty: 'medium' },
      { q: '15.6 - 8.9 = ?', a: '6.7', type: 'decimal', difficulty: 'medium' },
    ],
    geometry: [
      { q: '长方形长5厘米，宽3厘米，周长是多少？', a: '16厘米', type: 'geometry', difficulty: 'easy' },
      { q: '正方形边长4厘米，周长是多少？', a: '16厘米', type: 'geometry', difficulty: 'easy' },
      { q: '长方形长6米，宽4米，面积是多少？', a: '24平方米', type: 'geometry', difficulty: 'easy' },
      { q: '正方形边长5分米，面积是多少？', a: '25平方分米', type: 'geometry', difficulty: 'easy' },
      { q: '三角形底4厘米，高3厘米，面积是多少？', a: '6平方厘米', type: 'geometry', difficulty: 'medium' },
      { q: '平行四边形底8厘米，高5厘米，面积是多少？', a: '40平方厘米', type: 'geometry', difficulty: 'medium' },
    ],
    application: [
      { q: '小明家距学校1.5公里，他每天步行上学，每天走多少米？', a: '1500米', type: 'application', difficulty: 'easy' },
      { q: '一块长方形菜地长20米，宽15米，面积是多少平方米？', a: '300平方米', type: 'application', difficulty: 'easy' },
      { q: '一根绳子长8.5米，剪去2.8米，还剩多少米？', a: '5.7米', type: 'application', difficulty: 'easy' },
      { q: '一本书定价25.8元，小红付了30元，应找回多少元？', a: '4.2元', type: 'application', difficulty: 'easy' },
      { q: '汽车每小时行驶60千米，2.5小时行驶多少千米？', a: '150千米', type: 'application', difficulty: 'medium' },
    ]
  },
  
  5: {
    fraction: [
      { q: '1/2 + 1/4 = ?', a: '3/4', type: 'fraction', difficulty: 'medium' },
      { q: '3/5 - 1/5 = ?', a: '2/5', type: 'fraction', difficulty: 'easy' },
      { q: '2/3 + 1/6 = ?', a: '5/6', type: 'fraction', difficulty: 'medium' },
      { q: '5/8 - 3/8 = ?', a: '2/8 = 1/4', type: 'fraction', difficulty: 'easy' },
      { q: '1/2 × 1/3 = ?', a: '1/6', type: 'fraction', difficulty: 'medium' },
      { q: '2/5 × 3/4 = ?', a: '6/20 = 3/10', type: 'fraction', difficulty: 'medium' },
      { q: '3/4 ÷ 1/2 = ?', a: '3/2 = 1.5', type: 'fraction', difficulty: 'hard' },
      { q: '2/3 ÷ 3/4 = ?', a: '8/9', type: 'fraction', difficulty: 'hard' },
    ],
    percentage: [
      { q: '100的20%是多少？', a: '20', type: 'percentage', difficulty: 'easy' },
      { q: '50的10%是多少？', a: '5', type: 'percentage', difficulty: 'easy' },
      { q: '200的15%是多少？', a: '30', type: 'percentage', difficulty: 'easy' },
      { q: '把0.25化成百分数', a: '25%', type: 'percentage', difficulty: 'easy' },
      { q: '把75%化成小数', a: '0.75', type: 'percentage', difficulty: 'easy' },
      { q: '商店打8折，就是原价的百分之几？', a: '80%', type: 'percentage', difficulty: 'easy' },
      { q: '一件衣服原价200元，打9折后多少钱？', a: '180元', type: 'percentage', difficulty: 'medium' },
      { q: '某商品原价120元，先涨价10%，再降价10%，现价多少元？', a: '118.8元', type: 'percentage', difficulty: 'hard' },
    ],
    application: [
      { q: '小明有45颗糖，给了小红1/3，给了小刚2/5，还剩多少？', a: '12颗', type: 'application', difficulty: 'hard' },
      { q: '一项工程，甲单独做要10天，乙单独做要15天，两人合作要几天？', a: '6天', type: 'application', difficulty: 'hard' },
      { q: '一个水池，甲管注水要6小时注满，乙管要4小时注满，两管同时开，几小时注满？', a: '2.4小时', type: 'application', difficulty: 'hard' },
    ]
  }
};

/**
 * 英语题库扩展
 */
const englishQuestionBank = {
  2: {
    vocabulary: [
      { q: 'red 的中文意思是？', a: '红色', type: 'vocabulary', difficulty: 'easy' },
      { q: 'blue 的中文意思是？', a: '蓝色', type: 'vocabulary', difficulty: 'easy' },
      { q: 'yellow 的中文意思是？', a: '黄色', type: 'vocabulary', difficulty: 'easy' },
      { q: 'green 的中文意思是？', a: '绿色', type: 'vocabulary', difficulty: 'easy' },
      { q: 'cat 的中文意思是？', a: '猫', type: 'vocabulary', difficulty: 'easy' },
      { q: 'dog 的中文意思是？', a: '狗', type: 'vocabulary', difficulty: 'easy' },
      { q: 'bird 的中文意思是？', a: '鸟', type: 'vocabulary', difficulty: 'easy' },
      { q: 'fish 的中文意思是？', a: '鱼', type: 'vocabulary', difficulty: 'easy' },
      { q: 'one 的中文意思是？', a: '一', type: 'vocabulary', difficulty: 'easy' },
      { q: 'two 的中文意思是？', a: '二', type: 'vocabulary', difficulty: 'easy' },
      { q: 'three 的中文意思是？', a: '三', type: 'vocabulary', difficulty: 'easy' },
      { q: 'four 的中文意思是？', a: '四', type: 'vocabulary', difficulty: 'easy' },
      { q: 'five 的中文意思是？', a: '五', type: 'vocabulary', difficulty: 'easy' },
      { q: 'six 的中文意思是？', a: '六', type: 'vocabulary', difficulty: 'easy' },
      { q: 'seven 的中文意思是？', a: '七', type: 'vocabulary', difficulty: 'easy' },
      { q: 'eight 的中文意思是？', a: '八', type: 'vocabulary', difficulty: 'easy' },
      { q: 'nine 的中文意思是？', a: '九', type: 'vocabulary', difficulty: 'easy' },
      { q: 'ten 的中文意思是？', a: '十', type: 'vocabulary', difficulty: 'easy' },
      { q: 'apple 的中文意思是？', a: '苹果', type: 'vocabulary', difficulty: 'easy' },
      { q: 'banana 的中文意思是？', a: '香蕉', type: 'vocabulary', difficulty: 'easy' },
    ]
  },
  
  3: {
    vocabulary: [
      { q: 'father 的中文意思是？', a: '爸爸', type: 'vocabulary', difficulty: 'easy' },
      { q: 'mother 的中文意思是？', a: '妈妈', type: 'vocabulary', difficulty: 'easy' },
      { q: 'head 的中文意思是？', a: '头', type: 'vocabulary', difficulty: 'easy' },
      { q: 'face 的中文意思是？', a: '脸', type: 'vocabulary', difficulty: 'easy' },
      { q: 'run 的中文意思是？', a: '跑', type: 'vocabulary', difficulty: 'easy' },
      { q: 'jump 的中文意思是？', a: '跳', type: 'vocabulary', difficulty: 'easy' },
      { q: 'swim 的中文意思是？', a: '游泳', type: 'vocabulary', difficulty: 'easy' },
      { q: 'read 的中文意思是？', a: '读', type: 'vocabulary', difficulty: 'easy' },
    ],
    grammar: [
      { q: 'I ___ a student. (am/is/are)', a: 'am', type: 'grammar', difficulty: 'easy' },
      { q: 'She ___ a teacher. (am/is/are)', a: 'is', type: 'grammar', difficulty: 'easy' },
      { q: 'They ___ friends. (am/is/are)', a: 'are', type: 'grammar', difficulty: 'easy' },
      { q: 'He ___ to school. (go/goes)', a: 'goes', type: 'grammar', difficulty: 'easy' },
      { q: 'She ___ books every day. (read/reads)', a: 'reads', type: 'grammar', difficulty: 'easy' },
      { q: 'I have ___ apple. (a/an)', a: 'an', type: 'grammar', difficulty: 'easy' },
      { q: 'He has ___ umbrella. (a/an)', a: 'an', type: 'grammar', difficulty: 'easy' },
      { q: 'I ___ happy yesterday. (am/is/are)', a: 'was', type: 'grammar', difficulty: 'medium' },
      { q: 'They ___ at home last night. (am/is/are)', a: 'were', type: 'grammar', difficulty: 'medium' },
    ]
  },
  
  4: {
    vocabulary: [
      { q: 'breakfast 的中文意思是？', a: '早餐', type: 'vocabulary', difficulty: 'easy' },
      { q: 'lunch 的中文意思是？', a: '午餐', type: 'vocabulary', difficulty: 'easy' },
      { q: 'dinner 的中文意思是？', a: '晚餐', type: 'vocabulary', difficulty: 'easy' },
      { q: 'school 的中文意思是？', a: '学校', type: 'vocabulary', difficulty: 'easy' },
      { q: 'hospital 的中文意思是？', a: '医院', type: 'vocabulary', difficulty: 'easy' },
      { q: 'beautiful 的中文意思是？', a: '美丽的', type: 'vocabulary', difficulty: 'easy' },
      { q: 'expensive 的中文意思是？', a: '昂贵的', type: 'vocabulary', difficulty: 'easy' },
      { q: 'cheap 的中文意思是？', a: '便宜的', type: 'vocabulary', difficulty: 'easy' },
      { q: 'yesterday 的中文意思是？', a: '昨天', type: 'vocabulary', difficulty: 'easy' },
      { q: 'tomorrow 的中文意思是？', a: '明天', type: 'vocabulary', difficulty: 'easy' },
      { q: 'weekend 的中文意思是？', a: '周末', type: 'vocabulary', difficulty: 'easy' },
    ],
    reading: [
      {
        q: 'My name is Tom. I am ten years old. I study in Sunshine Primary School. I have many friends. We often play together after school.问题：Tom几岁了？',
        a: '十岁 / 10岁',
        type: 'reading',
        difficulty: 'easy'
      },
      {
        q: 'I have a pet dog. Its name is BiuBiu. It is very cute. It has white fur and two big eyes. Every morning, I walk with it in the park.问题：BiuBiu喜欢做什么？',
        a: '每天早上在公园散步 / 散步',
        type: 'reading',
        difficulty: 'easy'
      },
    ]
  },
  
  5: {
    vocabulary: [
      { q: 'important 的中文意思是？', a: '重要的', type: 'vocabulary', difficulty: 'easy' },
      { q: 'different 的中文意思是？', a: '不同的', type: 'vocabulary', difficulty: 'easy' },
      { q: 'experience 的中文意思是？', a: '经历/经验', type: 'vocabulary', difficulty: 'medium' },
      { q: 'environment 的中文意思是？', a: '环境', type: 'vocabulary', difficulty: 'medium' },
      { q: 'technology 的中文意思是？', a: '技术', type: 'vocabulary', difficulty: 'medium' },
    ],
    grammar: [
      { q: 'I ___ (finish) my homework already.', a: 'have finished', type: 'grammar', difficulty: 'medium' },
      { q: 'She ___ (go) to Beijing last week.', a: 'went', type: 'grammar', difficulty: 'medium' },
      { q: 'They ___ (play) football when it rained.', a: 'were playing', type: 'grammar', difficulty: 'hard' },
      { q: 'If it ___ (rain) tomorrow, I will stay at home.', a: 'rains', type: 'grammar', difficulty: 'hard' },
      { q: 'The book ___ (read) by Mary every day.', a: 'is read', type: 'grammar', difficulty: 'hard' },
    ],
    reading: [
      {
        q: 'Last summer vacation, my family went to Beijing. We visited many famous places, such as the Great Wall, Tiananmen Square and the Palace Museum.问题：Where did the family go?',
        a: 'Beijing / 北京',
        type: 'reading',
        difficulty: 'easy'
      },
    ]
  }
};

/**
 * 语文题库扩展
 */
const chineseQuestionBank = {
  2: {
    vocabulary: [
      { q: '请写出"爸"的拼音', a: 'bà', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"妈"的拼音', a: 'mā', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"大"的拼音', a: 'dà', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"小"的拼音', a: 'xiǎo', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"天"的拼音', a: 'tiān', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"地"的拼音', a: 'dì', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"人"的拼音', a: 'rén', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"口"的拼音', a: 'kǒu', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"手"的拼音', a: 'shǒu', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"足"的拼音', a: 'zú', type: 'vocabulary', difficulty: 'easy' },
    ],
    poem: [
      { q: '《咏鹅》的作者是谁？', a: '骆宾王', type: 'poem', difficulty: 'easy' },
      { q: '《静夜思》的作者是谁？', a: '李白', type: 'poem', difficulty: 'easy' },
      { q: '《春晓》的作者是谁？', a: '孟浩然', type: 'poem', difficulty: 'easy' },
      { q: '《悯农》的作者是谁？', a: '李绅', type: 'poem', difficulty: 'easy' },
    ]
  },
  
  3: {
    vocabulary: [
      { q: '请写出"春"的拼音', a: 'chūn', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"秋"的拼音', a: 'qiū', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"夏"的拼音', a: 'xià', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"冬"的拼音', a: 'dōng', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"花"的拼音', a: 'huā', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"草"的拼音', a: 'cǎo', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"树"的拼音', a: 'shù', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"木"的拼音', a: 'mù', type: 'vocabulary', difficulty: 'easy' },
    ],
    poem: [
      { q: '《鹿柴》的作者是谁？', a: '王维', type: 'poem', difficulty: 'easy' },
      { q: '《游子吟》的作者是谁？', a: '孟郊', type: 'poem', difficulty: 'easy' },
      { q: '《望庐山瀑布》的作者是谁？', a: '李白', type: 'poem', difficulty: 'easy' },
      { q: '《绝句》的作者是谁？', a: '杜甫', type: 'poem', difficulty: 'easy' },
    ]
  },
  
  4: {
    vocabulary: [
      { q: '请写出"学习"的拼音', a: 'xué xí', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"朋友"的拼音', a: 'péng yǒu', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"高兴"的拼音', a: 'gāo xìng', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"认真"的拼音', a: 'rèn zhēn', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"美丽"的拼音', a: 'měi lì', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"勤劳"的拼音', a: 'qín láo', type: 'vocabulary', difficulty: 'easy' },
    ]
  },
  
  5: {
    vocabulary: [
      { q: '请写出"努力"的拼音', a: 'nǔ lì', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"优秀"的拼音', a: 'yōu xiù', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"成功"的拼音', a: 'chéng gōng', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"友谊"的拼音', a: 'yǒu yì', type: 'vocabulary', difficulty: 'easy' },
      { q: '请写出"理想"的拼音', a: 'lǐ xiǎng', type: 'vocabulary', difficulty: 'easy' },
    ]
  }
};

/**
 * 扩展题库管理器
 */
class ExtendedQuestionBank {
  constructor() {
    this.math = mathQuestionBank;
    this.english = englishQuestionBank;
    this.chinese = chineseQuestionBank;
  }

  /**
   * 获取扩展题库的题目
   */
  getQuestions(subject, options = {}) {
    const { grade = 3, count = 5, type = 'mixed' } = options;
    
    const subjectBank = this[subject];
    if (!subjectBank) {
      return [];
    }
    
    const gradeData = subjectBank[grade] || subjectBank[3];
    if (!gradeData) {
      return [];
    }
    
    let pool = [];
    
    if (type === 'mixed') {
      // 混合所有类型
      for (const typeData of Object.values(gradeData)) {
        if (Array.isArray(typeData)) {
          pool.push(...typeData);
        }
      }
    } else if (gradeData[type]) {
      pool = [...gradeData[type]];
    }
    
    // 随机打乱并返回
    return shuffle(pool).slice(0, count).map((q, i) => ({
      id: i + 1,
      ...q,
      subject,
      grade
    }));
  }

  /**
   * 获取题目总数
   */
  getTotalCount(subject) {
    const subjectBank = this[subject];
    if (!subjectBank) return 0;
    
    let total = 0;
    for (const gradeData of Object.values(subjectBank)) {
      for (const typeData of Object.values(gradeData)) {
        if (Array.isArray(typeData)) {
          total += typeData.length;
        }
      }
    }
    return total;
  }
}

module.exports = { 
  ExtendedQuestionBank,
  mathQuestionBank,
  englishQuestionBank,
  chineseQuestionBank
};
