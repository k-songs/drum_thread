import "expo-router/entry";

import { createServer, Response, Server, Model } from "miragejs";

declare global {
  interface Window {
    server: Server;
  }
}

if (__DEV__) {
  if (window.server) {
    window.server.shutdown();
  }
  window.server = createServer({
    models: {
      post: Model,
    },
    seeds(server) {
      // 무한 스크롤 테스트용 더미 데이터 생성 (30개)
      const users = [
        { username: "madison", displayName: "Madison", avatar: "https://randomuser.me/api/portraits/women/1.jpg" },
        { username: "zerocho", displayName: "Zerocho", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
        { username: "karina", displayName: "Karina", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
        { username: "john", displayName: "John", avatar: "https://randomuser.me/api/portraits/men/2.jpg" },
        { username: "sarah", displayName: "Sarah", avatar: "https://randomuser.me/api/portraits/women/3.jpg" },
        { username: "mike", displayName: "Mike", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
      ];

      const contents = [
        "What is this?", "Hello, world!", "Nice day!", "Great weather today!",
        "Working on new features", "Just finished coding", "Coffee time ☕",
        "React Native is awesome!", "Learning something new", "Beautiful sunset 🌅"
      ];

      // 30개의 더미 포스트 생성 (무한 스크롤 테스트용)
      for (let i = 0; i < 30; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomContent = contents[Math.floor(Math.random() * contents.length)];
        
        server.create("post", {
          id: i.toString(),
          username: randomUser.username,
          displayName: randomUser.displayName,
          content: `${randomContent} #${i + 1}`,
          timeAgo: `${Math.floor(Math.random() * 24) + 1} hours ago`,
          likes: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 20),
          reposts: Math.floor(Math.random() * 10),
          isVerified: Math.random() > 0.7,
          avatar: randomUser.avatar,
          image: Math.random() > 0.6 ? `https://picsum.photos/800/600?random=${i}` : undefined,
          location: Math.random() > 0.8 ? [37.125 + Math.random(), 124.97 + Math.random()] : undefined,
        });
      }
    },

    routes() {
      // 로그인 API
      this.post("/login", (schema, request) => {
        const { username, password } = JSON.parse(request.requestBody);
        if (username === "zerocho" && password === "1234") {
          return {
            accessToken: "access-token",
            refreshToken: "refresh-token",
            user: {
              id: "zerohch0",
              name: "ZeroCho",
              description: "lover, programmer, youtuber",
              profileImageUrl: "https://avatars.githubusercontent.com/u/885857?v=4",
            },
          };
        } else {
          return new Response(401, {}, { message: "Invalid credentials" });
        }
      });

      // 게시글 목록 조회 (간단한 버전)
      this.get("/posts", (schema) => {
        return schema.db.posts;
      });

      // 게시글 업로드 API
      this.post("/posts", (schema, request) => {
        const { threads, replyOption } = JSON.parse(request.requestBody);
        console.log("게시글 업로드:", threads, replyOption);
        
        const createdPosts = threads.map((thread: any) => {
          return schema.db.posts.insert({
            id: `post-${Date.now()}-${Math.random()}`,
            username: "zerohch0",
            displayName: "ZeroCho",
            content: thread.text,
            timeAgo: "방금 전",
            likes: 0,
            comments: 0,
            reposts: 0,
            isVerified: true,
            avatar: "https://avatars.githubusercontent.com/u/885857?v=4",
            image: thread.imageUris?.[0],
            location: thread.location,
            createdAt: new Date().toISOString(),
          });
        });
        
        return new Response(
          201,
          {},
          {
            success: true,
            message: "게시글이 성공적으로 업로드되었습니다.",
            posts: createdPosts,
          }
        );
      });
    },
});
}

