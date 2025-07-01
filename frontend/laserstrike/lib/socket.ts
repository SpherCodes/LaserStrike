let socket: WebSocket | null = null;

export const getSocket = (userId: number) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    socket = new WebSocket(`ws://localhost:8000/ws/${userId.toString()}`);
    socket.onopen = () => {
      console.log("WebSocket connection established");
    };
    socket.onmessage = (event) => {
      console.log("Received:", event.data);
    };
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };
  }
  return socket;
};
export default getSocket;

export const sendImageToServer = (image: string): void => {
  if (socket) {
         //TODO: add shooter_id param
        socket.send(JSON.stringify({ image: image, shooter_id: 2 }));
    }
};
