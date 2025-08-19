import {
  type MaterialTopTabNavigationEventMap,
  type MaterialTopTabNavigationOptions,
  createMaterialTopTabNavigator,
} from "@react-navigation/material-top-tabs";
import { Slot, withLayoutContext } from "expo-router";
import type {
  ParamListBase,
  TabNavigationState,
} from "@react-navigation/native";
import { Pressable, View, Text,Image,StyleSheet } from "react-native";
import { useState,useEffect ,useContext} from "react";
import { AuthContext } from "@/app/_layout";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import SideMenu from "@/components/SideMenu";
import { BlurView } from "expo-blur";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import * as React from "react";
const { Navigator } = createMaterialTopTabNavigator();

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// 개발 중에만 사용
const clearAllData = async () => {
  await AsyncStorage.clear();
  await SecureStore.deleteItemAsync('accessToken').catch(() => {});
  await SecureStore.deleteItemAsync('refreshToken').catch(() => {});
};




export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user;

  
// 앱 시작 시 한 번 실행
useEffect(() => {
  clearAllData();
}, []);


  
  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {React.createElement(
        BlurView as any,
        { style: styles.header, intensity: 70 },
        <>
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
          {!isLoggedIn && (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => {
                console.log("loginButton onPress");
                router.navigate(`/login`);
              }}
            >
              <Text style={styles.loginButtonText}>로그인</Text>
            </TouchableOpacity>
          )}
        </>
      )}
      {isLoggedIn ? (
        <MaterialTopTabs
          screenOptions={{
            lazy: true,
            tabBarStyle: {
              backgroundColor: "white",
              boxShadow: "none",
              position: "relative",
            },
            tabBarPressColor: "transparent",
            tabBarActiveTintColor: "#555",
            tabBarIndicatorStyle: {
              backgroundColor: "black",
              height: 1,
            },
            tabBarIndicatorContainerStyle: {
              backgroundColor: "#aaa",
              position: "absolute",
              top: 49,
              height: 1,
            },
          }}
        >
          <MaterialTopTabs.Screen name="index" options={{ title: "For You" }} />
          <MaterialTopTabs.Screen
            name="following"
            options={{ title: "Following" }}
          />
        </MaterialTopTabs>
      ) : (
        <Slot />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  menuButton: {
    padding: 8,
    position: "absolute",
    left: 16,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  loginButton: {
    padding: 8,
    backgroundColor: "black",
    borderRadius: 4,
    position: "absolute",
    right: 16,
  },
  loginButtonText: {
    color: "white",
  },
});

