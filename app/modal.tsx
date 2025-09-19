import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { replace } from "expo-router/build/global-state/routing";
import { usePathname } from "expo-router";
import { useEffect } from "react";

export default function Modal() {
  const router = useRouter();

  const pathname = usePathname();

  useEffect(() => {
    console.log("Component app/add.tsx mounted. Current address:", pathname);
    return () => {
      console.log("Component app/add.tsx unmounted. Last address was:", pathname);
    };
  }, [pathname]); // pathname이 변경될 때마다 effect가 재실행되도록 설정



  console.log("라우터",router)
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>I'm a modal</Text>
      <Pressable onPress={() => router.replace('/(tabs)')}>
        <Text>Close</Text>
      </Pressable>
    </View>
  );
}