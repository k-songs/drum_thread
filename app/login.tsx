import { Background } from "@react-navigation/elements";
import { Redirect, router } from "expo-router";
import { View, Text, Pressable, StyleSheet ,Alert} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function Login() {
  const insets = useSafeAreaInsets();

  const isLoggedIn = false;

  const onLogin = () => {
    fetch("/login", {
      method: "POST",
      body: JSON.stringify({
        username: "zerocho",
        password: "1234",
      }),
    }) .then((res)=>{
        console.log("res",res,res.status)
        if(res.status >=400){
            return Alert.alert("Error","Invalid credentials")
        }
        return res.json()
    })
   
    .then((data) => {
        console.log("data",data)
    })
    .catch((error)=>{
        console.error("페칭에러 파싱에러",error)
        Alert.alert("네트워크")
    })
  };
  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={{ paddingTop: insets.top }}>
      <Pressable onPress={() => router.back()} style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Back</Text>
      </Pressable>

      <Pressable onPress={onLogin} style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Login 1</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  loginButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    width: 70,
  },
  loginButtonText: {
    color: "white",
  },
});
