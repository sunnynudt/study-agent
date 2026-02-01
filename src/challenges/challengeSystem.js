/**
 * 🎮 趣味挑战系统 - 让学习像打游戏一样上瘾！
 */

const fs = require('fs');
const path = require('path');
const { randomPick, shuffle, safeJsonParse, safeJsonStringify, formatTime } = require('../utils/helpers');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

/**
 * 挑战类型定义
 */
const CHALLENGE_TYPES = {
  // 数学挑战
  'speed_math': {
    name: '⚡ 闪电计算',
    description: '60秒内完成尽可能多的计算题',
    duration: 60,
    bonusPoints: 2, // 每题额外积分
    subject: 'math',
    minGrade: 2
  },
  'mind_math': {
    name: '🧠 智慧数学',
    description: '3道思维拓展题，考验你的数学思维',
    duration: null,
    bonusPoints: 3,
    subject: 'math',
    minGrade: 3
  },
  
  // 英语挑战
  'word_master': {
    name: '👑 单词大王',
    description: '限时挑战拼写20个单词',
    duration: 120,
    bonusPoints: 2,
    subject: 'english',
    minGrade: 2
  },
  'speaking_star': {
    name: '⭐ 口语之星',
    description: '大声朗读3段英语短文',
    duration: null,
    bonusPoints: 3,
    subject: 'english',
    minGrade: 3
  },
  
  // 语文挑战
  'poetry_master': {
    name: '📜 诗词达人',
    description: '挑战背诵5首古诗',
    duration: null,
    bonusPoints: 3,
    subject: 'chinese',
    minGrade: 2
  },
  'story_teller': {
    name: '📖 故事大王',
    description: '根据图片或关键词编一个小故事',
    duration: null,
    bonusPoints: 4,
    subject: 'chinese',
    minGrade: 3
  },
  
  // 跨学科挑战
  'daily_boss': {
    name: '👹 每日BOSS',
    description: '综合3科的高难度挑战题，完成有神秘奖励！',
    duration: null,
    bonusPoints: 5,
    subject: 'mixed',
    minGrade: 2
  },
  'weekend_champion': {
    name: '🏆 周末冠军',
    description: '周末专属挑战，题量大、难度高、奖励丰厚！',
    duration: null,
    bonusPoints: 6,
    subject: 'mixed',
    minGrade: 2
  }
};

/**
 * 成就勋章定义
 */
const CHALLENGE_ACHIEVEMENTS = {
  'first_challenge': {
    id: 'first_challenge',
    name: '🎮 首次挑战',
    description: '完成第一个挑战',
    icon: '🎮',
    condition: (stats) => stats.totalCompleted >= 1
  },
  'challenge_warrior': {
    id: 'challenge_warrior',
    name: '⚔️ 挑战勇士',
    description: '完成10个挑战',
    icon: '⚔️',
    condition: (stats) => stats.totalCompleted >= 10
  },
  'speed_demon': {
    id: 'speed_demon',
    name: '⚡ 速度之王',
    description: '完成5个闪电计算挑战',
    icon: '⚡',
    condition: (stats) => stats.byType?.speed_math >= 5
  },
  'perfect_streak': {
    id: 'perfect_streak',
    name: '💯 完美三连',
    description: '连续3个挑战全部正确',
    icon: '💯',
    condition: (stats) => stats.perfectStreak >= 3
  },
  'early_bird': {
    id: 'early_bird',
    name: '🌅 早起鸟',
    description: '早上6-8点完成一个挑战',
    icon: '🌅',
    condition: (stats) => stats.earlyBirdCompleted >= 1
  },
  'night_owl': {
    id: 'night_owl',
    name: '🦉 夜猫子',
    description: '晚上8-10点完成一个挑战',
    icon: '🦉',
    condition: (stats) => stats.nightOwlCompleted >= 1
  },
  'weekend_warrior': {
    id: 'weekend_warrior',
    name: '🎯 周末战士',
    description: '完成5个周末挑战',
    icon: '🎯',
    condition: (stats) => stats.byType?.weekend_champion >= 5
  }
};

class ChallengeSystem {
  constructor() {
    this.dataDir = DATA_DIR;
    this.ensureDataDir();
    this.challenges = CHALLENGE_TYPES;
    this.achievements = CHALLENGE_ACHIEVEMENTS;
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  getDataPath(userId) {
    return path.join(this.dataDir, `challenge_${userId}.json`);
  }

  /**
   * 获取用户挑战数据
   */
  getUserData(userId) {
    const filePath = this.getDataPath(userId);
    if (!fs.existsSync(filePath)) {
      return this.createEmptyData(userId);
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return safeJsonParse(data, this.createEmptyData(userId));
  }

  createEmptyData(userId) {
    return {
      userId,
      createdAt: formatTime(),
      totalCompleted: 0,
      totalPoints: 0,
      currentStreak: 0,
      perfectStreak: 0,
      bestScores: {},
      recentChallenges: [],
      byType: {},
      achievements: [],
      earlyBirdCompleted: 0,
      nightOwlCompleted: 0,
      lastChallengeDate: null
    };
  }

  /**
   * 获取可用挑战列表
   */
  getAvailableChallenges(grade) {
    const available = [];
    for (const [key, challenge] of Object.entries(this.challenges)) {
      if (grade >= challenge.minGrade) {
        // 检查是否是周末挑战
        if (key === 'weekend_champion') {
          const isWeekend = [0, 6].includes(new Date().getDay());
          if (!isWeekend) continue;
        }
        available.push({
          id: key,
          ...challenge
        });
      }
    }
    return available;
  }

  /**
   * 开始一个挑战
   */
  startChallenge(userId, challengeId, grade) {
    const challenge = this.challenges[challengeId];
    if (!challenge) {
      return { success: false, message: '未找到该挑战' };
    }

    // 检查年级限制
    if (grade < challenge.minGrade) {
      return { 
        success: false, 
        message: `这个挑战适合${challenge.minGrade}年级及以上的小朋友` 
      };
    }

    // 检查是否是周末挑战
    if (challengeId === 'weekend_champion') {
      const isWeekend = [0, 6].includes(new Date().getDay());
      if (!isWeekend) {
        return { 
          success: false, 
          message: '周末挑战只在周六、周日开放哦！' 
        };
      }
    }

    const userData = this.getUserData(userId);
    
    // 检查今日是否已完成该挑战
    const today = new Date().toDateString();
    const todayChallenge = userData.recentChallenges.find(
      c => c.date === today && c.challengeId === challengeId
    );
    if (todayChallenge) {
      return { 
        success: false, 
        message: '今天已经完成过这个挑战了，明天再来吧！' 
      };
    }

    return {
      success: true,
      challenge: {
        ...challenge,
        instructions: this.getChallengeInstructions(challengeId, grade),
        scoring: {
          basePoints: 10,
          bonusPoints: challenge.bonusPoints,
          perfectBonus: 5
        }
      }
    };
  }

  /**
   * 获取挑战说明
   */
  getChallengeInstructions(challengeId, grade) {
    const instructions = {
      'speed_math': `在60秒内，尽可能快地完成计算题！每道题基础分10分，额外获得${CHALLENGE_TYPES.speed_math.bonusPoints}分/题 bonus！`,
      'mind_math': `3道思维挑战题，考验你的数学逻辑！答对每道题得10分，如果3道全对，额外获得5分奖励！`,
      'word_master': `限时2分钟拼写20个单词！每个正确拼写得10分，额外获得${CHALLENGE_TYPES.word_master.bonusPoints}分/个 bonus！`,
      'speaking_star': `大声朗读3段英语短文，录下你的声音！每段朗读正确得10分，额外获得3分 bonus！`,
      'poetry_master': `挑战背诵5首古诗！每首正确背诵得10分，额外获得3分 bonus！`,
      'story_teller': `根据给定的关键词，编一个有趣的小故事！故事完整、有创意得10-15分！`,
      'daily_boss': `这是今天的BOSS挑战题！包含3科的难题，答对一题得15分！完成有神秘奖励！`,
      'weekend_champion': `周末特别挑战！题量大、难度高、奖励丰厚！完成全部题目得20分/题，还有额外神秘奖励！`
    };
    return instructions[challengeId] || '完成挑战获得积分！';
  }

  /**
   * 完成挑战并计分
   */
  completeChallenge(userId, challengeId, results) {
    const { correctCount, totalCount, isPerfect, timeSpent } = results;
    const challenge = this.challenges[challengeId];
    const userData = this.getUserData(userId);

    // 计算得分
    const basePoints = correctCount * 10;
    const bonusPoints = isPerfect ? (correctCount * challenge.bonusPoints) + 5 : (correctCount * challenge.bonusPoints);
    const totalPoints = basePoints + bonusPoints;

    // 更新用户数据
    userData.totalCompleted++;
    userData.totalPoints += totalPoints;
    userData.lastChallengeDate = formatTime();
    
    // 更新类型统计
    userData.byType[challengeId] = (userData.byType[challengeId] || 0) + 1;
    
    // 更新完美 streak
    if (isPerfect) {
      userData.perfectStreak++;
    } else {
      userData.perfectStreak = 0;
    }

    // 记录挑战
    const today = new Date().toDateString();
    userData.recentChallenges.push({
      challengeId,
      date: today,
      score: totalPoints,
      correct: correctCount,
      total: totalCount,
      perfect: isPerfect,
      timeSpent
    });

    // 只保留最近20条记录
    if (userData.recentChallenges.length > 20) {
      userData.recentChallenges = userData.recentChallenges.slice(-20);
    }

    // 检查时间段成就
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 8) {
      userData.earlyBirdCompleted++;
    }
    if (hour >= 20 && hour < 23) {
      userData.nightOwlCompleted++;
    }

    // 保存数据
    this.saveUserData(userId, userData);

    // 检查新成就
    const newAchievements = this.checkAchievements(userData);

    return {
      success: true,
      score: {
        basePoints,
        bonusPoints,
        total: totalPoints
      },
      streak: userData.perfectStreak,
      newAchievements
    };
  }

  /**
   * 检查成就
   */
  checkAchievements(userData) {
    const newAchievements = [];
    for (const [key, achievement] of Object.entries(this.achievements)) {
      if (!userData.achievements.includes(key) && achievement.condition(userData)) {
        userData.achievements.push(key);
        newAchievements.push(achievement);
      }
    }
    if (newAchievements.length > 0) {
      this.saveUserData(userData.userId, userData);
    }
    return newAchievements;
  }

  /**
   * 格式化挑战列表
   */
  formatChallengeList(grade) {
    const challenges = this.getAvailableChallenges(grade);
    if (challenges.length === 0) {
      return '今天暂时没有可用的挑战，明天再来吧！';
    }

    let message = `🎮 **今日挑战** (${challenges.length}个可用)\n\n`;
    
    // 检查是否是周末
    const isWeekend = [0, 6].includes(new Date().getDay());
    
    for (const challenge of challenges) {
      const status = this.getChallengeStatus(grade, challenge.id);
      message += `${status.icon} **${challenge.name}**\n`;
      message += `   ${challenge.description}\n`;
      message += `   基础分：10分/题 | Bonus：+${challenge.bonusPoints}分\n`;
      if (challenge.duration) {
        message += `   ⏱️ 限时：${challenge.duration}秒\n`;
      }
      message += `   ${status.text}\n\n`;
    }

    message += `💡 输入"开始挑战 [挑战名]"来参与！\n`;
    message += `例如："开始挑战 闪电计算"\n`;
    
    if (!isWeekend) {
      message += `\n🌟 提示：周末有特别的"周末冠军"挑战哦！`;
    }

    return message;
  }

  /**
   * 获取挑战状态
   */
  getChallengeStatus(grade, challengeId) {
    // 这里可以添加冷却时间等逻辑
    return {
      icon: '🎯',
      text: '可参与'
    };
  }

  /**
   * 格式化成就列表
   */
  formatAchievements(userId) {
    const userData = this.getUserData(userId);
    const earned = [];
    const locked = [];

    for (const [key, achievement] of Object.entries(this.achievements)) {
      if (userData.achievements.includes(key)) {
        earned.push(achievement);
      } else {
        locked.push(achievement);
      }
    }

    let message = `🏆 **挑战成就** (${earned.length}/${Object.keys(this.achievements).length})\n\n`;

    if (earned.length > 0) {
      message += `**已解锁**\n`;
      earned.forEach(a => {
        message += `${a.icon} ${a.name} - ${a.description}\n`;
      });
      message += '\n';
    }

    if (locked.length > 0) {
      message += `🔒 **待解锁**\n`;
      locked.slice(0, 4).forEach(a => {
        message += `${a.icon} ${a.name}\n`;
      });
      if (locked.length > 4) {
        message += `...还有${locked.length - 4}个`;
      }
    }

    return message;
  }

  /**
   * 获取排行榜
   */
  getLeaderboard(userId, limit = 10) {
    // 遍历所有用户数据文件
    const leaderboard = [];
    const files = fs.readdirSync(this.dataDir).filter(f => f.startsWith('challenge_'));
    
    for (const file of files) {
      const filePath = path.join(this.dataDir, file);
      const data = fs.readFileSync(filePath, 'utf8');
      const userData = safeJsonParse(data);
      
      leaderboard.push({
        userId: userData.userId,
        totalPoints: userData.totalPoints,
        totalCompleted: userData.totalCompleted,
        perfectStreak: userData.perfectStreak
      });
    }

    // 排序
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // 找当前用户排名
    const userRank = leaderboard.findIndex(u => u.userId === userId) + 1;

    return {
      leaderboard: leaderboard.slice(0, limit),
      userRank,
      totalUsers: leaderboard.length
    };
  }

  /**
   * 格式化排行榜
   */
  formatLeaderboard(userId) {
    const { leaderboard, userRank, totalUsers } = this.getLeaderboard(userId);
    
    let message = `🏆 **挑战排行榜** (共${totalUsers}人参与)\n\n`;
    
    leaderboard.forEach((user, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 4}.`;
      const isCurrentUser = user.userId === userId;
      const name = isCurrentUser ? '你' : `用户${user.userId.slice(-4)}`;
      message += `${medal} **${name}** - ${user.totalPoints}分 (${user.totalCompleted}次挑战)\n`;
    });
    
    if (userRank > 10) {
      message += `\n📍 你的排名：第${userRank}名，继续加油！`;
    }

    return message;
  }

  /**
   * 保存用户数据
   */
  saveUserData(userId, data) {
    const filePath = this.getDataPath(userId);
    fs.writeFileSync(filePath, safeJsonStringify(data));
  }
}

module.exports = ChallengeSystem;
