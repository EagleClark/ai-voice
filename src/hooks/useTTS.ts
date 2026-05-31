import { useState, useCallback, useRef } from 'react';
import { synthesize } from '../api/mimoApi';
import type { SynthesisResult } from '../types/mimo';

const COOLDOWN_MS = 3000;

interface TTSParams {
  model: string;
  text: string;
  voice: string;
  styleInstruction?: string;
  optimizeText?: boolean;
  format?: string;
}

export function useTTS() {
  const [synthesizing, setSynthesizing] = useState(false);
  const [result, setResult] = useState<SynthesisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const synthesizeText = useCallback(async (params: TTSParams): Promise<SynthesisResult> => {
    setSynthesizing(true);
    setError(null);
    try {
      const res = await synthesize(params);
      setResult(res);
      // Start cooldown after successful request
      setCooldown(true);
      cooldownTimer.current = setTimeout(() => setCooldown(false), COOLDOWN_MS);
      return res;
    } catch (e) {
      const msg = typeof e === 'string' ? e : (e as Error).message;
      setError(msg);
      // Also cooldown on 429
      if (msg.includes('过于频繁')) {
        setCooldown(true);
        cooldownTimer.current = setTimeout(() => setCooldown(false), COOLDOWN_MS);
      }
      throw e;
    } finally {
      setSynthesizing(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { synthesizing, cooldown, result, error, synthesize: synthesizeText, clearResult };
}
