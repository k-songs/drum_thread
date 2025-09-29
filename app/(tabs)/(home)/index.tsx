import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from "../../_layout";
import SideMenu from "@/components/SideMenu";
import { Ionicons } from "@expo/vector-icons";



export default function Index() {
  const router = useRouter();
  const pathname = usePathname();
  const insects = useSafeAreaInsets();
  const { user ,logout} = useContext(AuthContext);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const isLoggedIn = !!user

  const { width, height } = Dimensions.get("window");

  useEffect(() => {
    console.log(insects, "insets");
    console.log("너비", width, "높이", height);
  }, []);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insects.top, paddingBottom: insects.bottom },
      ]}
    >
      <BlurView style={styles.header} intensity={70}>


      {isLoggedIn && (
          <Pressable
            style={styles.menuButton}
            onPress={() => {
              setIsSideMenuOpen(true);
            }}
          >
            <Ionicons name="menu" size={24} color="black" />
          </Pressable>
        )}
        <SideMenu
          isVisible={isSideMenuOpen}
          onClose={() => setIsSideMenuOpen(false)}
        />
        <Image
          source={require("../../../assets/images/react-logo.png")}
          style={styles.headerLogo}
        />
         
 
    
        
      </BlurView>
      {!isLoggedIn && (
        <View style={styles.tabContainer}>
          <View style={styles.tab}>
            <Pressable onPress={() => router.push(`/`)}>
              <Text style={{ color: pathname === "/" ? "red" : "black" }}>
                For you
              </Text>
            </Pressable>
          </View>
          <View style={styles.tab}>
            <Pressable onPress={() => router.push(`/following`)}>
              <Text style={{ color: pathname === "/" ? "black" : "red" }}>
                Following
              </Text>
            </Pressable>
          </View>
        </View>
      )}
      <View>
        <Pressable onPress={() => router.push(`/@zerocho/post/1`)}>
          <Text>게시글1</Text>
        </Pressable>
      </View>
      <View>
        <Pressable onPress={() => router.push(`/@zerocho/post/2`)}>
          <Text>게시글2</Text>
        </Pressable>
      </View>
      <View>
        <Pressable onPress={() => router.push(`/@zerocho/post/3`)}>
          <Text>게시글3</Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
  },
  headerLogo: {
    width: 42, // DP, DIP
    height: 42,
  },
  loginButton: {
    position: "absolute",
    right: 20,
    top: 0,
    backgroundColor: "black",
    borderWidth: 1,
    borderColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  loginButtonText: {
    color: "white",
  },
  menuButton: {
    position: "absolute",
    left: 20,
    top: 10,
  },
});
