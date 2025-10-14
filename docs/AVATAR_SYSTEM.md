# 🎭 아바타 진화 시스템 가이드

## 📌 개요

청능 훈련 앱의 **아바타 진화 시스템**은 사용자의 지속적인 훈련을 독려하고 성장을 시각화하는 핵심 기능입니다.

---

## 🌱 진화 단계 (5단계)

| 단계 | 레벨 | 이름 | 이모지 | 필요 Perfect | 설명 |
|------|------|------|--------|--------------|------|
| Seed | 1-2 | 씨앗 귀 | 🌱 | 0-30 | 청각 훈련 시작 |
| Sprout | 3-4 | 새싹 귀 | 🌿 | 100-200 | 소리 감지 시작 |
| Bud | 5-7 | 꽃봉오리 귀 | 🌺 | 350-700 | 소리 구분 능력 향상 |
| Bloom | 8-10 | 활짝 핀 귀 | 🌸 | 1000-2000 | 명확한 청각 능력 |
| Master | 11+ | 빛나는 귀 | ✨ | 3000+ | 청각 마스터 |

---

## 📊 레벨업 기준

1. **Perfect 누적 횟수**: 주요 레벨업 기준
2. **정확도**: 훈련 세션 평균 정확도 추적
3. **연속 훈련 일수**: 꾸준한 훈련 독려

---

## 🗂️ 파일 구조

```
types/
  └── avatar.ts                  # 아바타 타입 정의 및 레벨 데이터

components/
  ├── AvatarDisplay.tsx          # 아바타 표시 컴포넌트
  └── LevelUpModal.tsx           # 레벨업 축하 모달

hooks/
  └── useAvatarProgress.ts       # 아바타 진행도 관리 Hook
```

---

## 🎨 Lottie 애니메이션 적용 가이드

### 1. Lottie 패키지 설치

```bash
npx expo install lottie-react-native
```

### 2. Lottie 파일 준비

다음 위치에 Lottie JSON 파일을 배치하세요:

```
assets/
  └── lottie/
      ├── seed.json          # 씨앗 귀 애니메이션
      ├── sprout.json        # 새싹 귀 애니메이션
      ├── bud.json           # 꽃봉오리 귀 애니메이션
      ├── bloom.json         # 활짝 핀 귀 애니메이션
      ├── master.json        # 빛나는 귀 애니메이션
      └── confetti.json      # 레벨업 축하 효과
```

### 3. AvatarDisplay.tsx 수정

```typescript
import LottieView from 'lottie-react-native';

// 아바타 아이콘 영역 (현재 이모지 부분을 교체)
<View style={[styles.avatarContainer, ...]}>
  <LottieView
    source={getLottieSource(avatarInfo.stage)}
    autoPlay
    loop
    style={{ width: currentSize.container, height: currentSize.container }}
  />
</View>

// Lottie 소스 매핑 함수
const getLottieSource = (stage: AvatarStage) => {
  const sources = {
    seed: require('../assets/lottie/seed.json'),
    sprout: require('../assets/lottie/sprout.json'),
    bud: require('../assets/lottie/bud.json'),
    bloom: require('../assets/lottie/bloom.json'),
    master: require('../assets/lottie/master.json'),
  };
  return sources[stage];
};
```

### 4. LevelUpModal.tsx 수정

```typescript
import LottieView from 'lottie-react-native';

// Confetti 효과 추가
<LottieView
  source={require('../assets/lottie/confetti.json')}
  autoPlay
  loop={false}
  style={styles.confetti}
/>

// 아바타 아이콘도 Lottie로 교체
<View style={[styles.avatarCircle, ...]}>
  <LottieView
    source={getLottieSource(newLevel.stage)}
    autoPlay
    loop
    style={{ width: 150, height: 150 }}
  />
</View>
```

---

## 🔧 데이터 저장 구조

AsyncStorage에 저장되는 데이터 구조:

```typescript
{
  "currentLevel": 3,
  "totalPerfects": 150,
  "totalTrainingSessions": 12,
  "consecutiveDays": 5,
  "averageAccuracy": 85.5,
  "lastTrainingDate": "2025-10-14"
}
```

**Storage Key**: `@hearing_training_progress`

---

## 🎮 사용 예시

### 메인 화면에서 아바타 표시

```typescript
import { useAvatarProgress } from "@/hooks/useAvatarProgress";
import { AvatarDisplay } from "@/components/AvatarDisplay";

const {
  currentLevelInfo,
  levelProgress,
  avatarProgress,
} = useAvatarProgress();

<AvatarDisplay
  avatarInfo={currentLevelInfo}
  progress={levelProgress}
  size="medium"
  showProgress={true}
/>
```

### 훈련 완료 시 진행도 업데이트

```typescript
const { addPerfects } = useAvatarProgress();

// 훈련 세트 완료 후
const accuracy = (perfectCount + goodCount) / totalQuestions * 100;
addPerfects(perfectCount, accuracy);
```

### 레벨업 모달 표시

```typescript
const { isLeveledUp, newLevelInfo, closeLevelUpModal } = useAvatarProgress();

<LevelUpModal
  visible={isLeveledUp}
  newLevel={newLevelInfo}
  onClose={closeLevelUpModal}
/>
```

---

## 🎯 향후 확장 가능성

1. **업적 시스템**: 특별한 조건 달성 시 배지 획득
2. **친구 비교**: 레벨 및 진행도 공유
3. **일일 미션**: 매일 새로운 훈련 목표 제시
4. **아바타 커스터마이징**: 레벨별 스킨 변경
5. **통계 차트**: 진행도 그래프 시각화

---

## 💡 개발 팁

### 레벨 밸런싱 조정

`types/avatar.ts`의 `AVATAR_LEVELS` 배열에서 `requiredPerfects` 값을 조정하세요.

### 테스트 모드

개발 중 빠른 레벨업 테스트를 위해 `requiredPerfects` 값을 낮춰보세요:

```typescript
// 테스트용 (개발 중에만)
requiredPerfects: 5  // 원래 100 → 5로 변경
```

### 진행도 초기화

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// 개발 중 진행도 초기화
await AsyncStorage.removeItem('@hearing_training_progress');
```

---

## 🐛 문제 해결

### AsyncStorage 데이터 확인

```typescript
const data = await AsyncStorage.getItem('@hearing_training_progress');
console.log(JSON.parse(data));
```

### 레벨업이 트리거되지 않을 때

1. `addPerfects` 함수가 정확히 호출되는지 확인
2. Console에서 레벨업 로그 확인: `🎊 레벨업! ...`
3. `isLeveledUp` state 값 확인

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. AsyncStorage 권한
2. Lottie 파일 경로
3. Console 로그

