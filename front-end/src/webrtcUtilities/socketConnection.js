import { io } from "socket.io-client";

let socket;
const socketConnection = (userName) => {
  //check to see if the socket is already connected
  if (socket && socket.connected) {
    //if so, then just return it so whoever needs it, can use it
    return socket;
  } else {
    //its not connected... connect!
    socket = io.connect("http://localhost:8081", {
      auth: {
        userName,
      },
    });
    console.log("Created socket connection");
    return socket;
  }
};

export default socketConnection;
