import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  Easing 
} from 'react-native-reanimated';

interface BurstAnimationProps {
  show: boolean;
  onComplete?: () => void;
  emoji?: string;
  duration?: number;
}

/**
 * 🎨 불꽃 애니메이션 컴포넌트
 * 
 * @param show - 애니메이션 표시 여부
 * @param onComplete - 애니메이션 완료 시 콜백
 * @param emoji - 표시할 이모지 (기본: 💥)
 * @param duration - 애니메이션 지속 시간 (기본: 800ms)
 */
export const BurstAnimation: React.FC<BurstAnimationProps> = ({ 
  show, 
  onComplete,
  emoji = '💥',
  duration = 800
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (show) {
      // 초기화
      scale.value = 0;
      opacity.value = 1;
      rotation.value = 0;
      
      // 스케일 애니메이션 (탄성 효과)
      scale.value = withSpring(1.2, {
        damping: 10,
        stiffness: 100,
      });
      
      // 투명도 애니메이션
      opacity.value = withTiming(0, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
      
      // 회전 애니메이션
      rotation.value = withTiming(360, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
      
      // 완료 콜백
      if (onComplete) {
        setTimeout(onComplete, duration);
      }
    }
  }, [show]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: opacity.value,
  }));

  if (!show) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Animated.Text style={styles.emoji}>{emoji}</Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 150,
  },
});

