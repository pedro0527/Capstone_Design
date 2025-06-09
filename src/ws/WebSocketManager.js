let socket = null;
let listeners = new Set();
let messageListenerInitialized = false;

export const WebSocketManager = {
  connect(url = import.meta.env.VITE_WS_URL) {
    if (!socket || socket.readyState > WebSocket.OPEN) {
      console.log("👉 WebSocket 연결 주소:", url);
      socket = new WebSocket(url);

      socket.onopen = () => console.log("[WebSocket] 연결됨");
      socket.onerror = (err) => console.error("[WebSocket] 오류", err);
      socket.onclose = () => {
        console.log("[WebSocket] 연결 종료");
        messageListenerInitialized = false; // 연결이 끊기면 다시 초기화해야 함
      };

      // ✅ 최초 연결 시에만 onmessage 설정
      if (!messageListenerInitialized) {
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          listeners.forEach((cb) => cb(data));
        };
        messageListenerInitialized = true;
      }
    }
  },

  send(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  },

  onMessage(callback) {
    listeners.add(callback);
  },

  removeMessageHandler(callback) {
    listeners.delete(callback);
  },

  clearAllHandlers() {
    listeners.clear();
  },

  disconnect() {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
      console.log("[WebSocketManager] 연결 종료 호출됨");
    }
  }
};
