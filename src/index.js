/**
 * OpenClaw Agent Wrapper
 * 将核心功能包装成 OpenClaw Agent 格式
 */

const StudyAgentCore = require('../core/agentCore');
const InteractionService = require('./interactionService');
const { extractSubject } = require('../core/intentClassifier');

/**
 * 创建 OpenClaw Agent
 */
function createAgent(options = {}) {
  const core = new StudyAgentCore({
    name: options.name || '学习小助手',
    model: options.model || 'minimax/MiniMax-M2.1',
    maxHistory: options.maxHistory || 20
  });

  const interaction = new InteractionService({
    name: options.name || '学习小助手'
  });

  /**
   * OpenClaw Agent 函数
   */
  async function* agent(input, context) {
    const { message, sessionId } = input;
    const userId = sessionId || 'default';
    
    // 第一次打招呼
    const lowerMessage = message.toLowerCase().trim();
    if (lowerMessage === '你好' || lowerMessage === 'hi' || lowerMessage === 'hello' || lowerMessage === '在吗') {
      const welcomeMsg = interaction.getWelcomeMessage(
        interaction.getTimeOfDay(),
        false
      );
      yield { role: 'assistant', content: welcomeMsg };
      return;
    }
    
    // 处理帮助请求
    if (lowerMessage === '帮助' || lowerMessage.includes('帮助')) {
      yield { role: 'assistant', content: interaction.getHelpInfo() };
      return;
    }
    
    // 解析用户回复
    const parsed = interaction.parseUserResponse(message);
    
    // 如果没有明确学科，尝试提取
    let subject = parsed.subject;
    if (!subject) {
      // 检查是否是出题请求
      if (lowerMessage.includes('题') || lowerMessage.includes('练习')) {
        // 看看历史记录中有没有学科
        const summary = core.contextManager.getSummary(userId);
        subject = summary.subject;
      }
    }
    
    // 使用核心处理
    yield* core.process(message, {
      grade: parsed.grade || 3,
      userId
    });
  }

  return agent;
}

module.exports = { createAgent };
