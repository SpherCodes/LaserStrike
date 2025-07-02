import { ShotEvent } from "./Types";

let socket: WebSocket | null = null;

// Callback type for handling responses
type ResponseCallback = (success: boolean, message?: string) => void;
type ShotEventCallback = (event: ShotEvent) => void;
type GameResetCallback = () => void;

// Store pending callbacks with request IDs
const pendingCallbacks = new Map<string, ResponseCallback>();

// Store event listeners for shot events
const shotEventListeners = new Set<ShotEventCallback>();
// Store event listeners for game reset events
const gameResetListeners = new Set<GameResetCallback>();

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

        // Handle shot event broadcasts
        if (
          response.type === "shot_event" &&
          response.killer &&
          response.target
        ) {
          console.log("Shot event received:", response);
          const shotEvent: ShotEvent = {
            killer: response.killer,
            target: response.target,
          };

          // Notify all listeners
          shotEventListeners.forEach((listener) => {
            listener(shotEvent);
          });
          return;
        }

        // Handle responses with request IDs
        if (response.requestId && pendingCallbacks.has(response.requestId)) {
          const callback = pendingCallbacks.get(response.requestId);
          pendingCallbacks.delete(response.requestId);

          if (callback) {
            callback(response.success === true, response.message);
          }
          return;
        }

        // Handle general boolean responses  to check if shot missed or not
        if (typeof response.success === "boolean") {
          console.log(
            `Operation ${response.success ? "successful" : "failed"}`
          );
          if (response.message) {
            console.log("Message:", response.message);
          }
        }
        console.log(response)
        if (response.type === "game_reset") {
          console.log("Game has been reset");

          // Notify all game reset listeners
          gameResetListeners.forEach((listener) => {
            listener();
          });

          // Clear player session
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("player");
            // Redirect to login page
            window.location.href = "/login";
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
      // Clear shot event listeners
      shotEventListeners.clear();
      // Clear game reset listeners
      gameResetListeners.clear();
    };
  }
  return socket;
};
export default getSocket;

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Register a listener for shot events
export const onShotEvent = (callback: ShotEventCallback): (() => void) => {
  shotEventListeners.add(callback);

  // Return a function to remove the listener
  return () => {
    shotEventListeners.delete(callback);
  };
};

// Register a listener for game reset events
export const onGameReset = (callback: GameResetCallback): (() => void) => {
  gameResetListeners.add(callback);

  // Return a function to remove the listener
  return () => {
    gameResetListeners.delete(callback);
  };
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

    // Send the image data with request ID
    socket.send(
      JSON.stringify({
        image,
        playerId,
        requestId,
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
