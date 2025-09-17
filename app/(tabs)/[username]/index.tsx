import { Text, View, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {useState} from "react"
import SideMenu from "@/components/SideMenu";
 export default function Index() {
  const router = useRouter
  const { username } = useLocalSearchParams();
  const insets =useSafeAreaInsets()     
  const [isSideMenuOpen,setIsSideMenuOpen]= useState(false)




  return (
    
  <View style={[styles.container,{paddingTop:insets.top}]}>
    <View style={styles.header}>
      <Pressable>
        
      </Pressable>
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
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
