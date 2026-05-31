import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  TextField,
  MenuItem,
  Alert,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import { PlayArrow, HourglassEmpty, VoiceChat, Brush, ContentCopy } from '@mui/icons-material';
import type { MimoModel } from '../types/mimo';
import { useTTS } from '../hooks/useTTS';
import VoicePanel from './VoicePanel';
import TextInput from './TextInput';
import StyleEditor from './StyleEditor';
import AudioPlayer from './AudioPlayer';

interface Props {
  hasApiKey: boolean;
  onOpenSettings: () => void;
}

export default function MainPage({ hasApiKey, onOpenSettings }: Props) {
  const [model, setModel] = useState<MimoModel>('mimo-v2.5-tts');
  const [voice, setVoice] = useState('mimo_default');
  const [text, setText] = useState('');
  const [styleInstruction, setStyleInstruction] = useState('');
  const [optimizeText, setOptimizeText] = useState(false);
  const [format, setFormat] = useState('wav');
  const { synthesizing, cooldown, result, error, synthesize, clearResult } = useTTS();

  const handleModelChange = (m: MimoModel) => {
    setModel(m);
    clearResult();
    if (m === 'mimo-v2.5-tts') setVoice('mimo_default');
    else setVoice('');
  };

  const handleSynthesize = async () => {
    if (!text.trim()) return;
    try {
      await synthesize({
        model,
        text: text.trim(),
        voice,
        styleInstruction: styleInstruction.trim() || undefined,
        optimizeText: model === 'mimo-v2.5-tts-voicedesign' ? optimizeText : undefined,
        format,
      });
    } catch {
      // error handled in hook
    }
  };

  const canSynthesize = text.trim().length > 0 && !synthesizing && !cooldown;
  const voiceRequired = model === 'mimo-v2.5-tts-voicedesign' && !voice.trim();

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Stack sx={{ gap: 2.5 }}>
          {!hasApiKey && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                快速开始
              </Typography>
              <Alert severity="info" variant="outlined" sx={{ fontSize: 13 }}>
                选择模型和音色，输入文本，点击合成即可生成语音。
                <Button
                  size="small"
                  onClick={onOpenSettings}
                  sx={{ fontSize: 13, textTransform: 'none', ml: 1 }}
                >
                  先去设置 API Key
                </Button>
              </Alert>
            </Box>
          )}

          <Tabs
            value={model}
            onChange={(_, v) => handleModelChange(v)}
            variant="fullWidth"
            sx={{ mb: 1 }}
          >
            <Tab
              icon={<VoiceChat />}
              iconPosition="start"
              label="预置音色"
              value="mimo-v2.5-tts"
            />
            <Tab
              icon={<Brush />}
              iconPosition="start"
              label="音色设计"
              value="mimo-v2.5-tts-voicedesign"
            />
            <Tab
              icon={<ContentCopy />}
              iconPosition="start"
              label="音色复刻"
              value="mimo-v2.5-tts-voiceclone"
            />
          </Tabs>
          <VoicePanel model={model} voice={voice} onVoiceChange={setVoice} />
          <StyleEditor
            value={styleInstruction}
            onChange={setStyleInstruction}
          />

          {model === 'mimo-v2.5-tts-voicedesign' && (
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={optimizeText}
                  onChange={(e) => setOptimizeText(e.target.checked)}
                />
              }
              label={<Typography variant="body2">智能润色播报文本</Typography>}
            />
          )}

          <TextField
            select
            label="输出格式"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            size="small"
            fullWidth
          >
            <MenuItem value="wav">WAV</MenuItem>
            <MenuItem value="pcm16">PCM16 (流式)</MenuItem>
          </TextField>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Stack sx={{ gap: 2.5 }}>
          <TextInput value={text} onChange={setText} />

          <Button
            variant="contained"
            size="large"
            onClick={handleSynthesize}
            disabled={!canSynthesize || voiceRequired}
            startIcon={synthesizing ? <HourglassEmpty /> : <PlayArrow />}
            sx={{ py: 1.5, fontSize: 16 }}
          >
            {synthesizing ? '合成中...' : cooldown ? '请稍等...' : '合成语音'}
          </Button>

          {voiceRequired && (
            <Alert severity="warning" variant="outlined">
              音色设计模式下需要填写音色描述
            </Alert>
          )}

          {error && (
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          )}

          <AudioPlayer result={result} />
        </Stack>
      </Grid>
    </Grid>
  );
}
