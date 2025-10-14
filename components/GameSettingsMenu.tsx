import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { DifficultyLevel, QuestionCount, QUESTION_COUNT_OPTIONS } from '@/types/game';

interface GameSettingsMenuProps {
  visible: boolean;
  onClose: () => void;
  currentSettings: {
    questionCount: QuestionCount;
    difficulty: DifficultyLevel;
  };
  onSettingsChange: (settings: { questionCount: QuestionCount; difficulty: DifficultyLevel }) => void;
}

export const GameSettingsMenu: React.FC<GameSettingsMenuProps> = ({
  visible,
  onClose,
  currentSettings,
  onSettingsChange,
}) => {
  const [tempQuestionCount, setTempQuestionCount] = React.useState(currentSettings.questionCount);
  const [tempDifficulty, setTempDifficulty] = React.useState(currentSettings.difficulty);

  const handleSave = () => {
    onSettingsChange({
      questionCount: tempQuestionCount,
      difficulty: tempDifficulty,
    });
    onClose();
  };

  const getDifficultyLabel = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'normal': return '보통 (기본)';
      case 'hard': return '어려움';
    }
  };

  const getDifficultyDescription = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy': return '판정 시간이 관대합니다 (초보자 추천)';
      case 'normal': return '적당한 난이도입니다';
      case 'hard': return '까다로운 판정 + 백색소음 (고급)';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.menuContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>⚙️ 게임 설정</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* 문항 수 설정 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 문항 수</Text>
              <Text style={styles.sectionDescription}>
                한 세트당 문항 수를 선택하세요 (최대 3세트까지 가능)
              </Text>
              <View style={styles.optionGroup}>
                {QUESTION_COUNT_OPTIONS.map((count) => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.optionButton,
                      tempQuestionCount === count && styles.optionButtonActive,
                    ]}
                    onPress={() => setTempQuestionCount(count)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        tempQuestionCount === count && styles.optionButtonTextActive,
                      ]}
                    >
                      {count}문항 {count === 10 && '(기본)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 난이도 설정 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 난이도</Text>
              <Text style={styles.sectionDescription}>
                훈련 난이도를 선택하세요
              </Text>
              <View style={styles.difficultyGroup}>
                {(['easy', 'normal', 'hard'] as DifficultyLevel[]).map((difficulty) => (
                  <TouchableOpacity
                    key={difficulty}
                    style={[
                      styles.difficultyCard,
                      tempDifficulty === difficulty && styles.difficultyCardActive,
                    ]}
                    onPress={() => setTempDifficulty(difficulty)}
                  >
                    <Text
                      style={[
                        styles.difficultyTitle,
                        tempDifficulty === difficulty && styles.difficultyTitleActive,
                      ]}
                    >
                      {getDifficultyLabel(difficulty)}
                    </Text>
                    <Text style={styles.difficultyDescription}>
                      {getDifficultyDescription(difficulty)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 정보 */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>ℹ️ 안내</Text>
              <Text style={styles.infoText}>
                • 10문항 완료 후 계속 여부를 선택할 수 있습니다{'\n'}
                • 최대 3세트(30문항)까지 연속으로 진행 가능합니다{'\n'}
                • 각 세트 종료 시 결과를 확인할 수 있습니다
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>저장</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 20,
    maxHeight: '80%',
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  optionGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  optionButtonActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#EBF5FF',
  },
  optionButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  optionButtonTextActive: {
    color: '#4A90E2',
  },
  difficultyGroup: {
    gap: 10,
  },
  difficultyCard: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  difficultyCardActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#EBF5FF',
  },
  difficultyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  difficultyTitleActive: {
    color: '#4A90E2',
  },
  difficultyDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
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
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

