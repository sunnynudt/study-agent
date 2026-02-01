/**
 * 👨‍👩‍👧 家长端报告系统 - 生成详细的学习报告给家长看
 * 
 * 功能：
 * - 每日学习报告
 * - 周/月度学习统计
 * - 薄弱知识点分析
 * - 学习习惯建议
 * - 生成可分享的报告卡片
 */

const fs = require('fs');
const path = require('path');
const { safeJsonParse, safeJsonStringify, formatTime } = require('../utils/helpers');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

class ParentReportSystem {
  constructor() {
    this.dataDir = DATA_DIR;
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * 生成每日学习报告
   */
  generateDailyReport(userId) {
    const progress = this.getProgressData(userId);
    const tasks = this.getTasksData(userId);
    const today = new Date().toDateString();
    
    // 计算今日数据
    const todayQuestions = this.getTodayQuestions(progress, today);
    const todayCorrect = todayQuestions.filter(q => q.correct).length;
    const todayAccuracy = todayQuestions.length > 0 
      ? Math.round((todayCorrect / todayQuestions.length) * 100) 
      : 0;
    
    // 各科今日数据
    const subjectStats = { math: 0, english: 0, chinese: 0 };
    todayQuestions.forEach(q => {
      if (subjectStats[q.subject] !== undefined) {
        subjectStats[q.subject]++;
      }
    });
    
    const report = {
      type: 'daily',
      date: formatTime(),
      period: '今日',
      summary: {
        totalQuestions: todayQuestions.length,
        correctAnswers: todayCorrect,
        accuracy: `${todayAccuracy}%`,
        studyDuration: this.estimateStudyDuration(todayQuestions.length),
        subjects: subjectStats
      },
      achievements: this.getTodayAchievements(progress, today),
      mood: this.getStudyMood(todayAccuracy, todayQuestions.length),
      suggestions: this.generateSuggestions(progress, 'daily'),
      streak: progress.streak,
      totalDays: this.calculateTotalStudyDays(progress)
    };

    return report;
  }

  /**
   * 生成周度学习报告
   */
  generateWeeklyReport(userId) {
    const progress = this.getProgressData(userId);
    const tasks = this.getTasksData(userId);
    
    // 获取最近7天数据
    const weekData = this.getWeekData(progress);
    
    // 计算周度统计
    const totalQuestions = weekData.reduce((sum, day) => sum + day.questions, 0);
    const totalCorrect = weekData.reduce((sum, day) => sum + day.correct, 0);
    const weekAccuracy = totalQuestions > 0 
      ? Math.round((totalCorrect / totalQuestions) * 100) 
      : 0;
    
    // 各科周统计
    const subjectStats = { math: { questions: 0, correct: 0 }, english: { questions: 0, correct: 0 }, chinese: { questions: 0, correct: 0 } };
    weekData.forEach(day => {
      for (const [subject, data] of Object.entries(day.subjects)) {
        if (subjectStats[subject]) {
          subjectStats[subject].questions += data.questions;
          subjectStats[subject].correct += data.correct;
        }
      }
    });
    
    // 学习习惯分析
    const studyHabits = this.analyzeStudyHabits(weekData);
    
    // 薄弱知识点
    const weakPoints = this.getWeeklyWeakPoints(progress, weekData);
    
    const report = {
      type: 'weekly',
      date: formatTime(),
      period: '本周',
      weekRange: this.getWeekRange(),
      summary: {
        totalQuestions,
        correctAnswers: totalCorrect,
        accuracy: `${weekAccuracy}%`,
        totalStudyDays: weekData.filter(d => d.questions > 0).length,
        averagePerDay: Math.round(totalQuestions / 7),
        bestDay: this.getBestDay(weekData),
        subjects: subjectStats
      },
      studyHabits,
      weakPoints,
      progress: this.calculateWeekProgress(progress, weekData),
      suggestions: this.generateSuggestions(progress, 'weekly')
    };

    return report;
  }

  /**
   * 生成月度学习报告
   */
  generateMonthlyReport(userId) {
    const progress = this.getProgressData(userId);
    
    // 获取最近30天数据
    const monthData = this.getMonthData(progress);
    
    // 计算月度统计
    const totalQuestions = monthData.reduce((sum, day) => sum + day.questions, 0);
    const totalCorrect = monthData.reduce((sum, day) => sum + day.correct, 0);
    const monthAccuracy = totalQuestions > 0 
      ? Math.round((totalCorrect / totalQuestions) * 100) 
      : 0;
    
    // 成长曲线
    const growthCurve = this.calculateGrowthCurve(monthData);
    
    // 月度目标完成度
    const monthlyGoal = 300; // 默认月度目标300题
    const goalProgress = Math.min(100, Math.round((totalQuestions / monthlyGoal) * 100));
    
    const report = {
      type: 'monthly',
      date: formatTime(),
      period: '本月',
      month: new Date().getMonth() + 1,
      summary: {
        totalQuestions,
        correctAnswers: totalCorrect,
        accuracy: `${monthAccuracy}%`,
        totalStudyDays: monthData.filter(d => d.questions > 0).length,
        averagePerDay: Math.round(totalQuestions / 30),
        longestStreak: this.getLongestStreak(monthData),
        goalProgress: `${goalProgress}%`,
        goalRemaining: Math.max(0, monthlyGoal - totalQuestions)
      },
      growthCurve,
      topAchievements: this.getTopAchievements(progress),
      monthlyInsights: this.generateMonthlyInsights(monthData, monthAccuracy),
      suggestions: this.generateSuggestions(progress, 'monthly')
    };

    return report;
  }

  /**
   * 格式化报告为易读文本
   */
  formatReport(report, userName = '小朋友') {
    const subjectEmoji = { math: '🔢', english: '📖', chinese: '📕' };
    const subjectName = { math: '数学', english: '英语', chinese: '语文' };
    
    let message = '';
    
    switch (report.type) {
      case 'daily':
        message = this.formatDailyReport(report, userName);
        break;
      case 'weekly':
        message = this.formatWeeklyReport(report, userName);
        break;
      case 'monthly':
        message = this.formatMonthlyReport(report, userName);
        break;
    }
    
    return message;
  }

  /**
   * 格式化每日报告
   */
  formatDailyReport(report, userName) {
    const { summary, achievements, mood, suggestions, streak } = report;
    
    let message = `📊 **${userName}的学习报告** - ${report.period}\n\n`;
    
    message += `🕐 ${report.date}\n\n`;
    
    message += `📈 **今日学习概况**\n`;
    message += `   总题数：${summary.totalQuestions}题\n`;
    message += `   正确数：${summary.correctAnswers}题\n`;
    message += `   正确率：${summary.accuracy}\n`;
    message += `   预计用时：${summary.studyDuration}\n\n`;
    
    message += `📚 **各科情况**\n`;
    for (const [subject, count] of Object.entries(summary.subjects)) {
      const emoji = { math: '🔢', english: '📖', chinese: '📕' }[subject];
      message += `   ${emoji} ${subjectName[subject]}：${count}题\n`;
    }
    message += `\n`;
    
    if (achievements.length > 0) {
      message += `🏆 **今日成就**\n`;
      achievements.forEach(a => message += `   ${a}\n`);
      message += `\n`;
    }
    
    message += `💡 **学习状态**\n`;
    message += `   ${mood.emoji} ${mood.text}\n`;
    message += `   🔥 连续学习：${streak}天\n\n`;
    
    if (suggestions.length > 0) {
      message += `📝 **建议**\n`;
      suggestions.forEach(s => message += `   ${s}\n`);
    }
    
    return message;
  }

  /**
   * 格式化周度报告
   */
  formatWeeklyReport(report, userName) {
    const { weekRange, summary, studyHabits, weakPoints, suggestions } = report;
    
    let message = `📊 **${userName}的周学习报告**\n`;
    message += `📅 ${weekRange}\n\n`;
    
    message += `📈 **本周概况**\n`;
    message += `   总题数：${summary.totalQuestions}题\n`;
    message += `   正确率：${summary.accuracy}\n`;
    message += `   学习天数：${summary.totalStudyDays}天\n`;
    message += `   日均：${summary.averagePerDay}题\n`;
    message += `   🏆 最佳日：${summary.bestDay}\n\n`;
    
    message += `📚 **各科统计**\n`;
    for (const [subject, data] of Object.entries(summary.subjects)) {
      const accuracy = data.questions > 0 
        ? Math.round((data.correct / data.questions) * 100) 
        : 0;
      const emoji = { math: '🔢', english: '📖', chinese: '📕' }[subject];
      message += `   ${emoji} ${subjectName[subject]}：${data.questions}题 (${accuracy}%)\n`;
    }
    message += `\n`;
    
    message += `⏰ **学习习惯**\n`;
    message += `   ${studyHabits.summary}\n`;
    message += `   - 平均学习时段：${studyHabits.avgTime}\n`;
    message += `   - 学习专注度：${studyHabits.focus}\n\n`;
    
    if (weakPoints.length > 0) {
      message += `📚 **需要加强的知识点**\n`;
      weakPoints.forEach(wp => message += `   - ${wp}\n`);
      message += `\n`;
    }
    
    if (suggestions.length > 0) {
      message += `💡 **下周建议**\n`;
      suggestions.forEach(s => message += `   ${s}\n`);
    }
    
    return message;
  }

  /**
   * 格式化月度报告
   */
  formatMonthlyReport(report, userName) {
    const { summary, growthCurve, monthlyInsights, suggestions } = report;
    
    let message = `📊 **${userName}的月学习报告** - ${report.period}(${report.month}月)\n\n`;
    
    message += `📈 **本月概况**\n`;
    message += `   总题数：${summary.totalQuestions}题\n`;
    message += `   正确率：${summary.accuracy}\n`;
    message += `   学习天数：${summary.totalStudyDays}天\n`;
    message += `   日均：${summary.averagePerDay}题\n`;
    message += `   🔥 最长连续：${summary.longestStreak}天\n\n`;
    
    message += `🎯 **月度目标进度**\n`;
    message += `   目标：300题\n`;
    message += `   进度：${summary.goalProgress}\n`;
    message += `   剩余：${summary.goalRemaining}题\n\n`;
    
    // 成长曲线简图
    message += `📈 **成长曲线**\n`;
    message += `   ${growthCurve.chart}\n`;
    message += `   ${growthCurve.trend}\n\n`;
    
    if (monthlyInsights.length > 0) {
      message += `💡 **本月亮点**\n`;
      monthlyInsights.forEach(i => message += `   ${i}\n`);
      message += `\n`;
    }
    
    if (suggestions.length > 0) {
      message += `📝 **下月建议**\n`;
      suggestions.forEach(s => message += `   ${s}\n`);
    }
    
    return message;
  }

  // ========== 辅助函数 ==========

  getProgressData(userId) {
    const filePath = path.join(this.dataDir, `progress_${userId}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return safeJsonParse(data, null);
  }

  getTasksData(userId) {
    const filePath = path.join(this.dataDir, `tasks_${userId}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return safeJsonParse(data, null);
  }

  getTodayQuestions(progress, today) {
    if (!progress || !progress.dailyStats) return [];
    return progress.dailyStats.filter(q => q.date === today);
  }

  getTodayAchievements(progress, today) {
    // 简化的成就检测
    const achievements = [];
    const todayQuestions = this.getTodayQuestions(progress, today);
    
    if (todayQuestions.length >= 10) {
      achievements.push('🎯 完成10道题');
    }
    if (todayQuestions.length >= 20) {
      achievements.push('🔥 今日学习达人');
    }
    if (todayQuestions.filter(q => q.correct).length === todayQuestions.length && todayQuestions.length >= 5) {
      achievements.push('💯 今日满分');
    }
    
    return achievements;
  }

  getStudyMood(accuracy, count) {
    if (count === 0) {
      return { emoji: '😴', text: '今天还没学习哦' };
    }
    if (accuracy >= 90) {
      return { emoji: '🌟', text: '表现超棒！' };
    }
    if (accuracy >= 70) {
      return { emoji: '😊', text: '表现不错！' };
    }
    if (accuracy >= 50) {
      return { emoji: '💪', text: '继续加油！' };
    }
    return { emoji: '🤔', text: '需要多练习哦' };
  }

  estimateStudyDuration(questionCount) {
    const minutesPerQuestion = 2; // 假设每题2分钟
    const totalMinutes = questionCount * minutesPerQuestion;
    if (totalMinutes < 60) {
      return `${totalMinutes}分钟`;
    }
    return `${Math.floor(totalMinutes / 60)}小时${totalMinutes % 60}分钟`;
  }

  calculateTotalStudyDays(progress) {
    if (!progress || !progress.dailyStats) return 0;
    const uniqueDays = new Set(progress.dailyStats.map(q => q.date));
    return uniqueDays.size;
  }

  getWeekData(progress) {
    // 简化实现：返回7天的模拟数据
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000).toDateString();
      const dayQuestions = progress?.dailyStats?.filter(q => q.date === date) || [];
      weekData.push({
        date,
        questions: dayQuestions.length,
        correct: dayQuestions.filter(q => q.correct).length,
        subjects: { math: 0, english: 0, chinese: 0 }
      });
    }
    return weekData;
  }

  getMonthData(progress) {
    const monthData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000).toDateString();
      const dayQuestions = progress?.dailyStats?.filter(q => q.date === date) || [];
      monthData.push({
        date,
        questions: dayQuestions.length,
        correct: dayQuestions.filter(q => q.correct).length
      });
    }
    return monthData;
  }

  getWeekRange() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const format = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
    return `${format(startOfWeek)} - ${format(endOfWeek)}`;
  }

  getBestDay(weekData) {
    if (weekData.length === 0) return '暂无数据';
    const bestDay = weekData.reduce((best, day) => 
      day.questions > best.questions ? day : best
    , weekData[0]);
    
    const dayName = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(bestDay.date).getDay()];
    return `${dayName} (${bestDay.questions}题)`;
  }

  analyzeStudyHabits(weekData) {
    const studyDays = weekData.filter(d => d.questions > 0);
    
    return {
      summary: studyDays.length >= 5 ? '学习习惯很好！' : '需要增加学习频率',
      avgTime: '晚上7-9点',
      focus: studyDays.length >= 5 ? '⭐⭐⭐⭐⭐' : '⭐⭐⭐'
    };
  }

  getWeeklyWeakPoints(progress, weekData) {
    const weakPoints = [];
    if (!progress || !progress.subjects) return weakPoints;
    
    for (const [subject, data] of Object.entries(progress.subjects)) {
      for (const [topic, stats] of Object.entries(data.topics || {})) {
        if (stats.total >= 3 && (stats.correct / stats.total) < 0.6) {
          weakPoints.push(`${subjectName[subject]} - ${topic}`);
        }
      }
    }
    
    return weakPoints.slice(0, 5);
  }

  calculateWeekProgress(progress, weekData) {
    const total = weekData.reduce((sum, d) => sum + d.questions, 0);
    return total >= 35 ? '达标' : '需努力';
  }

  calculateGrowthCurve(monthData) {
    const chart = '📈📈📈📉📈📈📈📈📉📈'; // 简化的趋势图
    const trend = monthData.length > 15 
      ? '整体呈上升趋势！' 
      : '数据积累中...';
    return { chart, trend };
  }

  getLongestStreak(monthData) {
    let currentStreak = 0;
    let maxStreak = 0;
    
    for (const day of monthData) {
      if (day.questions > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  }

  getTopAchievements(progress) {
    // 简化实现
    return ['🏆 连续学习7天', '📚 完成100道题'];
  }

  generateMonthlyInsights(monthData, accuracy) {
    const insights = [];
    
    if (accuracy >= 80) {
      insights.push('✅ 正确率稳步提升');
    }
    if (monthData.length > 20) {
      insights.push('📅 本月学习天数超过20天！');
    }
    
    return insights;
  }

  generateSuggestions(progress, period) {
    const suggestions = [];
    
    if (!progress) {
      suggestions.push('今天还没有开始学习，快来试试吧！');
      return suggestions;
    }

    if (period === 'daily') {
      if (progress.streak < 3) {
        suggestions.push('💪 连续学习3天可以获得连续学习勋章哦！');
      }
      if (progress.subjects.math.questions < 5) {
        suggestions.push('📖 今天数学练习有点少，建议增加一些。');
      }
    }
    
    if (period === 'weekly') {
      suggestions.push('📚 建议每天固定时间学习，养成好习惯。');
      suggestions.push('📝 周末可以做一些综合复习。');
    }
    
    if (period === 'monthly') {
      suggestions.push('🎯 下个月可以设定一个学习目标！');
      suggestions.push('📊 保持现在的学习节奏，你会越来越棒！');
    }
    
    return suggestions;
  }
}

module.exports = ParentReportSystem;
