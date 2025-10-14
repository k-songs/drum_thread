import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withSequence
} from 'react-native-reanimated';

type JudgementType = 'Perfect' | 'Good' | 'Miss';

interface JudgementAnimationProps {
  judgement: JudgementType | null;
  duration?: number;
}

/**
 * 🎨 판정 텍스트 애니메이션 컴포넌트
 * 
 * @param judgement - 판정 타입 (Perfect, Good, Miss)
 * @param duration - 애니메이션 지속 시간 (기본: 1000ms)
 */
export const JudgementAnimation: React.FC<JudgementAnimationProps> = ({ 
  judgement,
  duration = 1000
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (judgement) {
      scale.value = 0;
      opacity.value = 1;
      
      // 탄성 효과가 있는 스케일 애니메이션
      scale.value = withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(1.0, { damping: 10 })
      );
      
      // 페이드아웃
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 });
      }, duration - 300);
    }
  }, [judgement]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!judgement) return null;

  const textColor = 
    judgement === 'Perfect' ? '#FFD700' : 
    judgement === 'Good' ? '#4A90E2' : 
    '#999';

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={[styles.text, { color: textColor }]}>
        {judgement}!
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
  },
  text: {
    fontSize: 36,
    fontWeight: 'bold',
  },
});

