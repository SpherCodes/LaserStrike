export const RegisterPlayer = async (player: {
  name: string;
  tagId: string;
}): Promise<Player | null> => {
  if (player) {
    const res = await fetch("http://localhost:8000/users", {
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
