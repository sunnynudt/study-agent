/**
 * 上下文管理器 - 管理对话历史和上下文状态
 */

class ContextManager {
  constructor(options = {}) {
    this.maxHistory = options.maxHistory || 20;
    this.maxContextLength = options.maxContextLength || 8000;
    this.contexts = new Map(); // userId -> context
  }

  /**
   * 获取用户上下文
   */
  getContext(userId) {
    if (!this.contexts.has(userId)) {
      this.contexts.set(userId, this.createEmptyContext(userId));
    }
    return this.contexts.get(userId);
  }

  /**
   * 创建空上下文
   */
  createEmptyContext(userId) {
    return {
      userId,
      subject: null,
      grade: 3,
      topic: null,
      history: [],
      state: {
        hasGreeted: false,
        inQuestionSession: false,
        questionCount: 0
      },
      preferences: {},
      createdAt: Date.now(),
      lastActiveAt: Date.now()
    };
  }

  /**
   * 添加到历史记录
   */
  addToHistory(userId, message) {
    const context = this.getContext(userId);
    
    context.history.push({
      ...message,
      timestamp: Date.now()
    });

    // 限制历史长度
    if (context.history.length > this.maxHistory) {
      context.history = context.history.slice(-this.maxHistory);
    }

    context.lastActiveAt = Date.now();
  }

  /**
   * 设置学科
   */
  setSubject(userId, subject) {
    const context = this.getContext(userId);
    context.subject = subject;
  }

  /**
   * 设置年级
   */
  setGrade(userId, grade) {
    const context = this.getContext(userId);
    context.grade = grade;
  }

  /**
   * 设置话题
   */
  setTopic(userId, topic) {
    const context = this.getContext(userId);
    context.topic = topic;
  }

  /**
   * 更新状态
   */
  updateState(userId, updates) {
    const context = this.getContext(userId);
    context.state = { ...context.state, ...updates };
  }

  /**
   * 开始出题会话
   */
  startQuestionSession(userId, count = 5) {
    this.updateState(userId, {
      inQuestionSession: true,
      questionCount: count,
      currentQuestionIndex: 0
    });
  }

  /**
   * 结束出题会话
   */
  endQuestionSession(userId) {
    this.updateState(userId, {
      inQuestionSession: false,
      questionCount: 0,
      currentQuestionIndex: 0
    });
  }

  /**
   * 获取简化的上下文摘要
   */
  getSummary(userId) {
    const context = this.getContext(userId);
    
    return {
      userId: context.userId,
      subject: context.subject,
      grade: context.grade,
      topic: context.topic,
      messageCount: context.history.length,
      isInQuestionSession: context.state.inQuestionSession,
      lastActive: new Date(context.lastActiveAt).toLocaleString('zh-CN')
    };
  }

  /**
   * 清理不活跃的上下文
   */
  cleanupInactive(maxAge = 24 * 60 * 60 * 1000) { // 默认24小时
    const now = Date.now();
    for (const [userId, context] of this.contexts) {
      if (now - context.lastActiveAt > maxAge) {
        this.contexts.delete(userId);
      }
    }
  }

  /**
   * 重置用户上下文
   */
  reset(userId) {
    this.contexts.set(userId, this.createEmptyContext(userId));
  }

  /**
   * 导出上下文数据
   */
  export(userId) {
    return JSON.stringify(this.getContext(userId), null, 2);
  }

  /**
   * 导入上下文数据
   */
  import(userId, data) {
    try {
      const context = JSON.parse(data);
      this.contexts.set(userId, {
        ...context,
        userId,
        lastActiveAt: Date.now()
      });
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = ContextManager;
