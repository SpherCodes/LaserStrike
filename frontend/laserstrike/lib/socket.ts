let socket: WebSocket | null = null;

export const getSocket = (userId: string) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    socket = new WebSocket(`ws://localhost:8000/ws/${userId}`);
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

export const sendImageToServer = (image: string, playerId: string): void => {
    if (socket) {
       //Send the image data to the server
        socket.send(JSON.stringify({ image, playerId }));
    }
};
