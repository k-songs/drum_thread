import { Redirect, router } from "expo-router";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useEffect} from "react";
import {AuthContext} from "./_layout";
import {useContext} from "react";


export default function Login() {

  const insets = useSafeAreaInsets();
  const { user ,login} = useContext(AuthContext);
  const isLoggedIn = !!user;

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
    width: 100,
    alignItems: "flex-start",
  },
  loginButtonText: {
    color: "white",
  },
});