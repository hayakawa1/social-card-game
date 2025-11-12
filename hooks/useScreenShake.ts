import { useCallback, useState } from 'react';

/**
 * スクリーンシェイク用のHook
 * ダメージ演出などに使用
 */
export function useScreenShake() {
  const [isShaking, setIsShaking] = useState(false);
  const [intensity, setIntensity] = useState(0);

  const shake = useCallback((duration = 120, amp = 10) => {
    setIntensity(amp);
    setIsShaking(true);

    setTimeout(() => {
      setIsShaking(false);
      setIntensity(0);
    }, duration);
  }, []);

  const shakeStyle = isShaking
    ? {
        animation: `shake ${intensity > 15 ? 0.16 : 0.12}s ease-in-out`,
        '--shake-intensity': `${intensity}px`,
      } as React.CSSProperties
    : undefined;

  return { shake, shakeStyle, isShaking };
}

/**
 * スクリーンシェイク用のCSS（グローバルに追加）
 */
export const screenShakeCSS = `
@keyframes shake {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(var(--shake-intensity, 10px), 0); }
  20% { transform: translate(calc(var(--shake-intensity, 10px) * -1), 0); }
  30% { transform: translate(0, var(--shake-intensity, 10px)); }
  40% { transform: translate(0, calc(var(--shake-intensity, 10px) * -1)); }
  50% { transform: translate(calc(var(--shake-intensity, 10px) * 0.7), calc(var(--shake-intensity, 10px) * 0.7)); }
  60% { transform: translate(calc(var(--shake-intensity, 10px) * -0.7), calc(var(--shake-intensity, 10px) * -0.7)); }
  70% { transform: translate(calc(var(--shake-intensity, 10px) * 0.4), 0); }
  80% { transform: translate(calc(var(--shake-intensity, 10px) * -0.4), 0); }
  90% { transform: translate(0, calc(var(--shake-intensity, 10px) * 0.2)); }
}
`;
