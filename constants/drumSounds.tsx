export const DRUM_SOUNDS = {
  kick: require('@/assets/sounds/tom_z.mp3'),
  snare: require('@/assets/sounds/snare_z.mp3'),
  hihat: require('@/assets/sounds/hat_z.mp3'),
  cymbal: require('@/assets/sounds/cymbal_z.mp3'),
};

export const DRUM_INFO = {
  kick: {
    name: '킥드럼',
    description: '둔탁하고 깊은 저음',
    emoji: '🥁'
  },
  snare: {
    name: '스네어',
    description: '날카롭고 튀는 소리',
    emoji: '🪘'
  },
  hihat: {
    name: '하이햇',
    description: '짧고 선명한 금속음',
    emoji: '🎵'
  },
  cymbal: {
    name: '심벌',
    description: '긴 울림의 금속음',
    emoji: '🔔'
  }
};

export const DIFFICULTY_LEVELS = {
  beginner: {
    name: '초급',
    instruments: ['kick', 'snare'] as const,
    rounds: 5,
    description: '2가지 악기 (킥드럼, 스네어)'
  },
  intermediate: {
    name: '중급',
    instruments: ['kick', 'snare', 'hihat', 'cymbal'] as const,
    rounds: 10,
    description: '4가지 악기 (전체)'
  }
};

export type InstrumentType = keyof typeof DRUM_SOUNDS;
export type DifficultyType = keyof typeof DIFFICULTY_LEVELS;