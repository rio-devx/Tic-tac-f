import React, { useState, useEffect } from 'react';

interface MoveNotificationProps {
  moveData?: {
    position: number;
    symbol: 'X' | 'O';
    playerName: string;
  };
}

export const MoveNotification: React.FC<MoveNotificationProps> = ({ moveData }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [notification, setNotification] = useState<MoveNotificationProps['moveData'] | null>(null);

  useEffect(() => {
    if (moveData) {
      setNotification(moveData);
      setIsVisible(true);
      
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [moveData]);

  if (!isVisible || !notification) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right-2 duration-300">
      <div className={`
        px-4 py-3 rounded-lg shadow-lg border-l-4 flex items-center gap-3
        ${notification.symbol === 'X' 
          ? 'bg-blue-100/10 border-blue-500 text-blue-300' 
          : 'bg-red-100/10 border-red-500 text-red-300'
        }
        backdrop-blur
      `}>
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold
          ${notification.symbol === 'X' 
            ? 'bg-blue-500/20 text-blue-300' 
            : 'bg-red-500/20 text-red-300'
          }
        `}>
          {notification.symbol}
        </div>
        <div>
          <p className="font-semibold">
            {notification.playerName} moved!
          </p>
          <p className="text-sm opacity-75">
            Position {notification.position}
          </p>
        </div>
      </div>
    </div>
  );
};

