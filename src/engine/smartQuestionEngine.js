/**
 * 🎯 智能出题引擎 - 基于知识点掌握情况的个性化出题
 * 
 * 功能：
 * - 根据错题记录智能出题
 * - 混合复习模式（艾宾浩斯遗忘曲线）
 * - 难度自适应（答对增加难度，答错降低难度）
 * - 薄弱知识点重点强化
 */

const { QuestionBank } = require('../bank/questionBank');

/**
 * 知识点权重配置
 */
const KNOWLEDGE_WEIGHTS = {
  // 记忆曲线：1小时后复习效果最好
  '1hour': { weight: 1.0, label: '刚学' },
  '1day': { weight: 0.9, label: '昨天' },
  '3days': { weight: 0.7, label: '3天前' },
  '1week': { weight: 0.5, label: '1周前' },
  '2weeks': { weight: 0.3, label: '2周前' },
  '1month': { weight: 0.1, label: '1月前' }
};

/**
 * 错题重点复习类型
 */
const REVIEW_TYPES = {
  'wrong_only': { name: '只做错题', desc: '只出之前做错的题型' },
  'mixed': { name: '混合复习', desc: '错题+新题混合' },
  'adaptive': { name: '智能适应', desc: '根据正确率自动调整难度' },
  'spaced': { name: '间隔复习', desc: '按遗忘曲线安排复习' }
};

class SmartQuestionEngine {
  constructor() {
    this.questionBank = new QuestionBank();
  }

  /**
   * 智能出题 - 根据用户进度生成个性化题目
   */
  generateSmartQuestions(userProgress, options = {}) {
    const {
      subject = 'math',
      grade = 3,
      count = 5,
      mode = 'adaptive', // adaptive, review, challenge, random
      focusTopics = null, // 重点复习的知识点
      excludeTopics = null // 排除的知识点
    } = options;

    let questionPool = [];

    switch (mode) {
      case 'review':
        // 复习模式：重点出错题相关
        questionPool = this.generateReviewQuestions(userProgress, subject, grade, count);
        break;
        
      case 'challenge':
        // 挑战模式：提高难度
        questionPool = this.generateChallengeQuestions(userProgress, subject, grade, count);
        break;
        
      case 'random':
        // 随机模式：完全随机
        questionPool = this.questionBank.getQuestions(subject, { 
          grade, 
          count, 
          type: 'mixed',
          difficulty: 'mixed' 
        });
        break;
        
      case 'adaptive':
      default:
        // 自适应模式：根据正确率调整
        questionPool = this.generateAdaptiveQuestions(userProgress, subject, grade, count);
        break;
    }

    return questionPool;
  }

  /**
   * 生成复习题目 - 重点是错题
   */
  generateReviewQuestions(userProgress, subject, grade, count) {
    const subjectData = userProgress.subjects[subject];
    if (!subjectData || !subjectData.topics) {
      // 没有数据，返回随机题目
      return this.questionBank.getQuestions(subject, { grade, count, type: 'mixed' });
    }

    // 获取错误率高的知识点
    const weakTopics = [];
    for (const [topic, stats] of Object.entries(subjectData.topics)) {
      if (stats.total >= 2) {
        const accuracy = stats.correct / stats.total;
        if (accuracy < 0.7) {
          weakTopics.push({
            topic,
            accuracy,
            priority: 1 - accuracy // 准确率越低，优先级越高
          });
        }
      }
    }

    // 按优先级排序
    weakTopics.sort((a, b) => b.priority - a.priority);
    
    let questions = [];
    const topicCount = Math.min(weakTopics.length, count);
    
    // 每个薄弱知识点出1-2题
    for (let i = 0; i < topicCount; i++) {
      const topic = weakTopics[i].topic;
      const topicQuestions = this.questionBank.getQuestions(subject, {
        grade,
        count: Math.min(2, count - questions.length),
        type: topic,
        difficulty: 'easy' // 复习时用简单题建立信心
      });
      questions.push(...topicQuestions);
    }

    // 如果题目不够，补齐随机题
    if (questions.length < count) {
      const remaining = count - questions.length;
      const randomQuestions = this.questionBank.getQuestions(subject, {
        grade,
        count: remaining,
        type: 'mixed',
        difficulty: 'easy'
      });
      questions.push(...randomQuestions);
    }

    return questions.slice(0, count);
  }

  /**
   * 生成挑战题目 - 提高难度
   */
  generateChallengeQuestions(userProgress, subject, grade, count) {
    const subjectData = userProgress.subjects[subject];
    
    // 获取用户在该学科的整体正确率
    let accuracy = 0.5;
    if (subjectData && subjectData.questions > 0) {
      accuracy = subjectData.correct / subjectData.questions;
    }

    // 根据正确率选择难度
    let difficulty = 'easy';
    if (accuracy >= 0.8) {
      difficulty = 'hard'; // 高手用难题
    } else if (accuracy >= 0.6) {
      difficulty = 'medium';
    }

    return this.questionBank.getQuestions(subject, {
      grade,
      count,
      type: 'mixed',
      difficulty
    });
  }

  /**
   * 生成自适应题目 - 根据历史表现动态调整
   */
  generateAdaptiveQuestions(userProgress, subject, grade, count) {
    const subjectData = userProgress.subjects[subject];
    
    // 基础策略：60%复习题 + 40%新题
    let reviewCount = Math.ceil(count * 0.6);
    let newCount = count - reviewCount;
    
    // 如果是新手（<10题），全部出新题
    if (!subjectData || subjectData.questions < 10) {
      return this.questionBank.getQuestions(subject, { grade, count, type: 'mixed' });
    }

    // 如果正确率<50%，增加复习题比例
    if (subjectData.questions > 0) {
      const accuracy = subjectData.correct / subjectData.questions;
      if (accuracy < 0.5) {
        reviewCount = Math.ceil(count * 0.8);
        newCount = count - reviewCount;
      } else if (accuracy > 0.8) {
        reviewCount = Math.ceil(count * 0.3);
        newCount = count - reviewCount;
      }
    }

    // 生成复习题
    const reviewQuestions = this.generateReviewQuestions(
      userProgress, subject, grade, reviewCount
    );

    // 生成新题
    const newQuestions = this.questionBank.getQuestions(subject, {
      grade,
      count: newCount,
      type: 'mixed',
      difficulty: 'medium'
    });

    // 合并并打乱
    return this.shuffleArray([...reviewQuestions, ...newQuestions]).slice(0, count);
  }

  /**
   * 根据错题生成针对性练习
   */
  generateFromWrongQuestions(userProgress, subject, grade, count = 5) {
    const wrongQuestions = userProgress.wrongQuestions || [];
    
    // 找出该学科的错题
    const subjectWrongQuestions = wrongQuestions.filter(q => q.subject === subject);
    
    if (subjectWrongQuestions.length === 0) {
      return {
        message: `之前没有做错${this.getSubjectName(subject)}题哦！`,
        questions: this.questionBank.getQuestions(subject, { grade, count, type: 'mixed' })
      };
    }

    // 根据错题类型出题
    const topics = [...new Set(subjectWrongQuestions.map(q => q.topic))];
    let questions = [];

    for (const topic of topics.slice(0, 3)) {
      const topicQuestions = this.questionBank.getQuestions(subject, {
        grade,
        count: Math.ceil(count / Math.min(topics.length, 3)),
        type: topic,
        difficulty: 'easy'
      });
      questions.push(...topicQuestions);
    }

    // 如果不够，补随机题
    if (questions.length < count) {
      const remaining = count - questions.length;
      questions.push(...this.questionBank.getQuestions(subject, {
        grade,
        count: remaining,
        type: 'mixed',
        difficulty: 'easy'
      }));
    }

    return {
      message: `📚 根据你的错题记录，重点练习这些知识点：${topics.join('、')}`,
      questions: questions.slice(0, count)
    };
  }

  /**
   * 计算题目难度系数
   */
  calculateDifficulty(userProgress, topic, subject) {
    const subjectData = userProgress.subjects[subject];
    if (!subjectData || !subjectData.topics[topic]) {
      return 0.5; // 默认中等难度
    }

    const stats = subjectData.topics[topic];
    const accuracy = stats.correct / stats.total;

    // 准确率越高，难度系数越低
    // 0%准确率 -> 难度1.0
    // 100%准确率 -> 难度0.1
    return Math.max(0.1, Math.min(1.0, 1 - accuracy));
  }

  /**
   * 生成学习建议
   */
  generateStudySuggestions(userProgress) {
    const suggestions = [];
    const subjectMap = { math: '数学', english: '英语', chinese: '语文' };

    // 1. 分析各科强弱
    for (const [subject, data] of Object.entries(userProgress.subjects)) {
      if (data.questions === 0) {
        suggestions.push(`📖 ${subjectMap[subject]}：还没开始学习，快来试试吧！`);
        continue;
      }

      const accuracy = Math.round((data.correct / data.questions) * 100);
      
      if (accuracy >= 80) {
        suggestions.push(`🌟 ${subjectMap[subject]}掌握得很好（${accuracy}%），可以尝试挑战更高难度的题目！`);
      } else if (accuracy >= 60) {
        suggestions.push(`💪 ${subjectMap[subject]}还不错（${accuracy}%），继续保持！`);
      } else {
        suggestions.push(`📚 ${subjectMap[subject]}需要加强（${accuracy}%），建议多做一些练习题。`);
        
        // 找出薄弱知识点
        const weakTopics = [];
        for (const [topic, stats] of Object.entries(data.topics)) {
          if (stats.total >= 2 && (stats.correct / stats.total) < 0.6) {
            weakTopics.push(topic);
          }
        }
        if (weakTopics.length > 0) {
          suggestions.push(`   重点复习：${weakTopics.slice(0, 3).join('、')}`);
        }
      }
    }

    // 2. 连续学习建议
    if (userProgress.streak >= 3) {
      suggestions.push(`🔥 太棒了！已经连续学习${userProgress.streak}天！你的毅力很棒！`);
    } else if (userProgress.streak === 0 && userProgress.totalQuestions > 0) {
      suggestions.push(`📅 今天还没开始学习吧？快来完成第一个任务！`);
    }

    // 3. 错题建议
    if (userProgress.wrongQuestions && userProgress.wrongQuestions.length >= 5) {
      suggestions.push(`📝 错题本里有很多题目哦，建议定期复习错题本！`);
    }

    return suggestions;
  }

  /**
   * 格式化个性化出题菜单
   */
  formatQuestionMenu(userProgress, grade) {
    const subjectMap = { math: '数学', english: '英语', chinese: '语文' };
    
    let message = `🎯 **智能出题模式**\n\n`;
    
    message += `📊 **你的学习情况**\n`;
    for (const [subject, data] of Object.entries(userProgress.subjects)) {
      if (data.questions > 0) {
        const accuracy = Math.round((data.correct / data.questions) * 100);
        message += `   ${subjectMap[subject]}：${accuracy}% 正确率\n`;
      } else {
        message += `   ${subjectMap[subject]}：还没开始\n`;
      }
    }
    message += `\n`;
    
    message += `📋 **出题模式**\n\n`;
    message += `🔄 **智能适应** - 根据你的正确率自动调整难度\n`;
    message += `   输入："出${grade}道数学题" 或 "来点数学练习"\n\n`;
    
    message += `📝 **重点复习** - 针对错题强化训练\n`;
    message += `   输入："复习错题" 或 "做错题练习"\n\n`;
    
    message += `🔥 **挑战模式** - 尝试更高难度的题目\n`;
    message += `   输入："数学挑战" 或 "来点有难度的"\n\n`;
    
    message += `📖 **专项练习** - 集中练习某一知识点\n`;
    message += `   输入："练分数" 或 "做应用题"\n\n`;
    
    return message;
  }

  /**
   * 辅助函数：打乱数组
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * 辅助函数：获取学科名称
   */
  getSubjectName(subject) {
    const names = { math: '数学', english: '英语', chinese: '语文' };
    return names[subject] || subject;
  }
}

module.exports = SmartQuestionEngine;
