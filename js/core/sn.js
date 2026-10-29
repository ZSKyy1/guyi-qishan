/**
 * 序列号（SN）规则与解析
 * 规则：GY-年份-四位流水号，如 GY-2026-0001（可配置）
 * 解析要宽容：NFC 读到的可能是完整 URL、带空格、带小写、甚至只有数字
 */

export const SN_CONFIG = {
  prefix: 'GY',        // 前缀（品牌缩写，可改）
  digits: 4,           // 流水号位数
  yearMode: 'current', // 'current' 取当年
  separator: '-'
};

/** 生成 SN */
export function formatSn(year, seq) {
  return `${SN_CONFIG.prefix}${SN_CONFIG.separator}${year}${SN_CONFIG.separator}${String(seq).padStart(SN_CONFIG.digits, '0')}`;
}

/** 去掉空白并转大写 */
export function normalize(raw) {
  return String(raw || '').replace(/\s+/g, '').toUpperCase();
}

/**
 * 从任意文本中提取 SN
 * 支持：GY-2026-0001 / GY20260001 / https://xxx/?sn=GY-2026-0001 / guyi://product?sn=... / 0001
 */
export function extractSn(raw) {
  if (!raw) return '';
  const s = normalize(raw);

  // 1) URL 中的 sn 参数
  const m = s.match(/[?&]SN=([A-Z0-9\-_]+)/);
  if (m) return m[1];

  // 2) 完整格式 GY-2026-0001
  const full = s.match(/\b([A-Z]{2,4})-(\d{4})-(\d{3,6})\b/);
  if (full) return `${full[1]}-${full[2]}-${full[3]}`;

  // 3) 紧凑格式 GY20260001
  const tight = s.match(/\b([A-Z]{2,4})(\d{4})(\d{4})\b/);
  if (tight) return `${tight[1]}-${tight[2]}-${tight[3]}`;

  // 4) 纯流水号 → 用当前年份 + 默认前缀补全（宽容兜底）
  const plain = s.match(/^\d{1,6}$/);
  if (plain) return `${SN_CONFIG.prefix}-${new Date().getFullYear()}-${plain[0].padStart(SN_CONFIG.digits, '0')}`;

  // 5) 兜底：整段当作 SN
  return s;
}

/** 是否符合 SN 规范 */
export function isValid(sn) {
  return /^[A-Z]{2,4}-\d{4}-\d{3,6}$/.test(String(sn || ''));
}

/** 从 SN 里取流水号（用于生成下一个） */
export function seqOf(sn) {
  const m = String(sn || '').match(/-(\d{3,6})$/);
  return m ? parseInt(m[1], 10) : 0;
}
