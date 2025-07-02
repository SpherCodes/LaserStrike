import { Player } from "../Types";

export const RegisterPlayer = async (player: {
  name: string;
  tagId: number;
}): Promise<Player | null> => {
  if (player) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ;
    if (!apiUrl) {
      console.error(
        "API URL is not configured. Please set NEXT_PUBLIC_API_URL in environment variables."
      );
      throw new Error("API URL is not configured");
    }

    const res = await fetch(`${apiUrl}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: player.tagId,
        name: player.name,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Registration failed:", errorText);
      return null;
    }

    const data = await res.json();
    console.log("Registering player:", data);

    return data.user as Player;
  }
  console.error("No player provided");
  return null;
};
