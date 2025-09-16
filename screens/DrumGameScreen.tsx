import React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';
import Title from '../components/ui/Title';
import Card from '../components/ui/Card';
import InstructionText from '../components/ui/InstructionText';
import PrimaryButton from '../components/ui/PrimaryButton';
import Colors from '../constants/Colors';
import { DRUM_INSTRUMENTS, InstrumentType, DifficultyType, DIFFICULTY_LEVELS } from '@/constants/drumSounds';

interface DrumGameScreenProps {
  difficulty?: DifficultyType;
  onGameOver: (score: number, maxScore: number) => void;
  onCorrectAnswer?: () => void;
}

type GameState = 'ready' | 'playing' | 'answered' | 'waitingForNextRound';

function DrumGameScreen({ difficulty: selectedDifficulty = 'intermediate', onGameOver, onCorrectAnswer }: DrumGameScreenProps) {
  const [currentInstrument, setCurrentInstrument] = useState<InstrumentType | null>(null);
  const [choices, setChoices] = useState<InstrumentType[]>([]);
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState>('ready');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  
  const currentDifficulty = DIFFICULTY_LEVELS[selectedDifficulty];
  const maxRounds = currentDifficulty.rounds;
  const availableInstruments = currentDifficulty.instruments;

  useEffect(() => {
    startNewRound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const startNewRound = (): void => {
    // 정답 악기 선택
    const correctInstrument = availableInstruments[
      Math.floor(Math.random() * availableInstruments.length)
    ];
    setCurrentInstrument(correctInstrument);

    // 3개의 선택지 생성 (정답 포함)
    const wrongChoices = availableInstruments.filter(inst => inst !== correctInstrument);
    const selectedWrong = wrongChoices
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    
    const allChoices = [correctInstrument, ...selectedWrong]
      .sort(() => 0.5 - Math.random());
    
    setChoices(allChoices);
    setGameState('ready');
    setShowAnimation(false);
  };

  const playSound = async (): Promise<void> => {
    try {
      setIsPlaying(true);
      setShowAnimation(true);
      
      // 이전 사운드 정리
      if (sound) {
        await sound.unloadAsync();
      }

      if (!currentInstrument) return;

      const { sound: newSound } = await Audio.Sound.createAsync(
        DRUM_INSTRUMENTS[currentInstrument].sound,
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setGameState('playing');

      // 사운드 재생 완료 후 처리
      newSound.setOnPlaybackStatusUpdate((status:any) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          setShowAnimation(false);
          setGameState('answered');
        }
      });

    } catch (error) {
      Alert.alert('오류', '음성 재생에 실패했습니다.');
      setIsPlaying(false);
      setShowAnimation(false);
    }
  };

  const handleAnswer = async (selectedInstrument: InstrumentType): Promise<void> => {
    if (gameState !== 'answered') return;

    const isCorrect = selectedInstrument === currentInstrument;
    
    let newScore = score;
    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
      setFeedbackMessage('정답! 🎉 잘하셨습니다!');
      setShowFeedback(true);
      onCorrectAnswer?.();
    } else {
      setFeedbackMessage(`오답! 정답은 "${DRUM_INSTRUMENTS[currentInstrument!].name}"입니다.`);
      setShowFeedback(true);
    }
 
    setGameState('waitingForNextRound');
 
    setTimeout(() => {
      setShowFeedback(false);
      if (round >= maxRounds) {
        onGameOver(newScore, maxRounds);
      } else {
        setRound(prevRound => prevRound + 1);
        startNewRound();
      }
    }, 1000); // 1초 지연
  };

  const resetGame = (): void => {
    setScore(0);
    setRound(1);
    startNewRound();
  };

  return (
    <View style={styles.container}>
      <Title>타악기 맞히기 게임</Title>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>
          라운드: {round}/{maxRounds} | 점수: {score}
        </Text>
      </View>

      <Card style={styles.gameCard}>
        {/* Lottie 애니메이션 영역 */}
        <View style={styles.animationContainer}>
          {showAnimation && currentInstrument ? (
            DRUM_INSTRUMENTS[currentInstrument].lottie ? (
              <LottieView
                source={DRUM_INSTRUMENTS[currentInstrument].lottie}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            ) : ( // lottie가 없을 경우, emoji 없이 바로 기본 폴백
              <View style={styles.placeholderAnimation}>
                <Text style={styles.placeholderText}>?</Text> {/* Lottie가 없을 때 표시 */}
                <InstructionText>재생 버튼을 눌러주세요</InstructionText>
              </View>
            )
          ) : (
            <View style={styles.placeholderAnimation}>
              <Text style={styles.placeholderText}>🥁</Text> {/* 기본 아이콘 */}
              <InstructionText>재생 버튼을 눌러주세요</InstructionText>
            </View>
          )}
        </View>

        {/* 피드백 메시지 표시 */}
        {showFeedback && ( // showFeedback 상태에 따라 피드백 메시지를 조건부 렌더링
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}

        {/* 재생 버튼 */}
        <View style={styles.playButtonContainer}>
          <PrimaryButton 
            onPress={playSound} 
            disabled={isPlaying}
            style={[styles.playButton, isPlaying && styles.disabledButton]}
          >
            {isPlaying ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>🔊 소리 재생</Text>
            )}
          </PrimaryButton>
        </View>

        {/* 선택지 버튼들 */}
        {gameState === 'answered' && (
          <View style={styles.choicesContainer}>
            <InstructionText style={styles.choiceInstruction}>
              어떤 악기 소리였을까요?
            </InstructionText>
            <View style={styles.choiceButtons}>
              {choices.map((instrument) => (
                <TouchableOpacity
                  key={instrument}
                  style={styles.choiceButton}
                  onPress={() => handleAnswer(instrument)}
                >
                  <Text style={styles.choiceButtonText}>
                    {DRUM_INSTRUMENTS[instrument].name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Card>

      {/* 게임 리셋 버튼 */}
      <View style={styles.resetContainer}>
        <PrimaryButton onPress={resetGame} style={styles.resetButton}>
          <Text style={styles.buttonText}>다시 시작</Text>
        </PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 18,
    fontFamily: 'open-sans-bold',
    color: Colors.primary800,
  },
  gameCard: {
    marginBottom: 20,
  },
  animationContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
  placeholderAnimation: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 10,
  },
  playButtonContainer: {
    marginBottom: 20,
  },
  playButton: {
    marginHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  choicesContainer: {
    marginTop: 20,
  },
  choiceInstruction: {
    textAlign: 'center',
    marginBottom: 15,
  },
  choiceButtons: {
    gap: 10,
  },
  choiceButton: {
    backgroundColor: Colors.primary600,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  choiceButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'open-sans-bold',
  },
  resetContainer: {
    marginTop: 20,
  },
  resetButton: {
    marginHorizontal: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'open-sans-bold',
  },
  feedbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 50, // 메시지가 표시될 공간 확보
  },
  feedbackText: {
    fontSize: 22,
    fontFamily: 'open-sans-bold',
    color: Colors.primary800, // 또는 적절한 색상
    textAlign: 'center',
  },
});

export default DrumGameScreen;