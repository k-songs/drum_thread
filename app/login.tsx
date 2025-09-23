import { Redirect } from "expo-router";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function Login() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const onLogin = () => {
    fetch("/login", {
      method: "POST",
      body: JSON.stringify({
        username: "zerocho",
        password: "1234",
      }),
// app/login.tsx (21-29행 부근)

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
        setIsLoggedIn(true)
         router.replace("/(tabs)")
      })
      .catch((error) => {
        console.error("페칭,파싱에러 로그인", error);
        Alert.alert("네트워크 에러 로그인");
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
