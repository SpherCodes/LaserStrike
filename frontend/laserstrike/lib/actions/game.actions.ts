import { Player } from "../Types";

export const RegisterPlayer = async (player: {
  name: string;
  tagId: number;
}): Promise<Player | null> => {
  if (!player || !player.name || !player.tagId || player.tagId <= 0) {
    console.error("Invalid player data provided");
    return null;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
  try {
    const res = await fetch(`${apiUrl}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: player.tagId,
        name: player.name,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: "Unknown error" }));
      console.error("Registration failed:", errorData);
      return null;
    }

    const data = await res.json();
    console.log("Registration successful:", data);

    return data.user as Player;
  } catch (error) {
    console.error("Network error during registration:", error);
    return null;
  }
};
