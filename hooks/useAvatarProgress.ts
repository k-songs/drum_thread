import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, getCurrentLevelInfo, getLevelProgress, getNextLevel } from '@/types/avatar';

const STORAGE_KEY = '@hearing_training_progress';

/**
 * 🎭 아바타 진행도 관리 Hook
 * 
 * 기능:
 * - 사용자 진행도 저장/불러오기
 * - 레벨업 감지
 * - Perfect 누적
 */
export const useAvatarProgress = () => {
  const [progress, setProgress] = useState<UserProgress>({
    currentLevel: 1,
    totalPerfects: 0,
    totalTrainingSessions: 0,
    consecutiveDays: 0,
    averageAccuracy: 0,
    lastTrainingDate: new Date().toISOString().split('T')[0],
  });

  const [isLeveledUp, setIsLeveledUp] = useState(false);
  const [newLevelInfo, setNewLevelInfo] = useState<ReturnType<typeof getCurrentLevelInfo> | null>(null);

  // 진행도 불러오기
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setProgress(JSON.parse(saved));
      }
    } catch (error) {
      console.error('진행도 불러오기 실패:', error);
    }
  };

  const saveProgress = async (newProgress: UserProgress) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error('진행도 저장 실패:', error);
    }
  };

  // Perfect 추가 및 레벨 체크
  const addPerfects = (count: number, accuracy: number) => {
    const currentLevel = getCurrentLevelInfo(progress.totalPerfects);
    const newTotalPerfects = progress.totalPerfects + count;
    const newLevel = getCurrentLevelInfo(newTotalPerfects);

    const today = new Date().toISOString().split('T')[0];
    const isNewDay = today !== progress.lastTrainingDate;

    const newProgress: UserProgress = {
      ...progress,
      totalPerfects: newTotalPerfects,
      totalTrainingSessions: progress.totalTrainingSessions + 1,
      consecutiveDays: isNewDay ? progress.consecutiveDays + 1 : progress.consecutiveDays,
      averageAccuracy: (progress.averageAccuracy * progress.totalTrainingSessions + accuracy) / (progress.totalTrainingSessions + 1),
      lastTrainingDate: today,
      currentLevel: newLevel.level,
    };

    saveProgress(newProgress);

    // 레벨업 체크
    if (newLevel.level > currentLevel.level) {
      setNewLevelInfo(newLevel);
      setIsLeveledUp(true);
      console.log(`🎊 레벨업! ${currentLevel.name} → ${newLevel.name}`);
    }
  };

  // 레벨업 모달 닫기
  const closeLevelUpModal = () => {
    setIsLeveledUp(false);
  };

  // 현재 레벨 정보
  const currentLevelInfo = getCurrentLevelInfo(progress.totalPerfects);
  const nextLevelInfo = getNextLevel(currentLevelInfo.level);
  const levelProgress = getLevelProgress(progress.totalPerfects);

  return {
    progress,
    currentLevelInfo,
    nextLevelInfo,
    levelProgress,
    isLeveledUp,
    newLevelInfo,
    addPerfects,
    closeLevelUpModal,
  };
};

