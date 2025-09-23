import "expo-router/entry";

import { createServer, Response ,Server} from "miragejs";

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
    routes() {
      this.post("/login", (schema,request) => {
        const{username,password} =JSON.parse(request.requestBody)
        if(username === "zerocho" && password === "1234"){
        return {
          accessToken: "access-token",
          refreshToken: "refresh-token",
          user: {
            id: "zerocho",
          },
        };
    } else {
        return new Response(401, {}, { message: "Inval 서버 메세지" });
      }
    });
  },
});
}

