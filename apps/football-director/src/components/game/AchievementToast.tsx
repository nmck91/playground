/**
 * Football Director - Achievement Toast Component
 * Animated notification for unlocked achievements
 */

'use client';

import { Achievement } from '@playground/football-director-engine';
import { useEffect, useState } from 'react';

interface AchievementToastProps {
  achievements: Achievement[];
  onDismiss: (achievementId: string) => void;
}

export function AchievementToast({ achievements, onDismiss }: AchievementToastProps) {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Update queue when new achievements come in
  useEffect(() => {
    if (achievements.length > 0) {
      setQueue((prev) => {
        const newAchievements = achievements.filter(
          (a) => !prev.some((p) => p.id === a.id)
        );
        return [...prev, ...newAchievements];
      });
    }
  }, [achievements]);

  // Process queue
  useEffect(() => {
    if (!currentAchievement && queue.length > 0) {
      const next = queue[0];
      setCurrentAchievement(next);
      setQueue((prev) => prev.slice(1));
      setIsVisible(true);

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentAchievement, queue]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (currentAchievement) {
        onDismiss(currentAchievement.id);
        setCurrentAchievement(null);
      }
    }, 300); // Wait for exit animation
  };

  if (!currentAchievement) return null;

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div
        className={`pointer-events-auto transform transition-all duration-300 ease-out ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 rounded-lg shadow-2xl p-6 max-w-sm border-2 border-yellow-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">🏆</span>
              <span className="text-white font-bold text-lg">Achievement Unlocked!</span>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white hover:text-yellow-100 transition-normal"
            >
              ✕
            </button>
          </div>

          {/* Achievement Content */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-30">
            <div className="flex items-start gap-3">
              <div className="text-4xl">{currentAchievement.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg mb-1">
                  {currentAchievement.name}
                </h3>
                <p className="text-yellow-50 text-sm">
                  {currentAchievement.description}
                </p>
              </div>
            </div>
          </div>

          {/* Category Badge */}
          <div className="mt-3 flex justify-between items-center">
            <span className="inline-block bg-white bg-opacity-30 text-white text-xs font-medium px-3 py-1 rounded-full">
              {currentAchievement.category.toUpperCase()}
            </span>
            {queue.length > 0 && (
              <span className="text-white text-xs font-medium">
                +{queue.length} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
