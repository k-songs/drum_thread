import React from 'react';
import { View, StyleSheet } from 'react-native';
import Title from '../components/ui/Title';
import PrimaryButton from '../components/ui/PrimaryButton';
import Card from '../components/ui/Card';
import InstructionText from '../components/ui/InstructionText';

interface DifficultyScreenProps {
  onSelectDifficulty: (difficulty: number) => void;
}

function DifficultyScreen({ onSelectDifficulty }: DifficultyScreenProps) {
  return (
    <View style={styles.container}>
      <Title>난이도 선택</Title>
      
      <Card style={styles.card}>
        <InstructionText style={styles.instruction}>
          게임 난이도를 선택해주세요
        </InstructionText>
        
        <View style={styles.buttonContainer}>
          <PrimaryButton 
            onPress={() => onSelectDifficulty(2)}
            style={styles.button}
          >
            초급 (2가지 악기)
          </PrimaryButton>
          
          <PrimaryButton 
            onPress={() => onSelectDifficulty(4)}
            style={styles.button}
          >
            중급 (4가지 악기)
          </PrimaryButton>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    marginHorizontal: 20,
  },
});

export default DifficultyScreen;