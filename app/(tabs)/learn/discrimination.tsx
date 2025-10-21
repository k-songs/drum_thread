import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useRef, useEffect, useCallback } from "react";
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
import RewardModal from "@/components/RewardModal";
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

// 🎵 소리 분별 훈련 타입 정의
type DiscriminationMode = 'pitch' | 'duration' | 'word-pair';
type SoundPair = {
    sound1: string;
    sound2: string;
    areSame: boolean;
    type: 'pitch' | 'duration';
};

type WordPair = {
    word1: string;
    word2: string;
    areSame: boolean;
    difficulty: 'easy' | 'medium' | 'hard'; // 발음 차이 정도
};

// 🎵 소리 데이터 (실제로는 음성 파일을 사용하겠지만, 지금은 텍스트로 시뮬레이션)
const PITCH_PAIRS: SoundPair[] = [
    { sound1: "높은음 🎵", sound2: "낮은음 🎶", areSame: false, type: 'pitch' },
    { sound1: "높은음 🎵", sound2: "높은음 🎵", areSame: true, type: 'pitch' },
    { sound1: "중간음 🎼", sound2: "낮은음 🎶", areSame: false, type: 'pitch' },
    { sound1: "중간음 🎼", sound2: "중간음 🎼", areSame: true, type: 'pitch' },
];

const DURATION_PAIRS: SoundPair[] = [
    { sound1: "짧은소리 ♪", sound2: "긴소리 ♫♫♫", areSame: false, type: 'duration' },
    { sound1: "긴소리 ♫♫♫", sound2: "긴소리 ♫♫♫", areSame: true, type: 'duration' },
    { sound1: "중간소리 ♪♪", sound2: "짧은소리 ♪", areSame: false, type: 'duration' },
    { sound1: "중간소리 ♪♪", sound2: "중간소리 ♪♪", areSame: true, type: 'duration' },
];

const WORD_PAIRS: WordPair[] = [
    // 🟢 쉬움: 자음이 완전히 다름
    { word1: "곰", word2: "공", areSame: false, difficulty: 'easy' },
    { word1: "차", word2: "자", areSame: false, difficulty: 'easy' },
    { word1: "밥", word2: "팝", areSame: false, difficulty: 'easy' },
    { word1: "물", word2: "불", areSame: false, difficulty: 'easy' },
    { word1: "집", word2: "집", areSame: true, difficulty: 'easy' },
    { word1: "책", word2: "책", areSame: true, difficulty: 'easy' },

    // 🟡 보통: 자음 하나만 다름 (ㄱ/ㅋ, ㄷ/ㅌ, ㅂ/ㅍ 등)
    { word1: "가방", word2: "카방", areSame: false, difficulty: 'medium' },
    { word1: "다리", word2: "타리", areSame: false, difficulty: 'medium' },
    { word1: "바다", word2: "파다", areSame: false, difficulty: 'medium' },
    { word1: "고기", word2: "코기", areSame: false, difficulty: 'medium' },
    { word1: "사과", word2: "사과", areSame: true, difficulty: 'medium' },
    { word1: "나무", word2: "나무", areSame: true, difficulty: 'medium' },

    // 🔴 어려움: 미세한 차이 (받침, 장단음)
    { word1: "빛", word2: "빗", areSame: false, difficulty: 'hard' },
    { word1: "밤", word2: "밥", areSame: false, difficulty: 'hard' },
    { word1: "눈", word2: "눈", areSame: true, difficulty: 'hard' }, // 동음이의어
    { word1: "말", word2: "맘", areSame: false, difficulty: 'hard' },
    { word1: "길", word2: "김", areSame: false, difficulty: 'hard' },
    { word1: "꽃", word2: "꽃", areSame: true, difficulty: 'hard' },
];

function DiscriminationTraining() {
    const insets = useSafeAreaInsets();

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
    soundSpeed: 'normal',
  });
    const [showSettings, setShowSettings] = useState(false);
    const [mode, setMode] = useState<DiscriminationMode>('pitch');

    // 🎯 게임 상태
    const [gameStarted, setGameStarted] = useState(false);
    const [currentPair, setCurrentPair] = useState<SoundPair | WordPair | null>(null);
    const [showingFirstSound, setShowingFirstSound] = useState(false);
    const [showingSecondSound, setShowingSecondSound] = useState(false);
    const [canAnswer, setCanAnswer] = useState(false);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [judgement, setJudgement] = useState<"Perfect" | "Good" | "Miss" | null>(null);

    // 📊 문항 추적
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [perfectCount, setPerfectCount] = useState(0);
    const [goodCount, setGoodCount] = useState(0);
    const [missCount, setMissCount] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);

    // 🏆 결과 모달
    const [showResult, setShowResult] = useState(false);
    const [gameResult, setGameResult] = useState<GameResult | null>(null);

  // 🎨 애니메이션 값
  const burstScale = useSharedValue(0);
  const burstOpacity = useSharedValue(0);
  const judgementScale = useSharedValue(0);
  const judgementOpacity = useSharedValue(0);

  // 🏺 유물 애니메이션 값
  const artifactScale = useSharedValue(0);
  const artifactOpacity = useSharedValue(0);
  const artifactTranslateY = useSharedValue(20);

  // 🏺 게이미피케이션 상태 (유물 조각 시스템)
  const [artifactPieces, setArtifactPieces] = useState(0);
  const [totalArtifactPieces, setTotalArtifactPieces] = useState(0);
  const [showArtifactAnimation, setShowArtifactAnimation] = useState(false);

  // 🎊 유물 완성 보상 모달
  const [isRewardModalVisible, setIsRewardModalVisible] = useState(false);
  const [artifactRewards, setArtifactRewards] = useState<string[]>([]);

    // 🎖️ 랭크 시스템
    const [rankPoints, setRankPoints] = useState(0);
    const [currentRank, setCurrentRank] = useState('초급 청취자');
    const [showRankUpAnimation, setShowRankUpAnimation] = useState(false);

    // 🎆 입자 폭발 애니메이션 상태
    const [showParticleExplosion, setShowParticleExplosion] = useState(false);

    // 랭크 시스템 정의
    const RANKS = [
        { name: '초급 청취자', minPoints: 0, color: '#95A5A6', emoji: '🔰' },
        { name: '발음 감별사', minPoints: 100, color: '#3498DB', emoji: '🎧' },
        { name: '소리 탐정', minPoints: 300, color: '#9B59B6', emoji: '🕵️' },
        { name: '청각 마스터', minPoints: 600, color: '#E67E22', emoji: '🏆' },
        { name: '음성 전문가', minPoints: 1000, color: '#E74C3C', emoji: '👑' },
    ];

    // 게임 시작
    const startGame = () => {
        console.log(`=== 2단계 게임 시작 (${mode} 모드, 세트 ${currentSet}) ===`);
        setGameStarted(true);
        setScore(0);
        setCombo(0);
        setPerfectCount(0);
        setGoodCount(0);
        setMissCount(0);
        setCurrentQuestion(0);
        setMaxCombo(0);
        setCanAnswer(false);
        setCurrentPair(null);

        // 첫 번째 문제 시작
        setTimeout(() => {
            presentNextPair();
        }, 1000);
    };

    // 다음 문제 제시
    const presentNextPair = () => {
        let pairs: (SoundPair | WordPair)[];

        if (mode === 'pitch') {
            pairs = PITCH_PAIRS;
        } else if (mode === 'duration') {
            pairs = DURATION_PAIRS;
        } else {
            // 단어 모드에서는 게임 난이도에 따라 단어 난이도 필터링
            const wordDifficultyMap = {
                'easy': ['easy'],
                'normal': ['easy', 'medium'],
                'hard': ['easy', 'medium', 'hard']
            };

            const allowedDifficulties = wordDifficultyMap[settings.difficulty];
            pairs = WORD_PAIRS.filter(pair =>
                'difficulty' in pair && allowedDifficulties.includes(pair.difficulty)
            );
        }

        const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
        setCurrentPair(randomPair);
        setCanAnswer(false);

    // 첫 번째 소리 재생
    setShowingFirstSound(true);

    // 설정된 속도에 따라 첫 번째 소리 표시 시간 결정
    const firstSoundDuration = SOUND_SPEED_CONFIG[settings.soundSpeed].minInterval * 0.6; // 최소 간격의 60%

    setTimeout(() => {
        setShowingFirstSound(false);

        // 설정된 속도에 따라 두 번째 소리까지 간격 결정
        const secondSoundDelay = SOUND_SPEED_CONFIG[settings.soundSpeed].minInterval * 0.4; // 나머지 40%

        // 잠시 간격 후 두 번째 소리 재생
        setTimeout(() => {
            setShowingSecondSound(true);
            setTimeout(() => {
                setShowingSecondSound(false);
                setCanAnswer(true); // 이제 답변 가능
            }, 1500); // 두 번째 소리 표시 시간은 고정
        }, secondSoundDelay);
    }, firstSoundDuration);
    };

    // 답변 처리
    const handleAnswer = useCallback((selected: string) => {
        if (currentPair) {
            // 올바른 정답 확인 로직:
            // 사용자가 'same'을 선택했다면 currentPair.areSame가 true여야 정답
            // 사용자가 'different'를 선택했다면 currentPair.areSame가 false여야 정답
            const isCorrect = (selected === 'same' && currentPair.areSame) ||
                (selected === 'different' && !currentPair.areSame);

            let judgementResult: "Perfect" | "Good" | "Miss";
            let points = 0;

            if (isCorrect) {
                judgementResult = "Perfect";
                points = 100;
                const newCombo = combo + 1;
                setCombo(newCombo);
                setPerfectCount(prev => prev + 1);

                if (newCombo > maxCombo) {
                    setMaxCombo(newCombo);
                }

                // 🏺 유물 조각 획득 애니메이션
                triggerArtifactPieceAnimation();

                // 🎖️ 랭크 포인트 획득
                updateRankPoints(10); // Perfect 시 10포인트

                // 콤보 보너스
                if (newCombo === 5) {
                    points += 500;
                    updateRankPoints(20); // 콤보 보너스 포인트
                } else if (newCombo === 10) {
                    points += 1000;
                    updateRankPoints(50);
                }

                // 🎆 화려한 입자 폭발 애니메이션 (Perfect 전용)
                triggerParticleExplosion();
                triggerBurstAnimation();
                console.log(`✨ Perfect! +${points}점 | 콤보: ${newCombo}`);
            } else {
                judgementResult = "Miss";
                points = 0;
                setCombo(0);
                setMissCount(prev => prev + 1);
                console.log(`💔 Miss! 콤보 초기화`);
            }

            setJudgement(judgementResult);
            setScore(prev => prev + points);
            setCanAnswer(false);

            // 판정 텍스트 1초 후 제거
            setTimeout(() => setJudgement(null), 1000);

            // 다음 문항으로
            const nextQuestion = currentQuestion + 1;
            setCurrentQuestion(nextQuestion);

            if (nextQuestion >= settings.questionCount) {
                setTimeout(() => {
                    finishSet();
                }, 1500);
            } else {
                setTimeout(() => {
                    presentNextPair();
                }, 2000);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPair, combo, maxCombo, settings.questionCount, currentQuestion, perfectCount, score, judgement, mode]);

    // 🏺 유물 조각 획득 애니메이션 (유물 완성 보상 시스템 구현)
    const triggerArtifactPieceAnimation = () => {
        setArtifactPieces(prev => {
            const newCount = prev + 1;

            // 10개 모았을 때 유물 완성 보상 지급
            if (newCount >= 10) {
                const rewards = [
                    '🏺 전설 유물 완성!',
                    '💎 보물 상자 해금',
                    '🎖️ "유물 수집가" 칭호 획득',
                    '⭐ 추가 점수 1000점 보너스'
                ];
                setArtifactRewards(rewards);
                setIsRewardModalVisible(true);

                console.log("🎊 유물 완성! 보상 모달 표시");
            }

            return newCount;
        });
        setTotalArtifactPieces(prev => prev + 1);
        setShowArtifactAnimation(true);

        // 🏺 새로운 유물 발견 애니메이션 실행
        triggerArtifactAnimation();

        setTimeout(() => {
            setShowArtifactAnimation(false);
        }, 1000); // 애니메이션 시간 증가
    };

    // 🎆 입자 폭발 애니메이션
    const triggerParticleExplosion = () => {
        setShowParticleExplosion(true);
        setTimeout(() => {
            setShowParticleExplosion(false);
        }, 1200);
    };

    // 🎖️ 랭크 포인트 업데이트
    const updateRankPoints = (points: number) => {
        const newPoints = rankPoints + points;
        setRankPoints(newPoints);

        // 랭크 업 체크
        const newRank = RANKS.slice().reverse().find(rank => newPoints >= rank.minPoints);
        if (newRank && newRank.name !== currentRank) {
            setCurrentRank(newRank.name);
            setShowRankUpAnimation(true);
            setTimeout(() => {
                setShowRankUpAnimation(false);
            }, 3000);
            console.log(`🎖️ 랭크 업! ${newRank.emoji} ${newRank.name}`);
        }
    };

    // 세트 완료
    const finishSet = () => {
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
            averageReactionTime: 0, // 분별 훈련에서는 반응시간 측정 안함
            completedSets: currentSet,
        };

        addPerfects(perfectCount, accuracy);
        setGameResult(result);
        setShowResult(true);
        setGameStarted(false);
    };

    // 계속하기
    const continueGame = () => {
        setShowResult(false);
        setCurrentSet(prev => prev + 1);
        startGame();
    };

    // 게임 종료
    const resetGame = () => {
        setShowResult(false);
        setCurrentSet(1);
        setGameStarted(false);
        setScore(0);
        setCurrentQuestion(0);
        setArtifactPieces(0);
    };

  // 🎨 애니메이션 함수들
  const triggerBurstAnimation = () => {
    burstScale.value = 0;
    burstOpacity.value = 1;

    burstScale.value = withSpring(1.2, {
      damping: 10,
      stiffness: 100,
    });

    burstOpacity.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  };

  // 🏺 유물 발견 애니메이션
  const triggerArtifactAnimation = () => {
    // 초기화
    artifactScale.value = 0;
    artifactOpacity.value = 0;
    artifactTranslateY.value = 20;

    // 나타나는 애니메이션
    artifactOpacity.value = withTiming(1, { duration: 300 });
    artifactScale.value = withSpring(1.2, { damping: 8, stiffness: 100 });
    artifactTranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });

    // 사라지는 애니메이션 (딜레이 후)
    setTimeout(() => {
      artifactScale.value = withTiming(0.8, { duration: 200 });
      artifactOpacity.value = withTiming(0, { duration: 300 });
      artifactTranslateY.value = withTiming(-10, { duration: 300 });
    }, 300);
  };

  const burstAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: burstScale.value }],
      opacity: burstOpacity.value,
    };
  });

  // 🏺 유물 애니메이션 스타일
  const artifactAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: artifactScale.value },
        { translateY: artifactTranslateY.value }
      ],
      opacity: artifactOpacity.value,
    };
  });


    if (gameStarted) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.gameContainer}>
                    {/* 문항 진행률 */}
                    <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>
                            {mode === 'pitch' ? '🎵 음높이 비교' : mode === 'duration' ? '⏱️ 소리 길이 비교' : '🗣️ 단어 짝 맞추기'} -
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

                    {/* 🏺 유물 조각 진행도 */}
                    <View style={styles.artifactContainer}>
                        <Text style={styles.artifactTitle}>🏺 발굴된 유물 조각</Text>
                        <View style={styles.artifactProgress}>
                            <Text style={styles.artifactCount}>{artifactPieces}/10</Text>
                            <View style={styles.artifactBar}>
                                <View
                                    style={[
                                        styles.artifactFill,
                                        { width: `${(artifactPieces / 10) * 100}%` }
                                    ]}
                                />
                            </View>
                        </View>
                        {showArtifactAnimation && (
                            <Animated.View
                                style={[
                                    styles.artifactAnimationContainer,
                                    artifactAnimatedStyle
                                ]}
                            >
                                <Animated.Text style={styles.artifactAnimation}>
                                    🏺 유물 조각 발견!
                                </Animated.Text>
                                <Animated.Text style={styles.artifactSubAnimation}>
                                    ✨ +1개 획득
                                </Animated.Text>
                            </Animated.View>
                        )}
                    </View>

                    {/* 🎖️ 랭크 정보 */}
                    <View style={styles.rankContainer}>
                        <Text style={styles.rankTitle}>
                            {RANKS.find(rank => rank.name === currentRank)?.emoji} {currentRank}
                        </Text>
                        <View style={styles.rankProgress}>
                            <Text style={styles.rankPoints}>{rankPoints}P</Text>
                            <View style={styles.rankBar}>
                                <View
                                    style={[
                                        styles.rankFill,
                                        {
                                            width: `${Math.min(100, (rankPoints / (RANKS.find(rank => rank.name === currentRank)?.minPoints || 1000)) * 100)}%`,
                                            backgroundColor: RANKS.find(rank => rank.name === currentRank)?.color || '#95A5A6'
                                        }
                                    ]}
                                />
                            </View>
                        </View>
                        {showRankUpAnimation && (
                            <Animated.Text style={styles.rankUpAnimation}>
                                🎖️ 랭크 업! {RANKS.find(rank => rank.name === currentRank)?.emoji}
                            </Animated.Text>
                        )}
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
                        {showingFirstSound && currentPair && (
                            <View style={styles.soundDisplay}>
                                <Text style={styles.soundLabel}>첫 번째 소리</Text>
                                <Text style={styles.soundText}>
                                    {'sound1' in currentPair ? currentPair.sound1 : currentPair.word1}
                                </Text>
                            </View>
                        )}

                        {showingSecondSound && currentPair && (
                            <View style={styles.soundDisplay}>
                                <Text style={styles.soundLabel}>두 번째 소리</Text>
                                <Text style={styles.soundText}>
                                    {'sound2' in currentPair ? currentPair.sound2 : currentPair.word2}
                                </Text>
                            </View>
                        )}

                        {!showingFirstSound && !showingSecondSound && canAnswer && (
                            <Text style={styles.questionText}>
                                두 소리가 같나요? 다른가요?
                            </Text>
                        )}

                        {/* 🎆 입자 폭발 애니메이션 */}
                        <ParticleExplosion
                            show={showParticleExplosion}
                            particleCount={8}
                            colors={['#FFD700', '#FF6B6B', '#4A90E2', '#9B59B6', '#E67E22', '#2ECC71']}
                            duration={1200}
                            centerX={0}
                            centerY={0}
                        />

                        {/* 판정 텍스트 */}
                        {judgement && (
                            <JudgementAnimation
                                judgement={judgement}
                                duration={1000}
                            />
                        )}
                    </View>

                    {/* 답변 버튼들 */}
                    {canAnswer && (
                        <View style={styles.answerButtons}>
                            <TouchableOpacity
                                style={[styles.answerButton, styles.sameButton]}
                                onPress={() => handleAnswer('same')}
                            >
                                <Text style={styles.answerButtonText}>같음 ✓</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.answerButton, styles.differentButton]}
                                onPress={() => handleAnswer('different')}
                            >
                                <Text style={styles.answerButtonText}>다름 ✗</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* 종료 버튼 */}
                    <TouchableOpacity style={styles.stopButton} onPress={resetGame}>
                        <Text style={styles.stopButtonText}>게임 종료</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* 햄버거 메뉴 버튼 */}
            <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setShowSettings(true)}
            >
                <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>

            <ScrollView style={styles.content}>
                <Text style={styles.title}>청능 훈련 - 2단계</Text>
                <Text style={styles.subtitle}>소리 분별 훈련</Text>

                {/* 🎭 아바타 표시 */}
                <View style={styles.avatarSection}>
                    <AvatarDisplay
                        avatarInfo={currentLevelInfo}
                        progress={levelProgress}
                        size="medium"
                        showProgress={true}
                    />
                </View>

                {/* 훈련 모드 선택 */}
                <View style={styles.modeSelection}>
                    <Text style={styles.modeTitle}>🎯 훈련 모드 선택</Text>

                    <TouchableOpacity
                        style={[styles.modeButton, mode === 'pitch' && styles.selectedMode]}
                        onPress={() => setMode('pitch')}
                    >
                        <Text style={styles.modeButtonText}>🎵 음높이 비교</Text>
                        <Text style={styles.modeDescription}>높은음과 낮은음을 구별하는 훈련</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.modeButton, mode === 'duration' && styles.selectedMode]}
                        onPress={() => setMode('duration')}
                    >
                        <Text style={styles.modeButtonText}>⏱️ 소리 길이 비교</Text>
                        <Text style={styles.modeDescription}>짧은 소리와 긴 소리를 구별하는 훈련</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.modeButton, mode === 'word-pair' && styles.selectedMode]}
                        onPress={() => setMode('word-pair')}
                    >
                        <Text style={styles.modeButtonText}>🗣️ 단어 짝 맞추기</Text>
                        <Text style={styles.modeDescription}>비슷한 발음의 단어들을 구별하는 훈련</Text>
                    </TouchableOpacity>
                </View>

                {/* 🏺 게이미피케이션 설명 */}
                <View style={styles.gamificationCard}>
                    <Text style={styles.cardTitle}>🏺 고고학자 발굴 미션</Text>
                    <Text style={styles.cardContent}>
                        • 정답을 맞힐 때마다 유물 조각을 발견합니다{"\n"}
                        • 조각 10개를 모으면 하나의 유물이 완성됩니다{"\n"}
                        • 유물 완성 시 특별한 보상과 다음 단계 해금!{"\n"}
                        • 현재 발굴된 조각: {totalArtifactPieces}개
                    </Text>
                </View>

                {/* 시작 버튼 */}
                <TouchableOpacity style={styles.startButton} onPress={startGame}>
                    <Text style={styles.startButtonText}>
                        🎮 {mode === 'pitch' ? '음높이' : mode === 'duration' ? '소리길이' : '단어'} 훈련 시작하기
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* 설정 모달 */}
            <GameSettingsMenu
                visible={showSettings}
                onClose={() => setShowSettings(false)}
                currentSettings={settings}
                onSettingsChange={setSettings}
               
            />

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

            {/* 🎊 레벨업 모달 */}
            {newLevelInfo && (
                <LevelUpModal
                    visible={isLeveledUp}
                    newLevel={newLevelInfo}
                    onClose={closeLevelUpModal}
                />
            )}

            {/* 🎊 유물 완성 보상 모달 */}
            <RewardModal
                visible={isRewardModalVisible}
                onClose={() => setIsRewardModalVisible(false)}
                rewards={artifactRewards}
            />
        </View>
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingTop: 60,
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
        marginBottom: 20,
        textAlign: "center",
    },
    avatarSection: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        alignItems: 'center',
    },
    modeSelection: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
    },
    modeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    modeButton: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedMode: {
        borderColor: '#4A90E2',
        backgroundColor: '#EBF5FF',
    },
    modeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    modeDescription: {
        fontSize: 14,
        color: '#666',
    },
    gamificationCard: {
        backgroundColor: '#FFF8DC',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#DAA520',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    cardContent: {
        fontSize: 14,
        color: '#666',
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
    startButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
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
        fontSize: 14,
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
    artifactContainer: {
        backgroundColor: '#FFF8DC',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        position: 'relative',
    },
    artifactTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    artifactProgress: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    artifactCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#DAA520',
        marginRight: 10,
    },
    artifactBar: {
        flex: 1,
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    artifactFill: {
        height: '100%',
        backgroundColor: '#DAA520',
        borderRadius: 3,
    },
    artifactAnimationContainer: {
        position: 'absolute',
        top: -20,
        right: 10,
        alignItems: 'center',
        backgroundColor: 'rgba(218, 165, 32, 0.1)',
        borderRadius: 15,
        padding: 8,
        borderWidth: 1,
        borderColor: '#DAA520',
    },
    artifactAnimation: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#DAA520',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    artifactSubAnimation: {
        fontSize: 12,
        color: '#B8860B',
        marginTop: 2,
    },
    rankContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        position: 'relative',
        borderWidth: 2,
        borderColor: '#E9ECEF',
    },
    rankTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    rankProgress: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rankPoints: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6C757D',
        marginRight: 10,
    },
    rankBar: {
        flex: 1,
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    rankFill: {
        height: '100%',
        borderRadius: 3,
    },
    rankUpAnimation: {
        position: 'absolute',
        top: -10,
        left: 10,
        fontSize: 14,
        fontWeight: '600',
        color: '#E74C3C',
    },
    scoreBoard: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "white",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
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
        marginBottom: 20,
        elevation: 3,
        padding: 20,
    },
    soundDisplay: {
        alignItems: 'center',
    },
    soundLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    soundText: {
        fontSize: 48,
        fontWeight: "bold",
        color: "#4A90E2",
        textAlign: 'center',
    },
    questionText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    answerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    answerButton: {
        borderRadius: 12,
        padding: 20,
        minWidth: 120,
        elevation: 3,
    },
    sameButton: {
        backgroundColor: '#4CAF50',
    },
    differentButton: {
        backgroundColor: '#FF6B6B',
    },
    answerButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    stopButton: {
        backgroundColor: "#666",
        borderRadius: 12,
        padding: 15,
    },
    stopButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "white",
        textAlign: "center",
    },
});

export default DiscriminationTraining;
