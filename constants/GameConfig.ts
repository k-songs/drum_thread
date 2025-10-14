/**
 * 🎮 게임 설정 상수
 * 
 * 청능 훈련 게임의 모든 설정값을 관리합니다.
 * 여기서 값을 수정하면 전체 게임의 난이도와 동작을 조절할 수 있습니다.
 */

// 🎯 판정 기준 (ms)
export const TIMING_CONFIG = {
  // Perfect 판정 시간 (청능 훈련용 - 관대하게 설정)
  PERFECT: 800,
  // Good 판정 시간
  GOOD: 1500,
  // Miss 판정 시간
  MISS: 3000,
} as const;

// 🎵 소리 설정
export const SOUND_CONFIG = {
  // 음원 대신 사용할 소리 문자열
  STRINGS: ["삐", "땡", "띵", "뚝", "탁"],
  // 소리 발생 최소 간격 (ms)
  MIN_INTERVAL: 2000,
  // 소리 발생 최대 간격 (ms)
  MAX_INTERVAL: 4000,
  // 소리 표시 지속 시간 (ms)
  DISPLAY_DURATION: 800,
} as const;

// 🏆 점수 설정
export const SCORE_CONFIG = {
  PERFECT: 100,
  GOOD: 50,
  MISS: 0,
  // 콤보 보너스
  COMBO_5: 500,
  COMBO_10: 1000,
  COMBO_20: 2000,
} as const;

// 📊 레벨 설정
export const LEVEL_CONFIG = {
  // Perfect 몇 회마다 레벨업
  PERFECT_PER_LEVEL: 3,
  // 배지 획득 레벨
  BADGES: {
    2: "초보 반응가",
    3: "중급 반응가",
    4: "고급 반응가",
    5: "전문 반응가",
    10: "마스터 반응가",
  } as const,
} as const;

// 🎨 애니메이션 설정
export const ANIMATION_CONFIG = {
  // 불꽃 애니메이션 지속 시간 (ms)
  BURST_DURATION: 800,
  // 판정 텍스트 애니메이션 지속 시간 (ms)
  JUDGEMENT_DURATION: 1000,
  // 판정 텍스트 제거 지연 (ms)
  JUDGEMENT_REMOVE_DELAY: 1000,
} as const;

// 🎯 난이도 프리셋 (나중에 난이도 선택 기능 추가 시 사용)
export const DIFFICULTY_PRESETS = {
  VERY_EASY: {
    PERFECT: 1500,
    GOOD: 2500,
    MISS: 4000,
  },
  EASY: {
    PERFECT: 1000,
    GOOD: 2000,
    MISS: 3500,
  },
  NORMAL: {
    PERFECT: 800,
    GOOD: 1500,
    MISS: 3000,
  },
  HARD: {
    PERFECT: 500,
    GOOD: 1000,
    MISS: 2000,
  },
  VERY_HARD: {
    PERFECT: 300,
    GOOD: 700,
    MISS: 1500,
  },
} as const;

export type DifficultyLevel = keyof typeof DIFFICULTY_PRESETS;

