import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AvatarLevel } from '@/types/avatar';

interface AvatarDisplayProps {
  avatarInfo: AvatarLevel;
  progress: number;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
}

/**
 * 🎭 아바타 표시 컴포넌트
 * 
 * Lottie 파일 적용 시:
 * 1. react-native-lottie 설치
 * 2. emoji 대신 Lottie 애니메이션으로 교체
 * 3. stage별로 다른 Lottie 파일 매핑
 */
export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatarInfo,
  progress,
  size = 'medium',
  showProgress = true,
}) => {
  const sizeStyles = {
    small: { emoji: 40, container: 60 },
    medium: { emoji: 80, container: 100 },
    large: { emoji: 120, container: 150 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={styles.container}>
      {/* 아바타 아이콘 영역 - Lottie로 교체 예정 */}
      <View 
        style={[
          styles.avatarContainer,
          { 
            width: currentSize.container,
            height: currentSize.container,
            backgroundColor: `${avatarInfo.color}20`,
            borderColor: avatarInfo.color,
          }
        ]}
      >
        {/* TODO: Lottie 애니메이션으로 교체
        <LottieView
          source={require(`../assets/lottie/${avatarInfo.stage}.json`)}
          autoPlay
          loop
          style={{ width: currentSize.container, height: currentSize.container }}
        />
        */}
        <Text style={{ fontSize: currentSize.emoji }}>
          {avatarInfo.emoji}
        </Text>
      </View>

      {/* 레벨 뱃지 */}
      <View style={[styles.levelBadge, { backgroundColor: avatarInfo.color }]}>
        <Text style={styles.levelText}>Lv.{avatarInfo.level}</Text>
      </View>

      {/* 진행률 바 */}
      {showProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progress}%`,
                  backgroundColor: avatarInfo.color,
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
        </View>
      )}

      {/* 아바타 이름 */}
      <Text style={styles.avatarName}>{avatarInfo.name}</Text>
      <Text style={styles.avatarDesc}>{avatarInfo.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarContainer: {
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    position: 'relative',
  },
  levelBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    elevation: 3,
  },
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    width: '100%',
    marginTop: 15,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  avatarName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  avatarDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
});

