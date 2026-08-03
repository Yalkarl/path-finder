'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Premium background music player for assessment pages.
 * Features an animated vertical volume slider (90-degree bottom-to-top)
 * and a custom purple circular handle.
 */
export default function AssessmentMusicPlayer({ audioPath = '/audio/quiz_music.mp3' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35); // ระดับเสียงเริ่มต้น 35%
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef(null);

  // ซิงค์ระดับเสียงกับตัวเล่นเสียง Audio Element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // พยายามเล่นเพลงอัตโนมัติเมื่อโหลดหน้าเว็บ
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.volume = volume;

    const startPlay = () => {
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log('Autoplay blocked or audio not loaded.', err);
        });
    };

    startPlay();

    const handleFirstClick = () => {
      if (audio.paused) {
        startPlay();
      }
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);

    return () => {
      window.removeEventListener('click', handleFirstClick);
    };
  }, [audioPath]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.warn('Audio play failed:', err);
          setIsPlaying(false);
          alert('ไม่พบไฟล์เพลงทดสอบ: กรุณานำไฟล์เพลง .mp3 ของคุณไปวางไว้ที่โฟลเดอร์ public/audio/quiz_music.mp3 ก่อนเปิดเล่นนะครับ 🎵');
        });
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0 && !isPlaying && audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const isMuted = volume === 0 || !isPlaying;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column-reverse',
        gap: '0.6rem',
        padding: '0.5rem',
        borderRadius: '30px',
        background: isHovered ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        boxShadow: isHovered ? '0 8px 30px rgba(0, 0, 0, 0.08)' : 'none',
        border: isHovered ? '1px solid rgba(0, 0, 0, 0.04)' : '1px solid transparent',
        backdropFilter: isHovered ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: isHovered ? 'blur(12px)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Dynamic CSS Injection for Custom Purple Thumb and Range Styles */}
      <style>{`
        .custom-volume-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 5px !important;
          height: 80px !important;
          background: #E2E8F0 !important;
          outline: none;
          border-radius: 4px;
          writing-mode: vertical-lr;
          direction: rtl;
          cursor: pointer;
          margin: 0 !important;
          padding: 0 !important;
        }
        /* Chrome, Safari, Opera, Edge */
        .custom-volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #7C5CFC !important; /* Premium Purple */
          cursor: pointer;
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 6px rgba(124, 92, 252, 0.4);
          transition: transform 0.15s ease, background-color 0.15s ease;
        }
        .custom-volume-slider::-webkit-slider-thumb:hover {
          transform: scale(1.25);
          background: #6C4DE6 !important;
        }
        /* Firefox */
        .custom-volume-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #7C5CFC !important;
          cursor: pointer;
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 6px rgba(124, 92, 252, 0.4);
          transition: transform 0.15s ease, background-color 0.15s ease;
        }
        .custom-volume-slider::-moz-range-thumb:hover {
          transform: scale(1.25);
          background: #6C4DE6 !important;
        }
      `}</style>

      {/* Hidden HTML5 Audio Element */}
      <audio 
        ref={audioRef} 
        src={audioPath} 
        preload="auto" 
        onError={(e) => {
          console.warn("ไม่สามารถโหลดไฟล์เพลงได้ หรือยังไม่มีไฟล์เพลงที่ public/audio/quiz_music.mp3");
          setIsPlaying(false);
        }}
      />

      {/* Floating Toggle Button */}
      <button
        onClick={togglePlay}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: '#FFFFFF',
          border: 'none',
          boxShadow: isHovered ? 'none' : '0 4px 14px rgba(0, 0, 0, 0.08), 0 2px 5px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title={isPlaying ? 'ปิดเพลงพื้นหลัง' : 'เปิดเพลงพื้นหลัง'}
      >
        {isMuted ? (
          // ไอคอนปิดเสียง
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        ) : (
          // ไอคอนเปิดเสียง
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        )}
      </button>

      {/* Hover-to-Reveal 90-Degree Vertical Volume Slider */}
      <div style={{
        height: isHovered ? '90px' : '0px',
        opacity: isHovered ? 1 : 0,
        overflow: 'hidden',
        transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: isHovered ? '0.4rem' : '0px',
        width: '20px',
      }}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          className="custom-volume-slider"
          style={{
            writingMode: 'vertical-lr',
            direction: 'rtl',
          }}
          title={`ความดัง: ${Math.round(volume * 100)}%`}
        />
      </div>
    </div>
  );
}
