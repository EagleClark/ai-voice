import { useState, useRef, useEffect } from 'react';
import { toWavDataURL } from '../utils/audioTranscode';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Tooltip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Person,
  RecordVoiceOver,
  Circle,
  UploadFile,
  ExpandMore,
  Mic,
  FiberManualRecord,
  Stop,
} from '@mui/icons-material';
import type { MimoModel } from '../types/mimo';
import { PRESET_VOICES, VOICE_DESIGN_EXAMPLES } from '../types/mimo';

interface Props {
  model: MimoModel;
  voice: string;
  onVoiceChange: (voice: string) => void;
}

function genderColor(g: string): string {
  if (g === '女性' || g === 'Female') return '#e91e63';
  if (g === '男性' || g === 'Male') return '#2196f3';
  return 'text.secondary';
}

export default function VoicePanel({ model, voice, onVoiceChange }: Props) {
  if (model === 'mimo-v2.5-tts') {
    return (
      <Box>
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <RecordVoiceOver fontSize="small" /> 预置音色
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          点击选择 MiMo 内置精品音色，共 {PRESET_VOICES.length} 款
        </Typography>
        <Grid container spacing={0.5}>
          {PRESET_VOICES.map((v) => {
            const selected = voice === v.id;
            return (
              <Grid key={v.id} size={4}>
                <Tooltip title={`${v.name} — ${v.language} ${v.gender}`} arrow placement="top">
                  <Card
                    onClick={() => onVoiceChange(v.id)}
                    sx={{
                      cursor: 'pointer',
                      textAlign: 'center',
                      border: selected ? 2 : 1,
                      borderColor: selected ? 'primary.main' : 'divider',
                      bgcolor: selected ? 'action.selected' : undefined,
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                        {v.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.4 }}>
                        <Circle sx={{ fontSize: 8, color: genderColor(v.gender) }} />
                        {v.gender} · {v.language}
                      </Typography>
                    </CardContent>
                  </Card>
                </Tooltip>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  }

  if (model === 'mimo-v2.5-tts-voicedesign') {
    return (
      <Box>
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Person fontSize="small" /> 音色描述 (Voice Design Prompt)
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          用文字描述你想要的音色特征，描述越具体效果越好。支持中英文。1-4句话即可。
        </Typography>

        <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
          点击示例快速填充：
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
          {VOICE_DESIGN_EXAMPLES.map((ex) => (
            <Tooltip key={ex.label} title={ex.sampleText} arrow placement="bottom">
              <Chip
                label={ex.label}
                size="small"
                variant="outlined"
                color={voice === ex.prompt ? 'primary' : 'default'}
                onClick={() => onVoiceChange(ex.prompt)}
                sx={{ fontSize: 12, cursor: 'pointer' }}
              />
            </Tooltip>
          ))}
        </Box>

        <Box
          component="textarea"
          value={voice}
          onChange={(e) => onVoiceChange((e.target as HTMLTextAreaElement).value)}
          placeholder={'描述你想要的音色特征，例如：\n年轻女性，声音温柔平静，语速偏慢，像深夜电台主播在道晚安'}
          rows={4}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: '1px solid var(--mui-palette-divider)',
            backgroundColor: 'var(--mui-palette-background-paper)',
            color: 'var(--mui-palette-text-primary)',
            fontFamily: 'inherit',
            fontSize: 14,
            resize: 'vertical',
          }}
        />

        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: '24px', mr: 0.5 }}>
            描述维度参考:
          </Typography>
          {['性别年龄', '音色质感', '情绪语气', '语速节奏', '角色人设', '说话风格'].map((dim) => (
            <Chip key={dim} label={dim} size="small" variant="outlined" sx={{ fontSize: 11 }} />
          ))}
        </Box>
      </Box>
    );
  }

  // Voice Clone mode
  const [file, setFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setRecordingTime(0);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const wav = await toWavDataURL(dataUrl);
      onVoiceChange(wav);
    };
    reader.readAsDataURL(f);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('当前环境不支持麦克风访问，请使用 HTTPS 或本地应用打开，或改用文件上传');
      return;
    }

    // Pick a supported mime type (Safari doesn't support audio/webm)
    const mimeType = ['audio/webm', 'audio/mp4', 'audio/ogg']
      .find((m) => MediaRecorder.isTypeSupported(m)) || '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blobType = mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: blobType });
        setFile(new File([blob], 'recording.wav', { type: 'audio/wav' }));
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          const wav = await toWavDataURL(dataUrl);
          onVoiceChange(wav);
        };
        reader.readAsDataURL(blob);
      };

      mr.start();
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch (e) {
      const err = e as DOMException;
      if (err.name === 'NotAllowedError') {
        alert('麦克风权限被拒绝，请在浏览器设置中允许麦克风访问');
      } else if (err.name === 'NotFoundError') {
        alert('未检测到麦克风设备，请检查设备连接');
      } else {
        alert(`无法启动录音: ${err.message}`);
      }
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <UploadFile fontSize="small" /> 上传音频样本
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        上传一段清晰的人声音频 (mp3/wav, 不超过 10MB)，MiMo 将基于此复刻音色特征。
      </Typography>

      <Accordion elevation={0} sx={{ mb: 1.5 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
            <Mic fontSize="inherit" /> 录音参考文稿（照着念即可）
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            选择一段文稿，用清晰自然的语气朗读并录音。建议在安静环境中录制，时长 10-30 秒效果最佳。
          </Typography>
          {[
            {
              title: '通用短句',
              text: '大家好，我是今天的主讲人。很高兴能和大家一起分享这次的内容，希望我们能度过一段愉快的时光。',
            },
            {
              title: '日常对话',
              text: '今天天气真不错，阳光洒在窗台上，泡一杯茶，翻开一本很久没看的书，感觉整个人都放松下来了。',
            },
            {
              title: '商务场景',
              text: '各位同事，本季度的业绩已经出来了。总体来说数据表现不错，下面我从三个方面给大家做一个详细的汇报。',
            },
            {
              title: '故事朗读',
              text: '很久很久以前，在遥远的大山深处，有一个被遗忘的小村庄。村里住着一位老人，他每天都会坐在村口的大树下，给过往的行人讲故事。',
            },
          ].map((s) => (
            <Box
              key={s.title}
              sx={{
                mb: 1,
                p: 1,
                bgcolor: 'action.hover',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.selected' },
              }}
              onClick={() => navigator.clipboard.writeText(s.text)}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                {s.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {s.text}
              </Typography>
            </Box>
          ))}
          <Typography variant="caption" color="text.secondary">
            点击文稿可复制到剪贴板
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ p: 2, border: '2px dashed', borderColor: recording ? 'error.main' : 'divider', borderRadius: 1, textAlign: 'center' }}>
        {recording ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <FiberManualRecord sx={{ color: 'error.main', fontSize: 16, animation: 'pulse 1s infinite' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                录制中 {formatTime(recordingTime)}
              </Typography>
            </Box>
            <Button variant="contained" color="error" startIcon={<Stop />} onClick={stopRecording}>
              停止录制
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button component="label" variant="outlined" startIcon={<UploadFile />}>
              选择文件
              <input type="file" hidden accept="audio/mpeg,audio/wav,.mp3,.wav" onChange={handleFileChange} />
            </Button>
            <Button variant="outlined" color="error" startIcon={<FiberManualRecord />} onClick={startRecording}>
              开始录制
            </Button>
          </Box>
        )}
        {!recording && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            支持 MP3 / WAV 格式上传，或直接使用麦克风录制
          </Typography>
        )}
      </Box>

      {file && !recording && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          已选择: {file.name} ({(file.size / 1024).toFixed(1)} KB)
        </Typography>
      )}
      {voice && (
        <Alert severity="success" variant="outlined" sx={{ mt: 1, fontSize: 13 }}>
          音频已加载，MiMo 将基于此样本复刻音色特征
        </Alert>
      )}
    </Box>
  );
}
