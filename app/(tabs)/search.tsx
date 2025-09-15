
import {  Text, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useContext, useState } from "react";

import {
  TouchableOpacity,
  Alert,

} from 'react-native';
import TempDrumGame from '../../components/TempDrumGame'; // 경로 수정
import { DIFFICULTY_LEVELS } from '../../constants/drumSounds'; // 경로 수정

export default function Search() {
  const insets = useSafeAreaInsets();


  const [currentDifficulty, setCurrentDifficulty] = useState('beginner');

  const handleGameComplete = (score: number, maxScore: number, percentage: number) => {
    Alert.alert(
      '게임 완료!',
      `점수: ${score}/${maxScore} (${percentage}%)`,
      [
        { text: '다시 하기', onPress: () => setCurrentDifficulty(currentDifficulty) },
        { text: '확인' }
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>드럼 게임</Text>
        
        {/* 난이도 선택 버튼 */}
        <View style={styles.difficultyContainer}>
          <TouchableOpacity
            style={[
              styles.difficultyButton,
              currentDifficulty === 'beginner' && styles.activeDifficulty
            ]}
            onPress={() => setCurrentDifficulty('beginner')}
          >
            <Text style={styles.difficultyText}>초급</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.difficultyButton,
              currentDifficulty === 'intermediate' && styles.activeDifficulty
            ]}
            onPress={() => setCurrentDifficulty('intermediate')}
          >
            <Text style={styles.difficultyText}>중급</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 드럼 게임 컴포넌트 */}
      <TempDrumGame
        difficulty={currentDifficulty}
        onGameComplete={handleGameComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  difficultyButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  activeDifficulty: {
    backgroundColor: '#4CAF50',
  },
  difficultyText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
