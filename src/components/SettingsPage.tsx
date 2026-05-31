import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Key,
  Link as LinkIcon,
  Save,
  Delete,
} from '@mui/icons-material';
import { useSettings } from '../hooks/useSettings';

interface Props {
  onSaved: () => void;
}

export default function SettingsPage({ onSaved }: Props) {
  const { apiKey, baseUrl, hasApiKey, loading, saveApiKey, saveBaseUrl } = useSettings();
  const [keyInput, setKeyInput] = useState(apiKey);
  const [urlInput, setUrlInput] = useState(baseUrl);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (loading) return <Typography color="text.secondary">加载设置...</Typography>;

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveApiKey(keyInput.trim());
      await saveBaseUrl(urlInput.trim() || 'https://api.xiaomimimo.com/v1');
      setMessage({ type: 'success', text: '设置已保存' });
      setTimeout(() => onSaved(), 600);
    } catch (e) {
      setMessage({ type: 'error', text: '保存失败: ' + (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setKeyInput('');
    setUrlInput('https://api.xiaomimimo.com/v1');
    setMessage(null);
  };

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        设置
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        配置 API 连接参数，开始使用语音合成
      </Typography>

      <Paper sx={{ p: 3 }} elevation={0}>
        {/* API Key */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
          <Key sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
          API Key
        </Typography>
        <TextField
          type={showKey ? 'text' : 'password'}
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="输入你的 MiMo API Key"
          size="small"
          fullWidth
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowKey(!showKey)} edge="end">
                    {showKey ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          在{' '}
          <Link href="https://platform.xiaomimimo.com/" target="_blank" rel="noreferrer" underline="hover">
            MiMo 官网
          </Link>{' '}
          注册并获取 API Key。Key 将以加密方式存储在你的设备上，不会上传到任何第三方服务器。
        </Typography>

        <Divider sx={{ my: 2.5 }} />

        {/* Base URL */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
          <LinkIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
          API 地址
        </Typography>
        <TextField
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://api.xiaomimimo.com/v1"
          size="small"
          fullWidth
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          MiMo API 的基础地址，默认为官方服务地址。使用自定义代理时修改此项。
        </Typography>

        <Divider sx={{ my: 2.5 }} />

        {/* Model Info */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          可用模型
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[
            { name: 'mimo-v2.5-tts', desc: '预置音色合成，支持唱歌模式' },
            { name: 'mimo-v2.5-tts-voicedesign', desc: '文本描述设计定制音色' },
            { name: 'mimo-v2.5-tts-voiceclone', desc: '音频样本复刻任意音色' },
          ].map((m) => (
            <Typography key={m.name} variant="caption" color="text.secondary">
              <code>{m.name}</code> — {m.desc}
            </Typography>
          ))}
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* Actions */}
        {message && (
          <Typography
            variant="body2"
            color={message.type === 'success' ? 'success.main' : 'error.main'}
            sx={{ mb: 2 }}
          >
            {message.text}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={!keyInput.trim() || saving}
          >
            {saving ? '保存中...' : '保存设置'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleClear}
          >
            清除
          </Button>
          {hasApiKey && (
            <Button variant="text" onClick={onSaved} sx={{ ml: 'auto' }}>
              返回首页
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
