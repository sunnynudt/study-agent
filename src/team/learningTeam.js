/**
 * 👥 学习小队系统 - 协作学习，共同进步
 * 
 * 功能：
 * - 创建/加入学习小队
 * - 队内排行榜
 * - 协作任务（团队目标）
 * - 队友互动（加油打气）
 */

const fs = require('fs');
const path = require('path');
const { randomPick, safeJsonParse, safeJsonStringify, formatTime } = require('../utils/helpers');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

/**
 * 小队类型
 */
const TEAM_TYPES = {
  'study': { name: '学习大队', emoji: '📚', desc: '共同学习，共同进步', maxMembers: 5 },
  'math': { name: '数学攻关队', emoji: '🔢', desc: '专攻数学难题', maxMembers: 4 },
  'english': { name: '英语角', emoji: '📖', desc: '一起学英语', maxMembers: 4 },
  'chinese': { name: '文学社', emoji: '📕', desc: '一起学语文', maxMembers: 4 },
  'reading': { name: '阅读会', emoji: '📗', desc: '一起读好书', maxMembers: 6 }
};

/**
 * 团队任务模板
 */
const TEAM_TASKS = [
  { name: '今日学习目标', description: '小队成员今日共完成30道题', target: 30, reward: 50 },
  { name: '全员达标', description: '所有成员今日正确率达到80%以上', target: 0.8, reward: 100 },
  { name: '团结一心', description: '小队今日共完成50道题', target: 50, reward: 80 },
  { name: '晨读时光', description: '早上6-9点，小队共完成20道题', target: 20, reward: 60 },
  { name: '晚间冲刺', description: '晚上7-10点，小队共完成25道题', target: 25, reward: 70 }
];

class LearningTeamSystem {
  constructor() {
    this.dataDir = DATA_DIR;
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  getTeamPath(teamId) {
    return path.join(this.dataDir, `team_${teamId}.json`);
  }

  getUserTeamPath(userId) {
    return path.join(this.dataDir, `user_team_${userId}.json`);
  }

  /**
   * 创建小队
   */
  createTeam(leaderId, leaderName, teamName, teamType = 'study') {
    const teamId = `team_${Date.now()}`;
    const type = TEAM_TYPES[teamType] || TEAM_TYPES.study;
    
    const team = {
      teamId,
      name: teamName || type.name,
      type: teamType,
      emoji: type.emoji,
      description: type.desc,
      leaderId,
      leaderName,
      members: [{
        userId: leaderId,
        name: leaderName,
        joinedAt: formatTime(),
        isLeader: true,
        totalQuestions: 0,
        todayQuestions: 0,
        streak: 0
      }],
      maxMembers: type.maxMembers,
      createdAt: formatTime(),
      totalPoints: 0,
      level: 1,
      achievements: [],
      dailyStats: {
        date: new Date().toDateString(),
        totalQuestions: 0,
        totalCorrect: 0
      }
    };

    // 保存小队数据
    fs.writeFileSync(this.getTeamPath(teamId), safeJsonStringify(team));

    // 记录用户的所属小队
    fs.writeFileSync(this.getUserTeamPath(leaderId), safeJsonStringify({ teamId, role: 'leader' }));

    return {
      success: true,
      team,
      message: `🎉 恭喜！${team.emoji}「${team.name}」创建成功！\n\n${team.description}\n\n💡 现在可以邀请小伙伴加入了！`
    };
  }

  /**
   * 获取用户所属小队
   */
  getUserTeam(userId) {
    const filePath = this.getUserTeamPath(userId);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const userTeam = safeJsonParse(data);
    
    if (!userTeam || !userTeam.teamId) {
      return null;
    }

    const teamPath = this.getTeamPath(userTeam.teamId);
    if (!fs.existsSync(teamPath)) {
      return null;
    }

    const teamData = fs.readFileSync(teamPath, 'utf8');
    return safeJsonParse(teamData);
  }

  /**
   * 加入小队
   */
  joinTeam(userId, userName, teamId) {
    // 检查小队是否存在
    const teamPath = this.getTeamPath(teamId);
    if (!fs.existsSync(teamPath)) {
      return { success: false, message: '未找到该小队' };
    }

    const teamData = fs.readFileSync(teamPath, 'utf8');
    let team = safeJsonParse(teamData);

    // 检查是否已在小队中
    if (team.members.some(m => m.userId === userId)) {
      return { success: false, message: '你已经在这个小队里了！' };
    }

    // 检查人数限制
    if (team.members.length >= team.maxMembers) {
      return { success: false, message: '这个小队已经满员了！' };
    }

    // 添加成员
    team.members.push({
      userId,
      name: userName,
      joinedAt: formatTime(),
      isLeader: false,
      totalQuestions: 0,
      todayQuestions: 0,
      streak: 0
    });

    // 保存
    fs.writeFileSync(teamPath, safeJsonStringify(team));
    fs.writeFileSync(this.getUserTeamPath(userId), safeJsonStringify({ teamId, role: 'member' }));

    return {
      success: true,
      message: `🎉 欢迎加入${team.emoji}「${team.name」！\n\n和小伙伴们一起学习，共同进步吧！`
    };
  }

  /**
   * 离开小队
   */
  leaveTeam(userId, teamId) {
    const teamPath = this.getTeamPath(teamId);
    if (!fs.existsSync(teamPath)) {
      return { success: false, message: '未找到该小队' };
    }

    const teamData = fs.readFileSync(teamPath, 'utf8');
    let team = safeJsonParse(teamData);

    // 检查是否是队长
    if (team.leaderId === userId) {
      return { success: false, message: '队长不能退出小队，请先转让队长或解散小队' };
    }

    // 移除成员
    team.members = team.members.filter(m => m.userId !== userId);
    fs.writeFileSync(teamPath, safeJsonStringify(team));

    // 删除用户的小队记录
    fs.unlinkSync(this.getUserTeamPath(userId));

    return { success: true, message: '已离开小队，期待你找到新的学习伙伴！' };
  }

  /**
   * 更新成员学习数据
   */
  updateMemberProgress(userId, correct, total) {
    const team = this.getUserTeam(userId);
    if (!team) return;

    const teamPath = this.getTeamPath(team.teamId);
    const teamData = fs.readFileSync(teamPath, 'utf8');
    const updatedTeam = safeJsonParse(teamData);

    // 更新成员数据
    const member = updatedTeam.members.find(m => m.userId === userId);
    if (member) {
      member.totalQuestions += total;
      member.todayQuestions += total;
      updatedTeam.totalPoints += correct * 10;
    }

    // 更新小队每日统计
    updatedTeam.dailyStats.totalQuestions += total;
    updatedTeam.dailyStats.totalCorrect += correct;

    // 检查升级
    if (updatedTeam.totalPoints >= updatedTeam.level * 500) {
      updatedTeam.level++;
    }

    fs.writeFileSync(teamPath, safeJsonStringify(updatedTeam));
  }

  /**
   * 格式化小队信息
   */
  formatTeamInfo(userId) {
    const team = this.getUserTeam(userId);
    if (!team) {
      return `📚 **学习小队**\n\n还没有加入小队呢！\n\n💡 可以创建新小队或让小伙伴邀请你！\n\n**小队类型：**\n${Object.values(TEAM_TYPES).map(t => `${t.emoji} ${t.name} - ${t.desc}`).join('\n')}`;
    }

    let message = `${team.emoji} **${team.name}** (Lv.${team.level})\n\n`;
    message += `📝 ${team.description}\n\n`;
    message += `👑 队长：${team.leaderName}\n`;
    message += `👥 成员：${team.members.length}/${team.maxMembers}人\n`;
    message += `🏆 团队积分：${team.totalPoints}分\n\n`;

    message += `**成员列表**\n`;
    team.members.forEach((m, i) => {
      const leaderIcon = m.isLeader ? '👑 ' : '';
      message += `${i + 1}. ${leaderIcon}${m.name} - ${m.totalQuestions}题\n`;
    });

    // 今日统计
    const today = new Date().toDateString();
    if (team.dailyStats.date === today) {
      const accuracy = team.dailyStats.totalQuestions > 0 
        ? Math.round((team.dailyStats.totalCorrect / team.dailyStats.totalQuestions) * 100) 
        : 0;
      message += `\n📊 **今日团队统计**\n`;
      message += `   总题数：${team.dailyStats.totalQuestions}题\n`;
      message += `   正确率：${accuracy}%\n`;
    }

    return message;
  }

  /**
   * 格式化团队排行榜
   */
  formatTeamLeaderboard(userId) {
    const team = this.getUserTeam(userId);
    if (!team) {
      return '请先加入一个小队查看队内排行！';
    }

    const sortedMembers = [...team.members].sort((a, b) => b.totalQuestions - a.totalQuestions);

    let message = `🏆 **${team.name} 队内排行榜**\n\n`;

    sortedMembers.forEach((m, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      message += `${medal} ${m.name} - ${m.totalQuestions}题\n`;
    });

    return message;
  }

  /**
   * 获取团队任务
   */
  getTeamTasks() {
    return TEAM_TASKS.map((task, i) => ({
      id: i,
      ...task,
      emoji: ['📚', '🎯', '🤝', '🌅', '🌙'][i]
    }));
  }

  /**
   * 格式化团队任务列表
   */
  formatTeamTasks(userId) {
    const team = this.getUserTeam(userId);
    if (!team) {
      return '请先加入一个小队查看团队任务！';
    }

    const tasks = this.getTeamTasks();
    const today = new Date().toDateString();
    
    let message = `🎯 **${team.name} 团队任务**\n\n`;

    // 检查今日任务完成情况
    if (team.dailyStats.date === today) {
      const progress = Math.min(100, Math.round((team.dailyStats.totalQuestions / 30) * 100));
      message += `📊 今日进度：${progress}%\n`;
      message += `   已完成：${team.dailyStats.totalQuestions}/30题\n\n`;
    } else {
      message += `📊 今日进度：0%\n\n`;
    }

    message += `**可选任务**\n`;
    tasks.forEach(task => {
      message += `${task.emoji} ${task.name}\n`;
      message += `   ${task.description}\n`;
      message += `   奖励：${task.reward}积分\n\n`;
    });

    return message;
  }

  /**
   * 获取团队鼓励语
   */
  getTeamEncouragement(userId) {
    const team = this.getUserTeam(userId);
    if (!team) {
      return { message: '快加入学习小队，和小伙伴们一起学习吧！', teamName: null };
    }

    const messages = [
      `💪 ${team.name}的伙伴们，今天也要努力学习哦！`,
      `🌟 加油！${team.name}的队友们等着你的好成绩！`,
      `🎉 一起学习，一起进步！${team.name}最棒！`,
      `🔥 今日任务还没完成，${team.name}的伙伴们冲鸭！`,
      `⭐ 你不是一个人在战斗！${team.name}和你在一起！`
    ];

    return {
      message: randomPick(messages),
      teamName: team.name,
      emoji: team.emoji
    };
  }

  /**
   * 生成小队邀请码
   */
  generateInviteCode(teamId) {
    const code = teamId.slice(-6).toUpperCase();
    return {
      teamId,
      code,
      message: `分享这个邀请码给小伙伴：${code}`
    };
  }

  /**
   * 通过邀请码加入小队
   */
  joinByCode(userId, userName, code) {
    // 遍历所有小队查找
    const files = fs.readdirSync(this.dataDir).filter(f => f.startsWith('team_'));
    
    for (const file of files) {
      const teamPath = path.join(this.dataDir, file);
      const teamData = fs.readFileSync(teamPath, 'utf8');
      const team = safeJsonParse(teamData);
      
      if (team.teamId.slice(-6).toUpperCase() === code) {
        return this.joinTeam(userId, userName, team.teamId);
      }
    }

    return { success: false, message: '未找到该邀请码对应的小队' };
  }

  /**
   * 解散小队（队长专用）
   */
  disbandTeam(userId, teamId) {
    const teamPath = this.getTeamPath(teamId);
    if (!fs.existsSync(teamPath)) {
      return { success: false, message: '未找到该小队' };
    }

    const teamData = fs.readFileSync(teamPath, 'utf8');
    const team = safeJsonParse(teamData);

    if (team.leaderId !== userId) {
      return { success: false, message: '只有队长才能解散小队' };
    }

    // 移除所有成员的小队记录
    for (const member of team.members) {
      const userPath = this.getUserTeamPath(member.userId);
      if (fs.existsSync(userPath)) {
        fs.unlinkSync(userPath);
      }
    }

    // 删除小队文件
    fs.unlinkSync(teamPath);

    return { success: true, message: `${team.name}已解散，期待下次再创建新小队！` };
  }
}

module.exports = LearningTeamSystem;
