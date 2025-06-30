"use server";
import socket from "../socket";
export const JoinGame = async (player:Player) =>{
    if(player){
        console.log("Joining game with player:", player);
        socket.emit("joinGame", player);
    }
}
export const RegisterPlayer = async (player: PlayerRegisterProps) => {
    // if (player) {
    //     const res = await fetch("http://localhost/user", {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({ player }),
    //     });

    //     if (!res.ok) {
    //         return { success: false, error: await res.text() };
    //     }

    //     const data = await res.json();
    //     return { success: true, data };
    // }
    return { success: false, error: "No player provided" };
}

export const sendImageToServer = async (image: string) => {
    if (image) {
        console.log("Sending image to server:", image);
        socket.emit("sendImage", image);
    } else {
        console.error("No image provided to send");
    }
}