import { useState, useRef } from 'react';
import { Box, TextField, Typography, Chip, Tooltip, Alert } from '@mui/material';
import { TextFields, EmojiEmotions, RecordVoiceOver, Translate, Speed, MusicNote, InfoOutlined } from '@mui/icons-material';

interface Props {
  value: string;
  onChange: (text: string) => void;
}

interface TagItem {
  label: string;
  tag: string;
  tooltip: string;
}

interface TagGroup {
  icon: React.ReactNode;
  label: string;
  tags: TagItem[];
}

const TAG_GROUPS: TagGroup[] = [
  {
    icon: <EmojiEmotions fontSize="small" />,
    label: '基础情绪',
    tags: [
      { label: '开心', tag: '(开心)', tooltip: '表达高兴、喜悦的情绪' },
      { label: '悲伤', tag: '(悲伤)', tooltip: '表达难过、忧伤的情绪' },
      { label: '愤怒', tag: '(愤怒)', tooltip: '表达生气、愤怒的情绪' },
      { label: '恐惧', tag: '(恐惧)', tooltip: '表达害怕、恐惧的情绪' },
      { label: '惊讶', tag: '(惊讶)', tooltip: '表达吃惊、意外的情绪' },
      { label: '平静', tag: '(平静)', tooltip: '平静、淡然的语气' },
      { label: '委屈', tag: '(委屈)', tooltip: '表达委屈、不甘的情绪' },
      { label: '动情', tag: '(动情)', tooltip: '带着情感、走心的语气' },
    ],
  },
  {
    icon: <RecordVoiceOver fontSize="small" />,
    label: '语调风格',
    tags: [
      { label: '温柔', tag: '(温柔)', tooltip: '温柔、柔和的说话方式' },
      { label: '高冷', tag: '(高冷)', tooltip: '高冷、疏离的语气' },
      { label: '活泼', tag: '(活泼)', tooltip: '活泼、有活力的语气' },
      { label: '严肃', tag: '(严肃)', tooltip: '严肃、正式的语气' },
      { label: '慵懒', tag: '(慵懒)', tooltip: '慵懒、懒洋洋的语气' },
      { label: '磁性', tag: '(磁性)', tooltip: '有磁性的嗓音质感' },
      { label: '空灵', tag: '(空灵)', tooltip: '空灵、飘渺的声音' },
      { label: '甜美', tag: '(甜美)', tooltip: '甜美可爱的声音' },
    ],
  },
  {
    icon: <Translate fontSize="small" />,
    label: '方言特色',
    tags: [
      { label: '东北话', tag: '(东北话)', tooltip: '东北方言口音' },
      { label: '四川话', tag: '(四川话)', tooltip: '四川方言口音' },
      { label: '河南话', tag: '(河南话)', tooltip: '河南方言口音' },
      { label: '粤语', tag: '(粤语)', tooltip: '广东话 / 粤语' },
      { label: '台湾腔', tag: '(台湾腔)', tooltip: '台湾口音和说话方式' },
    ],
  },
  {
    icon: <Speed fontSize="small" />,
    label: '语速控制',
    tags: [
      { label: '语速加快', tag: '(语速加快)', tooltip: '加快说话速度' },
      { label: '语速放慢', tag: '(语速放慢)', tooltip: '放慢说话速度' },
      { label: '小声', tag: '(小声)', tooltip: '低声说话或耳语' },
      { label: '大喊', tag: '(提高音量喊话)', tooltip: '大声喊话' },
      { label: '急促', tag: '(急促)', tooltip: '急促进促的语气' },
      { label: '犹豫', tag: '(吞吞吐吐)', tooltip: '说话结巴、犹豫' },
    ],
  },
  {
    icon: <MusicNote fontSize="small" />,
    label: '特殊模式',
    tags: [
      { label: '唱歌', tag: '(唱歌)', tooltip: '以歌唱方式输出' },
      { label: '御姐音', tag: '(御姐音)', tooltip: '御姐人设声线' },
      { label: '夹子音', tag: '(夹子音)', tooltip: '夹子音人设声线' },
      { label: '大叔音', tag: '(大叔音)', tooltip: '大叔人设声线' },
      { label: '林黛玉', tag: '(林黛玉)', tooltip: '模仿林黛玉口吻' },
      { label: '孙悟空', tag: '(孙悟空)', tooltip: '模仿孙悟空口吻' },
    ],
  },
];

const COMBO_TAGS: { label: string; tag: string }[] = [
  { label: '温柔 磁性', tag: '(温柔 磁性)' },
  { label: '活泼 语速加快', tag: '(活泼 语速加快)' },
  { label: '高冷 四川话', tag: '(高冷 四川话)' },
  { label: '开心 语速加快', tag: '(开心 语速加快)' },
  { label: '紧张 深呼吸', tag: '(紧张，深呼吸)' },
  { label: '碎碎念 犹豫', tag: '(碎碎念，吞吞吐吐)' },
];

const TEMPLATES = [
  {
    label: '多角色对话',
    text: '(紧张，深呼吸)呼……冷静，冷静。不就是一个面试吗……(语速加快，碎碎念)自我介绍已经背了五十遍了，应该没问题的。加油，你可以的……(小声)哎呀，领带歪没歪？',
  },
  {
    label: '开心方言',
    text: '(开心 四川话)很久很久以前，在遥远的东方，有一座被迷雾笼罩的神秘山谷...',
  },
  {
    label: '日常对话',
    text: '(温柔)你好呀，今天天气真不错，要不要一起出去走走？',
  },
  {
    label: '客服播报',
    text: '(严肃)尊敬的客户您好，请稍等，我马上为您查询订单信息。',
  },
];

export default function TextInput({ value, onChange }: Props) {
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (tag: string) => {
    const el = textareaRef.current;
    if (!el) {
      onChange(value ? value + ' ' + tag : tag);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = value.slice(0, start);
    const after = value.slice(end);
    // Add space separator if needed
    const spacerBefore = before && !before.endsWith(' ') && !before.endsWith(')') ? ' ' : '';
    const spacerAfter = after && !after.startsWith(' ') ? ' ' : '';
    const newText = before + spacerBefore + tag + spacerAfter + after;
    onChange(newText);
    // Restore cursor after the inserted tag
    requestAnimationFrame(() => {
      const newPos = start + spacerBefore.length + tag.length + spacerAfter.length;
      el.setSelectionRange(newPos, newPos);
      el.focus();
    });
  };

  const insertTemplate = (text: string) => {
    onChange(text);
  };

  const visibleGroups = showAllGroups ? TAG_GROUPS : TAG_GROUPS.slice(0, 2);

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <TextFields fontSize="small" /> 合成文本
      </Typography>

      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={'输入要合成语音的文本内容...\n\n使用 (风格标签) 控制语气，标签放在句子前面即可生效。'}
        multiline
        rows={6}
        fullWidth
        size="small"
        inputRef={textareaRef}
      />

      {/* Templates */}
      <Typography variant="caption" sx={{ fontWeight: 600, mt: 1.5, mb: 0.5, display: 'block' }}>
        快速填入示例文本：
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
        {TEMPLATES.map((tpl) => (
          <Tooltip key={tpl.label} title={tpl.text} arrow placement="bottom">
            <Chip
              label={tpl.label}
              size="small"
              variant="outlined"
              color="info"
              onClick={() => insertTemplate(tpl.text)}
              sx={{ fontSize: 12, cursor: 'pointer' }}
            />
          </Tooltip>
        ))}
      </Box>

      {/* Combo tags */}
      <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
        常用组合标签：
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
        {COMBO_TAGS.map((t) => (
          <Chip
            key={t.tag}
            label={t.label}
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => insertAtCursor(t.tag)}
            sx={{ fontSize: 11, cursor: 'pointer' }}
          />
        ))}
      </Box>

      {/* Tag insertion buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, mt: 1.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          插入风格标签（点击插入到光标位置）：
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Chip
            label={showHelp ? '收起说明' : '标签说明'}
            size="small"
            variant="outlined"
            icon={<InfoOutlined sx={{ fontSize: 14 }} />}
            onClick={() => setShowHelp(!showHelp)}
            sx={{ fontSize: 11, cursor: 'pointer' }}
          />
          <Chip
            label={showAllGroups ? '收起' : '展开全部'}
            size="small"
            variant="outlined"
            onClick={() => setShowAllGroups(!showAllGroups)}
            sx={{ fontSize: 11, cursor: 'pointer' }}
          />
        </Box>
      </Box>

      {showHelp && (
        <Alert severity="info" variant="outlined" sx={{ mb: 1, fontSize: 12 }}>
          <Typography variant="caption" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
            标签使用规则：
          </Typography>
          <Typography variant="caption" component="div" color="text.secondary">
            • 标签放在句子前面，控制该句子的说话风格<br />
            • 同一句子前紧挨多个标签如 <code>(开心)(四川话)</code>，只有最后一个 <code>(四川话)</code> 生效<br />
            • 同一标签内用空格或逗号分隔多个风格如 <code>(高冷 四川话)</code>，不冲突的风格全部生效<br />
            • 不同句子可分别加标签，实现多角色/多情绪切换<br />
            • 分隔符不限，空格、逗号、顿号均可
          </Typography>
        </Alert>
      )}

      {visibleGroups.map((group) => (
        <Box key={group.label} sx={{ mb: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mb: 0.3 }}
          >
            {group.icon} {group.label}:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {group.tags.map((t) => (
              <Tooltip key={t.tag} title={t.tooltip} arrow placement="top">
                <Chip
                  label={t.label}
                  size="small"
                  variant="outlined"
                  onClick={() => insertAtCursor(t.tag)}
                  sx={{ fontSize: 11, cursor: 'pointer' }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
