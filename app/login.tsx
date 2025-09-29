/* import { Redirect, useRouter} from "expo-router";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useContext } from "react";
import {AuthContext} from "./_layout";



  export default function Login() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, login } = useContext(AuthContext);
    const isLoggedIn = !!user;
  
    if (isLoggedIn) {
      return <Redirect href="/(tabs)" />;
    }

  return (
    <View style={{ paddingTop: insets.top }}>
      <Pressable onPress={() => router.back()}>
        <Text>Back</Text>
      </Pressable>

      <Pressable onPress={login} style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Login mock</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  loginButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    width: 200,
    alignItems: "flex-start",
  },
  loginButtonText: {
    color: "white",
  },
});
 */

import { Redirect, router } from "expo-router";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useEffect} from "react";

export default function Login() {

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const checkAsyncStorage = async () => {
    try {
    const myValue = await AsyncStorage.getItem("user");
    console.log("AsyncStorage 'user' 값:", myValue);
    // 여기서 원하는 로직을 추가하여 myValue를 사용합니다.
    } catch (error) {
    console.error("AsyncStorage에서 'user'를 읽는 중 오류 발생:", error);
    }
    };
    checkAsyncStorage();
    }, []);
  const isLoggedIn = false;

  const onLogin = () => {
    fetch("/login", {
      method: "POST",
      body: JSON.stringify({
        username: "zerocho",
        password: "1234",
      }),


    })
      .then(async (res) => { // <--- 여기에 async 키워드를 추가해주세요!
        console.log("res", res, res.status);
        if (res.status >= 400) {
            // 먼저 사용자에게 알림을 띄웁니다. (return 제거)
            Alert.alert("Error", "Invalid 로그인");
            // 그 후 응답 본문을 파싱하여 에러 객체를 생성하고 던집니다. (await 추가)
            const errorData = await res.json(); // <--- res.json() 앞에 await을 추가해주세요.
            throw new Error(errorData.message || "로그인 실패"); // <--- 이 코드는 throw로 에러를 던집니다.
        }
        return res.json();
      })

// ... existing code ...

      .then((data) => {
        console.log("data1", data);
        return Promise.all([
        SecureStore.setItemAsync("accessToken", data.accessToken),
        SecureStore.setItemAsync("refreshToken", data.refreshToken),
        AsyncStorage.setItem("user", JSON.stringify(data.user)),
        ])
      })
      .then(() => {
        router.push("/(tabs)")
      })
      .catch((error) => {
        console.error("페칭,파싱에러 로그인", error);
     
      });
  };
  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={{ paddingTop: insets.top }}>
      <Pressable onPress={() => router.back()}>
        <Text>Back</Text>
      </Pressable>

      <Pressable onPress={onLogin} style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Login mock</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  loginButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    width: 100,
    alignItems: "flex-start",
  },
  loginButtonText: {
    color: "white",
  },
});