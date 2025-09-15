// components/TempDrumGame.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated, // Animated import
  PanResponder, // PanResponder import
} from "react-native";
import { Audio } from "expo-av";
import {
  DRUM_SOUNDS,
  DRUM_INFO,
  DIFFICULTY_LEVELS,
} from "../constants/drumSounds";

function TempDrumGame({ difficulty = "beginner", onGameComplete }) {
  const [currentInstrument, setCurrentInstrument] = useState(null);
  const [choices, setChoices] = useState([]);
  const [gameState, setGameState] = useState("ready"); // ready, playing, answered
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // 토글 스위치 애니메이션을 위한 값

  // PanResponder 설정

  const currentDifficulty = DIFFICULTY_LEVELS[difficulty];
  const availableInstruments = currentDifficulty.instruments;
  const maxRounds = currentDifficulty.rounds;

  useEffect(() => {
    // Audio 세션 설정
    setupAudio();
    startNewRound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // 새로운 라운드 시작 시 자동 재생 여부 확인 및 카운트다운 시작

  // 카운트다운 로직

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.log("오디오 설정 오류:", error);
    }
  };

  const startNewRound = () => {
    // 정답 악기 랜덤 선택
    const correctInstrument =
      availableInstruments[
        Math.floor(Math.random() * availableInstruments.length)
      ];
    setCurrentInstrument(correctInstrument);

    // 오답 선택지 생성
    const wrongChoices = availableInstruments
      .filter((inst) => inst !== correctInstrument)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2); // 2개의 오답

    // 전체 선택지 섞기
    const allChoices = [correctInstrument, ...wrongChoices].sort(
      () => 0.5 - Math.random()
    );

    setChoices(allChoices);
    setGameState("ready");
  };

  const playSound = async () => {
    try {
      setIsPlaying(true);
      
      // 이전 사운드 정리
      if (sound) {
        await sound.unloadAsync();
      }

      const soundSource = DRUM_SOUNDS[currentInstrument];
      const drumInfo = DRUM_INFO[currentInstrument];
      console.log(`🔊 Playing ${drumInfo.name}: ${drumInfo.description}`);

      const { sound: newSound } = await Audio.Sound.createAsync(soundSource, {
        shouldPlay: true,
        volume: 1.0,
      });

      setSound(newSound);
      setGameState("playing");

      // 웹 환경을 고려한 재생 완료 처리
      newSound.setOnPlaybackStatusUpdate((status) => {
        console.log('Playback status:', status); // 디버깅용
        if (status.didJustFinish) {
          setIsPlaying(false);
          setGameState("answered");
          console.log('Sound finished, gameState set to answered'); // 디버깅용
        }
      });

      // 웹 환경 대비 타이머 백업 (3초 후 강제로 answered 상태로 변경)
      setTimeout(() => {
        if (gameState === "playing") {
          console.log('Fallback: Setting gameState to answered after 3 seconds');
          setIsPlaying(false);
          setGameState("answered");
        }
      }, 3000);

    } catch (error) {
      console.error("사운드 재생 오류:", error);
      setIsPlaying(false);
      // Alert 대신 console.log 사용 (웹 환경 고려)
      console.log("음성 재생에 실패했습니다.");
    }
  };

  const handleAnswer = (selectedInstrument) => {
    console.log('handleAnswer called:', selectedInstrument, 'gameState:', gameState); // 디버깅용
    
    if (gameState !== "answered") {
      console.log('Game state is not answered, returning'); // 디버깅용
      return;
    }

    const isCorrect = selectedInstrument === currentInstrument;

    console.log('Answer result:', isCorrect ? 'Correct' : 'Wrong'); // 디버깅용

    let newScore = score;
    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
      setFeedbackMessage('정답! 🎉 잘하셨습니다!');
      setShowFeedback(true);
    } else {
      setFeedbackMessage(`오답! 정답은 "${DRUM_INFO[currentInstrument].name}"입니다.`);
      setShowFeedback(true);
    }
 
    setGameState('waitingForNextRound');
 
    setTimeout(() => {
      setShowFeedback(false);
      if (round >= maxRounds) {
        onGameComplete?.(newScore, maxRounds, Math.round((newScore / maxRounds) * 100));
      } else {
        setRound(prevRound => prevRound + 1);
        startNewRound();
      }
    }, 1000);
  };

  const resetGame = () => {
    setScore(0);
    setRound(1);
    startNewRound();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>드럼 소리 맞히기</Text>
        <Text style={styles.difficulty}>  
          {currentDifficulty.name} - {currentDifficulty.description}
        </Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>
          라운드: {round}/{maxRounds} | 점수: {score}
        </Text>
        <Text style={styles.percentageText}>
          정답률: {Math.round((score / Math.max(round - 1, 1)) * 100)}%
        </Text>
      </View>

      <View style={styles.gameArea}>
        {/* 시작 버튼 (게임 시작 전 한 번만 터치) */}
        {gameState === "ready" && !isPlaying && (
          <TouchableOpacity
            style={styles.startButton} // 새로운 스타일 적용
            onPress={() => {
              setGameState("playing"); // 즉시 게임 상태를 playing으로 변경
              playSound();
            }}
          >
            <Text style={styles.startButtonText}>게임 시작</Text>
          </TouchableOpacity>
        )}

        {/* 현재 악기 표시 (게임 상태에 따라) */}
        {currentInstrument && (
          <View style={styles.instrumentDisplay}>
            <Text style={styles.instrumentEmoji}>
              {DRUM_INFO[currentInstrument].emoji}
            </Text>
            {gameState === "ready" && (
              <Text style={styles.instructionText}>
                게임 시작 버튼을 눌러 소리를 들어보세요
              </Text>
            )}
            {gameState === "playing" && (
              <Text style={styles.instructionText}>
                🎵 소리를 집중해서 들어보세요...
              </Text>
            )}
            {gameState === "answered" && (
              <Text style={styles.instructionText}>
                🤔 어떤 악기 소리였을까요?
              </Text>
            )}
          </View>
        )}

        {/* 피드백 메시지 표시 */}
        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}
        
        {/* 재생 버튼 */}
        {gameState === "playing" && !isPlaying && (
          <TouchableOpacity
            style={styles.playButton}
            onPress={async () => {
              if (sound) {
                await sound.stopAsync(); // Stop current sound to play again
              }
              playSound();
            }}
          >
            <Text style={styles.playButtonText}>🔊 다시 듣기</Text>
          </TouchableOpacity>
        )}

        {/* 선택지 */}
        {gameState === "answered" && !showFeedback && (
          <View style={styles.choicesContainer}>
            <Text style={styles.choicesTitle}>답을 선택하세요:</Text>
            {choices.map((instrument, index) => (
              <TouchableOpacity
                key={instrument}
                style={styles.choiceButton}
                onPress={() => handleAnswer(instrument)}
              >
                <Text style={styles.choiceButtonText}>
                  {DRUM_INFO[instrument].emoji} {DRUM_INFO[instrument].name}
                </Text>
                <Text style={styles.choiceDescription}>
                  {DRUM_INFO[instrument].description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 게임 리셋 버튼 */}
      <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
        <Text style={styles.resetButtonText}>게임 다시 시작</Text>
      </TouchableOpacity>

      {/* 개발자 정보 */}
      <View style={styles.devInfo}>
        <Text style={styles.devInfoText}>
          💡 현재는 테스트 모드입니다{"\\n"}
          assets/sounds/ 폴더에 실제 MP3 파일을 추가하세요
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  difficulty: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  scoreContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  percentageText: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  gameArea: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    minHeight: 300,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instrumentDisplay: {
    alignItems: "center",
    marginBottom: 30,
  },
  instrumentEmoji: {
    fontSize: 64,
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  playButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  playButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  playButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  choicesContainer: {
    marginTop: 20,
  },
  choicesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  choiceButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  choiceButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  choiceDescription: {
    color: "#E3F2FD",
    fontSize: 12,
    marginTop: 5,
  },
  resetButton: {
    backgroundColor: "#FF5722",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  devInfo: {
    backgroundColor: "#FFF3CD",
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FFC107",
  },
  devInfoText: {
    fontSize: 12,
    color: "#856404",
    textAlign: "center",
    lineHeight: 18,
  },
  feedbackContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    minHeight: 50,
  },
  feedbackText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "space-between",
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  switchBackground: {
    width: 50,
    height: 25,
    borderRadius: 12.5,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  switchHandle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  countdownContainer: {
    backgroundColor: "#FF9800",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  countdownText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  startButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  startButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TempDrumGame;