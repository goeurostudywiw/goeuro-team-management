'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import BrandMascot from '@/components/BrandMascot';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  Copy,
  Check,
  GraduationCap,
  FileCheck,
  User,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle,
  MessageSquare,
  MonitorUp,
  ShieldCheck,
  Camera,
  Download,
  Square,
  Circle,
  UploadCloud,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

// STUN/TURN server configuration with fallback for public web hosts and mobile NATs
const defaultIceServers: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

let ICE_SERVERS: RTCConfiguration = { iceServers: defaultIceServers };
try {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ICE_SERVERS) {
    ICE_SERVERS = { iceServers: JSON.parse(process.env.NEXT_PUBLIC_ICE_SERVERS) };
  }
} catch (e) {}

// Synthetic Live Counseling Video & Audio Feed Generator
// Ensures 100% video uptime with branded visual feed even if physical webcam is missing/denied
function createSyntheticStream(roleLabel: string = 'Counselor'): { stream: MediaStream; cleanup: () => void } {
  if (typeof document === 'undefined') {
    return { stream: new MediaStream(), cleanup: () => {} };
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  let t = 0;

  function renderFrame() {
    if (!ctx) return;
    t += 0.05;

    // Rich Dark Indigo/Navy Gradient
    const bg = ctx.createLinearGradient(0, 0, 1280, 720);
    bg.addColorStop(0, '#09090b');
    bg.addColorStop(0.5, '#1e1138');
    bg.addColorStop(1, '#0c0a1a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1280, 720);

    // Decorative subtle grid lines
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1280; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 720);
      ctx.stroke();
    }
    for (let y = 0; y < 720; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1280, y);
      ctx.stroke();
    }

    const cx = 640;
    const cy = 330;
    const pulse = Math.sin(t) * 14;

    // Glowing outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, 115 + pulse, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Secondary pulse ring
    ctx.beginPath();
    ctx.arc(cx, cy, 95 + pulse * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.7)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center circular avatar container
    ctx.beginPath();
    ctx.arc(cx, cy, 80, 0, Math.PI * 2);
    ctx.fillStyle = '#2e1065';
    ctx.fill();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Avatar text / emblem
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(roleLabel === 'Student' ? 'STUDENT' : 'GOEURO', cx, cy - 6);

    ctx.fillStyle = '#e9d5ff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(roleLabel === 'Student' ? 'Live Applicant Feed' : 'Certified Counselor Feed', cx, cy + 26);

    // Dynamic Live Equalizer Waveform
    ctx.fillStyle = '#c084fc';
    const bars = 30;
    const startX = 400;
    for (let i = 0; i < bars; i++) {
      const barH = 8 + Math.abs(Math.sin(t * 2.5 + i * 0.45)) * 40;
      ctx.fillRect(startX + i * 16, 495 - barH / 2, 8, barH);
    }

    // Top Brand & Room Watermark Header
    ctx.fillStyle = 'rgba(15, 12, 28, 0.88)';
    ctx.fillRect(0, 0, 1280, 60);

    // German Flag Tricolor Strip
    ctx.fillStyle = '#000000';
    ctx.fillRect(32, 22, 8, 20);
    ctx.fillStyle = '#dd0000';
    ctx.fillRect(40, 22, 8, 20);
    ctx.fillStyle = '#ffce00';
    ctx.fillRect(48, 22, 8, 20);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('GOEURO STUDY IN GERMANY • OFFICIAL CONSULTATION', 68, 38);

    // Live Virtual Camera Active Indicator
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(1220, 36, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('LIVE HD FEED (ACTIVE)', 1204, 40);

    // Bottom Status Strip
    ctx.fillStyle = 'rgba(15, 12, 28, 0.7)';
    ctx.fillRect(0, 675, 1280, 45);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `WebRTC Room Secured • 100% Free Peer-to-Peer Consultation • ${new Date().toLocaleTimeString()}`,
      640,
      702
    );
  }

  // Initial draw and continuous 30fps timer
  renderFrame();
  const animIntervalId = setInterval(renderFrame, 33);

  const canvasStream = canvas.captureStream(30);

  // Generate an inaudible audio track so WebRTC media negotiation does not drop audio
  let audioContext: AudioContext | null = null;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      gain.gain.value = 0.00001; // inaudible carrier
      osc.connect(gain);
      const dest = audioContext.createMediaStreamDestination();
      gain.connect(dest);
      osc.start();
      const audioTrack = dest.stream.getAudioTracks()[0];
      if (audioTrack) {
        canvasStream.addTrack(audioTrack);
      }
    }
  } catch (e) {
    console.warn('AudioContext generation skipped:', e);
  }

  const cleanup = () => {
    clearInterval(animIntervalId);
    if (audioContext) {
      try {
        audioContext.close();
      } catch (e) {}
    }
    canvasStream.getTracks().forEach((track) => track.stop());
  };

  return { stream: canvasStream, cleanup };
}

export default function ConsultationRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = (params?.roomId as string) || 'default-room';
  const roleParam = searchParams.get('role');
  const role: 'counselor' | 'student' = roleParam === 'student' ? 'student' : 'counselor';

  // Media States
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isSyntheticCamera, setIsSyntheticCamera] = useState(false);
  const [isSwappedView, setIsSwappedView] = useState(false);

  // Call info
  const [callDuration, setCallDuration] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [leadInfo, setLeadInfo] = useState<any>(null);

  // Counselor Notes & Assessment State
  const [notes, setNotes] = useState('');
  const [germanLevel, setGermanLevel] = useState('A1');
  const [targetIntake, setTargetIntake] = useState('Winter 2026');
  const [savingNotes, setSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Online Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isUploadingRecording, setIsUploadingRecording] = useState(false);
  const [recordingSuccess, setRecordingSuccess] = useState<string | null>(null);
  const [recordedDownloadUrl, setRecordedDownloadUrl] = useState<string | null>(null);

  // Attendance Snapshot State
  const [snapshotToast, setSnapshotToast] = useState<string | null>(null);
  const [lastSnapshotUrl, setLastSnapshotUrl] = useState<string | null>(null);
  const [isSnapping, setIsSnapping] = useState(false);

  // WebRTC & Media Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const lastSignalTimeRef = useRef<number>(0);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const syntheticCleanupRef = useRef<(() => void) | null>(null);

  // Recording & Snapshot Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const recordingDurationRef = useRef<number>(0);
  const autoSnapshotTriggeredRef = useRef<boolean>(false);

  // 1. Initialize User Media (Camera & Mic with Multi-Step Fallbacks)
  const initCamera = useCallback(async (preferHardware = true) => {
    if (syntheticCleanupRef.current) {
      syntheticCleanupRef.current();
      syntheticCleanupRef.current = null;
    }

    let hardwareStream: MediaStream | null = null;

    if (preferHardware && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
        const hasVideoDevice = devices.some((d) => d.kind === 'videoinput');

        if (hasVideoDevice) {
          try {
            hardwareStream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 1280 }, height: { ideal: 720 } },
              audio: true,
            });
          } catch (err1) {
            try {
              hardwareStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
              });
            } catch (err2) {
              hardwareStream = await navigator.mediaDevices.getUserMedia({ video: true });
            }
          }
        }
      } catch (err) {
        console.warn('Physical camera enumeration/access notice:', err);
      }
    }

    // Verify if hardware camera is active and producing live video frames
    const vTrack = hardwareStream?.getVideoTracks()[0];
    if (hardwareStream && vTrack && vTrack.readyState === 'live') {
      vTrack.onended = () => {
        console.warn('Physical camera track ended, switching to synthetic counselor feed.');
        initCamera(false);
      };
      setLocalStream(hardwareStream);
      setIsSyntheticCamera(false);
      setMediaError(null);
      return hardwareStream;
    }

    // Fallback to high-quality synthetic live stream with animated canvas & audio
    try {
      const synthetic = createSyntheticStream(role === 'counselor' ? 'Counselor' : 'Student');
      syntheticCleanupRef.current = synthetic.cleanup;
      setLocalStream(synthetic.stream);
      setIsSyntheticCamera(true);
      return synthetic.stream;
    } catch (e: any) {
      console.error('Synthetic stream failed:', e);
      setMediaError('Could not initialize video feed: ' + (e?.message || 'Unknown error'));
      return null;
    }
  }, [role]);

  // Initial media setup on mount
  useEffect(() => {
    initCamera(true);

    return () => {
      if (syntheticCleanupRef.current) {
        syntheticCleanupRef.current();
      }
    };
  }, [initCamera]);

  // Dedicated Video Stream Attachers — Guarantees srcObject is bound and playing without black screens
  useEffect(() => {
    const videoEl = localVideoRef.current;
    if (!videoEl) return;

    if (localStream && videoEnabled) {
      if (videoEl.srcObject !== localStream) {
        videoEl.srcObject = localStream;
      }
      videoEl.muted = true;
      videoEl.play().catch((err) => {
        console.warn('Local video auto-play notice:', err);
      });
    }
  }, [localStream, videoEnabled]);

  useEffect(() => {
    const videoEl = remoteVideoRef.current;
    if (!videoEl) return;

    if (remoteStream) {
      if (videoEl.srcObject !== remoteStream) {
        videoEl.srcObject = remoteStream;
      }
      videoEl.play().catch((err) => {
        console.warn('Remote video auto-play notice:', err);
      });
    }
  }, [remoteStream]);

  // Sync tracks with existing WebRTC peer connection whenever localStream changes
  useEffect(() => {
    const pc = peerConnectionRef.current;
    if (!pc || !localStream) return;

    const currentSenders = pc.getSenders();
    localStream.getTracks().forEach((track) => {
      const existingSender = currentSenders.find((s) => s.track?.kind === track.kind);
      if (existingSender) {
        existingSender.replaceTrack(track).catch((err) => console.warn('replaceTrack warning:', err));
      } else {
        pc.addTrack(track, localStream);
      }
    });
  }, [localStream]);

  // 2. Call Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Call Duration
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 3. Signaling Helper
  const sendSignal = useCallback(async (type: string, data: any) => {
    try {
      await fetch('/api/meeting/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          role,
          action: 'signal',
          payload: { type, data },
        }),
      });
    } catch (e) {
      console.error('Failed to send signal:', e);
    }
  }, [roomId, role]);

  // 4. Create WebRTC PeerConnection
  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal('candidate', event.candidate);
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setIsConnected(true);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setIsConnected(true);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setIsConnected(false);
      }
    };

    // Add local tracks if available
    if (localStream) {
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream!));
    }

    peerConnectionRef.current = pc;
    return pc;
  }, [localStream, sendSignal]);

  // 5. Join Room & WebRTC Negotiation
  useEffect(() => {
    let isCancelled = false;

    async function joinRoom() {
      try {
        const res = await fetch('/api/meeting/signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId,
            role,
            action: 'join',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.lead) {
            setLeadInfo(data.lead);
            if (data.lead.notes) setNotes(data.lead.notes);
          }

          // If counselor joins and student is already in, initiate offer
          if (role === 'counselor' && data.studentActive) {
            const pc = createPeerConnection();
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await sendSignal('offer', offer);
          }
        }
      } catch (err) {
        console.error('Failed to join meeting room:', err);
      }
    }

    joinRoom();

    // 6. Polling Signaling Loop (Every 1s)
    const pollInterval = setInterval(async () => {
      if (isCancelled) return;
      try {
        const res = await fetch(`/api/meeting/signal?roomId=${roomId}&role=${role}&since=${lastSignalTimeRef.current}`);
        if (res.ok) {
          const data = await res.json();
          if (data.serverTime) lastSignalTimeRef.current = data.serverTime;

          for (const msg of data.messages || []) {
            const pc = peerConnectionRef.current || createPeerConnection();

            if (msg.type === 'offer' && role === 'student') {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              await sendSignal('answer', answer);
            } else if (msg.type === 'answer' && role === 'counselor') {
              if (pc.signalingState === 'have-local-offer') {
                await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
              }
            } else if (msg.type === 'candidate') {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
              } catch (e) {
                console.warn('Error adding ICE candidate:', e);
              }
            } else if (msg.type === 'user-joined') {
              // Remote user joined!
              if (role === 'counselor') {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                await sendSignal('offer', offer);
              }
            } else if (msg.type === 'user-left') {
              setIsConnected(false);
              setRemoteStream(null);
            }
          }
        }
      } catch (err) {
        console.warn('Signaling poll failed:', err);
      }
    }, 1000);

    return () => {
      isCancelled = true;
      clearInterval(pollInterval);
      // Leave room
      fetch('/api/meeting/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, role, action: 'leave' }),
      }).catch(() => {});

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [roomId, role, createPeerConnection, sendSignal]);

  // Toggle Microphone
  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => (t.enabled = !micEnabled));
      setMicEnabled(!micEnabled);
    }
  };

  // Toggle Camera
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => (t.enabled = !videoEnabled));
      setVideoEnabled(!videoEnabled);
    }
  };

  // Toggle Screen Sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Revert to camera
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }
      if (localStream && peerConnectionRef.current) {
        const videoTrack = localStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      }
      setIsScreenSharing(false);
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = displayStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = displayStream;
        }

        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.warn('Screen sharing cancelled or failed:', err);
      }
    }
  };

  // Copy Student Meeting Link
  const copyMeetingLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3005';
    const studentUrl = `${origin}/meeting/${roomId}?role=student`;
    navigator.clipboard.writeText(studentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Save Consultation Notes & Advance Lead Stage
  const handleSaveConsultation = async (advanceStage = false) => {
    if (!leadInfo?.id) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      return;
    }

    setSavingNotes(true);
    try {
      // 1. Update contact log
      await fetch(`/api/leads/${leadInfo.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactType: 'MEETING',
          summary: `Video Consultation completed (${formatTime(callDuration)}). German Level: ${germanLevel}. Intake: ${targetIntake}.\nNotes: ${notes}`,
          updateStage: advanceStage ? 'CONSULTATION_COMPLETED' : undefined,
        }),
      });

      // 2. Update lead notes
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadInfo.id,
          notes,
          qualificationNotes: `Assessed in 1-on-1 Video Consultation. German Level: ${germanLevel}, Target: ${targetIntake}`,
        }),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save consultation notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  // --- ATTENDANCE SNAPSHOT CAPTURE ENGINE ("လူစုံပါက SS ရိုက်ခြင်း") ---
  const captureSnapshot = useCallback(async (triggerType: 'AUTO' | 'MANUAL' = 'MANUAL') => {
    setIsSnapping(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw remote video (Student) as main backdrop
      if (remoteVideoRef.current && remoteVideoRef.current.readyState >= 2 && remoteVideoRef.current.videoWidth > 0) {
        ctx.drawImage(remoteVideoRef.current, 0, 0, 1280, 720);
      } else {
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, 1280, 720);
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(remoteStream ? 'Student Connected (Audio / Live Feed)' : 'Consultation Session Active', 640, 360);
        ctx.textAlign = 'left';
      }

      // 2. Draw local video in Picture-in-Picture (bottom-right)
      if (localVideoRef.current && localVideoRef.current.readyState >= 2 && localVideoRef.current.videoWidth > 0) {
        const pipW = 320;
        const pipH = 180;
        const pipX = 1280 - pipW - 24;
        const pipY = 720 - pipH - 24;

        // Draw glowing purple border
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(pipX - 3, pipY - 3, pipW + 6, pipH + 6);
        ctx.drawImage(localVideoRef.current, pipX, pipY, pipW, pipH);

        // PIP Label
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(pipX, pipY + pipH - 28, pipW, 28);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(role === 'counselor' ? 'Counselor (GOEURO)' : 'Student', pipX + 10, pipY + pipH - 10);
      }

      // 3. Draw Watermark & Verification Header
      ctx.fillStyle = 'rgba(9, 9, 11, 0.88)';
      ctx.fillRect(0, 0, 1280, 52);

      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('GOEURO EDUCATION AGENCY', 24, 32);

      ctx.fillStyle = '#ffffff';
      ctx.font = '13px sans-serif';
      const studentLabel = leadInfo?.fullName ? `Student: ${leadInfo.fullName}` : `Room: ${roomId}`;
      const timeStr = new Date().toLocaleString();
      ctx.fillText(`• ${studentLabel} • Intake: ${targetIntake} • Verified Consultation Proof • ${timeStr}`, 320, 32);

      const base64Image = canvas.toDataURL('image/jpeg', 0.88);

      // Post snapshot to backend API
      const targetLeadId = leadInfo?.id || (roomId.startsWith('consult-') ? roomId.replace('consult-', '') : null);
      const res = await fetch('/api/meeting/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          leadId: targetLeadId,
          roomId,
          triggerType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastSnapshotUrl(data.fileUrl);
        setSnapshotToast(
          triggerType === 'AUTO'
            ? '📸 Attendance snapshot automatically captured & saved to CRM dossier!'
            : '📸 Consultation snapshot saved to CRM dossier!'
        );
        setTimeout(() => setSnapshotToast(null), 4500);
      }
    } catch (err) {
      console.warn('Snapshot capture error:', err);
    } finally {
      setIsSnapping(false);
    }
  }, [leadInfo, roomId, targetIntake]);

  // Automated Snapshot Hook: Triggers 4 seconds after both parties are connected
  useEffect(() => {
    if (role === 'counselor' && isConnected && remoteStream && !autoSnapshotTriggeredRef.current) {
      const autoTimer = setTimeout(() => {
        if (isConnected && remoteStream && !autoSnapshotTriggeredRef.current) {
          autoSnapshotTriggeredRef.current = true;
          captureSnapshot('AUTO');
        }
      }, 4000);
      return () => clearTimeout(autoTimer);
    }
  }, [role, isConnected, remoteStream, captureSnapshot]);

  // --- ONLINE MEETING RECORDING ENGINE (Browser-Native $0.00 MediaRecorder) ---
  const uploadRecordingBlob = async (blob: Blob, duration: number) => {
    setIsUploadingRecording(true);
    try {
      const formData = new FormData();
      const targetLeadId = leadInfo?.id || (roomId.startsWith('consult-') ? roomId.replace('consult-', '') : null);
      formData.append('file', blob, `consultation_${roomId}_${Date.now()}.webm`);
      formData.append('roomId', roomId);
      if (targetLeadId) formData.append('leadId', targetLeadId);
      formData.append('duration', duration.toString());
      formData.append('notes', `Recorded Consultation (${formatTime(duration)}). German: ${germanLevel}, Intake: ${targetIntake}`);

      const res = await fetch('/api/meeting/recordings', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setRecordingSuccess('Consultation recording archived to student CRM dossier!');
        setTimeout(() => setRecordingSuccess(null), 5000);
      }
    } catch (err) {
      console.error('Failed to upload consultation recording:', err);
    } finally {
      setIsUploadingRecording(false);
    }
  };

  const startRecording = useCallback(() => {
    try {
      recordedChunksRef.current = [];
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dest = audioCtx.createMediaStreamDestination();

      // Connect local mic audio
      if (localStream && localStream.getAudioTracks().length > 0) {
        try {
          const localSrc = audioCtx.createMediaStreamSource(localStream);
          localSrc.connect(dest);
        } catch (e) {}
      }

      // Connect remote student audio
      if (remoteStream && remoteStream.getAudioTracks().length > 0) {
        try {
          const remoteSrc = audioCtx.createMediaStreamSource(remoteStream);
          remoteSrc.connect(dest);
        } catch (e) {}
      }

      // Prefer remote video > screen share > local video
      let videoTracks: MediaStreamTrack[] = [];
      if (remoteStream && remoteStream.getVideoTracks().length > 0) {
        videoTracks = remoteStream.getVideoTracks();
      } else if (localStream && localStream.getVideoTracks().length > 0) {
        videoTracks = localStream.getVideoTracks();
      }

      const mixedTracks = [...videoTracks, ...dest.stream.getAudioTracks()];
      const combinedStream = new MediaStream(mixedTracks);

      let mimeType = 'video/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
          mimeType = 'video/webm;codecs=vp8,opus';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        }
      }

      const recorder = new MediaRecorder(combinedStream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedDownloadUrl(url);

        // Auto-upload recording to backend CRM
        await uploadRecordingBlob(blob, recordingDurationRef.current);
      };

      recorder.start(1000); // 1-second chunks
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingDuration(0);
      recordingDurationRef.current = 0;

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const next = prev + 1;
          recordingDurationRef.current = next;
          return next;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Failed to start consultation recording:', err);
      alert('Recording failed to start: ' + err.message);
    }
  }, [localStream, remoteStream, leadInfo, roomId, germanLevel, targetIntake]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setIsRecording(false);
  }, []);

  const downloadRecordingLocal = () => {
    if (!recordedDownloadUrl) return;
    const a = document.createElement('a');
    a.href = recordedDownloadUrl;
    const studentName = leadInfo?.fullName?.replace(/\s+/g, '_') || 'student';
    a.download = `GOEURO_Consultation_${studentName}_${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="h-screen w-full bg-zinc-950 text-white flex flex-col overflow-hidden selection:bg-purple-600 selection:text-white">
      {/* Top Bar Header */}
      <header className="h-14 border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <BrandLogo variant="dark" width={130} showBadge={false} />
          </Link>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <div className="flex items-center space-x-2">
            <BrandMascot variant="avatar" size={28} />
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
              100% Free WebRTC
            </span>
            <span className="text-xs font-semibold text-zinc-300 truncate max-w-[150px] sm:max-w-[250px]">
              {leadInfo ? `Consultation: ${leadInfo.fullName}` : `Room: ${roomId}`}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Call Status Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700/80 text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-zinc-300 text-[11px] font-medium">
              {isConnected ? 'Connected P2P' : 'Waiting for student...'}
            </span>
          </div>

          {/* Call Duration Timer */}
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/80 text-xs font-mono text-zinc-300">
            <Clock className="w-3 h-3 text-purple-400" />
            <span>{formatTime(callDuration)}</span>
          </div>

          {/* Share Student Link Button */}
          <button
            onClick={copyMeetingLink}
            className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-xs transition btn-press"
            title="Copy link to send to student via Telegram or Viber"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Copy Student Link'}</span>
          </button>

          {/* Exit Room Button */}
          <button
            onClick={() => router.push(role === 'counselor' ? '/leads' : '/')}
            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-rose-950/80 text-zinc-400 hover:text-rose-200 border border-zinc-700/80 transition"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Main Video & Consultation Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left/Center: Video Call Canvas */}
        <div className="flex-1 relative flex flex-col items-center justify-between p-3 sm:p-5 bg-zinc-950 overflow-hidden">
          {/* Main Video Presentation Canvas */}
          <div className="w-full flex-1 max-w-5xl min-h-0 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 overflow-hidden relative flex items-center justify-center shadow-2xl">
            {/* Primary Remote Video — ALWAYS mounted to eliminate ref null race conditions */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                remoteStream ? 'opacity-100 block' : 'opacity-0 hidden'
              }`}
            />

            {/* Remote Waiting State Card */}
            {!remoteStream && (
              <div className="text-center p-6 max-w-md animate-fade-in z-0">
                <div className="w-16 h-16 rounded-full bg-purple-950/60 border border-purple-800 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-base font-bold text-zinc-200 mb-1">
                  {role === 'counselor' ? 'Waiting for Student to Join...' : 'Connecting to Counselor...'}
                </h3>
                <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                  {role === 'counselor'
                    ? 'Share the consultation room link with the student via Telegram or Viber. They can join instantly on phone or laptop without any app.'
                    : 'Your counselor is preparing your Germany study profile review.'}
                </p>
                {role === 'counselor' && (
                  <button
                    onClick={copyMeetingLink}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs transition btn-press"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Student Invite Link'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Local Video Thumbnail (Picture-in-Picture) */}
            <div
              onClick={() => setIsSwappedView(!isSwappedView)}
              title="Click to toggle / swap view size"
              className="absolute bottom-4 right-4 w-40 h-28 sm:w-60 sm:h-40 rounded-xl bg-zinc-950 border-2 border-purple-700/80 overflow-hidden shadow-2xl z-10 cursor-pointer hover:border-purple-400 transition"
            >
              {/* Local Video — ALWAYS mounted to eliminate ref null race conditions */}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
                  localStream && videoEnabled ? 'opacity-100 block' : 'opacity-0 hidden'
                }`}
              />

              {!(localStream && videoEnabled) && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 text-[10px]">
                  <VideoOff className="w-6 h-6 mb-1 text-zinc-600" />
                  <span>Camera Off</span>
                </div>
              )}

              {/* Picture-in-picture badges */}
              <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-semibold text-zinc-200 flex items-center space-x-1">
                <span className={`w-1.5 h-1.5 rounded-full ${localStream ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                <span>You ({role === 'counselor' ? 'Counselor' : 'Student'})</span>
              </div>

              {isSyntheticCamera && (
                <div className="absolute top-1.5 left-2 px-1.5 py-0.5 rounded bg-purple-900/90 text-[9px] font-bold text-purple-200 border border-purple-600">
                  Virtual HD
                </div>
              )}
            </div>
          </div>

          {/* Virtual Camera Notice & Reconnect Option */}
          {isSyntheticCamera && (
            <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-800 text-purple-200 text-xs flex flex-wrap items-center justify-between gap-2 max-w-5xl w-full shadow-lg">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Virtual HD Camera active. Hardware camera was not detected or was blocked. Consultation is 100% operational.</span>
              </div>
              <button
                onClick={() => initCamera(true)}
                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition btn-press flex items-center space-x-1 shrink-0"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Retry Hardware Webcam</span>
              </button>
            </div>
          )}

          {/* Media Permission Warning if any non-synthetic error */}
          {mediaError && !isSyntheticCamera && (
            <div className="mt-2 px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300 text-[11px] flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{mediaError}</span>
            </div>
          )}

          {/* Floating Glassmorphism Controls Bar */}
          <div className="mt-4 flex items-center space-x-2.5 sm:space-x-4 px-4 py-2.5 rounded-2xl bg-zinc-900/90 backdrop-blur-md border border-zinc-800 shadow-xl z-20">
            {/* Mic Toggle */}
            <button
              onClick={toggleMic}
              className={`p-3 rounded-xl transition btn-press ${
                micEnabled
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs'
              }`}
              title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            {/* Camera Toggle */}
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-xl transition btn-press ${
                videoEnabled
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs'
              }`}
              title={videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>

            {/* Screen Share Toggle */}
            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-xl transition btn-press ${
                isScreenSharing
                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white'
              }`}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen (Review CV, APS, Documents)'}
            >
              <MonitorUp className="w-4 h-4" />
            </button>

            {/* Attendance Snapshot Button ("လူစုံပါက SS ရိုက်ခြင်း / Proof") */}
            {role === 'counselor' && (
              <button
                onClick={() => captureSnapshot('MANUAL')}
                disabled={isSnapping}
                className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition btn-press flex items-center space-x-1.5"
                title="Capture Consultation Attendance Snapshot (Proof of Consultation)"
              >
                <Camera className={`w-4 h-4 text-purple-400 ${isSnapping ? 'animate-pulse' : ''}`} />
                <span className="hidden md:inline text-xs font-semibold">Snapshot</span>
              </button>
            )}

            {/* Online Meeting Recording Toggle ($0.00 In-Browser Native) */}
            {role === 'counselor' && (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-3.5 py-2.5 rounded-xl transition btn-press flex items-center space-x-2 font-bold text-xs ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg animate-pulse'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white'
                }`}
                title={isRecording ? 'Stop & Archive Recording' : 'Start Recording Consultation Audio & Video'}
              >
                {isRecording ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-white text-white" />
                    <span>REC {formatTime(recordingDuration)}</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span className="hidden md:inline">Record Call</span>
                  </>
                )}
              </button>
            )}

            {/* End Call Button */}
            <button
              onClick={() => router.push(role === 'counselor' ? '/leads' : '/')}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition btn-press"
              title="End Consultation Call"
            >
              <PhoneOff className="w-4 h-4" />
              <span className="hidden sm:inline">End Call</span>
            </button>
          </div>

          {/* Live Recording Upload & Local Download Tray */}
          {(recordedDownloadUrl || isUploadingRecording || recordingSuccess) && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/95 border border-purple-800/80 text-xs shadow-xl max-w-xl w-full">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-zinc-200 text-[11px]">
                  {isUploadingRecording
                    ? 'Archiving recording to student CRM dossier...'
                    : recordingSuccess || 'Consultation recording ready'}
                </span>
              </div>
              {recordedDownloadUrl && (
                <button
                  onClick={downloadRecordingLocal}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition btn-press shadow-xs"
                  title="Download high-resolution WebM recording directly to your computer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download to PC (.webm)</span>
                </button>
              )}
            </div>
          )}

          {/* Floating Toast Notification for Auto-Snapshot & Proof */}
          {snapshotToast && (
            <div className="fixed top-16 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-2xl bg-zinc-900/95 border border-purple-500 shadow-2xl text-xs text-purple-200 animate-slide-in backdrop-blur-md">
              <Camera className="w-4 h-4 text-purple-400 shrink-0 animate-bounce" />
              <span className="font-semibold">{snapshotToast}</span>
            </div>
          )}
        </div>

        {/* Right Sidebar: Counselor Live Assessment & Dossier */}
        {role === 'counselor' && (
          <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-900/95 flex flex-col h-auto lg:h-full overflow-y-auto">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Student Assessment & Notes
                </h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-purple-950 text-purple-300 border border-purple-800">
                Live CRM Sync
              </span>
            </div>

            <div className="p-4 space-y-4 flex-1">
              {/* Student Profile Quick View */}
              {leadInfo ? (
                <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{leadInfo.fullName}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-800">
                      {leadInfo.stage}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 space-y-0.5">
                    <div><strong>Contact:</strong> {leadInfo.preferredContact} ({leadInfo.contactHandle})</div>
                    {leadInfo.email && <div><strong>Email:</strong> {leadInfo.email}</div>}
                    <div><strong>Pathway:</strong> {leadInfo.interestedPathway?.name || 'General Inquiry'}</div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs text-zinc-400">
                  Direct ad-hoc room. Notes can be saved or exported below.
                </div>
              )}

              {/* German Language Assessment Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                  Assessed German Proficiency:
                </label>
                <div className="grid grid-cols-6 gap-1">
                  {['None', 'A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setGermanLevel(lvl)}
                      className={`py-1 rounded text-center text-xs font-bold transition ${
                        germanLevel === lvl
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Intake Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                  Target Germany Intake:
                </label>
                <select
                  value={targetIntake}
                  onChange={(e) => setTargetIntake(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-600"
                >
                  <option value="Winter 2026">Winter 2026 (September Ausbildung)</option>
                  <option value="Spring 2027">Spring 2027 (Summer Semester Uni)</option>
                  <option value="Autumn 2026">Autumn 2026</option>
                  <option value="Winter 2027">Winter 2027</option>
                </select>
              </div>

              {/* Live Consultation Notes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400">
                    Live Consultation Notes:
                  </label>
                  {saveSuccess && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Saved to CRM!</span>
                    </span>
                  )}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  placeholder="Record educational background, German study commitment, financial readiness (€11,904 blocked account or Ausbildung stipend), and counselor advice..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-600 resize-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveConsultation(false)}
                  disabled={savingNotes}
                  className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/80 transition btn-press flex items-center justify-center space-x-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
                </button>

                {leadInfo && (
                  <button
                    type="button"
                    onClick={() => handleSaveConsultation(true)}
                    disabled={savingNotes}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition btn-press flex items-center justify-center space-x-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Complete & Advance Stage →</span>
                  </button>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
