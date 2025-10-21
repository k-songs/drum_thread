import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing
} from "react-native-reanimated";
import { BurstAnimation, JudgementAnimation, ParticleExplosion } from '@/components/animations';
import { GameSettingsMenu } from "@/components/GameSettingsMenu";
import { GameResultModal } from "@/components/GameResultModal";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { LevelUpModal } from "@/components/LevelUpModal";
import {
  DifficultyLevel,
  QuestionCount,
  GameResult,
  DIFFICULTY_SETTINGS,
  MAX_SETS,
  SoundSpeed,
  SOUND_SPEED_CONFIG
} from "@/types/game";
import { useAvatarProgress } from "@/hooks/useAvatarProgress";

// 음원 대신 사용할 소리 문자열
const SOUND_STRINGS = ["삐", "땡", "띵", "뚝", "탁"];

export default function LearnIndex() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // 🎭 아바타 시스템
  const {
    progress: avatarProgress,
    currentLevelInfo,
    nextLevelInfo,
    levelProgress,
    isLeveledUp,
    newLevelInfo,
    addPerfects,
    closeLevelUpModal,
  } = useAvatarProgress();
  
  // 🎮 게임 설정
  const [settings, setSettings] = useState<{ questionCount: QuestionCount; difficulty: DifficultyLevel; soundSpeed: SoundSpeed }>({
    questionCount: 10,
    difficulty: 'normal',
    soundSpeed: 'normal', // 기본값 유지
  });
  const [showSettings, setShowSettings] = useState(false);
  
  // 🎯 게임 상태
  const [gameStarted, setGameStarted] = useState(false);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [soundTimestamp, setSoundTimestamp] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [judgement, setJudgement] = useState<"Perfect" | "Good" | "Miss" | null>(null);
  const [showBurst, setShowBurst] = useState(false);
  const [showParticleExplosion, setShowParticleExplosion] = useState(false);
  
  // 📊 문항 추적
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [goodCount, setGoodCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [currentSet, setCurrentSet] = useState(1);
  
  // 🏆 결과 모달
  const [showResult, setShowResult] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  
  // 🎨 react-native-reanimated 애니메이션 값
  const burstScale = useSharedValue(0);
  const burstOpacity = useSharedValue(0);
  const burstRotation = useSharedValue(0);
  
  // 판정 텍스트 애니메이션
  const judgementScale = useSharedValue(0);
  const judgementOpacity = useSharedValue(0);

  // 게임 시작
  const startGame = () => {
    console.log(`=== 게임 시작 (세트 ${currentSet}, ${settings.questionCount}문항, ${settings.difficulty}) ===`);
    setGameStarted(true);
    setScore(0);
    setCombo(0);
    setPerfectCount(0);
    setGoodCount(0);
    setMissCount(0);
    setCurrentQuestion(0);
    setReactionTimes([]);
    setJudgement(null);
    setMaxCombo(0);
  };

  // 문항 완료 후 결과 표시
  const finishSet = () => {
    const avgReactionTime = reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : 0;

    const accuracy = settings.questionCount > 0
      ? ((perfectCount + goodCount) / settings.questionCount) * 100
      : 0;

    const result: GameResult = {
      totalQuestions: settings.questionCount,
      perfectCount,
      goodCount,
      missCount,
      totalScore: score,
      maxCombo,
      averageReactionTime: avgReactionTime,
      completedSets: currentSet,
    };

    // 🎭 아바타 진행도 업데이트
    addPerfects(perfectCount, accuracy);

    console.log("=== 세트 완료 ===", result);
    setGameResult(result);
    setShowResult(true);
    setGameStarted(false);
    setCurrentSound(null);
  };

  // 계속하기
  const continueGame = () => {
    setShowResult(false);
    setCurrentSet(prev => prev + 1);
    // 누적 점수는 유지
    startGame();
  };

  // 게임 완전 종료
  const resetGame = () => {
    setShowResult(false);
    setCurrentSet(1);
    setGameStarted(false);
    setScore(0);
    setPerfectCount(0);
    setGoodCount(0);
    setMissCount(0);
    setCurrentQuestion(0);
    setReactionTimes([]);
  };

  // 무작위 간격으로 소리(문자열) 재생
  useEffect(() => {
    if (!gameStarted) return;

    let timeoutId: any;

    const scheduleNextSound = () => {
      const speedConfig = SOUND_SPEED_CONFIG[settings.soundSpeed];
      const randomDelay = speedConfig.minInterval + Math.random() * (speedConfig.maxInterval - speedConfig.minInterval);
      
      timeoutId = setTimeout(() => {
        const randomSound = SOUND_STRINGS[Math.floor(Math.random() * SOUND_STRINGS.length)];
        const timestamp = Date.now();
        
        setCurrentSound(randomSound);
        setSoundTimestamp(timestamp);
        console.log(`🔊 소리 발생: "${randomSound}" (시간: ${timestamp})`);

        // 800ms 후 소리 제거 (판정 시간 확보)
        setTimeout(() => {
          setCurrentSound(null);
        }, 800);

        // 다음 소리 예약
        scheduleNextSound();
      }, randomDelay);
    };

    // 첫 소리는 설정된 속도의 최소 시간 후 시작
    timeoutId = setTimeout(() => {
      const randomSound = SOUND_STRINGS[Math.floor(Math.random() * SOUND_STRINGS.length)];
      const timestamp = Date.now();
      
      setCurrentSound(randomSound);
      setSoundTimestamp(timestamp);
      console.log(`🔊 소리 발생: "${randomSound}" (시간: ${timestamp})`);

      setTimeout(() => {
        setCurrentSound(null);
      }, 800);

      // 다음 소리들 예약 시작
      scheduleNextSound();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [gameStarted]);

  // 버튼 클릭 핸들러 (타이밍 판정) - 난이도별 조절
  const handleCatch = () => {
    if (!gameStarted || !soundTimestamp) {
      console.log("❌ 소리가 없을 때 클릭");
      return;
    }

    const reactionTime = Date.now() - soundTimestamp;
    const timingConfig = DIFFICULTY_SETTINGS[settings.difficulty];
    
    console.log(`⏱️ 반응 시간: ${reactionTime}ms (난이도: ${settings.difficulty})`);

    let judgementResult: "Perfect" | "Good" | "Miss";
    let points = 0;

    // 🎯 난이도별 판정 기준 적용
    if (reactionTime <= timingConfig.perfect) {
      judgementResult = "Perfect";
      points = 100;
      const newCombo = combo + 1;
      setCombo(newCombo);
      setPerfectCount(prev => prev + 1);
      
      if (newCombo > maxCombo) {
        setMaxCombo(newCombo);
      }

      if (newCombo === 5) {
        points += 500;
        console.log("🎉 콤보 5회 달성! +500 보너스");
      } else if (newCombo === 10) {
        points += 1000;
        console.log("🎉 콤보 10회 달성! +1000 보너스");
      } else if (newCombo === 20) {
        points += 2000;
        console.log("🎉 콤보 20회 달성! +2000 보너스");
      }

      // 불꽃 애니메이션 실행
      triggerParticleExplosion();
      triggerBurstAnimation();
      triggerJudgementAnimation();
      
      console.log(`✨ Perfect! +${points}점 | 콤보: ${newCombo}`);
    } else if (reactionTime <= timingConfig.good) {
      judgementResult = "Good";
      points = 50;
      setCombo(0);
      setGoodCount(prev => prev + 1);
      console.log(`👍 Good! +${points}점 | 콤보 초기화`);
      triggerJudgementAnimation();
    } else if (reactionTime <= timingConfig.miss) {
      judgementResult = "Miss";
      points = 0;
      setCombo(0);
      setMissCount(prev => prev + 1);
      console.log(`💔 Miss! 콤보 초기화`);
      triggerJudgementAnimation();
    } else {
      // 너무 늦은 반응은 무시
      console.log("⏰ 너무 늦은 반응 (무시됨)");
      return;
    }

    setJudgement(judgementResult);
    setScore(prev => prev + points);
    setReactionTimes(prev => [...prev, reactionTime]);
    setSoundTimestamp(null);
    setCurrentSound(null);

    // 판정 텍스트 1초 후 제거
    setTimeout(() => setJudgement(null), 1000);

    // 📊 문항 수 체크
    const nextQuestion = currentQuestion + 1;
    setCurrentQuestion(nextQuestion);
    console.log(`문항 진행: ${nextQuestion}/${settings.questionCount}`);

    // 설정된 문항 수 완료 시 결과 표시
    if (nextQuestion >= settings.questionCount) {
      console.log("🎊 모든 문항 완료!");
      setTimeout(() => {
        finishSet();
      }, 1500); // 마지막 판정 애니메이션 후 결과 표시
    }
  };

  // 🎆 입자 폭발 애니메이션
  const triggerParticleExplosion = () => {
    setShowParticleExplosion(true);
    setTimeout(() => {
      setShowParticleExplosion(false);
    }, 1200);
  };

  // 🎨 불꽃 애니메이션 (react-native-reanimated 사용)
  const triggerBurstAnimation = () => {
    console.log("💥 불꽃 애니메이션 시작!");
    setShowBurst(true);
    
    // 초기화
    burstScale.value = 0;
    burstOpacity.value = 1;
    burstRotation.value = 0;
    
    // 스케일 애니메이션 (탄성 효과)
    burstScale.value = withSpring(1.2, {
      damping: 10,
      stiffness: 100,
    });
    
    // 투명도 애니메이션
    burstOpacity.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    
    // 회전 애니메이션 (추가 효과)
    burstRotation.value = withTiming(360, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    
    // 애니메이션 완료 후 정리
    setTimeout(() => {
      setShowBurst(false);
      console.log("💥 불꽃 애니메이션 완료!");
    }, 800);
  };
  
  // 🎨 판정 텍스트 애니메이션
  const triggerJudgementAnimation = () => {
    judgementScale.value = 0;
    judgementOpacity.value = 1;
    
    judgementScale.value = withSequence(
      withSpring(1.3, { damping: 8 }),
      withSpring(1.0, { damping: 10 })
    );
    
    setTimeout(() => {
      judgementOpacity.value = withTiming(0, { duration: 300 });
    }, 700);
  };
  
  // 🎨 애니메이션 스타일
  const burstAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: burstScale.value },
        { rotate: `${burstRotation.value}deg` }
      ],
      opacity: burstOpacity.value,
    };
  });
  
  const judgementAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: judgementScale.value }],
      opacity: judgementOpacity.value,
    };
  });

  // 문항 종료 체크 - handleCatch에서 처리하므로 별도 useEffect 불필요

  if (gameStarted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.gameContainer}>
          {/* 문항 진행률 */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              문항 {currentQuestion}/{settings.questionCount} (세트 {currentSet}/{MAX_SETS})
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(currentQuestion / settings.questionCount) * 100}%` }
                ]} 
              />
            </View>
          </View>

          {/* 상단 점수판 */}
          <View style={styles.scoreBoard}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>점수</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>콤보</Text>
              <Text style={[styles.scoreValue, styles.comboValue]}>{combo}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Perfect</Text>
              <Text style={[styles.scoreValue, styles.perfectValue]}>{perfectCount}</Text>
            </View>
          </View>

          {/* 소리 표시 영역 */}
          <View style={styles.soundArea}>
            {currentSound && (
              <Text style={styles.soundText}>{currentSound}</Text>
            )}
            
            {/* 🎆 입자 폭발 애니메이션 */}
            <ParticleExplosion
              show={showParticleExplosion}
              particleCount={8}
              colors={['#FFD700', '#FF6B6B', '#4A90E2', '#9B59B6', '#E67E22', '#2ECC71', '#F39C12']}
              duration={1200}
              centerX={0}
              centerY={0}
            />

            {/* 불꽃 애니메이션 (react-native-reanimated) */}
            {showBurst && (
              <Animated.View
                style={[
                  styles.burstAnimation,
                  burstAnimatedStyle,
                ]}
              >
                <Text style={styles.burstText}>💥</Text>
              </Animated.View>
            )}

            {/* 판정 텍스트 영역 */}
            {judgement && (
              <JudgementAnimation 
                judgement={judgement}
                duration={1000}
              />
            )}
          </View>

          {/* 캐치 버튼 */}
          <TouchableOpacity style={styles.catchButton} onPress={handleCatch}>
            <Text style={styles.catchButtonText}>소리 캐치!</Text>
          </TouchableOpacity>

          {/* 종료 버튼 */}
          <TouchableOpacity style={styles.stopButton} onPress={resetGame}>
            <Text style={styles.stopButtonText}>게임 종료</Text>
          </TouchableOpacity>

          {/* 하단 통계 */}
          <View style={styles.stats}>
            <View style={styles.statRow}>
              <Text style={styles.statsText}>Perfect: {perfectCount}</Text>
              <Text style={styles.statsText}>Good: {goodCount}</Text>
              <Text style={styles.statsText}>Miss: {missCount}</Text>
            </View>
            <Text style={styles.statsText}>최대 콤보: {maxCombo}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 햄버거 메뉴 버튼 */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setShowSettings(true)}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>


      <ScrollView style={styles.content}>
        <Text style={styles.title}>청능 훈련 - 1단계</Text>
        <Text style={styles.subtitle}>소리 훈련</Text>

        {/* 현재 설정 표시 */}
        <View style={styles.currentSettings}>
          <Text style={styles.settingsText}>
            📝 문항 수: {settings.questionCount}개 |
            🎯 난이도: {settings.difficulty === 'easy' ? '쉬움' : settings.difficulty === 'normal' ? '보통' : '어려움'} |
            🧭 속도: {settings.soundSpeed === 'veryslow' ? '매우 느림' : settings.soundSpeed === 'slow' ? '느림' : settings.soundSpeed === 'normal' ? '보통' : settings.soundSpeed === 'fast' ? '빠름' : '매우 빠름'}
          </Text>
        </View>
        
        {/* 🎭 아바타 표시 */}
        <View style={styles.avatarSection}>
          <AvatarDisplay
            avatarInfo={currentLevelInfo}
            progress={levelProgress}
            size="medium"
            showProgress={true}
          />
          {nextLevelInfo && (
            <View style={styles.nextLevelInfo}>
              <Text style={styles.nextLevelText}>
                다음 레벨까지: {nextLevelInfo.requiredPerfects - avatarProgress.totalPerfects}회 Perfect 남음
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.description}>
          소리가 있는지 없는지를 감지하는 훈련입니다.{"\n"}
          가장 기본적인 소리 자극에 반응하는 능력을 키워보세요.
        </Text>

        {/* 3대 핵심 요소 표 */}
        <View style={styles.table}>
          <Text style={styles.tableTitle}>핵심 요소</Text>
          
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
            
            </View>
          </View>

         

          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
             
            </View>
          </View>
        </View>

        {/* 게임 설명 */}
{/*         <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 소리 캐치 게임</Text>
          <Text style={styles.cardContent}>
            • 무작위 간격으로 소리가 발생합니다{"\n"}
            • 소리가 들릴 때마다 버튼을 눌러주세요{"\n"}
            • ±100ms 이내: Perfect (100점 + 콤보){"\n"}
            • ±300ms 이내: Good (50점, 콤보 초기화){"\n"}
            • 그 외: Miss (콤보 초기화)
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔥 리듬 콤보 시스템</Text>
          <Text style={styles.cardContent}>
            • 5회 콤보: +500 보너스{"\n"}
            • 10회 콤보: +1,000 보너스{"\n"}
            • 20회 콤보: +2,000 보너스{"\n"}
            • Perfect 판정 시 화려한 불꽃 효과!
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏅 성장 시스템 (테스트 모드)</Text>
          <Text style={styles.cardContent}>
            • Perfect 3회마다 순발력 레벨 상승{"\n"}
            • 레벨 2: '초보 반응가' 배지 획득{"\n"}
            • 레벨 3: '중급 반응가' 배지 획득{"\n"}
            • 레벨 4: '고급 반응가' 배지 획득{"\n"}
          </Text>
        </View> */}

        {/* 시작 버튼 */}
        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>🎮 1단계 훈련 시작하기</Text>
        </TouchableOpacity>

        {/* 2단계 훈련 버튼 */}
        <TouchableOpacity
          style={[styles.startButton, styles.stage2Button]}
          onPress={() => router.push('/learn/discrimination')}
        >
          <Text style={styles.startButtonText}>🎵 2단계: 소리 분별 훈련</Text>
        </TouchableOpacity>

        {/* 3단계 훈련 버튼 */}
        <TouchableOpacity
          style={[styles.startButton, styles.stage3Button]}
          onPress={() => router.push('/learn/identification')}
        >
          <Text style={styles.startButtonText}>🔤 3단계: 소리 식별 훈련</Text>
        </TouchableOpacity>

        {/* 안내 메시지 */}
      {/*   <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 안내</Text>
          <Text style={styles.infoText}>
            • {settings.questionCount}문항 완료 후 결과를 확인할 수 있습니다{'\n'}
            • 최대 {MAX_SETS}세트({MAX_SETS * settings.questionCount}문항)까지 연속으로 진행 가능합니다{'\n'}
            • 상단 메뉴(☰)에서 문항 수와 난이도를 조절할 수 있습니다
          </Text>
        </View> */}
      </ScrollView>


      {/* 결과 모달 */}
      {gameResult && (
        <GameResultModal
          visible={showResult}
          result={gameResult}
          onContinue={continueGame}
          onFinish={resetGame}
          canContinue={currentSet < MAX_SETS}
          currentSet={currentSet}
          maxSets={MAX_SETS}
          totalPerfects={avatarProgress.totalPerfects}
        />
      )}

      {/* 설정 모달 */}
      <GameSettingsMenu
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        currentSettings={settings}
        onSettingsChange={setSettings}
      />

      {/* 🎊 레벨업 모달 */}
      {newLevelInfo && (
        <LevelUpModal
          visible={isLeveledUp}
          newLevel={newLevelInfo}
          onClose={closeLevelUpModal}
        />
      )}
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuIcon: {
    fontSize: 28,
    color: '#4A90E2',
  },
  currentSettings: {
    backgroundColor: '#EBF5FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  settingsText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60, // 햄버거 메뉴 공간 확보
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4A90E2",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  table: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  tableRow: {
    marginBottom: 15,
  },
  tableCell: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4A90E2",
  },
  tableCellTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  tableCellDesc: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 5,
  },
  tableCellPurpose: {
    fontSize: 13,
    color: "#4A90E2",
    fontWeight: "600",
    fontStyle: "italic",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    padding: 18,
    marginTop: 10,
    marginBottom: 30,
    elevation: 3,
  },
  stage2Button: {
    backgroundColor: "#9B59B6",
    marginBottom: 20,
  },
  stage3Button: {
    backgroundColor: "#E67E22",
    marginBottom: 20,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  badgesContainer: {
    backgroundColor: "#FFF8DC",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  badgesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  badgeItem: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  infoCard: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  avatarSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    alignItems: 'center',
  },
  nextLevelInfo: {
    marginTop: 15,
    backgroundColor: '#F0F8FF',
    padding: 10,
    borderRadius: 8,
    width: '100%',
  },
  nextLevelText: {
    fontSize: 13,
    color: '#4A90E2',
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // 게임 화면 스타일
  gameContainer: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  scoreBoard: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
  },
  scoreItem: {
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  comboValue: {
    color: "#FF6B6B",
  },
  perfectValue: {
    color: "#FFD700",
  },
  soundArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 30,
    elevation: 3,
    position: "relative",
  },
  soundText: {
    fontSize: 80,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  burstAnimation: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  burstText: {
    fontSize: 200,
    color: "#FFD700", 
    elevation: 5,
  },
  judgementContainer: {
    position: "absolute",
    bottom: 50,
  },
  judgementText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  perfectText: {
    color: "#FFD700",
  },
  goodText: {
    color: "#4A90E2",
  },
  missText: {
    color: "#999",
  },
  catchButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 100,
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
    elevation: 5,
  },
  catchButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  stopButton: {
    backgroundColor: "#666",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  stats: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  statsText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
});
