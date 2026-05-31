import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Download, VolumeUp } from '@mui/icons-material';
import type { SynthesisResult } from '../types/mimo';

interface Props {
  result: SynthesisResult | null;
}

export default function AudioPlayer({ result }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (result?.audio_base64) {
      if (audioUrl) URL.revokeObjectURL(audioUrl);

      const byteChars = atob(result.audio_base64);
      const byteNums = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNums[i] = byteChars.charCodeAt(i);
      }
      const blob = new Blob([new Uint8Array(byteNums)], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    }
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [result]);

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'tts-output-' + Date.now() + '.wav';
    a.click();
  };

  if (!result) return null;

  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <VolumeUp fontSize="small" /> 合成结果
      </Typography>
      <Box component="audio" ref={audioRef} controls src={audioUrl ?? undefined} sx={{ width: '100%', mb: 1.5, display: 'block' }} />
      <Button variant="outlined" size="small" startIcon={<Download />} onClick={handleDownload}>
        下载 WAV
      </Button>
    </Box>
  );
}
