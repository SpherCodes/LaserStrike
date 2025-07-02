import { useState, useEffect } from "react";
import { ShotEvent } from "../Types";
import { onShotEvent } from "../socket";

/**
 * Hook for subscribing to shot events from WebSockets
 * @returns Latest shot event, if any
 */
const useShotEvents = () => {
  const [latestShotEvent, setLatestShotEvent] = useState<ShotEvent | null>(
    null
  );

  useEffect(() => {
    // Listen for shot events
    const unsubscribe = onShotEvent((event) => {
      console.log("Shot event received in hook:", event);
      setLatestShotEvent(event);
    });

    // Cleanup subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  return latestShotEvent;
};

export default useShotEvents;
