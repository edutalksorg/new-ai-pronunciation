import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { callsService } from '../../services/calls';
import { signalRService, IceCandidatePayload } from '../../services/signalr';
import {
    endCall,
    setCallStatus,
} from '../../store/callSlice';
import IncomingCallModal from './IncomingCallModal';
import ActiveCallOverlay from './ActiveCallOverlay';

// Helper to get WebRTC config
const getWebRTCConfig = async () => {
    try {
        const res: any = await callsService.webrtcConfig();
        const data = res.data || res; // Handle axios vs fetch wrapper differences
        return { iceServers: data.iceServers };
    } catch (e) {
        console.warn('Failed to fetch ICE servers, using default Google STUN', e);
        return {
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        };
    }
};

const CallManager: React.FC = () => {
    const dispatch = useDispatch();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const { callState, currentCall, isMuted } = useSelector((state: RootState) => state.call);

    // Refs for WebRTC to avoid stale closures in callbacks
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);
    const remoteStream = useRef<MediaStream | null>(null);
    const incomingAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        console.log("[CallManager] Call State", callState);
    }, [callState]);

    useEffect(() => {
        console.log("[CallManager] Current Call", currentCall);
    }, [currentCall]);

    useEffect(() => {
        console.log("[CallManager] Is Muted", isMuted);
    }, [isMuted]);

    useEffect(() => {
        console.log("[CallManager] User", user);
    }, [user]);

    useEffect(() => {
        console.log("[CallManager] Token", token);
    }, [token]);



    // 1. Initialize SignalR on Auth Load using the token
    useEffect(() => {
        if (token && user) {
            signalRService.setToken(token);
            // Assuming your hub URL - typically from env or constants
            const HUB_URL = 'https://edutalks-backend.lemonfield-c795bfef.centralindia.azurecontainerapps.io/hubs/call-signaling';
            // In a real app, replace with actual env var: import.meta.env.VITE_API_HUB_URL

            // For now, we use a placeholder or derived from current origin if relative path
            // But spec says "wss://your-api-domain.com..."
            // Let's assume the base API url + /hubs/call-signaling logic is handled in service or passed here
            // We'll trust the service logic or pass a relative path if supported
            // Connect directly to the backend to avoid Vite proxy WebSocket issues (1011)
            // We use skipNegotiation in signalr.ts, so this establishes a direct WSS connection.
            // BACKEND_HUB_URL is currently returning 404, disabling to prevent console spam during quiz testing
            // const BACKEND_HUB_URL = 'https://edutalks-backend.lemonfield-c795bfef.centralindia.azurecontainerapps.io/hubs/call-signaling';
            // signalRService.connect(BACKEND_HUB_URL).catch(console.error);

            return () => {
                signalRService.disconnect();
            }
        }
    }, [token, user]);

    // 2. Handle Cleanup of Media on Unmount or Call End
    useEffect(() => {
        if (callState === 'idle') {
            if (localStream.current) {
                localStream.current.getTracks().forEach(track => track.stop());
                localStream.current = null;
            }
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
            if (incomingAudioRef.current) {
                incomingAudioRef.current.srcObject = null;
            }
        }
    }, [callState]);

    // 3. Handle Mute Toggle (Hardware level)
    useEffect(() => {
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => {
                track.enabled = !isMuted;
            });
        }
    }, [isMuted]);

    // 4. WebRTC - Initialize & Event subscription
    // This effect runs when we enter a "connecting" state (accepted call)
    useEffect(() => {
        if (callState === 'connecting' && currentCall) {
            const initializePeer = async () => {
                console.log('[CallManager] Initializing Peer Connection');
                try {
                    // Get User Media
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                    localStream.current = stream;

                    // Create Peer Connection
                    const config = await getWebRTCConfig();
                    const pc = new RTCPeerConnection(config);
                    peerConnection.current = pc;

                    // Add Tracks
                    stream.getTracks().forEach(track => {
                        pc.addTrack(track, stream);
                    });

                    // Handle Remote Stream
                    pc.ontrack = (event) => {
                        console.log('[CallManager] Received Remote Stream');
                        const [remote] = event.streams;
                        remoteStream.current = remote;
                        if (incomingAudioRef.current) {
                            incomingAudioRef.current.srcObject = remote;
                            incomingAudioRef.current.play().catch(console.error);
                        }
                    };

                    // Handle ICE Candidates
                    pc.onicecandidate = (event) => {
                        if (event.candidate) {
                            signalRService.sendIceCandidate(currentCall.callId, {
                                candidate: event.candidate.candidate,
                                sdpMid: event.candidate.sdpMid || '',
                                sdpMLineIndex: event.candidate.sdpMLineIndex || 0
                            });
                        }
                    };

                    // Handle Connection State
                    pc.onconnectionstatechange = () => {
                        console.log('[CallManager] Connection State:', pc.connectionState);
                        if (pc.connectionState === 'connected') {
                            signalRService.notifyCallActive(currentCall.callId);
                            dispatch(setCallStatus('active'));
                        } else if (pc.connectionState === 'failed') {
                            dispatch(endCall());
                            // TODO: Show error notification
                        }
                    };

                    // --- Offer / Answer Logic ---

                    // Register handlers
                    signalRService.onReceiveOffer(async (sdp) => {
                        console.log('[CallManager] Received Offer');
                        if (!pc) return;
                        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }));
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        await signalRService.sendAnswer(currentCall.callId, answer.sdp || '');
                    });

                    signalRService.onReceiveAnswer(async (sdp) => {
                        console.log('[CallManager] Received Answer');
                        if (!pc) return;
                        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp }));
                    });

                    signalRService.onReceiveIceCandidate(async (candidate) => {
                        // console.log('[CallManager] Received ICE Candidate');
                        if (!pc) return;
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(candidate));
                        } catch (e) {
                            console.error('Error adding received ice candidate', e);
                        }
                    });

                    // Decide based on Role: Caller creates offer
                    // If I am the initiator (caller), I create the offer
                    // How do we know? We check if we *initiated* it. 
                    // currentCall.callerId === user.id ?

                    if (currentCall.callerId === user?.id) {
                        console.log('[CallManager] I am caller, creating offer...');
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        await signalRService.sendOffer(currentCall.callId, offer.sdp || '');
                    }

                } catch (err) {
                    console.error('Failed to initialize WebRTC', err);
                    dispatch(endCall());
                }
            };

            initializePeer();

            // Cleanup handlers on unmount/state change (important for double renders)
            return () => {
                signalRService.offWebRTC();
            };
        }
    }, [callState, currentCall, dispatch, user?.id]);

    return (
        <>
            <IncomingCallModal />
            <ActiveCallOverlay />
            <audio ref={incomingAudioRef} autoPlay />
        </>
    );
};

export default CallManager;
