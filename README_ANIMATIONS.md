# 🎨 애니메이션 가이드

청능 훈련 앱에서 `react-native-reanimated`를 사용한 애니메이션 시스템 가이드입니다.

## 📁 파일 구조

```
components/
  animations/
    ├── BurstAnimation.tsx       # 불꽃 애니메이션
    ├── JudgementAnimation.tsx   # 판정 텍스트 애니메이션
    └── index.ts                 # 애니메이션 export

constants/
  └── GameConfig.ts              # 게임 설정 상수

app/(tabs)/learn/
  └── index.tsx                  # 메인 게임 화면
```

## 🎯 현재 구현된 기능

### 1. 기본 애니메이션 (현재 사용 중)
- ✅ **불꽃 애니메이션**: Perfect 판정 시 화려한 폭발 효과
  - 스케일 애니메이션 (탄성 효과)
  - 투명도 페이드아웃
  - 회전 효과
  
- ✅ **판정 텍스트 애니메이션**: Perfect/Good/Miss 표시
  - 바운스 효과
  - 페이드아웃

### 2. 분리된 애니메이션 컴포넌트 (선택 사용)
더 유연한 관리를 위해 별도 파일로 분리했습니다:

```typescript
import { BurstAnimation, JudgementAnimation } from '@/components/animations';

// 사용 예시
<BurstAnimation 
  show={showBurst}
  onComplete={() => setShowBurst(false)}
  emoji="💥"
  duration={800}
/>
```

## 🛠️ 설정 조절 방법

### 1. 판정 시간 조절
`constants/GameConfig.ts` 파일에서 수정:

```typescript
export const TIMING_CONFIG = {
  PERFECT: 800,   // ← 이 값을 수정하세요
  GOOD: 1500,
  MISS: 3000,
};
```

### 2. 난이도 프리셋 사용
미리 정의된 난이도 중 선택:

```typescript
import { DIFFICULTY_PRESETS } from '@/constants/GameConfig';

// 사용 예시
const currentDifficulty = DIFFICULTY_PRESETS.EASY;
```

### 3. 애니메이션 커스터마이징

#### 불꽃 애니메이션
`components/animations/BurstAnimation.tsx`:

```typescript
// 스케일 크기 조절
scale.value = withSpring(1.2, {  // 1.2 → 더 큰 값으로 변경
  damping: 10,     // 탄성 감쇠
  stiffness: 100,  // 탄성 강도
});

// 회전 각도 조절
rotation.value = withTiming(360, {  // 360 → 다른 각도로 변경
  duration,
  easing: Easing.out(Easing.cubic),
});
```

#### 판정 텍스트
`components/animations/JudgementAnimation.tsx`:

```typescript
// 바운스 효과 조절
scale.value = withSequence(
  withSpring(1.3, { damping: 8 }),   // 첫 번째 바운스
  withSpring(1.0, { damping: 10 })   // 두 번째 바운스
);
```

## 🎨 애니메이션 추가 방법

### 1. 새로운 애니메이션 컴포넌트 생성

```typescript
// components/animations/ComboAnimation.tsx
import React from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export const ComboAnimation = ({ combo, show }) => {
  const scale = useSharedValue(1);
  
  React.useEffect(() => {
    if (show) {
      scale.value = withSpring(1.5);
    }
  }, [show]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text>COMBO x{combo}</Text>
    </Animated.View>
  );
};
```

### 2. index.ts에 export 추가

```typescript
// components/animations/index.ts
export { ComboAnimation } from './ComboAnimation';
```

### 3. 메인 화면에서 사용

```typescript
import { ComboAnimation } from '@/components/animations';

<ComboAnimation combo={combo} show={combo > 0} />
```

## 🔧 react-native-reanimated 주요 API

### useSharedValue
애니메이션 값을 관리:
```typescript
const scale = useSharedValue(0);
scale.value = 1;  // 값 변경
```

### useAnimatedStyle
애니메이션 스타일 생성:
```typescript
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
  opacity: opacity.value,
}));
```

### 애니메이션 함수

#### withTiming
시간 기반 애니메이션:
```typescript
value.value = withTiming(1, {
  duration: 800,
  easing: Easing.out(Easing.cubic),
});
```

#### withSpring
탄성 애니메이션:
```typescript
value.value = withSpring(1, {
  damping: 10,
  stiffness: 100,
});
```

#### withSequence
순차 애니메이션:
```typescript
value.value = withSequence(
  withSpring(1.5),
  withSpring(1.0)
);
```

## 📊 성능 최적화 팁

1. **worklet 사용**: 애니메이션이 UI 스레드에서 실행되도록
2. **useAnimatedStyle**: 스타일 재계산 최적화
3. **SharedValue**: 상태 변경 시 불필요한 리렌더링 방지

## 🚀 향후 추가 가능한 애니메이션

- [ ] **콤보 애니메이션**: 연속 성공 시 화려한 효과
- [ ] **레벨업 애니메이션**: 레벨 상승 시 전체 화면 효과
- [ ] **배지 획득 애니메이션**: 새 배지 획득 시 팝업
- [ ] **진행률 애니메이션**: 훈련 진행도 표시
- [ ] **파티클 효과**: 다양한 입자 효과
- [ ] **진동 피드백**: Haptic과 결합한 촉각 피드백

## 📚 참고 자료

- [react-native-reanimated 공식 문서](https://docs.swmansion.com/react-native-reanimated/)
- [Expo with Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated/)
- [애니메이션 예제 모음](https://github.com/software-mansion/react-native-reanimated/tree/main/app/src/examples)

