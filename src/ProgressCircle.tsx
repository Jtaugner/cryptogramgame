import React, { useRef, useEffect, useState } from 'react';
import './ProgressCircle.css'

interface ProgressCircleProps {
  /** Общая длительность в мс */
  blockedTime: number;
  endBlockTime: () => void;
  setBlockedTimeTimer: (time: number) => void;
  blockedTimeTimer: number;
  /** Диаметр круга в пикселях */
  size?: number;
  /** Толщина обводки */
  strokeWidth?: number;
  /** Цвет трека (фонового) */
  trackColor?: string;
  /** Цвет прогресса */
  progressColor?: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  blockedTime,
  endBlockTime,
  setBlockedTimeTimer,
  blockedTimeTimer,
  size = 50,
  strokeWidth = 2,
  trackColor = '#43425a',
  progressColor = '#43d109',
}) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const animationFrameRef = useRef<number>(0)
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const [elapsed, setElapsed] = useState(0); // прошедшее время
  const [pct, setPct] = useState(0);         // процент заполнения

  // Инициализация strokeDasharray
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.strokeDasharray = `${circumference} ${circumference}`;
      circleRef.current.style.strokeDashoffset = `${circumference}`;
    }
  }, [circumference]);

  // Таймер: обновляем elapsed каждые 100 мс
  useEffect(() => {
     if(blockedTime === 0) return;
    const start = Date.now();
    const tick = () => {
      const now = Date.now();
      const diff = now - start;
      const clamped = Math.min(diff, blockedTime);
      setElapsed(clamped);
      setPct((clamped / blockedTime) * 100);
      if (clamped < blockedTime) {
        animationFrameRef.current = requestAnimationFrame(tick);
        let n = Math.ceil((blockedTime - clamped) / 1000);
        if(n < blockedTimeTimer){
            setBlockedTimeTimer(n)
        }
      }else{
          endBlockTime();
      }
    };
    animationFrameRef.current = requestAnimationFrame(tick);

  }, [blockedTime]);

  useEffect(() => {
    //Unmount
    return () => {
      if(animationFrameRef.current){
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Анимация круга при изменении pct
  useEffect(() => {
    if (circleRef.current) {
      const offset = circumference * (1 - pct / 100);
      circleRef.current.style.transition = 'stroke-dashoffset 0.1s linear';
      circleRef.current.style.strokeDashoffset = `${offset}`;
    }
  }, [pct, circumference]);

  // Оставшееся время в секундах
//   const remainingSec = Math.ceil((blockedTime - elapsed) / 1000);

  return (
    <div className='progress-circle' style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* фоновое кольцо */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* активное кольцо */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      {/* центр */}
      <div className="mistakeCircle mistakeCircle_got"></div>
    </div>
  );
};

export default ProgressCircle;
