/**
 * 🎮 게임 타입 정의
 */

export type DifficultyLevel = 'easy' | 'normal' | 'hard';
export type QuestionCount = 5 | 10 | 15;
export type JudgementType = 'Perfect' | 'Good' | 'Miss';

export interface GameSettings {
  questionCount: QuestionCount;
  difficulty: DifficultyLevel;
}

export interface GameResult {
  totalQuestions: number;
  perfectCount: number;
  goodCount: number;
  missCount: number;
  totalScore: number;
  maxCombo: number;
  averageReactionTime: number;
  completedSets: number; // 완료한 세트 수 (10문항 단위)
}

export interface TimingConfig {
  perfect: number;
  good: number;
  miss: number;
}

export const DIFFICULTY_SETTINGS: Record<DifficultyLevel, TimingConfig> = {
  easy: {
    perfect: 1500,  // 쉬움: 매우 관대
    good: 2500,
    miss: 4000,
  },
  normal: {
    perfect: 800,   // 보통: 현재 설정
    good: 1500,
    miss: 3000,
  },
  hard: {
    perfect: 500,   // 어려움: 까다롭게 (+ 백색소음 예정)
    good: 1000,
    miss: 2000,
  },
};

export const QUESTION_COUNT_OPTIONS: QuestionCount[] = [5, 10, 15];
export const MAX_SETS = 3; // 최대 3세트 (30문항)

// 🎵 소리 속도 설정
export type SoundSpeed = 'veryslow' | 'slow' | 'normal' | 'fast' | 'veryfast';

export const SOUND_SPEED_CONFIG = {
  veryslow: { minInterval: 4000, maxInterval: 6000, label: '매우 느림' },
  slow: { minInterval: 2500, maxInterval: 4500, label: '느림' },
  normal: { minInterval: 1500, maxInterval: 3500, label: '보통' },
  fast: { minInterval: 800, maxInterval: 2200, label: '빠름' },
  veryfast: { minInterval: 500, maxInterval: 1500, label: '매우 빠름' },
} as const;

