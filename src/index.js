/**
 * Primary School Tutor Agent - 主入口
 */

const { OpenClawAgent } = require('openclaw');
const agent = require('./agent');

async function main() {
  console.log('🎓 小学学习助手启动中...');
  
  const claw = new OpenClawAgent({
    agent: agent,
    model: 'minimax/MiniMax-M2.1',
  });

  await claw.run();
}

main().catch(console.error);
