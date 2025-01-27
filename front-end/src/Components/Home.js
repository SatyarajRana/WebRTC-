import { useEffect } from "react";
import socketConnection from "../webrtcUtilities/socketConnection";
import clientSocketListeners from "../webrtcUtilities/clientSocketListeners";
import { useState } from "react";
import createPeerConnection from "../webrtcUtilities/createPeerConn";
import { useSearchParams, useNavigate } from "react-router-dom";

const Home = ({
  callStatus,
  updateCallStatus,
  setLocalStream,
  setRemoteStream,
  remoteStream,
  peerConnection,
  setPeerConnection,
  localStream,
  userName,
  setUserName,
  offerData,
  setOfferData,
}) => {
  const [typeOfCall, setTypeOfCall] = useState();
  const [joined, setJoined] = useState(false);
  const [availableCalls, setAvailableCalls] = useState([]);
  const navigate = useNavigate();

  const prepForCall = () => {
    return new Promise(async (resolve, reject) => {
      //can bring constraints in as a param
      const constraints = {
        video: true,
        audio: false,
      };
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        //update bools
        const copyCallStatus = { ...callStatus };
        copyCallStatus.haveMedia = true;
        copyCallStatus.videoEnabled = null;
        copyCallStatus.audioEnabled = false;
        updateCallStatus(copyCallStatus);
        setLocalStream(stream);
        resolve();
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  };
  //called on "Call" or "Answer"
  const initCall = async (typeOfCall) => {
    await prepForCall();
    // console.log("gum access granted!")
    setTypeOfCall(typeOfCall); //offer or answer
  };

  useEffect(() => {
    if (joined) {
      const userName = prompt("Enter your username");
      setUserName(userName);

      const setCalls = (data) => {
        setAvailableCalls(data);
        console.log(data);
      };
      const socket = socketConnection(userName);
      socket.on("availableOffers", setCalls);
      socket.on("newOfferWaiting", setCalls);
    }
  }, [joined]);

  //This runs when we have media and no peerConnection
  useEffect(() => {
    if (callStatus.haveMedia && !peerConnection) {
      // prepForCall has finished running and updated callStatus
      const { peerConnection, remoteStream } = createPeerConnection(
        userName,
        typeOfCall
      );
      setPeerConnection(peerConnection);
      setRemoteStream(remoteStream);
    }
  }, [callStatus.haveMedia]);

  //We know which type of client this is and have PC.
  useEffect(() => {
    if (typeOfCall && peerConnection) {
      const socket = socketConnection(userName);
      clientSocketListeners(
        socket,
        typeOfCall,
        callStatus,
        updateCallStatus,
        peerConnection
      );
    }
  }, [typeOfCall, peerConnection]);

  //once remoteStream AND pc are ready, navigate
  useEffect(() => {
    if (remoteStream && peerConnection) {
      navigate(`/${typeOfCall}`);
    }
  }, [remoteStream, peerConnection]);

  const call = async () => {
    initCall("offer");
  };

  const answer = (callData) => {
    initCall("answer");
    setOfferData(callData);
  };

  if (!joined) {
    return (
      <div className="container d-flex align-items-center justify-content-center min-vh-100">
        <button
          onClick={() => setJoined(true)}
          className="btn btn-primary btn-lg"
        >
          Join
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <h1>{userName}</h1>
        <div className="col-6">
          <h2>Make a call</h2>
          <button onClick={call} className="btn btn-success btn-lg hang-up">
            Start Call
          </button>
        </div>
        <div className="col-6">
          <h2>Available Calls</h2>
          {availableCalls.map((callData, i) => (
            <div className="col mb-2" key={i}>
              <button
                onClick={() => {
                  answer(callData);
                }}
                className="btn btn-lg btn-warning hang-up"
              >
                Answer Call From {callData.offererUserName}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
