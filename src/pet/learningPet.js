/**
 * 🌟 学习伙伴系统 - 虚拟宠物养成 + 学习激励
 * 
 * 概念：每个小学生都有一个虚拟学习伙伴（如小恐龙、小猫咪等）
 * - 按时学习可以喂食伙伴
 * - 完成任务伙伴会开心/跳舞
 * - 连续学习伙伴会成长进化
 * - 伙伴可以给用户加油打气
 */

const fs = require('fs');
const path = require('path');
const { randomPick, safeJsonParse, safeJsonStringify, formatTime } = require('../utils/helpers');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

// 宠物类型
const PET_TYPES = {
  'dino': { name: '小恐龙豆豆', emoji: '🦖', growStages: ['🥚', '🦖', '🐉', '🐲'] },
  'cat': { name: '小猫咪萌萌', emoji: '🐱', growStages: ['🐾', '😺', '😸', '😻'] },
  'dog': { name: '小狗旺财', emoji: '🐶', growStages: ['🐕', '🐩', '🐕‍🦺', '🦮'] },
  'panda': { name: '小熊猫滚滚', emoji: '🐼', growStages: ['🐼', '🎋', '🏮', '👑'] },
  'dragon': { name: '小龙人当当', emoji: '🐲', growStages: ['🐉', '🐲', '👑', '✨'] }
};

// 宠物心情
const MOODS = {
  'happy': { text: '开心', actions: ['跳舞', '打滚', '摇尾巴', '转圈圈'] },
  'excited': { text: '兴奋', actions: ['跳来跳去', '拍拍手', '大声欢呼'] },
  'encouraging': { text: '加油', actions: ['给你比心', '说悄悄话', '挥拳头'] },
  'proud': { text: '骄傲', actions: ['昂首挺胸', '闪闪发光', '接受赞美'] },
  'sleepy': { text: '困了', actions: ['打哈欠', '揉眼睛', '趴下'] },
  'hungry': { text: '饿了', actions: ['肚子叫', '眼巴巴看', '舔嘴唇'] },
  'sad': { text: '难过', actions: ['低头', '叹气', '眼泪汪汪'] }
};

// 食物类型
const FOODS = {
  '水果': { emoji: '🍎', energy: 10, pets: ['dino', 'cat', 'dog', 'panda', 'dragon'] },
  '糖果': { emoji: '🍬', energy: 15, pets: ['cat', 'dog'] },
  '骨头': { emoji: '🦴', energy: 20, pets: ['dog'] },
  '竹子': { emoji: '🎋', energy: 20, pets: ['panda'] },
  '肉': { emoji: '🍖', energy: 25, pets: ['dino', 'dog', 'dragon'] },
  '星星': { emoji: '⭐', energy: 50, pets: ['dino', 'cat', 'dog', 'panda', 'dragon'] }
};

class LearningPet {
  constructor() {
    this.dataDir = DATA_DIR;
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  getPetPath(userId) {
    return path.join(this.dataDir, `pet_${userId}.json`);
  }

  /**
   * 获取用户宠物数据
   */
  getPetData(userId) {
    const filePath = this.getPetPath(userId);
    if (!fs.existsSync(filePath)) {
      return this.createNewPet(userId);
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return safeJsonParse(data, this.createNewPet(userId));
  }

  /**
   * 创建新宠物
   */
  createNewPet(userId, petType = 'dino') {
    const pet = PET_TYPES[petType] || PET_TYPES.dino;
    return {
      userId,
      type: petType,
      name: pet.name,
      emoji: pet.emoji,
      stage: 0, // 成长阶段
      level: 1, // 等级
      exp: 0, // 经验值
      expToNextLevel: 100,
      energy: 100, // 饱食度
      mood: 'happy',
      lastFedTime: formatTime(),
      lastPlayTime: formatTime(),
      totalStudyDays: 0,
      consecutiveStudyDays: 0,
      skills: ['encourage', 'cheer'],
      achievements: [],
      createdAt: formatTime()
    };
  }

  /**
   * 选择宠物
   */
  selectPet(userId, petType) {
    if (!PET_TYPES[petType]) {
      return { success: false, message: '没有这种宠物哦' };
    }
    
    const petData = this.createNewPet(userId, petType);
    this.savePetData(userId, petData);
    
    return {
      success: true,
      message: `🎉 选择了${petData.name}作为你的学习伙伴！`,
      pet: petData
    };
  }

  /**
   * 格式化宠物列表供选择
   */
  formatPetSelection() {
    let message = `🐾 **选择你的学习伙伴**\n\n`;
    
    for (const [type, pet] of Object.entries(PET_TYPES)) {
      message += `${pet.emoji} **${pet.name}**\n`;
      message += `   成长：${pet.growStages.join(' → ')}\n\n`;
    }
    
    message += `💡 输入"我要[宠物名]"\n`;
    message += `例如："我要小恐龙" 或 "我要小猫咪"\n`;
    
    return message;
  }

  /**
   * 获取宠物当前状态
   */
  getPetStatus(userId) {
    const pet = this.getPetData(userId);
    const petInfo = PET_TYPES[pet.type];
    const currentEmoji = petInfo.growStages[pet.stage];
    const moodInfo = MOODS[pet.mood];
    
    // 计算饱食度衰减（每小时减少5点）
    const lastFed = new Date(pet.lastFedTime);
    const now = new Date();
    const hoursPassed = (now - lastFed) / (1000 * 60 * 60);
    const currentEnergy = Math.max(0, pet.energy - Math.floor(hoursPassed * 5));
    
    // 更新宠物状态
    if (currentEnergy < 30) {
      pet.mood = 'hungry';
    } else if (currentEnergy < 50) {
      pet.mood = 'sleepy';
    }
    
    // 计算经验进度
    const expProgress = Math.round((pet.exp / pet.expToNextLevel) * 100);
    
    let message = `${currentEmoji} **${pet.name}** (Lv.${pet.level})\n\n`;
    message += `📊 状态\n`;
    message += `   心情：${moodInfo.text}\n`;
    message += `   能量：${'🍖'.repeat(Math.ceil(currentEnergy / 20))}${'.。'.repeat(5 - Math.ceil(currentEnergy / 20))} ${currentEnergy}%\n`;
    message += `   经验：${'⭐'.repeat(Math.ceil(expProgress / 20))}${'☆'.repeat(5 - Math.ceil(expProgress / 20))} ${expProgress}%\n`;
    message += `   连续学习：${pet.consecutiveStudyDays}天\n\n`;
    
    // 显示当前技能
    message += `✨ 技能：${pet.skills.join('、')}\n\n`;
    
    // 显示可做动作
    const action = randomPick(moodInfo.actions);
    message += `💡 ${pet.name}正在${action}～`;
    
    return {
      pet,
      status: {
        energy: currentEnergy,
        mood: pet.mood,
        expProgress,
        level: pet.level
      },
      message
    };
  }

  /**
   * 喂食宠物
   */
  feedPet(userId, foodType) {
    const pet = this.getPetData(userId);
    const food = FOODS[foodType];
    
    if (!food) {
      return { 
        success: false, 
        message: `没有"${foodType}"这种食物哦！\n\n可选食物：${Object.keys(FOODS).join('、')}` 
      };
    }
    
    // 检查宠物是否喜欢吃
    if (!food.pets.includes(pet.type)) {
      return { 
        success: false, 
        message: `${pet.name}不喜欢吃${foodType}！\n\n${pet.name}喜欢吃：${food.pets.map(p => PET_TYPES[p].name.split('小')[1]).join('、')}` 
      };
    }
    
    // 增加能量和经验
    pet.energy = Math.min(100, pet.energy + food.energy);
    pet.exp += 10;
    pet.lastFedTime = formatTime();
    pet.mood = 'happy';
    
    // 检查升级
    if (pet.exp >= pet.expToNextLevel) {
      this.levelUp(pet);
    }
    
    this.savePetData(userId, pet);
    
    const action = randomPick(MOODS.happy.actions);
    return {
      success: true,
      message: `${pet.emoji} ${pet.name}开心地吃了${food.emoji}${foodType}！\n\n${pet.name}正在${action}～\n\n能量+${food.energy}，经验+10`
    };
  }

  /**
   * 升级
   */
  levelUp(pet) {
    pet.level++;
    pet.exp = pet.exp - pet.expToNextLevel;
    pet.expToNextLevel = Math.round(pet.expToNextLevel * 1.5);
    
    // 检查是否进化
    const petInfo = PET_TYPES[pet.type];
    if (pet.level >= 3 && pet.stage < 1) {
      pet.stage = 1;
      return { evolved: true, newStage: petInfo.growStages[1] };
    }
    if (pet.level >= 6 && pet.stage < 2) {
      pet.stage = 2;
      return { evolved: true, newStage: petInfo.growStages[2] };
    }
    if (pet.level >= 10 && pet.stage < 3) {
      pet.stage = 3;
      return { evolved: true, newStage: petInfo.growStages[3] };
    }
    
    return { leveledUp: true, newLevel: pet.level };
  }

  /**
   * 学习后与宠物互动
   */
  interactAfterStudy(userId) {
    const pet = this.getPetData(userId);
    
    // 增加经验
    pet.exp += 5;
    pet.mood = 'excited';
    
    // 更新连续学习天数
    const today = new Date().toDateString();
    const lastStudyDate = pet.lastStudyDate;
    
    if (lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastStudyDate === yesterday) {
        pet.consecutiveStudyDays++;
      } else {
        pet.consecutiveStudyDays = 1;
      }
      pet.totalStudyDays++;
      pet.lastStudyDate = today;
    }
    
    // 检查升级
    const levelUpResult = this.levelUp(pet);
    
    this.savePetData(userId, pet);
    
    // 生成互动消息
    const moodAction = randomPick(MOODS.excited.actions);
    let message = `${pet.emoji} ${pet.name}看到你学习完，开心地${moodAction}！\n\n`;
    message += `💖 ${pet.name}给你比心！\n`;
    message += `⭐ 经验+5\n`;
    
    if (levelUpResult?.leveledUp || levelUpResult?.evolved) {
      message += `\n🎉 ${levelUpResult.evolved ? `${pet.name}进化成${levelUpResult.newStage}啦！` : `🎊 ${pet.name}升级到Lv.${levelUpResult.newLevel}！`}`;
    }
    
    if (pet.consecutiveStudyDays >= 3) {
      message += `\n🔥 已经连续学习${pet.consecutiveStudyDays}天了！${pet.name}为你骄傲！`;
    }
    
    return { success: true, message };
  }

  /**
   * 获取宠物鼓励语
   */
  getEncouragement(userId) {
    const pet = this.getPetData(userId);
    const moodInfo = MOODS[pet.mood];
    const action = randomPick(moodInfo.actions);
    
    const encouragements = [
      `${pet.emoji} ${pet.name}说："加油！你一定可以的！"`,
      `${pet.emoji} ${pet.name}为你${action}："相信你自己！"`,
      `${pet.emoji} ${pet.name}拍拍你的肩膀："别放弃，继续努力！"`,
      `${pet.emoji} ${pet.name}闪闪发光："你是最棒的！"`,
      `${pet.emoji} ${pet.name}握紧拳头："冲冲冲！"`,
      `${pet.emoji} ${pet.name}说："休息一下再出发，但不要放弃哦！"`
    ];
    
    return randomPick(encouragements);
  }

  /**
   * 格式化宠物技能列表
   */
  formatPetSkills(pet) {
    const allSkills = {
      'encourage': { name: '鼓励', emoji: '💪', desc: '给主人加油打气' },
      'cheer': { name: '欢呼', emoji: '🎉', desc: '庆祝主人的进步' },
      'dance': { name: '跳舞', emoji: '💃', desc: '开心时跳舞庆祝' },
      'study': { name: '陪伴学习', emoji: '📚', desc: '陪主人一起学习' },
      'heal': { name: '治愈', emoji: '💖', desc: '心情不好时治愈主人' },
      'evolve': { name: '进化', emoji: '✨', desc: '成长后解锁新能力' }
    };
    
    let message = `✨ **${pet.name}的技能**\n\n`;
    
    for (const skill of pet.skills) {
      const skillInfo = allSkills[skill];
      if (skillInfo) {
        message += `${skillInfo.emoji} ${skillInfo.name} - ${skillInfo.desc}\n`;
      }
    }
    
    return message;
  }

  /**
   * 保存宠物数据
   */
  savePetData(userId, petData) {
    const filePath = this.getPetPath(userId);
    fs.writeFileSync(filePath, safeJsonStringify(petData));
  }
}

module.exports = LearningPet;
