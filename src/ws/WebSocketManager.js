let socket = null;
let listeners = [];

export const WebSocketManager = {
  connect(url = import.meta.env.VITE_WS_URL) {

    console.log("👉 WebSocket 연결 주소:", url);
    socket = new WebSocket(url);

    socket.onopen = () => {
      console.log("[WebSocket] 연결됨");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      listeners.forEach((cb) => cb(data));
    };

    socket.onerror = (err) => {
      console.error("[WebSocket] 오류", err);
    };

    socket.onclose = () => {
      console.log("[WebSocket] 연결 종료");
    };
  },

  send(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  },

  onMessage(callback) {
    listeners.push(callback);
  }
};
