import socketConnection from "./socketConnection";

let peerConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    },
  ],
};

const createPeerConnection = (userName, typeOfCall) => {
  const socket = socketConnection(userName);
  try {
    const peerConnection = new RTCPeerConnection(peerConfiguration);

    const remoteStream = new MediaStream();

    //peerConnection listeners
    peerConnection.addEventListener("signalingstatechange", (e) => {
      console.log("Signaling Event Change!");
      console.log(e);
      console.log(peerConnection.signalingState);
    });

    peerConnection.addEventListener("icecandidate", (e) => {
      console.log("Found and ice candidate!");
      if (e.candidate) {
        // emit the new ice cand. to the signaling server
        socket.emit("sendIceCandidateToSignalingServer", {
          iceCandidate: e.candidate,
          iceUserName: userName,
          didIOffer: typeOfCall === "offer",
        });
      }
    });

    peerConnection.addEventListener("track", (e) => {
      // the remote has sent us a track!
      // let's add it to our remoteStream
      e.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track, remoteStream);
        console.log("This should add some video/audio to the remote feed...");
      });
    });

    return {
      peerConnection,
      remoteStream,
    };
  } catch (err) {
    console.log(err);
  }
};

export default createPeerConnection;
