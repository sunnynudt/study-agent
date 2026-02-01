/**
 * 工具函数集合
 */

/**
 * 随机选择数组元素
 */
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 随机打乱数组
 */
function shuffle(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

/**
 * 格式化数字
 */
function formatNumber(num) {
  const map = { 0: '零', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九' };
  return String(num).split('').map(n => map[n] || n).join('');
}

/**
 * 延迟执行
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 截断文本
 */
function truncate(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * 去除首尾空白
 */
function trim(text) {
  return text.replace(/^\s+|\s+$/g, '');
}

/**
 * 检查是否为空
 */
function isEmpty(text) {
  return !text || trim(text).length === 0;
}

/**
 * 生成唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 安全的 JSON 解析
 */
function safeJsonParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

/**
 * 安全的 JSON 字符串化
 */
function safeJsonStringify(obj, fallback = '{}') {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return fallback;
  }
}

/**
 * 格式化时间
 */
function formatTime(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * 获取时间段描述
 */
function getTimePeriod() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '早上';
  if (hour >= 12 && hour < 14) return '中午';
  if (hour >= 14 && hour < 18) return '下午';
  return '晚上';
}

/**
 * 年级数字转中文
 */
function gradeToChinese(grade) {
  const map = { 1: '一年级', 2: '二年级', 3: '三年级', 4: '四年级', 5: '五年级', 6: '六年级' };
  return map[grade] || `${grade}年级`;
}

/**
 * 中文转年级数字
 */
function chineseToGrade(text) {
  const map = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6 };
  const match = text.match(/([一二三四五六])/);
  return match ? map[match[1]] : null;
}

module.exports = {
  randomPick,
  shuffle,
  formatNumber,
  delay,
  truncate,
  trim,
  isEmpty,
  generateId,
  safeJsonParse,
  safeJsonStringify,
  formatTime,
  getTimePeriod,
  gradeToChinese,
  chineseToGrade
};
