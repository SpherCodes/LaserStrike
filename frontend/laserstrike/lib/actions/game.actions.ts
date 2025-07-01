export const RegisterPlayer = async (player: {
  name: string;
  tagId: number;
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
    const data = await res.json();

    console.log("Registering player:", data);

    if (!res.ok) {
      console.error(await res.text());
      return null;
    }
    return data.user as Player;
  }
  console.error("No player provided");
  return null;
};
