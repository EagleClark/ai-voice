import { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tooltip,
} from '@mui/material';
import { ExpandMore, Style, Theaters, AutoAwesome } from '@mui/icons-material';

interface Props {
  value: string;
  onChange: (style: string) => void;
}

const STYLE_EXAMPLES = [
  {
    category: '日常场景',
    examples: [
      { label: '向朋友报喜', prompt: '用轻快上扬的语调，语速稍快，带着按捺不住的激动与得意，声音明亮有活力' },
      { label: '深夜电台', prompt: '声音低沉磁性，语速缓慢，像深夜电台主持，每个字都像是从胸腔深处发出的慰藉' },
      { label: '职场汇报', prompt: '声音清晰自信，语速适中，专业但不冷漠，条理分明地向团队汇报工作进展' },
      { label: '撒娇卖萌', prompt: '年轻女生，声音甜美带着撒娇的拖音，尾音微微上扬，带着一点点小任性' },
      { label: '愤怒斥责', prompt: '声音低沉有力，语速由慢转快，压抑着怒火，最后几个字几乎是从牙缝里挤出来' },
    ],
  },
  {
    category: '角色扮演',
    examples: [
      { label: '古风侠客', prompt: '青年男性，声音清朗如剑鸣，带着江湖儿女的潇洒豪迈，骄傲但令人信服' },
      { label: '霸道总裁', prompt: '成熟男性，声音低沉有压迫感，语速缓慢自带威严，每个停顿都让人不敢插话' },
      { label: '温柔护士', prompt: '年轻女性，声音温和有安抚感，语速适中偏慢，带着专业的关怀和耐心' },
      { label: '慈祥老人', prompt: '年长男性，嗓音略带沙哑和沧桑感，语速缓慢而沉稳，仿佛在讲一个很长的故事' },
      { label: '可爱少女', prompt: '小女孩声音，音调偏高，语速轻快，带着天真烂漫的好奇心，咬字不太清晰' },
    ],
  },
];

export default function StyleEditor({ value, onChange }: Props) {
  const [showExamples, setShowExamples] = useState(false);

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Style fontSize="small" /> 风格指令 (自然语言)
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        优先级低于文本中的风格/音频标签。当文本内已有标签时，此处指令仅作为补充参考。
      </Typography>

      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={'用自然语言描述你想要的说话风格。\n\n例如：用轻快上扬的语调向领导报喜，语速稍快，带着压抑不住的激动与小骄傲，声音明亮有活力。'}
        multiline
        rows={3}
        fullWidth
        size="small"
      />

      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <AutoAwesome fontSize="inherit" />
          快速填入示例：
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {STYLE_EXAMPLES.flatMap((g) => g.examples).slice(0, 6).map((ex) => (
            <Tooltip key={ex.label} title={ex.prompt} arrow placement="bottom">
              <Chip
                label={ex.label}
                size="small"
                variant="outlined"
                color={value === ex.prompt ? 'primary' : 'default'}
                onClick={() => onChange(ex.prompt)}
                sx={{ fontSize: 12, cursor: 'pointer' }}
              />
            </Tooltip>
          ))}
          <Chip
            label="更多示例..."
            size="small"
            variant="outlined"
            onClick={() => setShowExamples(!showExamples)}
            sx={{ fontSize: 12, cursor: 'pointer' }}
          />
        </Box>
      </Box>

      {showExamples && (
        <Box sx={{ mt: 1 }}>
          {STYLE_EXAMPLES.map((group) => (
            <Box key={group.category} sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                {group.category}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {group.examples.map((ex) => (
                  <Chip
                    key={ex.label}
                    label={ex.label}
                    size="small"
                    variant="outlined"
                    onClick={() => onChange(ex.prompt)}
                    sx={{ fontSize: 12, cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Accordion sx={{ mt: 1 }} elevation={0}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
            <Theaters fontSize="inherit" /> 导演模式 (高级)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            像导演给演员写剧本一样，从角色、场景、指导三个维度全方位刻画声音：
          </Typography>
          <Box
            component="pre"
            sx={{ fontSize: 11, color: 'text.secondary', whiteSpace: 'pre-wrap', fontFamily: 'monospace', bgcolor: 'action.hover', p: 1.5, borderRadius: 1, mb: 1 }}
          >
{`【角色】人物身份、性格底色、说话习惯
【场景】此刻发生了什么、和谁说话、情绪状态
【指导】语速、气息、停顿、重音、音色质感`}
          </Box>
          <Typography variant="caption" color="text.secondary">
            适合对语音表演要求较高的场景，如角色配音、影视级内容生成。
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
