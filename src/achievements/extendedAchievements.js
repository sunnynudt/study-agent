/**
 * 🏆 扩展成就系统 - 更多有趣成就和勋章
 */

const { randomPick } = require('../utils/helpers');

/**
 * 扩展成就定义
 */
const EXTENDED_ACHIEVEMENTS = {
  // 时间相关成就
  'early_bird': {
    id: 'early_bird',
    name: '🌅 早起鸟',
    description: '早上6-8点完成5道题',
    condition: (progress, context) => {
      const hour = context?.hour || new Date().getHours();
      return hour >= 6 && hour < 8 && context?.questionsToday >= 5;
    },
    icon: '🌅',
    tier: 'bronze'
  },
  
  'night_owl': {
    id: 'night_owl',
    name: '🦉 夜猫子',
    description: '晚上8-10点完成5道题',
    condition: (progress, context) => {
      const hour = context?.hour || new Date().getHours();
      return hour >= 20 && hour < 22 && context?.questionsToday >= 5;
    },
    icon: '🦉',
    tier: 'bronze'
  },
  
  'weekend_warrior': {
    id: 'weekend_warrior',
    name: '🎯 周末战士',
    description: '周末完成20道题',
    condition: (progress, context) => {
      const day = new Date().getDay();
      return (day === 0 || day === 6) && context?.questionsToday >= 20;
    },
    icon: '🎯',
    tier: 'silver'
  },
  
  // 连续性成就
  'streak_3': {
    id: 'streak_3',
    name: '🔥 三天打鱼',
    description: '连续学习3天',
    condition: (progress) => progress.streak >= 3,
    icon: '🔥',
    tier: 'bronze'
  },
  
  'streak_7': {
    id: 'streak_7',
    name: '🌟 一周坚持',
    description: '连续学习7天',
    condition: (progress) => progress.streak >= 7,
    icon: '🌟',
    tier: 'silver'
  },
  
  'streak_30': {
    id: 'streak_30',
    name: '💪 月度学习者',
    description: '连续学习30天',
    condition: (progress) => progress.streak >= 30,
    icon: '💪',
    tier: 'gold'
  },
  
  // 数量成就
  'first_question': {
    id: 'first_question',
    name: '🎯 初露锋芒',
    description: '完成第一道题目',
    condition: (progress) => progress.totalQuestions >= 1,
    icon: '🎯',
    tier: 'bronze'
  },
  
  'ten_questions': {
    id: 'ten_questions',
    name: '📝 十题达人',
    description: '完成10道题目',
    condition: (progress) => progress.totalQuestions >= 10,
    icon: '📝',
    tier: 'bronze'
  },
  
  'fifty_questions': {
    id: 'fifty_questions',
    name: '📚 学富五车',
    description: '完成50道题目',
    condition: (progress) => progress.totalQuestions >= 50,
    icon: '📚',
    tier: 'silver'
  },
  
  'hundred_questions': {
    id: 'hundred_questions',
    name: '🏆 百题斩',
    description: '完成100道题目',
    condition: (progress) => progress.totalQuestions >= 100,
    icon: '🏆',
    tier: 'gold'
  },
  
  'five_hundred': {
    id: 'five_hundred',
    name: '👑 五百雄兵',
    description: '完成500道题目',
    condition: (progress) => progress.totalQuestions >= 500,
    icon: '👑',
    tier: 'gold'
  },
  
  'thousand_master': {
    id: 'thousand_master',
    name: '⭐ 千题王',
    description: '完成1000道题目',
    condition: (progress) => progress.totalQuestions >= 1000,
    icon: '⭐',
    tier: 'diamond'
  },
  
  // 正确率成就
  'accuracy_70': {
    id: 'accuracy_70',
    name: '👍 70%准确率',
    description: '正确率达到70%（至少50题）',
    condition: (progress) => {
      if (progress.totalQuestions < 50) return false;
      return (progress.correctAnswers / progress.totalQuestions) >= 0.7;
    },
    icon: '👍',
    tier: 'bronze'
  },
  
  'accuracy_80': {
    id: 'accuracy_80',
    name: '🎯 80%准确率',
    description: '正确率达到80%（至少50题）',
    condition: (progress) => {
      if (progress.totalQuestions < 50) return false;
      return (progress.correctAnswers / progress.totalQuestions) >= 0.8;
    },
    icon: '🎯',
    tier: 'silver'
  },
  
  'accuracy_90': {
    id: 'accuracy_90',
    name: '🌟 90%准确率',
    description: '正确率达到90%（至少50题）',
    condition: (progress) => {
      if (progress.totalQuestions < 50) return false;
      return (progress.correctAnswers / progress.totalQuestions) >= 0.9;
    },
    icon: '🌟',
    tier: 'gold'
  },
  
  'perfect_10': {
    id: 'perfect_10',
    name: '💯 满分10',
    description: '一次完成10道题全部正确',
    condition: (progress, context) => context?.perfectSession === true && context?.sessionQuestions >= 10,
    icon: '💯',
    tier: 'diamond'
  },
  
  // 学科成就
  'math_master': {
    id: 'math_master',
    name: '🔢 数学小达人',
    description: '完成20道数学题',
    condition: (progress) => progress.subjects.math?.questions >= 20,
    icon: '🔢',
    tier: 'bronze'
  },
  
  'math_expert': {
    id: 'math_expert',
    name: '🧮 数学专家',
    description: '完成50道数学题',
    condition: (progress) => progress.subjects.math?.questions >= 50,
    icon: '🧮',
    tier: 'silver'
  },
  
  'math_king': {
    id: 'math_king',
    name: '👑 数学之王',
    description: '完成100道数学题',
    condition: (progress) => progress.subjects.math?.questions >= 100,
    icon: '👑',
    tier: 'gold'
  },
  
  'english_master': {
    id: 'english_master',
    name: '📖 英语小达人',
    description: '完成20道英语题',
    condition: (progress) => progress.subjects.english?.questions >= 20,
    icon: '📖',
    tier: 'bronze'
  },
  
  'english_expert': {
    id: 'english_expert',
    name: '📚 英语专家',
    description: '完成50道英语题',
    condition: (progress) => progress.subjects.english?.questions >= 50,
    icon: '📚',
    tier: 'silver'
  },
  
  'english_king': {
    id: 'english_king',
    name: '🌍 英语之王',
    description: '完成100道英语题',
    condition: (progress) => progress.subjects.english?.questions >= 100,
    icon: '🌍',
    tier: 'gold'
  },
  
  'chinese_master': {
    id: 'chinese_master',
    name: '📕 语文小达人',
    description: '完成20道语文题',
    condition: (progress) => progress.subjects.chinese?.questions >= 20,
    icon: '📕',
    tier: 'bronze'
  },
  
  'chinese_expert': {
    id: 'chinese_expert',
    name: '📗 语文专家',
    description: '完成50道语文题',
    condition: (progress) => progress.subjects.chinese?.questions >= 50,
    icon: '📗',
    tier: 'silver'
  },
  
  'chinese_king': {
    id: 'chinese_king',
    name: '📜 语文之王',
    description: '完成100道语文题',
    condition: (progress) => progress.subjects.chinese?.questions >= 100,
    icon: '📜',
    tier: 'gold'
  },
  
  'all_subjects_master': {
    id: 'all_subjects_master',
    name: '🎓 三科全能',
    description: '每科都完成至少50道题',
    condition: (progress) => {
      return progress.subjects.math?.questions >= 50 &&
             progress.subjects.english?.questions >= 50 &&
             progress.subjects.chinese?.questions >= 50;
    },
    icon: '🎓',
    tier: 'diamond'
  },
  
  // 错题成就
  'wrong_book_5': {
    id: 'wrong_book_5',
    name: '📖 错题本',
    description: '收集5道错题',
    condition: (progress) => (progress.wrongQuestions?.length || 0) >= 5,
    icon: '📖',
    tier: 'bronze'
  },
  
  'wrong_book_20': {
    id: 'wrong_book_20',
    name: '📝 错题收集癖',
    description: '收集20道错题',
    condition: (progress) => (progress.wrongQuestions?.length || 0) >= 20,
    icon: '📝',
    tier: 'silver'
  },
  
  'learn_from_mistakes': {
    id: 'learn_from_mistakes',
    name: '💪 知错能改',
    description: '在错题本中出现过的题做对3次',
    condition: (progress, context) => (context?.learnedFromMistakes || 0) >= 3,
    icon: '💪',
    tier: 'silver'
  },
  
  // 挑战成就
  'challenge_first': {
    id: 'challenge_first',
    name: '🎮 挑战新手',
    description: '完成第一个挑战',
    condition: (progress, context) => (context?.challengesCompleted || 0) >= 1,
    icon: '🎮',
    tier: 'bronze'
  },
  
  'challenge_10': {
    id: 'challenge_10',
    name: '⚔️ 挑战达人',
    description: '完成10个挑战',
    condition: (progress, context) => (context?.challengesCompleted || 0) >= 10,
    icon: '⚔️',
    tier: 'silver'
  },
  
  'challenge_50': {
    id: 'challenge_50',
    name: '🏆 挑战之王',
    description: '完成50个挑战',
    condition: (progress, context) => (context?.challengesCompleted || 0) >= 50,
    icon: '🏆',
    tier: 'gold'
  },
  
  // 小队成就
  'team_player': {
    id: 'team_player',
    name: '🤝 团队精神',
    description: '加入学习小队',
    condition: (progress, context) => context?.hasTeam === true,
    icon: '🤝',
    tier: 'bronze'
  },
  
  'team_leader': {
    id: 'team_leader',
    name: '👑 队长风范',
    description: '创建学习小队并有3名以上成员',
    condition: (progress, context) => context?.isTeamLeader === true && context?.teamMembers >= 3,
    icon: '👑',
    tier: 'silver'
  },
  
  'team_contributor': {
    id: 'team_contributor',
    name: '⭐ 团队贡献者',
    description: '为团队贡献100道题',
    condition: (progress, context) => (context?.teamContribution || 0) >= 100,
    icon: '⭐',
    tier: 'gold'
  },
  
  // 特殊成就
  'first_login': {
    id: 'first_login',
    name: '👋 你好新朋友',
    description: '第一次使用学习助手',
    condition: (progress, context) => context?.isFirstLogin === true,
    icon: '👋',
    tier: 'bronze'
  },
  
  'explorer': {
    id: 'explorer',
    name: '🔍 探索者',
    description: '尝试过所有三种学科',
    condition: (progress) => {
      const subjects = progress.subjects || {};
      return (subjects.math?.questions || 0) > 0 &&
             (subjects.english?.questions || 0) > 0 &&
             (subjects.chinese?.questions || 0) > 0;
    },
    icon: '🔍',
    tier: 'silver'
  },
  
  'insomniac': {
    id: 'insomniac',
    name: '🌙 深夜学习者',
    description: '凌晨12点后完成5道题',
    condition: (progress, context) => {
      const hour = context?.hour || new Date().getHours();
      return hour >= 0 && hour < 5 && context?.questionsToday >= 5;
    },
    icon: '🌙',
    tier: 'bronze'
  }
};

/**
 * 徽章等级定义
 */
const BADGE_TIERS = {
  'bronze': { name: '铜牌', color: '🥉', points: 10 },
  'silver': { name: '银牌', color: '🥈', points: 25 },
  'gold': { name: '金牌', color: '🥇', points: 50 },
  'diamond': { name: '钻石', color: '💎', points: 100 }
};

class ExtendedAchievementSystem {
  constructor() {
    this.achievements = EXTENDED_ACHIEVEMENTS;
    this.tiers = BADGE_TIERS;
  }

  /**
   * 检查成就
   */
  checkAchievements(progress, context = {}) {
    const newAchievements = [];
    const earnedIds = context.earnedAchievements || [];
    
    for (const [key, achievement] of Object.entries(this.achievements)) {
      if (!earnedIds.includes(key) && achievement.condition(progress, context)) {
        newAchievements.push({
          ...achievement,
          key,
          tierInfo: this.tiers[achievement.tier]
        });
      }
    }

    return newAchievements;
  }

  /**
   * 获取所有成就
   */
  getAllAchievements(progress, context = {}) {
    const earned = this.checkAchievements(progress, context);
    const all = Object.values(this.achievements);
    
    return {
      earned: earned.length,
      total: all.length,
      achievements: earned,
      locked: all.filter(a => !earned.some(e => e.id === a.id)),
      totalPoints: this.calculateTotalPoints(progress, context)
    };
  }

  /**
   * 计算总积分
   */
  calculateTotalPoints(progress, context = {}) {
    const earned = this.checkAchievements(progress, context);
    return earned.reduce((sum, a) => sum + (a.tierInfo?.points || 10), 0);
  }

  /**
   * 格式化成就列表（按等级分组）
   */
  formatAchievements(progress, context = {}) {
    const { earned, total, achievements, locked, totalPoints } = this.getAllAchievements(progress, context);

    if (achievements.length === 0 && locked.length === 0) {
      return '还没有任何成就，快去学习获得吧！';
    }

    let message = `🏆 **成就勋章** (${earned}/${total})\n`;
    message += `📊 总积分：${totalPoints}分\n\n`;

    // 按等级分组显示
    const tierOrder = ['diamond', 'gold', 'silver', 'bronze'];
    
    for (const tier of tierOrder) {
      const tierAchievements = achievements.filter(a => a.tier === tier);
      const tierInfo = this.tiers[tier];
      
      if (tierAchievements.length > 0) {
        message += `${tierInfo.color} **${tierInfo.name}成就**\n`;
        tierAchievements.forEach(a => {
          message += `${a.icon} ${a.name} - ${a.description}\n`;
        });
        message += '\n';
      }
    }

    // 显示待解锁成就
    const lockedCount = locked.length;
    if (lockedCount > 0) {
      message += `🔒 **待解锁** (${lockedCount}个)\n`;
      locked.slice(0, 5).forEach(a => {
        message += `${a.icon} ${a.name}\n`;
      });
      if (lockedCount > 5) {
        message += `...还有${lockedCount - 5}个`;
      }
    }

    return message;
  }

  /**
   * 获取下一个目标
   */
  getNextGoal(progress, context = {}) {
    const goals = [
      {
        condition: progress.totalQuestions < 10,
        message: `📝 再做${10 - progress.totalQuestions}道题就能获得"十题达人"成就！`
      },
      {
        condition: progress.totalQuestions < 50,
        message: `📚 再做${50 - progress.totalQuestions}道题就能获得"学富五车"成就！`
      },
      {
        condition: progress.streak < 3,
        message: `🔥 再连续学习${3 - progress.streak}天就能解锁"三天打鱼"成就！`
      },
      {
        condition: progress.streak < 7,
        message: `🌟 再连续学习${7 - progress.streak}天就能解锁"一周坚持"成就！`
      },
      {
        condition: (progress.subjects.math?.questions || 0) < 20,
        message: `🔢 再做${20 - (progress.subjects.math?.questions || 0)}道数学题就能获得"数学小达人"！`
      },
      {
        condition: (progress.subjects.english?.questions || 0) < 20,
        message: `📖 再做${20 - (progress.subjects.english?.questions || 0)}道英语题就能获得"英语小达人"！`
      },
      {
        condition: (progress.subjects.chinese?.questions || 0) < 20,
        message: `📕 再做${20 - (progress.subjects.chinese?.questions || 0)}道语文题就能获得"语文小达人"！`
      }
    ];

    const nextGoal = goals.find(g => g.condition);
    return nextGoal ? nextGoal.message : '🎉 你已经完成了很多目标！继续保持！';
  }

  /**
   * 庆祝新成就
   */
  celebrateNewAchievement(achievement) {
    const tierInfo = this.tiers[achievement.tier];
    const messages = [
      `🎉 恭喜获得${tierInfo.color}成就：「${achievement.name}」！`,
      `🌟 太棒了！解锁了新${tierInfo.name}成就：「${achievement.name}」！`,
      `🎊 厉害！获得了${achievement.icon}「${achievement.name}」勋章！`,
      `🏆 恭喜！这是你的新${tierInfo.name}成就：「${achievement.name}」！`,
      `⭐ 闪闪发光！解锁成就：「${achievement.name}」！`
    ];

    return {
      message: randomPick(messages),
      points: tierInfo.points,
      tier: tierInfo.name
    };
  }

  /**
   * 获取成就进度
   */
  getAchievementProgress(progress, context = {}) {
    const progressList = [];
    
    // 数量进度
    const questionProgress = Math.min(100, (progress.totalQuestions / 100) * 100);
    progressList.push({
      name: '做题数量',
      icon: '📝',
      progress: questionProgress,
      current: progress.totalQuestions,
      target: 100
    });

    // 连续进度
    const streakProgress = Math.min(100, (progress.streak / 30) * 100);
    progressList.push({
      name: '连续学习',
      icon: '🔥',
      progress: streakProgress,
      current: progress.streak,
      target: 30
    });

    // 正确率进度
    const accuracy = progress.totalQuestions > 0 
      ? (progress.correctAnswers / progress.totalQuestions) * 100 
      : 0;
    progressList.push({
      name: '正确率',
      icon: '🎯',
      progress: Math.min(100, accuracy),
      current: `${accuracy.toFixed(0)}%`,
      target: '90%'
    });

    return progressList;
  }

  /**
   * 格式化进度条
   */
  formatProgressBar(progress, context = {}) {
    const progressList = this.getAchievementProgress(progress, context);
    
    let message = `📊 **成就进度**\n\n`;
    
    progressList.forEach(p => {
      const filled = Math.round(p.progress / 5);
      const bar = '▓'.repeat(filled) + '░'.repeat(20 - filled);
      message += `${p.icon} ${p.name}: ${bar}\n`;
      message += `   ${p.current} / ${p.target}\n\n`;
    });

    return message;
  }
}

module.exports = { 
  ExtendedAchievementSystem,
  EXTENDED_ACHIEVEMENTS,
  BADGE_TIERS
};
