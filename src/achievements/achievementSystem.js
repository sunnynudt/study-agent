/**
 * 成就系统模块
 * 通过勋章激励学习动力
 */

const { randomPick } = require('../utils/helpers');

/**
 * 成就定义
 */
const ACHIEVEMENTS = {
  // 入门成就
  first_question: {
    id: 'first_question',
    name: '🎯 初露锋芒',
    description: '完成第一道题目',
    condition: (progress) => progress.totalQuestions >= 1,
    icon: '🎯'
  },
  
  first_day: {
    id: 'first_day',
    name: '🌅 第一天',
    description: '开始学习之旅',
    condition: (progress) => progress.totalQuestions >= 1,
    icon: '🌅'
  },
  
  // 数量成就
  ten_questions: {
    id: 'ten_questions',
    name: '📝 十题达人',
    description: '完成10道题目',
    condition: (progress) => progress.totalQuestions >= 10,
    icon: '📝'
  },
  
  fifty_questions: {
    id: 'fifty_questions',
    name: '📚 学富五车',
    description: '完成50道题目',
    condition: (progress) => progress.totalQuestions >= 50,
    icon: '📚'
  },
  
  hundred_questions: {
    id: 'hundred_questions',
    name: '🏆 百题斩',
    description: '完成100道题目',
    condition: (progress) => progress.totalQuestions >= 100,
    icon: '🏆'
  },
  
  // 连续学习成就
  streak_3: {
    id: 'streak_3',
    name: '🔥 三天打鱼',
    description: '连续学习3天',
    condition: (progress) => progress.streak >= 3,
    icon: '🔥'
  },
  
  streak_7: {
    id: 'streak_7',
    name: '🌟 一周坚持',
    description: '连续学习7天',
    condition: (progress) => progress.streak >= 7,
    icon: '🌟'
  },
  
  streak_30: {
    id: 'streak_30',
    name: '💪 月度学习者',
    description: '连续学习30天',
    condition: (progress) => progress.streak >= 30,
    icon: '💪'
  },
  
  // 正确率成就
  accuracy_80: {
    id: 'accuracy_80',
    name: '🎯 80%准确率',
    description: '正确率达到80%',
    condition: (progress) => {
      if (progress.totalQuestions < 10) return false;
      return (progress.correctAnswers / progress.totalQuestions) >= 0.8;
    },
    icon: '🎯'
  },
  
  accuracy_90: {
    id: 'accuracy_90',
    name: '🌟 90%准确率',
    description: '正确率达到90%',
    condition: (progress) => {
      if (progress.totalQuestions < 20) return false;
      return (progress.correctAnswers / progress.totalQuestions) >= 0.9;
    },
    icon: '🌟'
  },
  
  perfect_score: {
    id: 'perfect_score',
    name: '💯 满分高手',
    description: '一次练习全部正确',
    condition: (progress) => {
      // 这个需要 session 级别的追踪，暂时用总次数模拟
      return progress.correctAnswers >= 5 && progress.totalQuestions >= 5;
    },
    icon: '💯'
  },
  
  // 学科成就
  math_master: {
    id: 'math_master',
    name: '🔢 数学小达人',
    description: '完成20道数学题',
    condition: (progress) => progress.subjects.math.questions >= 20,
    icon: '🔢'
  },
  
  english_master: {
    id: 'english_master',
    name: '📖 英语小达人',
    description: '完成20道英语题',
    condition: (progress) => progress.subjects.english.questions >= 20,
    icon: '📖'
  },
  
  chinese_master: {
    id: 'chinese_master',
    name: '📕 语文小达人',
    description: '完成20道语文题',
    condition: (progress) => progress.subjects.chinese.questions >= 20,
    icon: '📕'
  },
  
  all_subjects: {
    id: 'all_subjects',
    name: '🎓 三科全能',
    description: '每科都完成至少10道题',
    condition: (progress) => {
      return progress.subjects.math.questions >= 10 &&
             progress.subjects.english.questions >= 10 &&
             progress.subjects.chinese.questions >= 10;
    },
    icon: '🎓'
  },
  
  // 错题成就
  learn_from_mistakes: {
    id: 'learn_from_mistakes',
    name: '📖 错题本',
    description: '记录5道错题并复习',
    condition: (progress) => progress.wrongQuestions.length >= 5,
    icon: '📖'
  }
};

/**
 * 成就系统类
 */
class AchievementSystem {
  constructor() {
    this.achievements = ACHIEVEMENTS;
  }

  /**
   * 检查并获取新成就
   */
  checkAchievements(progress) {
    const newAchievements = [];
    
    for (const [key, achievement] of Object.entries(this.achievements)) {
      if (achievement.condition(progress)) {
        newAchievements.push(achievement);
      }
    }
    
    return newAchievements;
  }

  /**
   * 获取成就列表
   */
  getAllAchievements(progress) {
    const earned = this.checkAchievements(progress);
    const all = Object.values(this.achievements);
    
    return {
      earned: earned.length,
      total: all.length,
      achievements: earned,
      locked: all.filter(a => !earned.includes(a))
    };
  }

  /**
   * 生成成就消息
   */
  formatAchievements(progress) {
    const { earned, total, achievements, locked } = this.getAllAchievements(progress);
    
    if (achievements.length === 0) {
      return '还没有获得任何成就，继续加油！多做题目就能获得勋章哦～';
    }
    
    let message = `🏆 **成就勋章** (${earned}/${total})\n\n`;
    
    achievements.forEach(a => {
      message += `${a.icon} **${a.name}** - ${a.description}\n`;
    });
    
    if (locked.length > 0) {
      message += `\n🔒 待解锁成就：\n`;
      locked.slice(0, 3).forEach(a => {
        message += `${a.icon} ${a.name}\n`;
      });
      if (locked.length > 3) {
        message += `...还有${locked.length - 3}个`;
      }
    }
    
    return message;
  }

  /**
   * 获得新成就时的庆祝消息
   */
  celebrateNewAchievement(achievement) {
    const messages = [
      `🎉 恭喜获得成就：「${achievement.name}」！`,
      `🌟 太棒了！解锁了新成就：「${achievement.name}」！`,
      `🎊 厉害！获得了「${achievement.name}」勋章！`,
      `🏆 恭喜！这是你的新成就：「${achievement.name}」！`
    ];
    
    return randomPick(messages) + `\n${achievement.description}`;
  }

  /**
   * 获取下一个目标提示
   */
  getNextGoal(progress) {
    const goals = [
      {
        condition: progress.totalQuestions < 10,
        message: '📝 再做' + (10 - progress.totalQuestions) + '道题就能获得"十题达人"成就！'
      },
      {
        condition: progress.streak < 3,
        message: '🔥 再连续学习' + (3 - progress.streak) + '天就能解锁"三天打鱼"成就！'
      },
      {
        condition: progress.subjects.math.questions < 20,
        message: '🔢 再做' + (20 - progress.subjects.math.questions) + '道数学题就能获得"数学小达人"！'
      },
      {
        condition: progress.subjects.english.questions < 20,
        message: '📖 再做' + (20 - progress.subjects.english.questions) + '道英语题就能获得"英语小达人"！'
      },
      {
        condition: progress.subjects.chinese.questions < 20,
        message: '📕 再做' + (20 - progress.subjects.chinese.questions) + '道语文题就能获得"语文小达人"！'
      }
    ];
    
    const nextGoal = goals.find(g => g.condition);
    return nextGoal ? nextGoal.message : '🎉 你已经完成了很多目标！保持下去！';
  }
}

module.exports = AchievementSystem;
