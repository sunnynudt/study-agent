/**
 * 知识点掌握图谱模块
 * 可视化展示学习进度和知识掌握情况
 */

const ProgressTracker = require('../progress/progressTracker');

/**
 * 知识点图谱类
 */
class KnowledgeGraph {
  constructor() {
    this.progressTracker = new ProgressTracker();
    
    // 知识点定义
    this.knowledgePoints = {
      math: {
        addition: { name: '加减法', level: 2, topics: ['100以内加减', '万以内加减', '小数加减'] },
        multiplication: { name: '乘法', level: 2, topics: ['乘法口诀', '表内乘法', '小数乘整数'] },
        division: { name: '除法', level: 2, topics: ['表内除法', '除数是整十数', '小数除法'] },
        fraction: { name: '分数', level: 3, topics: ['分数的认识', '分数加减', '分数比较'] },
        decimal: { name: '小数', level: 3, topics: ['小数的认识', '小数加减', '小数乘除'] },
        percentage: { name: '百分数', level: 5, topics: ['百分数认识', '百分数应用'] },
        geometry: { name: '几何图形', level: 2, topics: ['认识图形', '面积周长', '立体图形'] },
        application: { name: '应用题', level: 2, topics: ['简单应用', '复合应用', '典型问题'] }
      },
      english: {
        vocabulary: { name: '词汇', level: 2, topics: ['颜色数字', '日常词汇', '进阶词汇'] },
        grammar: { name: '语法', level: 3, topics: ['单复数', '时态', '句型结构'] },
        reading: { name: '阅读', level: 2, topics: ['短文阅读', '理解问题', '阅读策略'] },
        listening: { name: '听力', level: 2, topics: ['听音辨词', '对话理解', '短文听力'] },
        writing: { name: '写作', level: 4, topics: ['句子仿写', '段落写作', '短文写作'] },
        speaking: { name: '口语', level: 2, topics: ['日常对话', '情景交际', '自我介绍'] }
      },
      chinese: {
        vocabulary: { name: '识字写字', level: 2, topics: ['生字学习', '词语积累', '错别字'] },
        reading: { name: '阅读理解', level: 2, topics: ['理解词句', '段落分析', '主旨概括'] },
        composition: { name: '作文', level: 2, topics: ['看图写话', '命题作文', '读后感'] },
        poetry: { name: '古诗词', level: 2, topics: ['背诵默写', '诗意理解', '诗人简介'] },
        idiom: { name: '成语故事', level: 3, topics: ['成语积累', '故事理解', '成语运用'] },
        classical: { name: '文言文', level: 5, topics: ['字词理解', '句子翻译', '内容把握'] }
      }
    };
  }

  /**
   * 获取完整知识图谱
   */
  getFullGraph() {
    return this.knowledgePoints;
  }

  /**
   * 生成用户知识掌握图谱
   */
  generateUserGraph(userId) {
    const progress = this.progressTracker.getProgress(userId);
    const graph = {
      overview: this.generateOverview(progress),
      subjects: {},
      strongPoints: [],
      weakPoints: [],
      suggestions: []
    };
    
    // 生成各学科图谱
    for (const [subject, data] of Object.entries(progress.subjects)) {
      graph.subjects[subject] = this.generateSubjectGraph(subject, data);
    }
    
    // 分析强项和弱项
    const allTopics = [];
    for (const [subject, data] of Object.entries(progress.subjects)) {
      for (const [topic, stats] of Object.entries(data.topics)) {
        const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
        allTopics.push({ subject, topic, accuracy, total: stats.total });
      }
    }
    
    // 排序
    allTopics.sort((a, b) => b.accuracy - a.accuracy);
    
    // 取强项（准确率>=80%，至少做过3题）
    graph.strongPoints = allTopics
      .filter(t => t.accuracy >= 80 && t.total >= 3)
      .slice(0, 5)
      .map(t => this.formatTopicName(t.subject, t.topic));
    
    // 取弱项（准确率<60%，至少做过2题）
    graph.weakPoints = allTopics
      .filter(t => t.accuracy < 60 && t.total >= 2)
      .slice(0, 5)
      .map(t => this.formatTopicName(t.subject, t.topic));
    
    // 生成建议
    graph.suggestions = this.generateSuggestions(graph.weakPoints, progress);
    
    return graph;
  }

  /**
   * 生成概览
   */
  generateOverview(progress) {
    const accuracy = progress.totalQuestions > 0 
      ? Math.round((progress.correctAnswers / progress.totalQuestions) * 100) 
      : 0;
    
    return {
      totalQuestions: progress.totalQuestions,
      correctAnswers: progress.correctAnswers,
      accuracy,
      streak: progress.streak,
      grade: progress.grade
    };
  }

  /**
   * 生成学科知识图谱
   */
  generateSubjectGraph(subject, data) {
    const graph = {
      subject,
      totalQuestions: data.questions,
      correctAnswers: data.correct,
      accuracy: data.questions > 0 ? Math.round((data.correct / data.questions) * 100) : 0,
      topics: {}
    };
    
    // 初始化所有知识点
    if (this.knowledgePoints[subject]) {
      for (const [topicKey, topicData] of Object.entries(this.knowledgePoints[subject])) {
        graph.topics[topicKey] = {
          name: topicData.name,
          status: 'locked',
          progress: 0,
          accuracy: null,
          minGrade: topicData.level
        };
      }
    }
    
    // 更新有数据的知识点
    for (const [topic, stats] of Object.entries(data.topics)) {
      if (graph.topics[topic]) {
        const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        
        // 根据准确率确定状态
        let status = 'in-progress';
        if (accuracy >= 80) status = 'mastered';
        else if (accuracy < 50) status = 'needs-work';
        
        graph.topics[topic].status = status;
        graph.topics[topic].progress = Math.min(100, Math.round((stats.total / 10) * 100));
        graph.topics[topic].accuracy = accuracy;
      }
    }
    
    return graph;
  }

  /**
   * 格式化知识点名称
   */
  formatTopicName(subject, topic) {
    const subjectMap = { math: '数学', english: '英语', chinese: '语文' };
    const topicName = this.knowledgePoints[subject]?.[topic]?.name || topic;
    return `${subjectMap[subject]} - ${topicName}`;
  }

  /**
   * 生成学习建议
   */
  generateSuggestions(weakPoints, progress) {
    const suggestions = [];
    
    if (progress.totalQuestions === 0) {
      return ['今天还没有开始学习哦，快来出几道题吧！'];
    }
    
    if (weakPoints.length > 0) {
      suggestions.push(`📚 推荐重点复习：${weakPoints.slice(0, 3).join('、')}`);
    }
    
    // 根据连续学习天数建议
    if (progress.streak >= 3) {
      suggestions.push('🔥 连续学习好几天了！你的毅力很棒！继续保持！');
    } else if (progress.streak === 0) {
      suggestions.push('💪 今天开始新的学习之旅吧！');
    }
    
    // 学科平衡建议
    const subjects = progress.subjects;
    const totals = {
      math: subjects.math?.questions || 0,
      english: subjects.english?.questions || 0,
      chinese: subjects.chinese?.questions || 0
    };
    
    const minSubject = Object.entries(totals).sort((a, b) => a[1] - b[1])[0];
    if (minSubject[1] < 5) {
      const subjectMap = { math: '数学', english: '英语', chinese: '语文' };
      suggestions.push(`📖 ${subjectMap[minSubject[0]]}练习有点少哦，建议加强一下！`);
    }
    
    // 正确率建议
    const accuracy = progress.totalQuestions > 0 
      ? (progress.correctAnswers / progress.totalQuestions) * 100 
      : 0;
    
    if (accuracy < 50) {
      suggestions.push('💡 正确率还可以提高，建议做完题后仔细看看解析哦！');
    } else if (accuracy >= 90) {
      suggestions.push('🌟 正确率很高！你已经掌握得很好了！');
    }
    
    return suggestions;
  }

  /**
   * 格式化图谱为可视化文本
   */
  formatAsciiGraph(userId) {
    const graph = this.generateUserGraph(userId);
    const subjectMap = { math: '数学', english: '英语', chinese: '语文' };
    
    let output = `📊 **知识掌握图谱**\n\n`;
    
    // 概览
    output += `**总览**\n`;
    output += `📝 总题数：${graph.overview.totalQuestions}\n`;
    output += `✅ 正确数：${graph.overview.correctAnswers}\n`;
    output += `📈 正确率：${graph.overview.accuracy}%\n`;
    output += `🔥 连续学习：${graph.overview.streak}天\n\n`;
    
    // 各学科进度
    for (const [subject, data] of Object.entries(graph.subjects)) {
      output += `**${subjectMap[subject]}** (${data.accuracy}%)\n`;
      
      for (const [key, topic] of Object.entries(data.topics)) {
        const statusIcon = {
          'mastered': '🟢',
          'in-progress': '🟡',
          'needs-work': '🔴',
          'locked': '⚪'
        }[topic.status] || '⚪';
        
        const accuracyText = topic.accuracy !== null ? ` ${topic.accuracy}%` : '';
        output += `  ${statusIcon} ${topic.name}${accuracyText}\n`;
      }
      output += '\n';
    }
    
    // 强项
    if (graph.strongPoints.length > 0) {
      output += `**🌟 强项**\n${graph.strongPoints.join('、')}\n\n`;
    }
    
    // 弱项
    if (graph.weakPoints.length > 0) {
      output += `**📚 待加强**\n${graph.weakPoints.join('、')}\n\n`;
    }
    
    // 建议
    if (graph.suggestions.length > 0) {
      output += `**💡 学习建议**\n`;
      graph.suggestions.forEach(s => output += `${s}\n`);
    }
    
    return output;
  }
}

module.exports = KnowledgeGraph;
