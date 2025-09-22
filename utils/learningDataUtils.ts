
import AsyncStorage from '@react-native-async-storage/async-storage';

const LEARNING_DATA_KEY = '@learning_data';

// 날짜 형식 변환 함수 (index.tsx와 동일하게 유지)
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const loadLearningData = async (): Promise<Record<string, boolean>> => {
  try {
    const jsonValue = await AsyncStorage.getItem(LEARNING_DATA_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    console.error('Failed to load learning data:', e);
    return {};
  }
};

export const saveLearningData = async (data: Record<string, boolean>) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(LEARNING_DATA_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save learning data:', e);
  }
};

export const injectDummyLearningData = async () => {
  console.log('Injecting dummy learning data...');

  const dummyLearnedDates: Record<string, boolean> = {};

  // 8월 데이터 (총 8일 학습)
  const augustLearningDays = [1, 5, 10, 15, 16, 20, 21, 22];
  augustLearningDays.forEach(day => {
    const date = new Date(2025, 7, day); // 8월 (월은 0부터 시작)
    dummyLearnedDates[formatDate(date)] = true;
  });

  // 9월 데이터 (현재 9월 16일 기준: 1, 2, 3일 학습 후 끊김, 14, 15, 16일 연속 학습)
  const septemberLearningDays = [1, 2, 3, 14, 15, 16];
  septemberLearningDays.forEach(day => {
    const date = new Date(2025, 8, day); // 9월 (월은 0부터 시작)
    dummyLearnedDates[formatDate(date)] = true;
  });

  try {
    await AsyncStorage.setItem(LEARNING_DATA_KEY, JSON.stringify(dummyLearnedDates));
    console.log('Dummy learning data injected successfully:', dummyLearnedDates);
  } catch (e) {
    console.error('Failed to inject dummy learning data:', e);
  }
};

export const clearLearningData = async () => {
  try {
    await AsyncStorage.removeItem(LEARNING_DATA_KEY);
    await AsyncStorage.removeItem('@dummy_dat-injected'); // 플래그도 함께 제거
    console.log('Learning data cleared successfully.');
  } catch (e) {
    console.error('Failed to clear learning data:', e);
  }
};
