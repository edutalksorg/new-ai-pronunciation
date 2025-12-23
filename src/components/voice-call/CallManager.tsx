import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { callsService } from '../../services/calls';
import { signalRService } from '../../services/signalr';
import agoraService from '../../services/agora';
import {
    endCall,
    setCallStatus,
} from '../../store/callSlice';
import IncomingCallModal from './IncomingCallModal';
import ActiveCallOverlay from './ActiveCallOverlay';
import CallingModal from './CallingModal';
import { callLogger } from '../../utils/callLogger';

/**
 * Convert GUID string to numeric UID for Agora
 * Backend expects integer UID, so we hash the GUID to a number
 */
const guidToNumericUid = (guid: string): number => {
    // Remove hyphens and take first 8 characters
    const hex = guid.replace(/-/g, '').substring(0, 8);
    // Convert to integer (max 32-bit unsigned int)
    return parseInt(hex, 16) >>> 0;
};

const CallManager: React.FC = () => {
    const dispatch = useDispatch();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const { callState, currentCall, isMuted } = useSelector((state: RootState) => state.call);

    // Refs for Agora
    const incomingAudioRef = useRef<HTMLAudioElement | null>(null);
    const isJoiningChannel = useRef<boolean>(false);
    const hasJoinedChannel = useRef<boolean>(false);

    // Log state changes for debugging
    useEffect(() => {
        callLogger.stateTransition('previous', callState, currentCall?.callId);
    }, [callState, currentCall?.callId]);

    useEffect(() => {
        if (currentCall) {
            callLogger.debug('Current call updated', {
                callId: currentCall.callId,
                status: currentCall.status,
                callerName: currentCall.callerName,
                calleeName: currentCall.calleeName
            });
        }
    }, [currentCall]);

    useEffect(() => {
        callLogger.debug(`Mute state: ${isMuted ? 'MUTED' : 'UNMUTED'}`);
    }, [isMuted]);

    // 1. Initialize SignalR on Auth Load
    useEffect(() => {
        if (token && user) {
            callLogger.info('Initializing SignalR for authenticated user', {
                userId: user.id,
                userName: user.fullName
            });

            signalRService.setToken(token);

            const HUB_URL = 'https://edutalks-backend.lemonfield-c795bfef.centralindia.azurecontainerapps.io/hubs/call-signaling';

            callLogger.info('Connecting to SignalR hub', { hubUrl: HUB_URL });

            signalRService.connect(HUB_URL)
                .then(() => {
                    callLogger.info('✅ SignalR connection established successfully');
                    // Automatically set availability to Online
                    callsService.updateAvailability('Online')
                        .then(() => callLogger.info('Updated availability to Online'))
                        .catch(err => callLogger.warning('Failed to auto-set availability', err));
                })
                .catch((error) => {
                    callLogger.error('❌ SignalR connection failed', error);
                });

            return () => {
                callLogger.info('Disconnecting SignalR on unmount');
                signalRService.disconnect();
            };
        }
    }, [token, user?.id]);

    // 2. Handle Cleanup on Call End
    useEffect(() => {
        if (callState === 'idle') {
            callLogger.debug('Call state is idle, cleaning up Agora resources');

            if (hasJoinedChannel.current) {
                agoraService.leaveChannel()
                    .then(() => {
                        callLogger.info('✅ Left Agora channel');
                        hasJoinedChannel.current = false;
                        isJoiningChannel.current = false;
                    })
                    .catch(err => callLogger.error('Error leaving Agora channel', err));
            }
        }
    }, [callState]);

    // 3. Handle Mute Toggle with Agora
    useEffect(() => {
        if (hasJoinedChannel.current) {
            agoraService.setMuted(isMuted)
                .then(() => {
                    callLogger.debug(`Agora audio ${isMuted ? 'muted' : 'unmuted'}`);
                })
                .catch(err => callLogger.error('Error toggling mute', err));
        }
    }, [isMuted]);

    // 4. Agora - Join Channel when call becomes active
    useEffect(() => {
        const joinAgoraChannel = async () => {
            if (!currentCall || !user) return;
            if (isJoiningChannel.current || hasJoinedChannel.current) return;

            // Only join when call is connecting or active
            if (callState !== 'connecting' && callState !== 'active') return;

            try {
                isJoiningChannel.current = true;
                callLogger.info('🎙️ Joining Agora channel', {
                    callId: currentCall.callId,
                    userId: user.id
                });

                // Channel name based on call ID
                const channelName = `call_${currentCall.callId}`;

                // Convert user GUID to numeric UID for Agora
                // Backend expects integer, Agora accepts both string and number
                const numericUid = guidToNumericUid(user.id);
                const stringUid = user.id; // Keep string for Agora join

                // Fetch Agora token from backend
                // Backend expects numeric UId parameter
                let agoraToken: string | null = null;
                try {
                    callLogger.debug('Fetching Agora token from backend', {
                        channelName,
                        numericUid,
                        originalGuid: user.id
                    });
                    // Send numeric UID to backend (it expects int)
                    const tokenResponse = await callsService.getAgoraToken(channelName, numericUid.toString()) as { token: string };
                    agoraToken = tokenResponse.token || null;
                    callLogger.info('✅ Agora token fetched successfully');
                } catch (error: any) {
                    callLogger.warning('Failed to fetch Agora token, using null (App Certificate must be disabled)', error.message);
                    // Continue with null token - works when App Certificate is disabled
                }

                // Set up Agora event callbacks
                agoraService.setEventCallbacks({
                    onUserPublished: (remoteUser) => {
                        callLogger.info('✅ Remote user joined and published audio', {
                            uid: remoteUser.uid
                        });
                        // Update call status to active when remote user joins
                        if (callState === 'connecting') {
                            dispatch(setCallStatus('active'));
                        }
                    },
                    onUserLeft: (remoteUser) => {
                        callLogger.info('👋 Remote user left', {
                            uid: remoteUser.uid
                        });
                    },
                    onConnectionStateChange: (state) => {
                        callLogger.info(`🔗 Agora connection state: ${state}`);
                        if (state === 'CONNECTED') {
                            dispatch(setCallStatus('active'));
                        } else if (state === 'DISCONNECTED') {
                            // Handle disconnection
                            callLogger.warning('Agora disconnected');
                        }
                    }
                });

                // Join the channel with numeric UID
                await agoraService.joinChannel(channelName, agoraToken, numericUid);

                hasJoinedChannel.current = true;
                callLogger.info('✅ Successfully joined Agora channel');

                // Update call status to active
                dispatch(setCallStatus('active'));

            } catch (error: any) {
                callLogger.error('❌ Failed to join Agora channel', error);
                isJoiningChannel.current = false;

                // End call on error
                if (currentCall) {
                    try {
                        await callsService.end(currentCall.callId);
                    } catch (e) {
                        callLogger.error('Failed to end call after Agora error', e);
                    }
                    dispatch(endCall({ partnerName: currentCall.callerName || currentCall.calleeName || 'Unknown' }));
                }
            }
        };

        joinAgoraChannel();
    }, [callState, currentCall, user, dispatch]);

    // 5. Cleanup on unmount
    useEffect(() => {
        return () => {
            if (hasJoinedChannel.current) {
                callLogger.info('Component unmounting, leaving Agora channel');
                agoraService.leaveChannel()
                    .catch(err => callLogger.error('Error during unmount cleanup', err));
            }
        };
    }, []);

    return (
        <>
            {/* Incoming Call Modal */}
            <IncomingCallModal />

            {/* Calling Modal (Outgoing) */}
            <CallingModal />

            {/* Active Call Overlay */}
            {callState === 'active' && <ActiveCallOverlay />}

            {/* Hidden audio element for incoming call ringtone */}
            <audio
                ref={incomingAudioRef}
                src="/sounds/incoming-call.mp3"
                loop
                style={{ display: 'none' }}
            />
        </>
    );
};

export default CallManager;

