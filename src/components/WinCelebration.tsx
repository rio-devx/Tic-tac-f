import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface WinCelebrationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export const WinCelebration: React.FC<WinCelebrationProps> = ({ 
  isVisible, 
  onComplete 
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible) {
      // Play victory sound
      const playVictorySound = () => {
        try {
          const audio = new Audio('/sound/mixkit-cheering-crowd-loud-whistle-610.wav');
          audio.volume = 0.7; // Set volume to 70%
          audio.play().catch((error) => {
            console.warn('Could not play victory sound:', error);
          });
          audioRef.current = audio;
        } catch (error) {
          console.warn('Could not create audio element:', error);
        }
      };

      // Fireworks animation
      const triggerFireworks = () => {
        // First burst from center
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'],
          shapes: ['star', 'circle'],
          scalar: 1.2,
        });

        // Left side burst
        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0.2, y: 0.7 },
            colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'],
            shapes: ['star', 'circle'],
            scalar: 1.1,
          });
        }, 200);

        // Right side burst
        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 0.8, y: 0.7 },
            colors: ['#dda0dd', '#98d8c8', '#f7dc6f', '#ff6b6b', '#4ecdc4'],
            shapes: ['star', 'circle'],
            scalar: 1.1,
          });
        }, 400);

        // Final center burst
        setTimeout(() => {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'],
            shapes: ['star', 'circle'],
            scalar: 1.3,
          });
        }, 800);
      };

      // Start the celebration
      playVictorySound();
      triggerFireworks();

      // Auto-hide after 3 seconds
      timeoutRef.current = setTimeout(() => {
        onComplete?.();
      }, 3000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {/* Victory Text Overlay */}
      <div className="text-center animate-in zoom-in duration-500">
        <div className="relative">
          {/* Glowing background */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-yellow-500/30 to-yellow-400/20 rounded-full blur-xl animate-pulse" />
          
          {/* Main text */}
          <h1 className="relative text-4xl md:text-6xl font-bold text-yellow-300 drop-shadow-2xl animate-bounce">
            🏆 You Win! 🏆
          </h1>
          
          {/* Sparkle effects */}
          <div className="absolute -top-4 -left-4 text-yellow-400 animate-ping">
            ✨
          </div>
          <div className="absolute -top-2 -right-6 text-yellow-400 animate-pulse delay-300">
            ⭐
          </div>
          <div className="absolute -bottom-2 -left-2 text-yellow-400 animate-bounce delay-500">
            🌟
          </div>
          <div className="absolute -bottom-4 -right-4 text-yellow-400 animate-ping delay-700">
            ✨
          </div>
        </div>
        
        {/* Subtitle */}
        <p className="mt-4 text-lg md:text-xl text-yellow-200 font-semibold animate-fade-in delay-500">
          Congratulations!
        </p>
      </div>

      {/* Fireworks Canvas */}
      <canvas 
        id="confetti-canvas"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: -1 }}
      />
    </div>
  );
};
