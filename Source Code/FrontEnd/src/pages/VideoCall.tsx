import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";
import api from "../services/api";

export default function VideoCall() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [appointment, setAppointment] = useState<any>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  // 🔌 SOCKET CONNECT
  useEffect(() => {
    if (!user?._id) return;

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
      socket.emit("register", user._id);
    });

    return () => {
      socket.off("connect");
    };
  }, [user]);

  // 🎥 CAMERA + WEBRTC
  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection();
        peerConnection.current = pc;

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event: RTCTrackEvent) => {
          console.log("📺 Remote stream received");

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    init();
  }, []);

  // 📞 START CALL (DOCTOR)
  const startCall = async () => {
    if (!peerConnection.current || !appointment || !user?._id) return;

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("call-user", {
      to: appointment?.patient?._id,
      offer,
      from: user._id,
    });

    console.log("📞 Calling...");
  };

  // 📥 RECEIVE CALL + ANSWER
  useEffect(() => {
    socket.on("call-made", async (data: any) => {
      if (!peerConnection.current) return;

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(data.offer),
      );

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("make-answer", {
        to: data.from,
        answer,
      });
    });

    socket.on("answer-made", async (data: any) => {
      if (!peerConnection.current) return;

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(data.answer),
      );
    });

    return () => {
      socket.off("call-made");
      socket.off("answer-made");
    };
  }, []);

  // 📥 FETCH APPOINTMENT
  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint =
          user?.role === "doctor"
            ? "/doctor/appointments"
            : "/patients/records";

        const res = await api.get(endpoint);

        const appts =
          user?.role === "doctor" ? res.data : res.data.appointments;

        const current = appts.find((a: any) => a._id === id);
        setAppointment(current);
      } catch (err) {
        console.error(err);
      }
    };

    if (user) fetchData();
  }, [id, user]);

  // 🔥 AUTO CALL
  useEffect(() => {
    if (user?.role === "doctor" && appointment) {
      setTimeout(startCall, 2000);
    }
  }, [appointment]);

  // 🎛️ CONTROLS
  const toggleMute = () => {
    if (!streamRef.current) return;

    streamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (!streamRef.current) return;

    streamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsVideoOff(!isVideoOff);
  };

  const handleEndCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    navigate(-1);
  };

  return (
    <div className="h-screen w-full bg-black relative">
      {/* 🎥 REMOTE VIDEO */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* 🎥 LOCAL VIDEO */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        className="absolute bottom-5 right-5 w-40 rounded-lg"
      />

      {/* CONTROLS */}
      <div className="absolute bottom-5 w-full flex justify-center gap-4">
        <button onClick={toggleMute}>{isMuted ? <MicOff /> : <Mic />}</button>

        <button onClick={toggleVideo}>
          {isVideoOff ? <VideoOff /> : <Video />}
        </button>

        <button onClick={handleEndCall}>
          <PhoneOff />
        </button>
      </div>
    </div>
  );
}
