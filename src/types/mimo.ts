export type MimoModel =
  | 'mimo-v2.5-tts'
  | 'mimo-v2.5-tts-voicedesign'
  | 'mimo-v2.5-tts-voiceclone';

export interface PresetVoice {
  id: string;
  name: string;
  language: string;
  gender: string;
}

export const PRESET_VOICES: PresetVoice[] = [
  { id: 'mimo_default', name: 'MiMo-默认', language: '中文', gender: '取决于集群' },
  { id: '冰糖', name: '冰糖', language: '中文', gender: '女性' },
  { id: '茉莉', name: '茉莉', language: '中文', gender: '女性' },
  { id: '苏打', name: '苏打', language: '中文', gender: '男性' },
  { id: '白桦', name: '白桦', language: '中文', gender: '男性' },
  { id: 'Mia', name: 'Mia', language: 'English', gender: 'Female' },
  { id: 'Chloe', name: 'Chloe', language: 'English', gender: 'Female' },
  { id: 'Milo', name: 'Milo', language: 'English', gender: 'Male' },
  { id: 'Dean', name: 'Dean', language: 'English', gender: 'Male' },
];

export interface VoiceDesignExample {
  label: string;
  prompt: string;
  sampleText: string;
}

export const VOICE_DESIGN_EXAMPLES: VoiceDesignExample[] = [
  {
    label: '温柔女声',
    prompt: '年轻女性，声音温柔平静，语速偏慢，像深夜电台主播在道晚安，让人感到安心舒适。',
    sampleText: '夜深了，城市安静下来，让我陪你度过这段安静的时光。',
  },
  {
    label: '活力少年',
    prompt: '青少年男性，声音明亮活泼，语速偏快，充满朝气和好奇心，咬字清晰有力。',
    sampleText: '哇！这也太酷了吧！我跟你说，今天发生了一件超有趣的事！',
  },
  {
    label: '沉稳大叔',
    prompt: '中年男性，嗓音低沉醇厚，语速缓慢稳重，带着岁月沉淀的从容与智慧。',
    sampleText: '年轻人，有些事急不得，慢慢来，时间会给你答案。',
  },
  {
    label: '干练职场',
    prompt: '三十岁女性，声音清晰自信，语速适中，专业但不冷漠，像在向团队做汇报。',
    sampleText: '各位，这是我们本季度的业绩报告，数据表明策略是有效的。',
  },
  {
    label: '可爱甜声',
    prompt: '年轻女孩，声音甜美清脆，带着一点俏皮，像在和朋友分享开心事。',
    sampleText: '嘻嘻，你终于来啦！我等你等了好久呢，快来看看这个！',
  },
  {
    label: '威严长者',
    prompt: '年长男性，声音浑厚有力度，语速缓慢，字字千钧，让人不敢造次。',
    sampleText: '此事关乎家族百年基业，万不可意气用事，你可想清楚了？',
  },
];

export interface SynthesisResult {
  audio_base64: string;
  format: string;
}

export interface SynthesisParams {
  model: string;
  text: string;
  voice: string;
  styleInstruction?: string;
  optimizeText?: boolean;
  format?: string;
}
