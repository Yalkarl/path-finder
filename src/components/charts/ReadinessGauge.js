'use client';
import { useEffect, useState } from 'react';

/**
 * Premium SVG Circular Gauge to show target readiness.
 */
export default function ReadinessGauge({ percentage = 0, size = 200, strokeWidth = 16 }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedValue / 100) * circumference;

  // การกำหนดสีไดนามิกตามระดับความพร้อม
  let strokeColor = '#FF6B6B'; // สีแดงสำหรับความพร้อมระดับต้องเร่งพัฒนา
  let statusText = 'ต้องพัฒนาอีกมาก';
  let bgLight = 'rgba(255, 107, 107, 0.1)';
  
  if (percentage >= 75) {
    strokeColor = '#10B981'; // สีเขียวสำหรับความพร้อมระดับสูง
    statusText = 'พร้อมมาก! ลุยเลย';
    bgLight = 'rgba(16, 185, 129, 0.1)';
  } else if (percentage >= 50) {
    strokeColor = '#7C5CFC'; // สีม่วงสำหรับความพร้อมระดับดีมาก
    statusText = 'ความพร้อมดี';
    bgLight = 'rgba(124, 92, 252, 0.1)';
  } else if (percentage >= 35) {
    strokeColor = '#FFBE1A'; // สีส้ม/เหลืองสำหรับความพร้อมระดับปานกลาง
    statusText = 'กำลังเตรียมความพร้อม';
    bgLight = 'rgba(255, 190, 26, 0.1)';
  }

  const isSmall = size < 120;
  const percentFontSize = isSmall ? '1.25rem' : '2.5rem';
  const labelFontSize = isSmall ? '0.55rem' : '0.75rem';
  const labelPadding = isSmall ? '0.1rem 0.3rem' : '0.2rem 0.6rem';
  const labelMargin = isSmall ? '0.15rem' : '0.35rem';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: size,
      height: size,
    }}>
      {/* Outer subtle shadow circle */}
      <div style={{
        position: 'absolute',
        width: size - strokeWidth * 2,
        height: size - strokeWidth * 2,
        borderRadius: '50%',
        background: '#FFFFFF',
        boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.03), 0 10px 25px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
      }}>
        <span style={{
          fontSize: percentFontSize,
          fontWeight: '800',
          color: strokeColor,
          lineHeight: '1',
          fontFamily: 'var(--font-outfit), sans-serif',
        }}>
          {animatedValue}%
        </span>
        <span style={{
          fontSize: labelFontSize,
          fontWeight: '700',
          marginTop: labelMargin,
          background: bgLight,
          color: strokeColor,
          padding: labelPadding,
          borderRadius: '20px',
          whiteSpace: 'nowrap',
        }}>
          {statusText}
        </span>
      </div>

      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', zIndex: 1 }}>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        {/* Animated Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease',
          }}
        />
      </svg>
    </div>
  );
}
