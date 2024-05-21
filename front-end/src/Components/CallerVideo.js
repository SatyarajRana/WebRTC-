import { useEffect, useRef, useState } from "react";
import "./VideoPage.css";
import { useSearchParams, useNavigate } from "react-router-dom";
import socketConnection from "../webrtcUtilities/socketConnection";
import ActionButtons from "./ActionButtons/ActionButtons";
import VideoMessageBox from "./VideoMessageBox";

const CallerVideo = ({
  remoteStream,
  localStream,
  peerConnection,
  callStatus,
  updateCallStatus,
  userName,
}) => {
  const remoteFeedEl = useRef(null);
  const localFeedEl = useRef(null);
  const navigate = useNavigate();
  const [videoMessage, setVideoMessage] = useState(
    "Please enable video to start!"
  );
  const [offerCreated, setOfferCreated] = useState(false);

  useEffect(() => {
    remoteFeedEl.current.srcObject = remoteStream;
    localFeedEl.current.srcObject = localStream;
  }, []);

  useEffect(() => {
    if (peerConnection) {
      peerConnection.ontrack = (e) => {
        if (e?.streams?.length) {
          setVideoMessage("");
        } else {
          setVideoMessage("Disconnected...");
        }
      };
    }
  }, [peerConnection]);

  useEffect(() => {
    const shareVideoAsync = async () => {
      const offer = await peerConnection.createOffer();
      peerConnection.setLocalDescription(offer);

      const socket = socketConnection(userName);
      socket.emit("newOffer", offer);
      setOfferCreated(true);
      setVideoMessage("Awaiting answer...");
      console.log(
        "created offer, setLocalDesc, emitted offer, updated videoMessage"
      );
    };
    if (!offerCreated && callStatus.videoEnabled) {
      //CREATE AN OFFER!!
      console.log("We have video and no offer... making offer");
      shareVideoAsync();
    }
  }, [callStatus.videoEnabled, offerCreated]);

  useEffect(() => {
    const addAnswerAsync = async () => {
      await peerConnection.setRemoteDescription(callStatus.answer);
      console.log("Answer added!!");
    };
    if (callStatus.answer) {
      addAnswerAsync();
    }
  }, [callStatus]);

  return (
    <div>
      <div className="videos">
        <VideoMessageBox message={videoMessage} />
        <video
          id="local-feed"
          ref={localFeedEl}
          autoPlay
          controls
          playsInline
        ></video>
        <video
          id="remote-feed"
          ref={remoteFeedEl}
          autoPlay
          controls
          playsInline
        ></video>
      </div>
      <ActionButtons
        localFeedEl={localFeedEl}
        remoteFeedEl={remoteFeedEl}
        callStatus={callStatus}
        localStream={localStream}
        updateCallStatus={updateCallStatus}
        peerConnection={peerConnection}
      />
    </div>
  );
};

export default CallerVideo;
