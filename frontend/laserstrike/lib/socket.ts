let socket: WebSocket | null = null;

// Callback type for handling responses
type ResponseCallback = (success: boolean, message?: string) => void;

// Store pending callbacks with request IDs
const pendingCallbacks = new Map<string, ResponseCallback>();

export const getSocket = (userId: number) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    if (typeof window === "undefined") return null; // Server-side guard

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error(
        "API URL is not configured. Please set NEXT_PUBLIC_API_URL in environment variables."
      );
      return null;
    }

    const wsUrl = apiUrl
      .replace("http://", "ws://")
      .replace("https://", "wss://");
    socket = new WebSocket(`${wsUrl}/ws/${userId.toString()}`);
    socket.onopen = () => {
      console.log("WebSocket connection established");
    };
    socket.onmessage = (event) => {
      console.log("Received:", event.data);

      try {
        const response = JSON.parse(event.data);

        // Handle responses with request IDs
        if (response.requestId && pendingCallbacks.has(response.requestId)) {
          const callback = pendingCallbacks.get(response.requestId);
          pendingCallbacks.delete(response.requestId);

          if (callback) {
            callback(response.success === true, response.message);
          }
        }

        // Handle general boolean responses
        if (typeof response.success === "boolean") {
          console.log(
            `Operation ${response.success ? "successful" : "failed"}`
          );
          if (response.message) {
            console.log("Message:", response.message);
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    socket.onclose = () => {
      console.log("WebSocket connection closed");
      // Clear pending callbacks
      pendingCallbacks.clear();
    };
  }
  return socket;
};
export default getSocket;

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Send image with callback for response
export const sendImageToServer = (
  image: string,
  playerId: number,
  callback?: ResponseCallback
): void => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const requestId = generateRequestId();

    // Store callback if provided
    if (callback) {
      pendingCallbacks.set(requestId, callback);
    }

    console.log(
      JSON.stringify({
        image,
        playerId,
      })
    );
    // Send the image data with request ID
    socket.send(
      JSON.stringify({
        image,
        playerId,
      })
    );

    console.log("Image sent to server, awaiting response...");
  } else {
    console.error("WebSocket is not connected");
    if (callback) {
      callback(false, "WebSocket not connected");
    }
  }
};

// Send any data with callback
export const sendDataToServer = (
  data: Record<string, unknown>,
  callback?: ResponseCallback
): void => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const requestId = generateRequestId();

    // Store callback if provided
    if (callback) {
      pendingCallbacks.set(requestId, callback);
    }

    // Send data with request ID
    socket.send(
      JSON.stringify({
        ...data,
        requestId,
      })
    );

    console.log("Data sent to server, awaiting response...");
  } else {
    console.error("WebSocket is not connected");
    if (callback) {
      callback(false, "WebSocket not connected");
    }
  }
};
