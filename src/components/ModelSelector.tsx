import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import { VoiceChat, Brush, ContentCopy } from '@mui/icons-material';
import type { MimoModel } from '../types/mimo';

interface Props {
  value: MimoModel;
  onChange: (model: MimoModel) => void;
}

const MODELS: {
  id: MimoModel;
  label: string;
  desc: string;
  icon: React.ReactNode;
  features: string[];
}[] = [
  {
    id: 'mimo-v2.5-tts',
    label: '预置音色合成',
    desc: '使用 MiMo 内置精品音色，开箱即用',
    icon: <VoiceChat />,
    features: ['9 款精品音色', '唱歌模式', '风格标签控制', '自然语言指令'],
  },
  {
    id: 'mimo-v2.5-tts-voicedesign',
    label: '音色设计',
    desc: '通过文本描述创造独一无二的定制音色',
    icon: <Brush />,
    features: ['文本描述生成音色', '无限音色可能', '智能文本润色', '无需音频样本'],
  },
  {
    id: 'mimo-v2.5-tts-voiceclone',
    label: '音色复刻',
    desc: '上传音频样本，精准复刻任意声音',
    icon: <ContentCopy />,
    features: ['高精度音色复刻', '支持 MP3/WAV', '风格灵活控制', '自然语言指令'],
  },
];

export default function ModelSelector({ value, onChange }: Props) {
  return (
    <>
      <Typography variant="subtitle2" gutterBottom>
        选择合成模式
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        三种模式各有擅长，根据你的需求选择最合适的
      </Typography>
      {MODELS.map((m) => {
        const selected = value === m.id;
        return (
          <Card
            key={m.id}
            onClick={() => onChange(m.id)}
            sx={{
              mb: 1,
              cursor: 'pointer',
              border: selected ? 2 : 1,
              borderColor: selected ? 'primary.main' : 'divider',
              bgcolor: selected ? 'action.selected' : undefined,
              transition: 'all 0.15s',
              '&:hover': { borderColor: 'primary.main' },
            }}
          >
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {m.icon} {m.label}
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.3 }}>
                {m.desc}
              </Typography>
              <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {m.features.map((f) => (
                  <Chip key={f} label={f} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                ))}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
