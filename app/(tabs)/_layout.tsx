import { Ionicons } from "@expo/vector-icons";
import { type BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Tabs, useRouter } from "expo-router";
import { useContext, useRef, useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Pressable,
  useColorScheme,
} from "react-native";
import { AuthContext } from "../_layout";

const AnimatedTabBarButton = ({
  children,
  onPress,
  style,
  ...restProps
}: BottomTabBarButtonProps) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressOut = () => {
    Animated.sequence([
      Animated.spring(scaleValue, {
        toValue: 1.2,
        useNativeDriver: true,
        speed: 200,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 200,
      }),
    ]).start();
  };

  // ref를 restProps에서 제외하여 Pressable에 전달하지 않음
  const { ref, ...filteredRestProps } = restProps as any;

  return (
    <Pressable
      {...filteredRestProps}
      onPress={onPress}
      onPressOut={handlePressOut}
      style={[
        { flex: 1, justifyContent: "center", alignItems: "center" },
        style,
      ]}
      android_ripple={{ borderless: false, radius: 0 }}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function TabLayout() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user;
  const colorScheme = useColorScheme();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const toLoginPage = () => {
    setIsLoginModalOpen(false);
    router.push("/login");
  };

  return (
    <>
      <Tabs
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colorScheme === "dark" ? "#101010" : "white",
            borderTopWidth: 0,
          },
          tabBarButton: (props) => <AnimatedTabBarButton {...props} />,
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="home"
                size={24}
                color={
                  focused
                    ? colorScheme === "dark"
                      ? "white"
                      : "black"
                    : "gray"
                }
              />
            ),
          }}
        />{/* 
        <Tabs.Screen
          name="search"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="search"
                size={24}
                color={
                  focused
                    ? colorScheme === "dark"
                      ? "white"
                      : "black"
                    : "gray"
                }
              />
            ),
          }}
        /> */}
        <Tabs.Screen
          name="search"
          options={{
            tabBarLabel: () => null,
            // size를 인자로 받아야 합니다.
            tabBarIcon: ({ focused, size }) => {
              // 1. 활성화된 아이콘의 최종 색상을 결정합니다.
              const iconColor = focused
                ? colorScheme === "dark"
                  ? "white"
                  : "black"
                : "gray";

              // 2. ★ 애니메이션 값 설정 (useRef 사용)
              // 초기 투명도(opacity) 값을 0으로 설정합니다.
              const glowOpacity = useRef(new Animated.Value(0)).current;

              // 3. ★ focused 상태 변화에 반응하는 로직
              useEffect(() => {
                if (focused) {
                  // 탭이 활성화되면 (focused = true)
                  // 1. 투명도를 1 (최대 광채)로 빠르게 설정
                  glowOpacity.setValue(1);

                  // 2. 0.3초 딜레이 후, 0.7초 동안 투명도를 0으로 서서히 줄입니다 (Fade Out)
                  Animated.timing(glowOpacity, {
                    toValue: 0,
                    duration: 2100, // 0.7초 동안 사라짐
                    delay: 900, // 0.3초 후에 사라지기 시작
                    useNativeDriver: true, // 성능 최적화를 위해 네이티브 드라이버 사용
                  }).start();
                } else {
                  // 탭이 비활성화되면 즉시 투명도를 0으로 리셋 (깜빡임 방지)
                  glowOpacity.setValue(0);
                }
              }, [focused]); // focused 상태가 바뀔 때마다 실행

              return (
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>

                  {/* 1. ★ Animated.View를 사용하여 광채 효과 배경 적용 */}
                  <Animated.View
                    style={{
                      position: 'absolute',
                      width: size * 1.6,
                      height: size * 1.6,
                      borderRadius: size * 0.8,
                      backgroundColor: iconColor,

                      // ★ 애니메이션이 적용될 opacity (glowOpacity 값에 따라 0.0 ~ 1.0)
                      opacity: glowOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.15], // 0일 땐 0%, 1일 땐 15% 투명도 (광채의 최대 강도)
                      }),
                    }}
                  />

                  {/* 2. 실제 아이콘 */}
                  <Ionicons
                    name="search"
                    size={size}
                    color={iconColor}
                  />
                </View>
              );
            },
          }}
        />



        <Tabs.Screen
          name="learn"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="book"
                size={24}
                color={
                  focused
                    ? colorScheme === "dark"
                      ? "white"
                      : "black"
                    : "gray"
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          listeners={{
            tabPress: (e) => {
              console.log("tabPress");
              e.preventDefault();
              if (isLoggedIn) {
                router.navigate("/modal");
              } else {
                openLoginModal();
              }
            },
          }}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="add"
                size={24}
                color={
                  focused
                    ? colorScheme === "dark"
                      ? "white"
                      : "black"
                    : "gray"
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="activity"
          listeners={{
            tabPress: (e) => {
              if (!isLoggedIn) {
                e.preventDefault();
                openLoginModal();
              }
            },
          }}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="heart-outline"
                size={24}
                color={
                  focused
                    ? colorScheme === "dark"
                      ? "white"
                      : "black"
                    : "gray"
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="[username]"
          listeners={{
            tabPress: (e) => {
              if (!isLoggedIn) {
                e.preventDefault();
                openLoginModal();
              }
            },
          }}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="person-outline"
                size={24}
                color={
                  focused
                    ? colorScheme === "dark"
                      ? "white"
                      : "black"
                    : "gray"
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="(post)/[username]/post/[postID]"
          options={{
            href: null,
          }}
        />

      </Tabs>
      <Modal
        visible={isLoginModalOpen}
        transparent={true}
        animationType="slide"
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View style={{ backgroundColor: "white", padding: 20 }}>
            <Pressable onPress={toLoginPage}>
              <Text>Login Modal</Text>
            </Pressable>
            <TouchableOpacity onPress={closeLoginModal}>
              <Ionicons name="close" size={24} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}