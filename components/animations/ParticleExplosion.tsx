import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withDelay,
  Easing
} from 'react-native-reanimated';

interface ParticleExplosionProps {
  show: boolean;
  onComplete?: () => void;
  particleCount?: number;
  colors?: string[];
  duration?: number;
  centerX?: number;
  centerY?: number;
}

/**
 * 🎆 입자 폭발 애니메이션 컴포넌트 (단순화 버전)
 * Perfect 판정 시 화려한 입자 효과를 제공합니다.
 */
export const ParticleExplosion: React.FC<ParticleExplosionProps> = ({ 
  show, 
  onComplete,
  particleCount = 8,
  colors = ['#FFD700', '#FF6B6B', '#4A90E2', '#9B59B6'],
  duration = 1000,
  centerX = 0,
  centerY = 0
}) => {
  // 고정된 8개의 입자만 사용 (Hooks 안정성을 위해)
  const scale1 = useSharedValue(0);
  const opacity1 = useSharedValue(0);
  const translateX1 = useSharedValue(0);
  const translateY1 = useSharedValue(0);
  
  const scale2 = useSharedValue(0);
  const opacity2 = useSharedValue(0);
  const translateX2 = useSharedValue(0);
  const translateY2 = useSharedValue(0);
  
  const scale3 = useSharedValue(0);
  const opacity3 = useSharedValue(0);
  const translateX3 = useSharedValue(0);
  const translateY3 = useSharedValue(0);
  
  const scale4 = useSharedValue(0);
  const opacity4 = useSharedValue(0);
  const translateX4 = useSharedValue(0);
  const translateY4 = useSharedValue(0);
  
  const scale5 = useSharedValue(0);
  const opacity5 = useSharedValue(0);
  const translateX5 = useSharedValue(0);
  const translateY5 = useSharedValue(0);
  
  const scale6 = useSharedValue(0);
  const opacity6 = useSharedValue(0);
  const translateX6 = useSharedValue(0);
  const translateY6 = useSharedValue(0);
  
  const scale7 = useSharedValue(0);
  const opacity7 = useSharedValue(0);
  const translateX7 = useSharedValue(0);
  const translateY7 = useSharedValue(0);
  
  const scale8 = useSharedValue(0);
  const opacity8 = useSharedValue(0);
  const translateX8 = useSharedValue(0);
  const translateY8 = useSharedValue(0);

  // 중앙 폭발 효과
  const centerScale = useSharedValue(0);
  const centerOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (show) {
      // 모든 입자 초기화
      const particles = [
        { scale: scale1, opacity: opacity1, translateX: translateX1, translateY: translateY1 },
        { scale: scale2, opacity: opacity2, translateX: translateX2, translateY: translateY2 },
        { scale: scale3, opacity: opacity3, translateX: translateX3, translateY: translateY3 },
        { scale: scale4, opacity: opacity4, translateX: translateX4, translateY: translateY4 },
        { scale: scale5, opacity: opacity5, translateX: translateX5, translateY: translateY5 },
        { scale: scale6, opacity: opacity6, translateX: translateX6, translateY: translateY6 },
        { scale: scale7, opacity: opacity7, translateX: translateX7, translateY: translateY7 },
        { scale: scale8, opacity: opacity8, translateX: translateX8, translateY: translateY8 },
      ];

      particles.forEach((particle, index) => {
        const angle = (360 / 8) * index;
        const distance = 60 + Math.random() * 30;
        const delay = Math.random() * 200;

        // 초기화
        particle.scale.value = 0;
        particle.opacity.value = 1;
        particle.translateX.value = 0;
        particle.translateY.value = 0;

        // 애니메이션
        const endX = Math.cos((angle * Math.PI) / 180) * distance;
        const endY = Math.sin((angle * Math.PI) / 180) * distance;

        particle.translateX.value = withDelay(
          delay,
          withSpring(endX, { damping: 15, stiffness: 100 })
        );

        particle.translateY.value = withDelay(
          delay,
          withSpring(endY, { damping: 15, stiffness: 100 })
        );

        particle.scale.value = withDelay(
          delay,
          withTiming(1, { duration: 200 })
        );

        particle.opacity.value = withDelay(
          delay + 300,
          withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
        );
      });

      // 중앙 폭발 효과
      centerScale.value = 0;
      centerOpacity.value = 1;
      
      centerScale.value = withSpring(1.5, { damping: 8 });
      centerOpacity.value = withTiming(0, { 
        duration: 800, 
        easing: Easing.out(Easing.cubic) 
      });

      // 완료 콜백
      if (onComplete) {
        setTimeout(onComplete, duration);
      }
    }
  }, [show]);

  // 애니메이션 스타일들
  const particle1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX1.value },
      { translateY: translateY1.value },
      { scale: scale1.value }
    ],
    opacity: opacity1.value,
  }));

  const particle2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX2.value },
      { translateY: translateY2.value },
      { scale: scale2.value }
    ],
    opacity: opacity2.value,
  }));

  const particle3Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX3.value },
      { translateY: translateY3.value },
      { scale: scale3.value }
    ],
    opacity: opacity3.value,
  }));

  const particle4Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX4.value },
      { translateY: translateY4.value },
      { scale: scale4.value }
    ],
    opacity: opacity4.value,
  }));

  const particle5Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX5.value },
      { translateY: translateY5.value },
      { scale: scale5.value }
    ],
    opacity: opacity5.value,
  }));

  const particle6Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX6.value },
      { translateY: translateY6.value },
      { scale: scale6.value }
    ],
    opacity: opacity6.value,
  }));

  const particle7Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX7.value },
      { translateY: translateY7.value },
      { scale: scale7.value }
    ],
    opacity: opacity7.value,
  }));

  const particle8Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX8.value },
      { translateY: translateY8.value },
      { scale: scale8.value }
    ],
    opacity: opacity8.value,
  }));

  const centerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: centerScale.value }],
    opacity: centerOpacity.value,
  }));

  if (!show) return null;

  return (
    <View style={[styles.container, { left: centerX, top: centerY }]}>
      {/* 고정된 8개 입자 */}
      <Animated.View style={[styles.particle, { backgroundColor: colors[0] }, particle1Style]} />
      <Animated.View style={[styles.particle, { backgroundColor: colors[1] }, particle2Style]} />
      <Animated.View style={[styles.particle, { backgroundColor: colors[2] }, particle3Style]} />
      <Animated.View style={[styles.particle, { backgroundColor: colors[3] }, particle4Style]} />
      <Animated.View style={[styles.particle, { backgroundColor: colors[0] }, particle5Style]} />
      <Animated.View style={[styles.particle, { backgroundColor: colors[1] }, particle6Style]} />
      <Animated.View style={[styles.particle, { backgroundColor: colors[2] }, particle7Style]} />
      <Animated.View style={[styles.particle, { backgroundColor: colors[3] }, particle8Style]} />
      
      {/* 중앙 폭발 효과 */}
      <Animated.View style={[styles.centerBurst, centerStyle]}>
        <Animated.Text style={styles.centerEmoji}>✨</Animated.Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  centerBurst: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerEmoji: {
    fontSize: 40,
    textAlign: 'center',
  },
});