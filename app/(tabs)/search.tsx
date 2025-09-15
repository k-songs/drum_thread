
import {  Text, View, StyleSheet, TouchableOpacity, Alert, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState, useRef } from "react";

import TempDrumGame from '../../components/TempDrumGame'; // 경로 수정
import { DIFFICULTY_LEVELS } from '../../constants/drumSounds'; // 경로 수정
import DrumGameOverScreen from '../../screens/DrumGameOverScreen';
import { router } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient'; // LinearGradient import

export default function Search() {
  const insets = useSafeAreaInsets();


  const [currentDifficulty, setCurrentDifficulty] = useState<'beginner' | 'intermediate'>('beginner');
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalMaxScore, setFinalMaxScore] = useState(0);
  const [finalPercentage, setFinalPercentage] = useState(0);

  // 난이도 버튼 애니메이션을 위한 Animated.Value
  const beginnerScale = useRef(new Animated.Value(1)).current;
  const intermediateScale = useRef(new Animated.Value(1)).current;
 
  const animateButton = (scaleValue: Animated.Value, toValue: number) => {
    Animated.spring(scaleValue, {
      toValue,
      useNativeDriver: true,
      friction: 3, // 마찰력 (튀는 정도)
      tension: 40, // 장력 (속도)
    }).start();
  };
 
  const handleDifficultyPress = (difficulty: 'beginner' | 'intermediate') => {
    setCurrentDifficulty(difficulty);
    // 선택된 버튼만 애니메이션 적용
    if (difficulty === 'beginner') {
      animateButton(beginnerScale, 1.1);
      animateButton(intermediateScale, 1);
    } else {
      animateButton(intermediateScale, 1.1);
      animateButton(beginnerScale, 1);
    }
    handleRestartGame(); // 난이도 변경 시 게임 재시작
  };

  const handleGameComplete = (score: number, maxScore: number, percentage: number) => {
    setFinalScore(score);
    setFinalMaxScore(maxScore);
    setFinalPercentage(percentage);
    setIsGameOver(true);
  };

  const handleRestartGame = () => {
    setIsGameOver(false);
    setFinalScore(0);
    setFinalMaxScore(0);
    setFinalPercentage(0);
    // 게임 재시작 시 버튼 스케일 초기화
    animateButton(beginnerScale, 1);
    animateButton(intermediateScale, 1);
  };

  const handleGoHome = () => {
    router.navigate("/"); // 홈 화면으로 이동
    setIsGameOver(false);
    // 홈으로 이동 시 버튼 스케일 초기화
    animateButton(beginnerScale, 1);
    animateButton(intermediateScale, 1);
  };

  return (
    <LinearGradient
      colors={['#4CAF50', '#2196F3']} // 초록색에서 파란색 그라데이션
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🥁 드럼 게임 🎵</Text>
        
        {/* 난이도 선택 버튼 */}
        <View style={styles.difficultyContainer}>
          <TouchableOpacity
            onPress={() => handleDifficultyPress('beginner')}
            onPressIn={() => animateButton(beginnerScale, 1.05)} // 누르는 동안 살짝 커짐
            onPressOut={() => animateButton(beginnerScale, currentDifficulty === 'beginner' ? 1.1 : 1)} // 떼면 원래대로 또는 선택 상태 유지
          >
            <Animated.View
              style={[
                styles.difficultyButton,
                currentDifficulty === 'beginner' && styles.activeDifficulty,
                { transform: [{ scale: beginnerScale }] }
              ]}
            >
              <Text style={styles.difficultyText}>초급</Text>
            </Animated.View>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleDifficultyPress('intermediate')}
            onPressIn={() => animateButton(intermediateScale, 1.05)}
            onPressOut={() => animateButton(intermediateScale, currentDifficulty === 'intermediate' ? 1.1 : 1)}
          >
            <Animated.View
              style={[
                styles.difficultyButton,
                currentDifficulty === 'intermediate' && styles.activeDifficulty,
                { transform: [{ scale: intermediateScale }] }
              ]}
            >
              <Text style={styles.difficultyText}>중급</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {!isGameOver ? (
        <TempDrumGame
          difficulty={currentDifficulty}
          onGameComplete={handleGameComplete}
        />
      ) : (
        <DrumGameOverScreen
          score={finalScore}
          maxScore={finalMaxScore}
          onRestart={handleRestartGame}
          onGoHome={handleGoHome}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // 반투명 흰색 헤더
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 10,
    borderRadius: 15,
    marginHorizontal: 15,
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    width: '100%',
  },
  difficultyButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // 반투명 버튼
    borderColor: 'white',
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDifficulty: {
    backgroundColor: 'white', // 선택 시 불투명 흰색
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  difficultyText: {
    color: '#333', // 선택 안 됐을 때는 어두운 색
    fontWeight: 'bold',
    fontSize: 16,
  },
});
