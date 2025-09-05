import { Redirect, router } from "expo-router";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthContext } from "./_layout";
import { useContext } from "react";
import * as SecureStore from "expo-secure-store"
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const insets = useSafeAreaInsets();
  const { user, login } = useContext(AuthContext);
  const isLoggedIn = !!user;


   const onLogin =()=>{
    console.log("login")
    fetch(
      "/login",{
        method:"POST",
        body:JSON.stringify({
          username:"zerocho",
          password:"1234"
        })
      }
    )
    .then((res)=>{
      console.log("res",res.status)
      if(res.status >=400){
        return Alert.alert("Error","Invalid credentials")
      }
      return res.json()
    })
    .then((data)=>{
      console.log("data",data)
      SecureStore.setItemAsync("accessToken",data.accessToken)
      SecureStore.setItemAsync("refreshToken",data.refreshToken)
      AsyncStorage.setItem("user",JSON.stringify(data.user))
    })
    .then(()=>{
      router.push("/(tabs)")
    })
    .catch((error)=>{
      console.error(error)
    })
   }


  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }
  return (
    <View style={{ paddingTop: insets.top }}>
      <Pressable onPress={() => router.back()}>
        <Text>Back</Text>
      </Pressable>
      <Pressable style={styles.loginButton} onPress={login}>
        <Text style={styles.loginButtonText}>Login</Text>
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
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
  },
});
