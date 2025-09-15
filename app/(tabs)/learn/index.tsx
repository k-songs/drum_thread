import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LearnIndex() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>학습 카테고리</Text>
        <Text style={styles.description}>
          여기에서 다양한 학습 콘텐츠를 확인하실 수 있습니다.
        </Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📚 기초 학습</Text>
          <Text style={styles.cardContent}>
            기본적인 개념부터 차근차근 학습해보세요.
          </Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚀 심화 과정</Text>
          <Text style={styles.cardContent}>
            더 깊이 있는 내용을 탐구해보세요.
          </Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 실습 프로젝트</Text>
          <Text style={styles.cardContent}>
            실제 프로젝트를 통해 경험을 쌓아보세요.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 