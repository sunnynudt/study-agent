/**
 * 学习进度追踪模块
 * 记录用户学习数据，分析掌握情况
 */

const fs = require('fs');
const path = require('path');
const { safeJsonParse, safeJsonStringify, formatTime } = require('../utils/helpers');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

class ProgressTracker {
  constructor() {
    this.dataDir = DATA_DIR;
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  getUserPath(userId) {
    return path.join(this.dataDir, `progress_${userId}.json`);
  }

  /**
   * 获取用户进度数据
   */
  getProgress(userId) {
    const filePath = this.getUserPath(userId);
    if (!fs.existsSync(filePath)) {
      return this.createEmptyProgress(userId);
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    return safeJsonParse(data, this.createEmptyProgress(userId));
  }

  /**
   * 创建空进度数据
   */
  createEmptyProgress(userId) {
    return {
      userId,
      grade: 3,
      createdAt: formatTime(),
      lastActiveAt: formatTime(),
      totalQuestions: 0,
      correctAnswers: 0,
      subjects: {
        math: { questions: 0, correct: 0, topics: {} },
        english: { questions: 0, correct: 0, topics: {} },
        chinese: { questions: 0, correct: 0, topics: {} }
      },
      dailyStats: [],
      wrongQuestions: [], // 错题本
      streak: 0, // 连续学习天数
      lastStudyDate: null
    };
  }

  /**
   * 记录答题
   */
  recordAnswer(userId, subject, isCorrect, question, topic = null) {
    const progress = this.getProgress(userId);
    
    // 更新总数
    progress.totalQuestions++;
    progress.lastActiveAt = formatTime();
    
    // 更新学科统计
    if (!progress.subjects[subject]) {
      progress.subjects[subject] = { questions: 0, correct: 0, topics: {} };
    }
    progress.subjects[subject].questions++;
    if (isCorrect) {
      progress.correctAnswers++;
      progress.subjects[subject].correct++;
    }
    
    // 更新知识点统计
    if (topic && progress.subjects[subject].topics[topic] !== undefined) {
      progress.subjects[subject].topics[topic].total++;
      if (isCorrect) {
        progress.subjects[subject].topics[topic].correct++;
      }
    } else if (topic) {
      progress.subjects[subject].topics[topic] = {
        total: 1,
        correct: isCorrect ? 1 : 0
      };
    }
    
    // 记录错题
    if (!isCorrect) {
      progress.wrongQuestions.push({
        question: question.q,
        answer: question.a,
        subject,
        topic,
        date: formatTime()
      });
      // 只保留最近20道错题
      if (progress.wrongQuestions.length > 20) {
        progress.wrongQuestions = progress.wrongQuestions.slice(-20);
      }
    }
    
    // 更新连续学习
    const today = new Date().toDateString();
    if (progress.lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (progress.lastStudyDate === yesterday) {
        progress.streak++;
      } else {
        progress.streak = 1;
      }
      progress.lastStudyDate = today;
    }
    
    // 保存
    this.saveProgress(userId, progress);
    
    return progress;
  }

  /**
   * 获取统计摘要
   */
  getSummary(userId) {
    const progress = this.getProgress(userId);
    const accuracy = progress.totalQuestions > 0 
      ? Math.round((progress.correctAnswers / progress.totalQuestions) * 100) 
      : 0;
    
    return {
      userId: progress.userId,
      grade: progress.grade,
      totalQuestions: progress.totalQuestions,
      correctAnswers: progress.correctAnswers,
      accuracy: `${accuracy}%`,
      streak: progress.streak,
      lastActive: progress.lastActiveAt,
      subjects: {
        math: `${progress.subjects.math.correct}/${progress.subjects.math.questions}`,
        english: `${progress.subjects.english.correct}/${progress.subjects.english.questions}`,
        chinese: `${progress.subjects.chinese.correct}/${progress.subjects.chinese.questions}`
      }
    };
  }

  /**
   * 获取弱项分析
   */
  getWeakPoints(userId) {
    const progress = this.getProgress(userId);
    const weakPoints = [];
    
    for (const [subject, data] of Object.entries(progress.subjects)) {
      for (const [topic, stats] of Object.entries(data.topics)) {
        const accuracy = stats.total > 0 
          ? (stats.correct / stats.total) * 100 
          : 0;
        
        if (accuracy < 60 && stats.total >= 2) {
          weakPoints.push({
            subject,
            topic,
            accuracy: `${Math.round(accuracy)}%`,
            total: stats.total,
            correct: stats.correct
          });
        }
      }
    }
    
    return weakPoints.sort((a, b) => a.accuracy - b.accuracy);
  }

  /**
   * 获取错题本
   */
  getWrongQuestions(userId, limit = 10) {
    const progress = this.getProgress(userId);
    return progress.wrongQuestions.slice(-limit);
  }

  /**
   * 更新年级设置
   */
  updateGrade(userId, grade) {
    const progress = this.getProgress(userId);
    progress.grade = grade;
    progress.lastActiveAt = formatTime();
    this.saveProgress(userId, progress);
  }

  /**
   * 保存进度
   */
  saveProgress(userId, progress) {
    const filePath = this.getUserPath(userId);
    fs.writeFileSync(filePath, safeJsonStringify(progress));
  }

  /**
   * 生成学习报告
   */
  generateReport(userId) {
    const progress = this.getProgress(userId);
    const accuracy = progress.totalQuestions > 0 
      ? Math.round((progress.correctAnswers / progress.totalQuestions) * 100) 
      : 0;
    
    const weakPoints = this.getWeakPoints(userId);
    const wrongQuestions = this.getWrongQuestions(userId);
    
    return {
      title: '📊 学习报告',
      date: formatTime(),
      summary: {
        总题数: progress.totalQuestions,
        正确数: progress.correctAnswers,
        正确率: `${accuracy}%`,
        连续学习: `${progress.streak}天`
      },
      subjects: {
        数学: `${progress.subjects.math.correct}/${progress.subjects.math.questions}`,
        英语: `${progress.subjects.english.correct}/${progress.subjects.english.questions}`,
        语文: `${progress.subjects.chinese.correct}/${progress.subjects.chinese.questions}`
      },
      weakPoints: weakPoints.length > 0 
        ? weakPoints.map(wp => `- ${wp.subject} - ${wp.topic}: ${wp.accuracy}`).join('\n')
        : '暂无薄弱知识点，继续保持！',
      wrongCount: wrongQuestions.length,
      encouragement: this.getEncouragementMessage(accuracy, progress.streak)
    };
  }

  getEncouragementMessage(accuracy, streak) {
    if (accuracy >= 90) return '🌟 太棒了！正确率很高！继续保持！';
    if (accuracy >= 70) return '💪 不错！继续努力，可以做得更好！';
    if (streak >= 3) return '🔥 连续学习3天以上！你的毅力很棒！';
    return '📚 每天进步一点点，最终会成功！';
  }
}

module.exports = ProgressTracker;
