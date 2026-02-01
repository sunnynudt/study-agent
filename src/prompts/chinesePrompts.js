/**
 * Prompt 模板集合 - 语文学科
 */

const CHINESE_PROMPTS = {
  // 系统 Prompt
  system: `你是语文小老师，负责帮助小学生学习语文。

## 年级重点
2-3年级：生字词学习、简单阅读、短句仿写
4年级：阅读理解技巧、作文入门、成语积累
5年级：阅读分析能力、作文提升、传统文化

## 教学方法
- 鼓励多读多背
- 用故事讲解成语/古诗
- 阅读要引导思考
- 写作要从说到写，循序渐进`,

  // 出题模板
  generate: {
    vocabulary: (grade, count) =>
      `请出${count}道${grade}年级语文词汇练习题（看拼音写汉字、词语填空等），涵盖常用字词，附带答案。`,
    
    reading: (grade, wordCount) =>
      `请提供一篇适合${grade}年级学生的阅读材料（约${wordCount}字），并附上3-5道理解题目和答案。`,
    
    composition: (grade, wordCount) =>
      `请给${grade}年级学生出一个作文题目，要求约${wordCount}字，并提供写作提示和优秀范文。`,
    
    classical: (grade, count) =>
      `请出${count}道${grade}年级古诗词理解题，包括诗句背诵、诗意理解、诗人简介等，附带答案。`,
    
    idiom: (grade, count) =>
      `请给${grade}年级学生出${count}道成语故事理解题，通过故事学习成语，附带答案和成语解释。`
  },

  // 答疑模板
  answer: {
    character: (char, grade) =>
      `请向${grade}年级小学生解释这个字"${char}"，包括读音、意思、组词和书写要点。`,
    
    word: (word, grade) =>
      `请用简单的方式向${grade}年级小学生解释词语"${word}"，给出近义词、反义词和例句。`,
    
    poem: (poem, grade) =>
      `请讲解这首古诗，适合${grade}年级学生，包括诗意、诗人背景和名句赏析。`,
    
    reading: (question, grade) =>
      `请帮${grade}年级小学生解答这道阅读理解题：${question}，请耐心分析。`
  },

  // 讲解模板
  explain: {
    character: (char, structure, example) =>
      `**字**: ${char}\n\n**结构**: ${structure}\n\n**组词**: ${example}`,
    
    idiom: (idiom, story, meaning) =>
      `**成语**: ${idiom}\n\n**故事**: ${story}\n\n**意思**: ${meaning}\n\n**造句**: ${meaning}造个句子吧！`,
    
    poem: (title, author, content, meaning) =>
      `**古诗**: ${title}\n\n**作者**: ${author}\n\n**内容**: ${content}\n\n**诗意**: ${meaning}`
  }
};

// 预设古诗词
const CHINESE_POEMS = {
  grade2: [
    { title: '咏鹅', author: '骆宾王', content: '鹅，鹅，鹅，曲项向天歌。白毛浮绿水，红掌拨清波。' },
    { title: '静夜思', author: '李白', content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。' },
    { title: '春晓', author: '孟浩然', content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。' }
  ],
  grade3: [
    { title: '悯农', author: '李绅', content: '锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。' },
    { title: '鹿柴', author: '王维', content: '空山不见人，但闻人语响。返景入深林，复照青苔上。' },
    { title: '游子吟', author: '孟郊', content: '慈母手中线，游子身上衣。临行密密缝，意恐迟迟归。' }
  ],
  grade4: [
    { title: '望庐山瀑布', author: '李白', content: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。' },
    { title: '绝句', author: '杜甫', content: '两个黄鹂鸣翠柳，一行白鹭上青天。窗含西岭千秋雪，门泊东吴万里船。' },
    { title: '江雪', author: '柳宗元', content: '千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。' }
  ],
  grade5: [
    { title: '泊船瓜洲', author: '王安石', content: '京口瓜洲一水间，钟山只隔数重山。春风又绿江南岸，明月何时照我还。' },
    { title: '秋夜将晓出篱门迎凉有感', author: '陆游', content: '三万里河东入海，五千仞岳上摩天。遗民泪尽胡尘里，南望王师又一年。' },
    { title: '闻官军收河南河北', author: '杜甫', content: '剑外忽传收蓟北，初闻涕泪满衣裳。却看妻子愁何在，漫卷诗书喜欲狂。' }
  ]
};

// 预设成语故事
const CHINESE_IDIOMS = [
  { idiom: '画蛇添足', story: '古时候，楚国有人比赛画蛇，先画完的人给蛇添上了脚，结果输了。', meaning: '做多余的事，反而把事情弄坏了' },
  { idiom: '亡羊补牢', story: '羊圈破了，羊丢了。邻居说把羊圈修好还不晚。', meaning: '出了问题后想办法补救，防止继续出错' },
  { idiom: '守株待兔', story: '农夫捡到一只撞死在树桩上的兔子，从此天天守在树旁等兔子。', meaning: '不努力却希望坐享其成' },
  { idiom: '刻舟求剑', story: '剑掉进河里，主人在船舷上刻记号，等船靠岸再去捞。', meaning: '拘泥成法，不知道变通' },
  { idiom: '拔苗助长', story: '农夫嫌禾苗长得太慢，把每棵苗都往上拔了一截，结果禾苗都枯死了。', meaning: '急于求成，反而坏事' }
];

module.exports = {
  CHINESE_PROMPTS,
  CHINESE_POEMS,
  CHINESE_IDIOMS
};
