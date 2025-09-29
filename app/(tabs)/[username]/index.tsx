import {
  Text,
  View,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import SideMenu from "@/components/SideMenu";
import { useContext ,useState} from "react";
import { AuthContext } from "../../_layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";


export default function Index() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const { user } = useContext(AuthContext);   
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const isLoggedIn = !!user;
  
  return (
    <View
    style={[
      styles.container,
      { paddingTop: insets.top, paddingBottom: insets.bottom },
    ]}
  >
 
      <View style={styles.header}>
{isLoggedIn && (
        <Pressable
        style={styles.menuButton}
        onPress={() => {
        setIsSideMenuOpen(true)
        }}
        >

        
        <Ionicons name="menu" size={24} color="black" />
        </Pressable>
        )}
      <SideMenu
        isVisible={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
      />
      </View>
   
      <View style={styles.profile}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: user?.profileImageUrl }}
            style={styles.profileAvatar}
          />
          <Text>{user?.name}</Text>
          <Text>{user?.id}</Text>
          <Text>{user?.description}</Text>
        </View>
      </View>
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => router.push(`/${username}`)}>
          <Text>Threads</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => router.push(`/${username}/replies`)}>
          <Text>replies</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => router.push(`/${username}/reposts`)}>
          <Text>Remote</Text>
        </TouchableOpacity>
      </View>
    </View>
  
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 50,
  },

  menuButton: {
    position: "absolute",
    left: 20,
    top: 10,
  },

  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  profile: {
  
  },
  profileHeader: {

  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});



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
