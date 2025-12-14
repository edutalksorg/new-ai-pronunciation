import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Phone, PhoneOff, Clock } from 'lucide-react';
import { RootState } from '../../store';
import { callsService } from '../../services/calls';
import { acceptCall, clearIncomingInvitation } from '../../store/callSlice';
import { signalRService } from '../../services/signalr';

const IncomingCallModal: React.FC = () => {
    const dispatch = useDispatch();
    const { incomingInvitation } = useSelector((state: RootState) => state.call);
    const [timeLeft, setTimeLeft] = useState(60);
    useEffect(() => {
        console.log("[IncomingCallModal] Inviatation", incomingInvitation);
    }, [incomingInvitation]);

    useEffect(() => {
        if (incomingInvitation) {
            setTimeLeft(incomingInvitation.expiresInSeconds || 60);
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleDecline(); // Auto decline
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [incomingInvitation]);

    if (!incomingInvitation) return null;

    useEffect(() => {
        const audio = new Audio('/sounds/ringtone.mp3');
        audio.loop = true;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("Ringtone playback error:", error);
            });
        }

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, [incomingInvitation.callId]);

    const handleAccept = async () => {
        try {
            // 1. Join SignalR Group
            await signalRService.joinCallSession(incomingInvitation.callId);

            // 2. Call API to confirm
            await callsService.respond(incomingInvitation.callId, true);

            // 3. Update Redux
            // We construct a partial object to satisfy the basic needs until we get full details
            dispatch(acceptCall({
                callId: incomingInvitation.callId,
                callerId: '', // Unknown at this stage if not in payload, but usually backend sends it
                callerName: incomingInvitation.callerName,
                callerAvatar: incomingInvitation.callerAvatar,
                calleeId: '', // Current user
                calleeName: 'Me',
                status: 'accepted',
                initiatedAt: incomingInvitation.timestamp,
            } as any)); // Using 'any' briefly to bypass missing fields not critical for connection

        } catch (error) {
            console.error('Failed to accept call', error);
            // Show error handling
        }
    };

    const handleDecline = async () => {
        try {
            await callsService.respond(incomingInvitation.callId, false);
        } catch (error) {
            console.error('Failed to decline call', error);
        } finally {
            dispatch(clearIncomingInvitation());
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 transform transition-all animate-in fade-in zoom-in-95">
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-100 dark:border-indigo-900/50 shadow-inner">
                            {incomingInvitation.callerAvatar ? (
                                <img
                                    src={incomingInvitation.callerAvatar}
                                    alt={incomingInvitation.callerName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                                    {incomingInvitation.callerName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-2 transform -translate-x-1/2 left-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                            <Clock size={12} /> {timeLeft}s
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {incomingInvitation.callerName}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                        Incoming Voice Call...
                    </p>

                    <div className="flex items-center gap-6 w-full justify-center">
                        <button
                            onClick={handleDecline}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-red-200 dark:border-red-900">
                                <PhoneOff size={24} />
                            </div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Decline</span>
                        </button>

                        <button
                            onClick={handleAccept}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-green-200 dark:shadow-green-900/50 animate-pulse">
                                <Phone size={28} className="fill-current" />
                            </div>
                            <span className="text-xs font-medium text-gray-900 dark:text-white font-semibold">Accept</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;
