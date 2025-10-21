import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from "react-native";
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

// 🎵 소리 식별 훈련 타입 정의
type IdentificationMode = 'word-challenge' | 'sound-identification' | 'voice-recording';

type WordChallenge = {
    word: string;
    pronunciation: string; // 실제 발음 표시용
    category: 'common' | 'intermediate' | 'advanced';
    hint?: string; // 힌트 추가
};

type SentenceChallenge = {
    sentence: string;
    pronunciation: string;
    complexity: 'simple' | 'medium' | 'complex';
};

type SoundChallenge = {
    soundName: string;
    audioFile: string; // 실제로는 음성 파일, 지금은 문자열로 대체
    category: 'home' | 'street' | 'nature' | 'technology';
};

// 🎵 단어 챌린지 데이터 (100개 핵심 단어)
const WORD_CHALLENGES: WordChallenge[] = [
    // 🟢 초급 단어 (자주 사용) - 20개
    { word: "사과", pronunciation: "sa-gwa", category: 'common', hint: "빨간색이나 초록색 과일" },
    { word: "학교", pronunciation: "hak-gyo", category: 'common', hint: "공부하는 곳" },
    { word: "물", pronunciation: "mul", category: 'common', hint: "투명하고 마실 수 있는 액체" },
    { word: "바람", pronunciation: "ba-ram", category: 'common', hint: "움직이는 공기" },
    { word: "집", pronunciation: "jip", category: 'common', hint: "살고 있는 장소" },
    { word: "강아지", pronunciation: "gang-a-ji", category: 'common', hint: "짖는 동물" },
    { word: "고양이", pronunciation: "go-yang-i", category: 'common', hint: "야옹 소리를 내는 동물" },
    { word: "친구", pronunciation: "chin-gu", category: 'common', hint: "함께 놀고 이야기하는 사람" },
    { word: "가족", pronunciation: "ga-jok", category: 'common', hint: "함께 사는 사람들" },
    { word: "음식", pronunciation: "eum-sik", category: 'common', hint: "먹을 수 있는 것" },
    { word: "자동차", pronunciation: "ja-dong-cha", category: 'common', hint: "길을 달리는 탈 것" },
    { word: "전화", pronunciation: "jeon-hwa", category: 'common', hint: "통화하는 기계" },
    { word: "책", pronunciation: "chaek", category: 'common', hint: "읽을 수 있는 종이" },
    { word: "연필", pronunciation: "yeon-pil", category: 'common', hint: "글씨를 쓰는 도구" },
    { word: "의자", pronunciation: "ui-ja", category: 'common', hint: "앉을 수 있는 가구" },
    { word: "테이블", pronunciation: "te-i-beul", category: 'common', hint: "음식을 먹는 평평한 곳" },
    { word: "창문", pronunciation: "chang-mun", category: 'common', hint: "빛이 들어오는 유리" },
    { word: "문", pronunciation: "mun", category: 'common', hint: "방이나 건물에 있는 입구" },
    { word: "손", pronunciation: "son", category: 'common', hint: "손가락이 있는 신체 부위" },
    { word: "발", pronunciation: "bal", category: 'common', hint: "걷는 데 사용하는 신체 부위" },

    // 🟡 중급 단어 (덜 자주 사용) - 15개
    { word: "컴퓨터", pronunciation: "keom-pyu-teo", category: 'intermediate', hint: "정보를 처리하는 전자 기기" },
    { word: "도서관", pronunciation: "do-seo-gwan", category: 'intermediate', hint: "책을 빌리고 읽을 수 있는 곳" },
    { word: "병원", pronunciation: "byeong-won", category: 'intermediate', hint: "아픈 사람이 치료받는 곳" },
    { word: "은행", pronunciation: "eun-haeng", category: 'intermediate', hint: "돈을 관리하는 곳" },
    { word: "시장", pronunciation: "si-jang", category: 'intermediate', hint: "물건을 사고파는 장소" },
    { word: "식당", pronunciation: "sik-dang", category: 'intermediate', hint: "음식을 먹을 수 있는 곳" },
    { word: "공항", pronunciation: "gong-hang", category: 'intermediate', hint: "비행기를 타고 내리는 곳" },
    { word: "기차역", pronunciation: "gi-cha-yeok", category: 'intermediate', hint: "기차를 타고 내리는 곳" },
    { word: "대학교", pronunciation: "dae-hak-gyo", category: 'intermediate', hint: "고등 교육을 받는 곳" },
    { word: "회사", pronunciation: "hoe-sa", category: 'intermediate', hint: "일하는 장소" },
    { word: "아파트", pronunciation: "a-pa-teu", category: 'intermediate', hint: "여러 가구가 사는 건물" },
    { word: "마트", pronunciation: "ma-teu", category: 'intermediate', hint: "식료품을 사는 곳" },
    { word: "카페", pronunciation: "ka-pe", category: 'intermediate', hint: "커피와 음료를 마시는 곳" },
    { word: "영화관", pronunciation: "yeong-hwa-gwan", category: 'intermediate', hint: "영화를 보는 곳" },
    { word: "체육관", pronunciation: "che-yuk-gwan", category: 'intermediate', hint: "운동할 수 있는 실내 공간" },

    // 🔴 고급 단어 (희귀 단어) - 10개
    { word: "현대인", pronunciation: "hyeon-dae-in", category: 'advanced', hint: "현대 사회에 살고 있는 사람" },
    { word: "문화재", pronunciation: "mun-hwa-jae", category: 'advanced', hint: "역사적, 예술적 가치가 있는 것" },
    { word: "민주주의", pronunciation: "min-ju-ju-ui", category: 'advanced', hint: "국민이 주인인 정치 체제" },
    { word: "자유시장경제", pronunciation: "ja-yu-si-jang-gyeong-je", category: 'advanced', hint: "자유롭게 경제 활동을 하는 체제" },
    { word: "환경오염", pronunciation: "hwan-gyeong-o-yeom", category: 'advanced', hint: "자연 환경이 더러워지는 현상" },
    { word: "기후변화", pronunciation: "gi-hu-byeon-hwa", category: 'advanced', hint: "지구 온도와 기후가 변하는 현상" },
    { word: "인공지능", pronunciation: "in-gong-ji-neung", category: 'advanced', hint: "사람처럼 생각하는 기계" },
    { word: "양자역학", pronunciation: "yang-ja-yeok-hak", category: 'advanced', hint: "아주 작은 세계의 물리학" },
    { word: "나노기술", pronunciation: "na-no-gi-sul", category: 'advanced', hint: "아주 작은 크기의 기술" },
    { word: "생명공학", pronunciation: "saeng-myeong-gong-hak", category: 'advanced', hint: "생명을 연구하고 응용하는 학문" },
];

// 🎵 문장 챌린지 데이터 (삭제)
// const SENTENCE_CHALLENGES: SentenceChallenge[] = [];

// 🎵 생활 소음 데이터 (비활성화됨)
// const SOUND_CHALLENGES: SoundChallenge[] = [];

// 음성 녹음 데이터 타입
type VoiceRecording = {
    id: string;
    name: string;
    duration: number;
    createdAt: Date;
    audioUri?: string;
};

function IdentificationTraining() {
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
    const [mode, setMode] = useState<IdentificationMode>('word-challenge');

    // 🏆 청각 나무 성장 시스템
    const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());
    const [soundMuseum, setSoundMuseum] = useState<Set<string>>(new Set());
    const [treeStage, setTreeStage] = useState<'seedling' | 'sapling' | 'tree' | 'golden'>('seedling');

    // 🎯 게임 상태
    const [gameStarted, setGameStarted] = useState(false);
    const [currentChallenge, setCurrentChallenge] = useState<any>(null);
    const [userInput, setUserInput] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [gameResult, setGameResult] = useState<GameResult | null>(null);
    const [isCorrect, setIsCorrect] = useState(false);

    // 📊 게임 진행
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [perfectCount, setPerfectCount] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);

    // 🎨 애니메이션 상태
    const [showParticleExplosion, setShowParticleExplosion] = useState(false);
    const [isPlayingSound, setIsPlayingSound] = useState(false);
    const treeScale = useSharedValue(1);
    const treeOpacity = useSharedValue(1);

    // 🎤 음성 녹음 상태
    const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [currentRecording, setCurrentRecording] = useState<VoiceRecording | null>(null);

    // 청각 나무 성장 로직
    const updateTreeGrowth = (newMasteredCount: number) => {
        if (newMasteredCount >= 80) {
            setTreeStage('golden');
        } else if (newMasteredCount >= 50) {
            setTreeStage('tree');
        } else if (newMasteredCount >= 25) {
            setTreeStage('sapling');
        } else {
            setTreeStage('seedling');
        }
    };

    // 게임 시작
    const startGame = () => {
        console.log(`=== 3단계 게임 시작 (${mode} 모드, 세트 ${currentSet}) ===`);

        setGameStarted(true);
        setScore(0);
        setPerfectCount(0);
        setCurrentQuestion(0);
        setTimeout(() => presentNextChallenge(), 1000);
    };

    // 다음 챌린지 제시
    const presentNextChallenge = () => {
        let challenge: any;

        if (mode === 'word-challenge') {
            // 난이도별 단어 필터링
            const availableWords = WORD_CHALLENGES.filter(word =>
                settings.difficulty === 'easy' ? word.category === 'common' :
                settings.difficulty === 'normal' ? ['common', 'intermediate'].includes(word.category) :
                true
            );
            challenge = availableWords[Math.floor(Math.random() * availableWords.length)];
        } else {
            // 생활 소음 (현재 비활성화됨)
            // challenge = SOUND_CHALLENGES[Math.floor(Math.random() * SOUND_CHALLENGES.length)];
            // 임시로 단어 챌린지로 대체
            const availableSentences = WORD_CHALLENGES.filter(word =>
                settings.difficulty === 'easy' ? word.category === 'common' :
                settings.difficulty === 'normal' ? ['common', 'intermediate'].includes(word.category) :
                true
            );
            challenge = availableSentences[Math.floor(Math.random() * availableSentences.length)];
        }

        setCurrentChallenge(challenge);
        setUserInput('');
    };

    // 한글 입력 상태 관리를 위한 추가 상태
    const [isComposing, setIsComposing] = useState(false);

    // 한글 입력 핸들러 최적화
    const handleTextChange = useCallback((text: string) => {
        // 조합 중인 텍스트 처리
        setUserInput(text);
    }, []);

    // 음성 녹음 관련 함수들
    const startRecording = async () => {
        try {
            setIsRecording(true);
            const newRecording: VoiceRecording = {
                id: `recording_${Date.now()}`,
                name: `녹음 ${recordings.length + 1}`,
                duration: 0,
                createdAt: new Date(),
            };
            setCurrentRecording(newRecording);
            console.log('🎤 녹음 시작');
        } catch (error) {
            console.error('녹음 시작 중 오류:', error);
            setIsRecording(false);
        }
    };

    const stopRecording = async () => {
        try {
            setIsRecording(false);
            if (currentRecording) {
                const updatedRecording: VoiceRecording = {
                    ...currentRecording,
                    duration: 10, // 임시 고정 값 (실제로는 녹음 길이 계산 필요)
                };
                setRecordings(prev => [...prev, updatedRecording]);
                setCurrentRecording(null);
                console.log('🎤 녹음 완료:', updatedRecording);
            }
        } catch (error) {
            console.error('녹음 중지 중 오류:', error);
        }
    };

    const playRecording = (recording: VoiceRecording) => {
        console.log(`🔊 녹음 재생: ${recording.name}`);
        // 실제 오디오 재생 로직 추가 필요
    };

    const deleteRecording = (recordingId: string) => {
        setRecordings(prev => prev.filter(r => r.id !== recordingId));
    };

    // 입력 완료 핸들러
    const handleInputSubmit = useCallback(() => {
        if (!currentChallenge || !userInput.trim()) return;

        // 사용자 입력을 그대로 비교 (간단한 접근)
        const userAnswer = userInput.trim();
        const correctAnswer = currentChallenge.word.trim();

        // 완전 일치 비교
        const correct = userAnswer === correctAnswer;

        console.log(`📝 답변 확인: "${userInput}" vs 정답: "${correctAnswer}" -> ${correct ? '정확함' : '틀림'}`);

        setIsCorrect(correct);

        if (correct) {
            setScore(prev => prev + 100);
            setPerfectCount(prev => prev + 1);

            // 🏆 게이미피케이션 업데이트
            if (mode === 'word-challenge') {
                const newMastered = new Set(masteredWords);
                newMastered.add(currentChallenge.word);
                setMasteredWords(newMastered);
                updateTreeGrowth(newMastered.size);
            }

            // 🎆 성공 애니메이션
            setShowParticleExplosion(true);
            setTimeout(() => setShowParticleExplosion(false), 1200);
        } else {
            // 틀린 답변의 경우 힌트를 보여줌
            Alert.alert(
                '틀린 답변',
                `정확한 답변: "${correctAnswer}"\n\n힌트: ${currentChallenge.hint || '다시 한 번 생각해보세요'}`,
                [{ text: '다시 시도', style: 'default' }]
            );
        }

        setShowResult(true);

        // 결과 표시 후 다음 문제
        setTimeout(() => {
            setShowResult(false);
            setUserInput(''); // 입력창 초기화

            const nextQuestion = currentQuestion + 1;
            setCurrentQuestion(nextQuestion);

            if (nextQuestion >= settings.questionCount) {
                finishSet();
            } else {
                setTimeout(() => presentNextChallenge(), 1000);
            }
        }, 2000);
    }, [currentChallenge, userInput, mode, masteredWords, currentQuestion, settings.questionCount]);

    // 세트 완료
    const finishSet = () => {
        const result: GameResult = {
            totalQuestions: settings.questionCount,
            perfectCount,
            goodCount: 0,
            missCount: settings.questionCount - perfectCount,
            totalScore: score,
            maxCombo: perfectCount,
            averageReactionTime: 0,
            completedSets: currentSet,
        };

        addPerfects(perfectCount, (perfectCount / settings.questionCount) * 100);
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
        setPerfectCount(0);
    };

    // 소리 재생 기능 (시뮬레이션)
    const playSound = useCallback(() => {
        if (isPlayingSound || !currentChallenge) {
            console.log('❌ 소리 재생 불가:', { isPlayingSound, hasChallenge: !!currentChallenge });
            return;
        }

        setIsPlayingSound(true);
        console.log('🔊 소리 재생 시작:', currentChallenge);

        // 실제 오디오 재생 시뮬레이션 (나중에 실제 오디오 파일로 교체 가능)
        setTimeout(() => {
            setIsPlayingSound(false);
            console.log('🔊 소리 재생 완료');
        }, 2000); // 2초 재생 시뮬레이션
    }, [isPlayingSound, currentChallenge]);

    // 청각 나무 애니메이션
    const triggerTreeAnimation = () => {
        treeScale.value = 1;
        treeOpacity.value = 1;

        treeScale.value = withSequence(
            withSpring(1.2, { damping: 8 }),
            withSpring(1.0, { damping: 10 })
        );
    };

    const treeAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: treeScale.value }],
        opacity: treeOpacity.value,
    }));

    if (gameStarted) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.gameContainer}>
                    {/* 문항 진행률 */}
                    <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>
                            {mode === 'word-challenge' ? '🔤 단어 식별' : '🔊 소음 식별 (준비 중)'} -
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

                    {/* 🏆 청각 나무 성장 표시 */}
                    <View style={styles.treeContainer}>
                        <Text style={styles.treeTitle}>🌳 청각 나무 성장</Text>
                        <Animated.View style={[styles.treeDisplay, treeAnimatedStyle]}>
                            <Text style={styles.treeEmoji}>
                                {treeStage === 'seedling' ? '🌱' :
                                 treeStage === 'sapling' ? '🌿' :
                                 treeStage === 'tree' ? '🌳' : '🌟'}
                            </Text>
                            <Text style={styles.treeStage}>
                                {treeStage === 'seedling' ? '새싹' :
                                 treeStage === 'sapling' ? '작은 나무' :
                                 treeStage === 'tree' ? '큰 나무' : '황금 나무'}
                            </Text>
                        </Animated.View>
                        <Text style={styles.treeProgress}>
                            마스터 단어: {masteredWords.size}/100개
                        </Text>
                    </View>

                    {/* 상단 점수판 */}
                    <View style={styles.scoreBoard}>
                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreLabel}>점수</Text>
                            <Text style={styles.scoreValue}>{score}</Text>
                        </View>
                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreLabel}>Perfect</Text>
                            <Text style={[styles.scoreValue, styles.perfectValue]}>{perfectCount}</Text>
                        </View>
                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreLabel}>마스터 단어</Text>
                            <Text style={[styles.scoreValue, styles.masterValue]}>{masteredWords.size}</Text>
                        </View>
                    </View>

                    {/* 챌린지 영역 */}
                    <View style={styles.challengeArea}>
                        {currentChallenge && (
                            <>
                                {/* 소리 재생 영역 */}
                                <View style={styles.soundArea}>
                                    <TouchableOpacity
                                        style={[
                                            styles.playButton,
                                            isPlayingSound && styles.playButtonPlaying
                                        ]}
                                        onPress={playSound}
                                        disabled={isPlayingSound}
                                    >
                                        <Text style={styles.playButtonText}>
                                            {isPlayingSound ? '🔊 재생 중...' : '🔊 소리 듣기'}
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={styles.instructionText}>
                                        {mode === 'word-challenge' ? '단어를 입력하세요' :
                                         '소음이 무엇인지 입력하세요 (준비 중)'}
                                    </Text>
                                    {currentChallenge && (
                                        <Text style={styles.challengeHint}>
                                            {mode === 'word-challenge' ? '힌트: 발음 기호를 참고하세요' :
                                             '힌트: 생활 소리를 상상해보세요 (준비 중)'}
                                        </Text>
                                    )}
                                </View>

                                {/* 답변 입력 영역 */}
                                <View style={styles.inputArea}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={userInput}
                                        onChangeText={setUserInput}
                                        placeholder="답변을 입력하세요"
                                        placeholderTextColor="#999"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        returnKeyType="done"
                                        onSubmitEditing={handleInputSubmit}
                                        blurOnSubmit={true}
                                    />
                                    <TouchableOpacity
                                        style={[styles.submitButton, !userInput.trim() && styles.submitButtonDisabled]}
                                        onPress={handleInputSubmit}
                                        disabled={!userInput.trim()}
                                    >
                                        <Text style={styles.submitButtonText}>제출</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
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
                    </View>

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

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                <Text style={styles.title}>청능 훈련 - 3단계</Text>
                <Text style={styles.subtitle}>소리 식별 훈련</Text>

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
                    <Text style={styles.modeTitle}>🎯 식별 훈련 모드 선택</Text>

                    <TouchableOpacity
                        style={[styles.modeButton, mode === 'word-challenge' && styles.selectedMode]}
                        onPress={() => setMode('word-challenge')}
                    >
                        <Text style={styles.modeButtonText}>🔤 단어 마스터리 트리</Text>
                        <Text style={styles.modeDescription}>단어를 정확히 식별하고 마스터리 트리에 등록</Text>
                    </TouchableOpacity>

                    {/* 소음 박물관 모드 (현재 비활성화됨) */}
                    <TouchableOpacity
                        style={[styles.modeButton, styles.disabledMode]}
                        disabled={true}
                    >
                        <Text style={[styles.modeButtonText, styles.disabledText]}>🔊 소음 박물관</Text>
                        <Text style={[styles.modeDescription, styles.disabledText]}>생활 소음을 듣고 정체를 맞추기 (준비 중)</Text>
                    </TouchableOpacity>

                    {/* 음성 녹음 모드 */}
                    <TouchableOpacity
                        style={[styles.modeButton, mode === 'voice-recording' && styles.selectedMode]}
                        onPress={() => setMode('voice-recording')}
                    >
                        <Text style={styles.modeButtonText}>🎙️ 음성 녹음</Text>
                        <Text style={styles.modeDescription}>내 목소리를 녹음하고 재생하기</Text>
                    </TouchableOpacity>

                    {/* 음성 녹음 모드 */}
                    {mode === 'voice-recording' && (
                        <View style={styles.voiceRecordingContainer}>
                            <View style={styles.recordingControls}>
                                <TouchableOpacity 
                                    style={[
                                        styles.recordButton, 
                                        isRecording && styles.recordingButton
                                    ]}
                                    onPress={isRecording ? stopRecording : startRecording}
                                >
                                    <Text style={styles.recordButtonText}>
                                        {isRecording ? '🛑 녹음 중지' : '🎤 녹음 시작'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {recordings.length > 0 && (
                                <View style={styles.recordingsList}>
                                    <Text style={styles.recordingsTitle}>📋 내 녹음 목록</Text>
                                    {recordings.map((recording) => (
                                        <View key={recording.id} style={styles.recordingItem}>
                                            <Text style={styles.recordingName}>{recording.name}</Text>
                                            <Text style={styles.recordingDuration}>
                                                {recording.duration}초
                                            </Text>
                                            <View style={styles.recordingActions}>
                                                <TouchableOpacity 
                                                    style={styles.playRecordingButton}
                                                    onPress={() => playRecording(recording)}
                                                >
                                                    <Text>▶️</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity 
                                                    style={styles.deleteRecordingButton}
                                                    onPress={() => deleteRecording(recording.id)}
                                                >
                                                    <Text>🗑️</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* 🏆 게이미피케이션 설명 */}
                <View style={styles.gamificationCard}>
                    <Text style={styles.cardTitle}>🌳 청각 나무 성장 시스템</Text>
                    <Text style={styles.cardContent}>
                        • 단어를 정확히 식별할 때마다 나무에 잎사귀가 돋아납니다{"\n"}
                        • 문장 완벽 입력 시 열매가 열립니다{"\n"}
                        • 소음 정확 식별 시 소리 박물관에 전시됩니다 (준비 중){"\n"}
                        • 나무가 성장함에 따라 새로운 능력이 해금됩니다!
                    </Text>
                </View>

                {/* 시작 버튼 */}
                <TouchableOpacity style={styles.startButton} onPress={startGame}>
                    <Text style={styles.startButtonText}>
                        🎮 {mode === 'word-challenge' ? '단어' : mode === 'voice-recording' ? '음성 녹음' : '소음'} 식별 훈련 시작하기
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
    disabledMode: {
        backgroundColor: '#f0f0f0',
        borderColor: '#ccc',
    },
    disabledText: {
        color: '#999',
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
    treeContainer: {
        backgroundColor: '#E8F5E8',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
    },
    treeTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    treeDisplay: {
        alignItems: 'center',
        marginBottom: 8,
    },
    treeEmoji: {
        fontSize: 48,
        marginBottom: 5,
    },
    treeStage: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A90E2',
    },
    treeProgress: {
        fontSize: 12,
        color: '#666',
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
    perfectValue: {
        color: "#FFD700",
    },
    masterValue: {
        color: "#4A90E2",
    },
    challengeArea: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 20,
        marginBottom: 20,
        elevation: 3,
        padding: 20,
    },
    soundArea: {
        alignItems: 'center',
        marginBottom: 30,
    },
    playButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
    },
    playButtonPlaying: {
        backgroundColor: '#E67E22',
    },
    playButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    challengeHint: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 5,
        fontStyle: 'italic',
    },
    instructionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    inputArea: {
        width: '100%',
        alignItems: 'center',
    },
    textInput: {
        width: '80%',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        backgroundColor: 'white',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        padding: 15,
        minWidth: 120,
        elevation: 3,
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
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

    // 음성 녹음 모드 스타일
    voiceRecordingContainer: {
        width: '100%',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
    },
    recordingControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    recordButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        padding: 15,
        minWidth: 150,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordingButton: {
        backgroundColor: '#E67E22',
    },
    recordButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    recordingsList: {
        marginTop: 10,
    },
    recordingsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    recordingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
    },
    recordingName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    recordingDuration: {
        fontSize: 12,
        color: '#666',
    },
    recordingActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playRecordingButton: {
        marginLeft: 10,
        padding: 5,
    },
    deleteRecordingButton: {
        marginLeft: 10,
        padding: 5,
    },
});

export default IdentificationTraining;
