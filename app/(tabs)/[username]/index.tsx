import { Text, View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Index() {
  const { username } = useLocalSearchParams();
  
  return (
    <View style={styles.tabBar}>
      <Text>{username}의 Threads</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
