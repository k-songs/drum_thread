import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import Post, { type Post as PostType } from "@/components/Post";
import { useState, useCallback } from "react";

export default function Index() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(10); // 간단한 무한 스크롤

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    setDisplayedCount(10); // 새로고침 시 처음 10개로 리셋
    await fetchPosts();
    setIsRefreshing(false);
  };
   //
  // 간단한 무한 스크롤 - 10개씩 더 보여주기
  const loadMore = () => {
    if (displayedCount < posts.length) {
      setDisplayedCount(prev => Math.min(prev + 10, posts.length));
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  const displayedPosts = posts.slice(0, displayedCount);
  const hasMore = displayedCount < posts.length;

  const renderPost = ({ item }: { item: PostType }) => <Post item={item} />;

  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#666" />
        <Text style={styles.footerText}>더 많은 게시글 로딩 중...</Text>
      </View>
    );
  };

  if (isLoading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#666" />
        <Text style={styles.loadingText}>게시글을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      colorScheme === "dark" ? styles.containerDark : styles.containerLight,
    ]}>
      <FlatList
        data={displayedPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        
        // 간단한 무한 스크롤
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#666"]}
            tintColor="#666"
          />
        }
        
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "white",
  },
  containerDark: {
    backgroundColor: "#101010",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
    fontSize: 16,
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
  },
});
