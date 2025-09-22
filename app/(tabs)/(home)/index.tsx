import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();
  const pathname = usePathname();
  const insects = useSafeAreaInsets();
  const isLoggedIn = true;

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
        <Image
          source={require("../../../assets/images/react-logo.png")}
          style={styles.headerLogo}
        />

        {!isLoggedIn && (
          <TouchableOpacity
            onPress={() => router.navigate("/login")}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>로그인111</Text>
          </TouchableOpacity>
        )}
      </BlurView>
      {isLoggedIn && (
        <View style={styles.tabContainer}>
          <View style={styles.tab}>
            <TouchableOpacity onPress={() => router.push(`/`)}>
              <Text style={{ color: pathname === "/" ? "red" : "black" }}>
                For you
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tab}>
            <TouchableOpacity onPress={() => router.push(`/following`)}>
              <Text style={{ color: pathname === "/" ? "black" : "red" }}>
                Following
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View>
        <TouchableOpacity onPress={() => router.push(`/@zerocho/post/1`)}>
          <Text>게시글1</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => router.push(`/@zerocho/post/2`)}>
          <Text>게시글2</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => router.push(`/@zerocho/post/3`)}>
          <Text>게시글3</Text>
        </TouchableOpacity>
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
});
