import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { GameResult } from '@/types/game';
import { getCurrentLevelInfo } from '@/types/avatar';

interface GameResultModalProps {
  visible: boolean;
  result: GameResult;
  onContinue: () => void;
  onFinish: () => void;
  canContinue: boolean; // 최대 세트 수 체크
  currentSet: number;
  maxSets: number;
  totalPerfects?: number; // 전체 누적 Perfect 횟수 (옵션)
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  visible,
  result,
  onContinue,
  onFinish,
  canContinue,
  currentSet,
  maxSets,
  totalPerfects,
}) => {
  const accuracy = result.totalQuestions > 0
    ? ((result.perfectCount + result.goodCount) / result.totalQuestions * 100).toFixed(1)
    : 0;

  const getGrade = (acc: number): string => {
    if (acc >= 90) return 'S';
    if (acc >= 80) return 'A';
    if (acc >= 70) return 'B';
    if (acc >= 60) return 'C';
    return 'D';
  };

  const grade = getGrade(Number(accuracy));
  
  // 🎭 아바타 레벨 정보 (옵션)
  const currentLevelInfo = totalPerfects !== undefined 
    ? getCurrentLevelInfo(totalPerfects) 
    : null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.resultContainer}>
          <ScrollView style={styles.scrollContent}>
            {/* 헤더 */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>🎉 훈련 결과</Text>
              <Text style={styles.setInfo}>
                세트 {currentSet} / {maxSets} 완료
              </Text>
            </View>

            {/* 등급 */}
            <View style={styles.gradeSection}>
              <Text style={styles.gradeLabel}>종합 등급</Text>
              <Text 
                style={[
                  styles.gradeText, 
                  styles[`grade${grade}` as keyof typeof styles]
                ]}
              >
                {grade}
              </Text>
              <Text style={styles.accuracyText}>정확도: {accuracy}%</Text>
            </View>

            {/* 통계 카드 */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📊</Text>
                <Text style={styles.statLabel}>총 문항</Text>
                <Text style={styles.statValue}>{result.totalQuestions}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🎯</Text>
                <Text style={styles.statLabel}>총 점수</Text>
                <Text style={styles.statValue}>{result.totalScore}</Text>
              </View>
            </View>

            {/* 판정 분석 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📈 판정 분석</Text>
              <View style={styles.judgementStats}>
                <View style={styles.judgementRow}>
                  <View style={styles.judgementLabel}>
                    <View style={[styles.dot, styles.perfectDot]} />
                    <Text style={styles.judgementText}>Perfect</Text>
                  </View>
                  <Text style={styles.judgementCount}>{result.perfectCount}회</Text>
                  <Text style={styles.judgementPercent}>
                    {result.totalQuestions > 0
                      ? ((result.perfectCount / result.totalQuestions) * 100).toFixed(0)
                      : 0}%
                  </Text>
                </View>
                <View style={styles.judgementRow}>
                  <View style={styles.judgementLabel}>
                    <View style={[styles.dot, styles.goodDot]} />
                    <Text style={styles.judgementText}>Good</Text>
                  </View>
                  <Text style={styles.judgementCount}>{result.goodCount}회</Text>
                  <Text style={styles.judgementPercent}>
                    {result.totalQuestions > 0
                      ? ((result.goodCount / result.totalQuestions) * 100).toFixed(0)
                      : 0}%
                  </Text>
                </View>
                <View style={styles.judgementRow}>
                  <View style={styles.judgementLabel}>
                    <View style={[styles.dot, styles.missDot]} />
                    <Text style={styles.judgementText}>Miss</Text>
                  </View>
                  <Text style={styles.judgementCount}>{result.missCount}회</Text>
                  <Text style={styles.judgementPercent}>
                    {result.totalQuestions > 0
                      ? ((result.missCount / result.totalQuestions) * 100).toFixed(0)
                      : 0}%
                  </Text>
                </View>
              </View>
            </View>

            {/* 추가 정보 */}
            <View style={styles.additionalInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>최대 콤보</Text>
                <Text style={styles.infoValue}>{result.maxCombo}회</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>평균 반응 시간</Text>
                <Text style={styles.infoValue}>{result.averageReactionTime.toFixed(0)}ms</Text>
              </View>
            </View>

            {/* 🎭 아바타 레벨 정보 */}
            {currentLevelInfo && (
              <View style={styles.avatarInfoBox}>
                <Text style={styles.avatarInfoTitle}>🎭 현재 청능 레벨</Text>
                <View style={styles.avatarInfoContent}>
                  <Text style={styles.avatarEmoji}>{currentLevelInfo.emoji}</Text>
                  <View style={styles.avatarTextContainer}>
                    <Text style={styles.avatarLevelBadge}>Lv.{currentLevelInfo.level}</Text>
                    <Text style={styles.avatarName}>{currentLevelInfo.name}</Text>
                    <Text style={styles.avatarDesc}>{currentLevelInfo.description}</Text>
                    <Text style={styles.avatarTotalPerfects}>
                      누적 Perfect: {totalPerfects}회
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* 피드백 메시지 */}
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackText}>
                {grade === 'S' && '🌟 완벽합니다! 훌륭한 청능 훈련 결과입니다!'}
                {grade === 'A' && '👍 매우 잘하셨습니다! 조금만 더 연습하면 완벽해요!'}
                {grade === 'B' && '💪 좋아요! 꾸준히 연습하면 더 좋아질 거예요!'}
                {grade === 'C' && '📈 괜찮아요! 계속 훈련하면 실력이 향상될 거예요!'}
                {grade === 'D' && '🎯 포기하지 마세요! 연습하면 반드시 좋아집니다!'}
              </Text>
            </View>
          </ScrollView>

          {/* 버튼 영역 */}
          <View style={styles.buttonContainer}>
            {canContinue ? (
              <>
                <TouchableOpacity style={styles.finishButton} onPress={onFinish}>
                  <Text style={styles.finishButtonText}>종료</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
                  <Text style={styles.continueButtonText}>계속하기</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.fullButton} onPress={onFinish}>
                <Text style={styles.fullButtonText}>완료</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 20,
    maxHeight: '85%',
    elevation: 5,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  setInfo: {
    fontSize: 16,
    color: '#666',
  },
  gradeSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    marginBottom: 20,
  },
  gradeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  gradeText: {
    fontSize: 72,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  gradeS: { color: '#FFD700' },
  gradeA: { color: '#4A90E2' },
  gradeB: { color: '#50C878' },
  gradeC: { color: '#FF9500' },
  gradeD: { color: '#999' },
  accuracyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  judgementStats: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
  },
  judgementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  judgementLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  perfectDot: { backgroundColor: '#FFD700' },
  goodDot: { backgroundColor: '#4A90E2' },
  missDot: { backgroundColor: '#999' },
  judgementText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  judgementCount: {
    fontSize: 16,
    color: '#666',
    marginRight: 15,
  },
  judgementPercent: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: 'bold',
    width: 50,
    textAlign: 'right',
  },
  additionalInfo: {
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  feedbackBox: {
    backgroundColor: '#FFF8DC',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  feedbackText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  finishButton: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  continueButton: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  fullButton: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  fullButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  avatarInfoBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  avatarInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  avatarInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  avatarEmoji: {
    fontSize: 60,
  },
  avatarTextContainer: {
    flex: 1,
  },
  avatarLevelBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  avatarName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  avatarDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  avatarTotalPerfects: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
  },
});

