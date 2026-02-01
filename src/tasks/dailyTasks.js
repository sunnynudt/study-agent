/**
 * 每日学习任务模块
 * 设置和追踪每日学习目标
 */

const fs = require('fs');
const path = require('path');
const { safeJsonParse, safeJsonStringify, formatTime, getTimePeriod } = require('../utils/helpers');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

/**
 * 每日任务配置
 */
const DEFAULT_DAILY_TASKS = {
  math: { count: 5, description: '5道数学题' },
  english: { count: 5, description: '5道英语题' },
  chinese: { count: 5, description: '5道语文题' }
};

/**
 * 每日任务类
 */
class DailyTasks {
  constructor() {
    this.dataDir = DATA_DIR;
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  getTaskPath(userId) {
    return path.join(this.dataDir, `tasks_${userId}.json`);
  }

  /**
   * 获取用户任务数据
   */
  getTasks(userId) {
    const filePath = this.getTaskPath(userId);
    if (!fs.existsSync(filePath)) {
      return this.createEmptyTasks(userId);
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const tasks = safeJsonParse(data, this.createEmptyTasks(userId));
    
    // 检查是否需要刷新每日任务
    if (this.needRefresh(tasks)) {
      return this.refreshDailyTasks(userId, tasks);
    }
    
    return tasks;
  }

  /**
   * 创建空任务数据
   */
  createEmptyTasks(userId) {
    const today = new Date().toDateString();
    return {
      userId,
      createdAt: formatTime(),
      lastRefreshDate: today,
      currentDate: today,
      dailyGoal: {
        math: 5,
        english: 5,
        chinese: 5
      },
      dailyProgress: {
        math: 0,
        english: 0,
        chinese: 0
      },
      weeklyProgress: {
        monday: { math: 0, english: 0, chinese: 0 },
        tuesday: { math: 0, english: 0, chinese: 0 },
        wednesday: { math: 0, english: 0, chinese: 0 },
        thursday: { math: 0, english: 0, chinese: 0 },
        friday: { math: 0, english: 0, chinese: 0 },
        saturday: { math: 0, english: 0, chinese: 0 },
        sunday: { math: 0, english: 0, chinese: 0 }
      },
      streak: 0,
      lastCompletedDate: null,
      totalDaysCompleted: 0
    };
  }

  /**
   * 检查是否需要刷新
   */
  needRefresh(tasks) {
    const today = new Date().toDateString();
    return tasks.currentDate !== today;
  }

  /**
   * 刷新每日任务
   */
  refreshDailyTasks(userId, oldTasks) {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    // 检查是否连续完成
    if (oldTasks.lastCompletedDate === yesterday) {
      oldTasks.streak++;
    } else if (oldTasks.lastCompletedDate !== today) {
      oldTasks.streak = 0;
    }
    
    // 重置每日进度
    const newTasks = {
      ...oldTasks,
      currentDate: today,
      dailyProgress: {
        math: 0,
        english: 0,
        chinese: 0
      }
    };
    
    this.saveTasks(userId, newTasks);
    return newTasks;
  }

  /**
   * 更新每日目标
   */
  updateDailyGoal(userId, subject, count) {
    const tasks = this.getTasks(userId);
    tasks.dailyGoal[subject] = count;
    this.saveTasks(userId, tasks);
    return tasks;
  }

  /**
   * 记录完成题目
   */
  recordCompletion(userId, subject, count = 1) {
    const tasks = this.getTasks(userId);
    tasks.dailyProgress[subject] += count;
    
    // 更新周进度
    const dayName = this.getDayName();
    tasks.weeklyProgress[dayName][subject] += count;
    
    this.saveTasks(userId, tasks);
    
    // 检查是否完成当日任务
    const completed = this.checkDailyCompletion(tasks);
    
    return {
      tasks,
      completed,
      isSubjectComplete: tasks.dailyProgress[subject] >= tasks.dailyGoal[subject]
    };
  }

  /**
   * 检查每日任务是否完成
   */
  checkDailyCompletion(tasks) {
    return (
      tasks.dailyProgress.math >= tasks.dailyGoal.math &&
      tasks.dailyProgress.english >= tasks.dailyGoal.english &&
      tasks.dailyProgress.chinese >= tasks.dailyGoal.chinese
    );
  }

  /**
   * 标记任务完成
   */
  markComplete(userId) {
    const tasks = this.getTasks(userId);
    
    if (this.checkDailyCompletion(tasks)) {
      const today = new Date().toDateString();
      tasks.lastCompletedDate = today;
      tasks.totalDaysCompleted++;
      this.saveTasks(userId, tasks);
      return true;
    }
    
    return false;
  }

  /**
   * 获取每日任务状态
   */
  getTaskStatus(userId) {
    const tasks = this.getTasks(userId);
    const subjectMap = { math: '数学', english: '英语', chinese: '语文' };
    
    const status = [];
    let totalGoal = 0;
    let totalProgress = 0;
    
    for (const [subject, goal] of Object.entries(tasks.dailyGoal)) {
      const progress = tasks.dailyProgress[subject];
      const percentage = Math.round((progress / goal) * 100);
      const emoji = progress >= goal ? '✅' : '⬜';
      
      status.push(`${emoji} ${subjectMap[subject]}: ${progress}/${goal}题 (${percentage}%)`);
      totalGoal += goal;
      totalProgress += progress;
    }
    
    const overallPercentage = Math.round((totalProgress / totalGoal) * 100);
    
    return {
      status,
      totalProgress,
      totalGoal,
      overallPercentage,
      streak: tasks.streak,
      daysCompleted: tasks.totalDaysCompleted,
      isComplete: this.checkDailyCompletion(tasks)
    };
  }

  /**
   * 获取今日任务提示
   */
  getTodayTip(userId) {
    const status = this.getTaskStatus(userId);
    const timePeriod = getTimePeriod();
    
    if (status.isComplete) {
      return {
        message: `🎉 太棒了！今天的任务全部完成！`,
        action: 'mark_complete'
      };
    }
    
    const incomplete = status.status.filter(s => s.includes('⬜'));
    const nextSubject = incomplete[0]?.match(/数学|英语|语文/)?.[0];
    
    return {
      message: `${timePeriod}好！今日任务进度：${status.overallPercentage}%`,
      next: nextSubject ? `建议：来做点${nextSubject}练习吧！` : '快完成今天的任务了！',
      action: 'continue'
    };
  }

  /**
   * 获取星期几名称
   */
  getDayName() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  }

  /**
   * 获取周统计
   */
  getWeeklyStats(userId) {
    const tasks = this.getTasks(userId);
    const weekProgress = tasks.weeklyProgress;
    const subjectMap = { math: '数学', english: '英语', chinese: '语文' };
    
    const stats = {
      days: [],
      subjects: {}
    };
    
    // 整理每天的数据
    for (const [day, data] of Object.entries(weekProgress)) {
      const dayTotal = data.math + data.english + data.chinese;
      stats.days.push({
        name: day,
        total: dayTotal,
        ...data
      });
    }
    
    // 整理每科的数据
    for (const subject of ['math', 'english', 'chinese']) {
      let total = 0;
      for (const day of Object.values(weekProgress)) {
        total += day[subject];
      }
      stats.subjects[subjectMap[subject]] = total;
    }
    
    return stats;
  }

  /**
   * 保存任务数据
   */
  saveTasks(userId, tasks) {
    const filePath = this.getTaskPath(userId);
    fs.writeFileSync(filePath, safeJsonStringify(tasks));
  }
}

module.exports = DailyTasks;
