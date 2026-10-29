/**
 * 内容资产库（与小程序版同源，改为 ES Module）
 * 品牌 / 分类 / 大漆历史 / 漂漆六步法 / 平凉色谱 / 纹样故事 / 项目 / 团队 / 关于 / 示例产品
 * APP 版说明：示例产品的 images / video 为空数组 → 前端渲染「替换为真实产品图 / 视频」占位块
 */

export const BRAND = {
  name: '古艺新创·平凉漆扇',
  shortName: '古艺新创',
  slogan: '以漆为墨，以水为媒，一扇一平凉',
  subSlogan: '国家级非遗「大漆髹饰技艺」× 平凉地域文化 创新实践',
  intro:
    '古艺新创团队以甘肃平凉国家级非物质文化遗产「大漆髹饰技艺」为根基，' +
    '取崆峒山之云海、泾河之回澜、庄浪之梯田、丝路之气象入纹，' +
    '以漂漆六步法「静、调、滴、拨、吸、浸」成器。每一件作品皆独一无二，' +
    '并配一枚专属序列号与 NFC 芯片，让非遗可被追溯、可被拥有、可被讲述。',
  heritage: '国家级非物质文化遗产 · 大漆髹饰技艺',
  region: '甘肃 · 平凉'
};

/* 产品系列分类（含主题色，用于分类标签与卡片区分） */
export const CATEGORIES = [
  { key: 'fan', name: '扇系列', desc: '团扇 · 折扇 · 纸伞', subTypes: ['团扇', '折扇', '纸伞'], sort: 1, color: '#0FA98F', grad: 'var(--grad-brand)' },
  { key: 'accessory', name: '配饰系列', desc: '发圈 · 发夹 · 扇坠', subTypes: ['发圈', '发夹', '扇坠', '胸针'], sort: 2, color: '#FF7FA0', grad: 'var(--grad-pink)' },
  { key: 'home', name: '家居系列', desc: '漆盘 · 摆件 · 香器', subTypes: ['漆盘', '摆件', '香器', '茶则'], sort: 3, color: '#FFB300', grad: 'var(--grad-gold)' },
  { key: 'culture', name: '文创系列', desc: '书签 · 礼盒 · 联名', subTypes: ['书签', '礼盒', '明信片', '联名款'], sort: 4, color: '#FF6B4A', grad: 'var(--grad-orange)' }
];

export const LACQUER_HISTORY = {
  title: '八千年漆艺脉络',
  subtitle: '从跨湖桥的一支漆弓，到平凉的一柄漆扇',
  timeline: [
    { era: '约 8000 年前', title: '跨湖桥漆弓', desc: '浙江萧山跨湖桥遗址出土的漆弓，将中国人使用大漆的历史上溯至八千年前，是世界上最早的漆器实物之一。' },
    { era: '约 7000 年前', title: '河姆渡朱漆碗', desc: '河姆渡文化木胎朱漆碗，髹涂生漆并调入朱砂，证明先民已掌握「漆 + 矿物颜料」的调色技术。' },
    { era: '战国 · 楚', title: '楚漆浪漫', desc: '楚国漆器以黑红为主调，云纹、凤鸟纹飞扬流动，漆工艺第一次成为独立的艺术语言。' },
    { era: '汉 · 唐', title: '髹漆成制', desc: '汉代设「漆工」官署，唐代漆器随丝路西传。平凉作为丝路要冲，成为漆艺与商贸交汇之地。' },
    { era: '宋 · 元', title: '戗金与剔犀', desc: '宋代素髹极简、戗金精细；元代剔犀、剔红层层积累，漆器的文人气与匠人气并盛。' },
    { era: '明 · 清', title: '集大成', desc: '《髹饰录》成书，系统总结髹饰十四门、数百技法，是中国乃至世界最早的漆工艺专著。' },
    { era: '当代', title: '大漆髹饰技艺', desc: '以天然大漆为核心的传统髹饰技艺列入国家级非物质文化遗产名录，进入系统性保护与创新阶段。' },
    { era: '此刻', title: '平凉新创', desc: '古艺新创以漂漆入扇，让八千年漆艺在平凉的山水之间重新流动。' }
  ]
};

export const PIAOQI_STEPS = [
  { key: '静', name: '静', full: '静水待漆', desc: '取清水静置，去其浮躁。水面如镜，方能映出漆色最本真的流动。心境亦需静，手静则纹正。', tip: '水温 20–25℃ 最佳，静置 10 分钟以上', grad: 'var(--grad-brand)' },
  { key: '调', name: '调', full: '调漆配色', desc: '以平凉色谱为纲，将天然大漆与矿物色粉调和，调入松节油稀释至可滴落之稠度。一色一意，不可杂陈。', tip: '崆峒青、泾河碧、梯田金、丹霞赭、苹果花粉', grad: 'var(--grad-blue)' },
  { key: '滴', name: '滴', full: '滴漆入水', desc: '以竹签蘸漆，距水面三寸轻点。漆入水即散，成环、成晕、成云，此为纹样之始。', tip: '滴距越稳，环纹越圆', grad: 'var(--grad-green)' },
  { key: '拨', name: '拨', full: '拨水成纹', desc: '以针或签轻拨水面，牵引漆膜走向。或作云海翻涌，或作回澜层层，或作梯田蜿蜒——全在腕间一分力。', tip: '一纹一故事，拨前先立意', grad: 'var(--grad-gold)' },
  { key: '吸', name: '吸', full: '吸余留清', desc: '以纸轻触水面，吸去浮漆与杂质，使纹样边界清朗。留白处，正是云海的天光。', tip: '吸得越净，纹样越通透', grad: 'var(--grad-orange)' },
  { key: '浸', name: '浸', full: '浸扇取纹', desc: '扇面平入水中，一沉一提，水色尽附于扇。出水刹那，纹样成定局，天下再无第二柄相同。', tip: '入水角度决定纹样走向，不可重复', grad: 'var(--grad-pink)' }
];

export const PINGLIANG_COLORS = [
  { name: '崆峒青', hex: '#0FA98F', en: 'Kongtong Green', from: '崆峒山雨后林霭', meaning: '青绿沉静，取崆峒山雨后林霭之色。主「静」，是漆扇的底色与骨相。', tag: '品牌主色' },
  { name: '泾河碧', hex: '#22C3E6', en: 'Jinghe Blue', from: '泾河清波回澜', meaning: '鲜亮水绿，取泾河清波回澜之色。主「流」，是漂漆最灵动的那一笔。', tag: '品牌主色' },
  { name: '梯田金', hex: '#FFB300', en: 'Titian Gold', from: '庄浪梯田秋收', meaning: '明亮金黄，取庄浪梯田秋收之色。主「丰」，寓意耕耘有获、岁岁丰登。', tag: '强调点缀' },
  { name: '丹霞赭', hex: '#FF6B4A', en: 'Danxia Orange', from: '丹霞赤壁暖阳', meaning: '暖红橙，取平凉丹霞地貌暖阳映壁之色。主「烈」，是丝路上最热烈的一抹。', tag: '强调点缀' },
  { name: '苹果花粉', hex: '#FF7FA0', en: 'Apple Blossom', from: '静宁苹果花', meaning: '粉嫩柔润，取静宁苹果花初绽之色。主「新」，代表年轻化表达与面向未来的生命力。', tag: '年轻板块' },
  { name: '瓦灰', hex: '#5A6169', en: 'Tile Gray', from: '古城青瓦', meaning: '中性沉稳，取平凉古城青瓦之色。主「承」，作文字与结构之基，让所有亮色有处安放。', tag: '中性基底' }
];

export const PATTERNS = [
  { key: 'kongtong', name: '崆峒云海', series: 'fan', origin: '崆峒山 · 云海日出', story: '崆峒山为天下道教第一山，黄帝问道广成子于此。晨起云海翻涌，山巅若浮岛。此纹以崆峒青入水，拨出层层叠涌之云，留白处即天光。', meaning: '问道 · 登高 · 心有山海', colorHex: '#0FA98F' },
  { key: 'jinghe', name: '泾河回澜', series: 'fan', origin: '泾河 · 泾渭分明', story: '泾河自六盘山东麓而下，与渭水交汇处清浊分明。此纹以泾河碧为主色，拨出水波回旋、层层推远之势，取「泾渭分明」之清正。', meaning: '清正 · 回澜 · 生生不息', colorHex: '#22C3E6' },
  { key: 'zhuanglang', name: '庄浪梯田', series: 'fan', origin: '庄浪 · 百万亩梯田', story: '庄浪人四十年修出百万亩梯田，把荒山绣成锦缎。此纹以梯田金层层叠绕，如等高线般一圈圈向上，是对「人定胜天」最朴素的礼赞。', meaning: '耕耘 · 层叠 · 岁岁丰登', colorHex: '#FFB300' },
  { key: 'silkroad', name: '丝路驼铃', series: 'culture', origin: '丝绸之路 · 平凉驿', story: '平凉为丝路北线重镇，商旅络绎，驼铃不绝。此纹以丹霞赭作沙丘之暖，间以苹果花粉点染，如大漠落日与花开的相遇。', meaning: '通达 · 交汇 · 文明互鉴', colorHex: '#FF6B4A' }
];

export const PROJECT = {
  guidelineTitle: '指导思想',
  guideline: [
    '以习近平文化思想为指引，坚持「保护第一、传承优先」的非遗工作方针。',
    '坚持创造性转化、创新性发展，让非遗从博物馆走进日常生活。',
    '以数字化手段为技艺建档、为作品确权、为传承赋能。'
  ],
  backgroundTitle: '项目背景',
  background: {
    culture: {
      title: '文化根基',
      items: [
        '甘肃平凉「大漆髹饰技艺」列入国家级非物质文化遗产名录。',
        '平凉坐拥崆峒山、泾河、庄浪梯田、丝路古道四重文化坐标，纹样取之不尽。',
        '漂漆技艺天然具备「不可复制」的独特性，天生适配单件藏品化叙事。'
      ]
    },
    pain: {
      title: '现实痛点',
      items: [
        '认知断层：大众知漆器而不知漆艺，年轻群体接触渠道匮乏。',
        '溯源缺位：手作品无唯一身份，真伪难辨，难以形成收藏与信任。',
        '渠道单一：线下展销为主，缺少可持续的数字化展示与交易入口。',
        '传承焦虑：工序复杂、周期漫长，青年从业者难以为继。'
      ]
    }
  },
  approachTitle: '总体思路',
  approach: [
    { key: 'guard', name: '守护技艺', color: '#0FA98F', icon: '🛡', desc: '完整记录漂漆六步法与纹样谱系，建立可检索的数字档案；以师徒制 + 工作坊延续手艺命脉。' },
    { key: 'market', name: '激活市场', color: '#22C3E6', icon: '📡', desc: '以「一物一码」序列号 + NFC 芯片为每件作品确权，构建可售、可查、可赠的数字化消费体验。' },
    { key: 'ecosystem', name: '培育生态', color: '#FFB300', icon: '🌱', desc: '串联传承人、设计师、渠道与消费者，形成「技艺—产品—内容—社群」的正向循环。' }
  ],
  futureTitle: '未来展望',
  future: [
    '建立「平凉纹样基因库」，将地域文化符号系统化、可授权、可复用。',
    '推出数字藏品证书（以实物 SN 为锚），打通线上线下确权。',
    '建设研学工坊，让游客亲手完成漂漆六步，带走专属 SN 作品。',
    '与文旅、景区、文创品牌联名，形成平凉非遗城市名片。'
  ]
};

export const TEAM = [
  { key: 'narrator', name: '柳青岚', title: '项目文化解说员', titleShort: '文化解说员', avatarText: '岚', color: '#0FA98F', duty: '负责大漆髹饰技艺的文化脉络梳理、纹样释义与展陈讲解，让每一件作品「有话可说」。', tags: ['文化脉络', '纹样释义', '展陈讲解'], quote: '一纹一故事，讲的其实是平凉的山水。' },
  { key: 'planner', name: '沈砚舟', title: '项目策划师', titleShort: '策划师', avatarText: '砚', color: '#22C3E6', duty: '负责项目架构、市场定位与数字化建设，主导 SN 体系与 NFC 溯源方案落地。', tags: ['项目架构', '市场定位', '数字化'], quote: '让千年技艺拥有可追溯的数字身份。' },
  { key: 'designer', name: '苏漆白', title: '项目核心设计师', titleShort: '核心设计师', avatarText: '漆', color: '#FF7FA0', duty: '负责平凉色谱提炼与纹样设计，将崆峒云海、泾河回澜、庄浪梯田转译为可量产的漆扇语言。', tags: ['纹样设计', '色谱提炼', '产品设计'], quote: '水知道纹样该往哪里走，我只是顺水推舟。' },
  { key: 'operator', name: '何守拙', title: '项目实践操作员', titleShort: '实践操作员', avatarText: '拙', color: '#FFB300', duty: '负责漂漆六步法的实际制作与品控，把控每一柄扇的成纹质量与良品率。', tags: ['漂漆制作', '工艺品控', '材料调配'], quote: '手静，纹才正。急不得。' }
];

export const ABOUT = {
  visionTitle: '我们的愿景',
  vision:
    '让国家级非遗「大漆髹饰技艺」在平凉的山水之间继续流动——' +
    '既守得住八千年的手艺，也走得出一条通往年轻人的路。' +
    '每一件作品都有唯一的序列号，每一段纹样都有可追溯的故事。',
  values: [
    { name: '守正', desc: '尊重大漆本性，不省工序、不减工时' },
    { name: '出新', desc: '以地域文化为母题，做当代人愿意用的漆器' },
    { name: '可溯', desc: '一物一码，NFC 可查，真伪可辨' },
    { name: '共享', desc: '让传承人、设计师与消费者共享技艺红利' }
  ],
  contactTitle: '联系我们',
  contacts: [
    { label: '项目微信', value: 'guyi-xinchuang（示例）', copyable: true },
    { label: '合作邮箱', value: 'hello@guyi-xinchuang.cn（示例）', copyable: true },
    { label: '项目地址', value: '甘肃省平凉市崆峒区 · 古艺新创漆艺工坊（示例）', copyable: false },
    { label: '非遗项目', value: '大漆髹饰技艺（国家级非物质文化遗产）', copyable: false }
  ],
  disclaimer: '本 App 所载联系方式、示例产品与价格均为演示数据，正式使用前请在「管理端」替换为真实信息。'
};

/** 示例产品：images / video 为空 → 前端展示占位块（APP 内可直接上传替换） */
export const DEMO_PRODUCTS = [
  { sn: 'GY-2026-0001', name: '崆峒云海·团扇', category: 'fan', subType: '团扇', patternName: '崆峒云海', patternStory: '以崆峒青入水，拨出层层叠涌之云，留白处即山巅天光。取黄帝问道广成子之意，云海之上，问道于心。', craft: '漂漆六步法全手工完成；天然大漆 + 矿物色粉；竹制扇骨，苏工绷面。', usage: '夏日纳凉、汉服配饰、书房陈设、非遗礼赠', status: 'sold', featured: true, onSale: true, price: 598, images: [], video: null, nfcTagId: 'NFC-GY-0001' },
  { sn: 'GY-2026-0002', name: '泾河回澜·折扇', category: 'fan', subType: '折扇', patternName: '泾河回澜', patternStory: '泾渭分明，清者自清。以泾河碧为主色，水波回旋、层层推远，扇开如一段河湾。', craft: '漂漆取纹后手工折裱；棕竹扇骨 18 方；扇面双面髹漆加固。', usage: '日常把玩、文人雅集、商务礼赠', status: 'unsold', featured: true, onSale: true, price: 468, images: [], video: null, nfcTagId: 'NFC-GY-0002' },
  { sn: 'GY-2026-0003', name: '庄浪梯田·纸伞', category: 'fan', subType: '纸伞', patternName: '庄浪梯田', patternStory: '梯田金层层叠绕如等高线，一圈圈向上——四十年修出的百万亩梯田，被收进一柄伞里。', craft: '棉纸伞面手工漂漆；桐油罩面防水；竹制伞骨 36 根。', usage: '旗袍搭配、旅拍道具、空间陈列', status: 'unsold', featured: true, onSale: true, price: 728, images: [], video: null, nfcTagId: 'NFC-GY-0003' },
  { sn: 'GY-2026-0004', name: '苹果花开·发圈', category: 'accessory', subType: '发圈', patternName: '苹果花开', patternStory: '苹果花粉入水即散，如静宁苹果花初绽。粉嫩柔润，是平凉给年轻人最直接的一份甜。', craft: '真丝底料漂漆取纹；手工缝制；内衬高弹力松筋。', usage: '日常佩戴、伴手礼、年轻化入门款', status: 'unsold', featured: true, onSale: true, price: 128, images: [], video: null, nfcTagId: 'NFC-GY-0004' },
  { sn: 'GY-2026-0005', name: '泾河小澜·发夹', category: 'accessory', subType: '发夹', patternName: '泾河回澜', patternStory: '取泾河一湾小澜，纹样精简，小而完整。', craft: '漆片裁切打磨；黄铜夹体镶嵌；边缘手工倒角。', usage: '日常佩戴、搭配单品', status: 'unsold', featured: false, onSale: true, price: 98, images: [], video: null, nfcTagId: '' },
  { sn: 'GY-2026-0006', name: '崆峒听风·扇坠', category: 'accessory', subType: '扇坠', patternName: '崆峒云海', patternStory: '扇坠虽小，云海俱全。悬于扇柄，行则风动，静则山在。', craft: '漆珠逐颗浸染穿绳；配崆峒青流苏。', usage: '扇坠、包挂、车挂', status: 'unsold', featured: false, onSale: true, price: 168, images: [], video: null, nfcTagId: '' },
  { sn: 'GY-2026-0007', name: '梯田秋收·漆盘', category: 'home', subType: '漆盘', patternName: '庄浪梯田', patternStory: '盘心一圈圈金色梯田，盛果、盛茶、盛四季。', craft: '木胎裱布刮灰；漂漆取纹后罩面推光；可接触食品（干果）。', usage: '茶席果盘、玄关收纳、墙面挂饰', status: 'unsold', featured: true, onSale: true, price: 880, images: [], video: null, nfcTagId: '' },
  { sn: 'GY-2026-0008', name: '丝路驼铃·礼盒', category: 'culture', subType: '礼盒', patternName: '丝路驼铃', patternStory: '丹霞赭作沙丘之暖，苹果花粉点染花开——大漠落日与春天的一次相遇。', craft: '礼盒内含漆扇 1 柄 + 纹样卡 + SN 证书；盒面丝网印平凉纹样。', usage: '政企礼赠、文旅伴手礼、节庆定制', status: 'unsold', featured: false, onSale: true, price: 1280, images: [], video: null, nfcTagId: '' }
];
