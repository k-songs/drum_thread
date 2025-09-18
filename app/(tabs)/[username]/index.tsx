import {
  Text,
  View,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const { username } = useLocalSearchParams();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View>
        <TouchableOpacity onPress={() => router.push(`/${username}`)}>
          <Text>Threads</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => router.push(`/${username}/replies`)}>
          <Text>replies</Text>
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity onPress={() => router.push(`/${username}/reposts`)}>
          <Text>Remote</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}





/* import { Text, View, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {useState} from "react"
import SideMenu from "@/components/SideMenu";
 export default function Index() {
  const router = useRouter(); // 훅 호출
  const { username } = useLocalSearchParams();
  const usernameString = typeof username === 'string' ? username : ''; // 타입 단언 또는 기본값 설정
  const insets =useSafeAreaInsets()     
  const [isSideMenuOpen,setIsSideMenuOpen]= useState(false)




  return (
    
  <View style={[styles.container,{paddingTop:insets.top}]}>
    <View style={styles.header}>
      <Pressable>
        
      </Pressable>
      <View style={styles.profile}>
          <View style={styles.profileHeader}></View>
          <Text>

          </Text>
      </View>
    <View style={styles.tabBar}>
      <Text>{username}의 Threads</Text>
    </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{

  },
  header:{

  },
  profileHeader:{

  },
  profile:{
    
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
 */
