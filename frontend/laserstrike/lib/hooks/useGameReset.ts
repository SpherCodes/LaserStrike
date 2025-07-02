import { useEffect, useState } from "react";
import { onGameReset } from "../socket";

/**
 * Hook for subscribing to game reset events from WebSockets
 * Provides a way for components to react to game reset events
 * before the automatic redirect happens
 *
 * @returns A boolean indicating if a game reset has been triggered
 */
const useGameReset = () => {
  const [resetTriggered, setResetTriggered] = useState(false);

  useEffect(() => {
    // Listen for game reset events
    const unsubscribe = onGameReset(() => {
      console.log("Game reset received in hook");
      setResetTriggered(true);
    });

    // Cleanup subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  return resetTriggered;
};

export default useGameReset;
