import AgoraRTC, {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    IMicrophoneAudioTrack,
    UID
} from 'agora-rtc-sdk-ng';

// Agora Configuration - Production App ID (requires certificate/token)
const AGORA_APP_ID = '3a2e9a0f5c924ca9b460555916dbaae5';

// Event callback types
type UserPublishedCallback = (user: IAgoraRTCRemoteUser) => void;
type UserLeftCallback = (user: IAgoraRTCRemoteUser) => void;
type ConnectionStateCallback = (state: string) => void;

class AgoraService {
    private client: IAgoraRTCClient | null = null;
    private localAudioTrack: IMicrophoneAudioTrack | null = null;
    private currentChannelName: string | null = null;
    private currentUid: UID | null = null;

    // Event callbacks
    private onUserPublished: UserPublishedCallback | null = null;
    private onUserLeft: UserLeftCallback | null = null;
    private onConnectionStateChange: ConnectionStateCallback | null = null;

    /**
     * Initialize Agora client
     */
    async initialize() {
        if (this.client) {
            console.log('⚠️ Agora client already initialized');
            return;
        }

        console.log('🎙️ Initializing Agora client...');

        // Create Agora client with RTC mode and VP8 codec
        this.client = AgoraRTC.createClient({
            mode: 'rtc',
            codec: 'vp8'
        });

        // Set up event listeners
        this.setupEventListeners();

        console.log('✅ Agora client initialized');
    }

    /**
     * Set up Agora event listeners
     */
    private setupEventListeners() {
        if (!this.client) return;

        // User published audio
        this.client.on('user-published', async (user, mediaType) => {
            console.log(`👤 User published ${mediaType}:`, user.uid);

            if (mediaType === 'audio') {
                try {
                    // Subscribe to remote user's audio
                    await this.client!.subscribe(user, mediaType);
                    console.log('✅ Subscribed to remote audio');

                    // Play remote audio
                    user.audioTrack?.play();
                    console.log('🔊 Playing remote audio');

                    // Notify callback
                    if (this.onUserPublished) {
                        this.onUserPublished(user);
                    }
                } catch (error) {
                    console.error('❌ Failed to subscribe to remote user:', error);
                }
            }
        });

        // User unpublished
        this.client.on('user-unpublished', (user, mediaType) => {
            console.log(`👤 User unpublished ${mediaType}:`, user.uid);
        });

        // User left channel
        this.client.on('user-left', (user, reason) => {
            console.log(`👋 User left channel:`, user.uid, 'Reason:', reason);

            if (this.onUserLeft) {
                this.onUserLeft(user);
            }
        });

        // Connection state changed
        this.client.on('connection-state-change', (curState, prevState, reason) => {
            console.log(`🔗 Connection state: ${prevState} → ${curState}`, reason);

            if (this.onConnectionStateChange) {
                this.onConnectionStateChange(curState);
            }
        });

        // Network quality
        this.client.on('network-quality', (stats) => {
            // Log network quality (optional)
            // console.log('📊 Network quality:', stats);
        });
    }

    /**
     * Join an Agora channel
     * @param channelName - Channel name (e.g., call_123)
     * @param token - Agora token from backend
     * @param uid - User ID (use user's ID from your system)
     */
    async joinChannel(channelName: string, token: string | null, uid: string | number): Promise<void> {
        try {
            if (!this.client) {
                await this.initialize();
            }

            console.log(`📞 Joining Agora channel: ${channelName}`);

            // Join the channel
            this.currentUid = await this.client!.join(
                AGORA_APP_ID,
                channelName,
                token, // Can be null for testing (not recommended for production)
                uid
            );

            this.currentChannelName = channelName;
            console.log(`✅ Joined channel as UID: ${this.currentUid}`);

            // Create and publish local audio track
            await this.publishLocalAudio();

        } catch (error: any) {
            console.error('❌ Failed to join Agora channel:', error);
            throw new Error(`Failed to join channel: ${error.message}`);
        }
    }

    /**
     * Create and publish local audio track
     */
    private async publishLocalAudio(): Promise<void> {
        try {
            console.log('🎤 Creating local audio track...');

            // Create microphone audio track
            this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                encoderConfig: 'speech_standard', // Optimized for voice
            });

            console.log('✅ Local audio track created');

            // Publish to channel
            await this.client!.publish([this.localAudioTrack]);
            console.log('✅ Published local audio to channel');

        } catch (error: any) {
            console.error('❌ Failed to publish local audio:', error);
            throw new Error(`Failed to publish audio: ${error.message}`);
        }
    }

    /**
     * Leave the current channel and cleanup
     */
    async leaveChannel(): Promise<void> {
        try {
            console.log('👋 Leaving Agora channel...');

            // Close local audio track
            if (this.localAudioTrack) {
                this.localAudioTrack.close();
                this.localAudioTrack = null;
                console.log('✅ Local audio track closed');
            }

            // Leave channel
            if (this.client) {
                await this.client.leave();
                console.log('✅ Left Agora channel');
            }

            this.currentChannelName = null;
            this.currentUid = null;

        } catch (error: any) {
            console.error('❌ Error leaving channel:', error);
            throw error;
        }
    }

    /**
     * Toggle mute/unmute local audio
     * @returns New mute state (true = muted, false = unmuted)
     */
    async toggleMute(): Promise<boolean> {
        if (!this.localAudioTrack) {
            console.warn('⚠️ No local audio track to mute');
            return false;
        }

        const currentlyEnabled = this.localAudioTrack.enabled;
        await this.localAudioTrack.setEnabled(!currentlyEnabled);

        const isMuted = !this.localAudioTrack.enabled;
        console.log(`🔇 Audio ${isMuted ? 'muted' : 'unmuted'}`);

        return isMuted;
    }

    /**
     * Set mute state explicitly
     */
    async setMuted(muted: boolean): Promise<void> {
        if (!this.localAudioTrack) {
            console.warn('⚠️ No local audio track');
            return;
        }

        await this.localAudioTrack.setEnabled(!muted);
        console.log(`🔇 Audio ${muted ? 'muted' : 'unmuted'}`);
    }

    /**
     * Get current mute state
     */
    isMuted(): boolean {
        return this.localAudioTrack ? !this.localAudioTrack.enabled : false;
    }

    /**
     * Set event callbacks
     */
    setEventCallbacks(callbacks: {
        onUserPublished?: UserPublishedCallback;
        onUserLeft?: UserLeftCallback;
        onConnectionStateChange?: ConnectionStateCallback;
    }) {
        this.onUserPublished = callbacks.onUserPublished || null;
        this.onUserLeft = callbacks.onUserLeft || null;
        this.onConnectionStateChange = callbacks.onConnectionStateChange || null;
    }

    /**
     * Cleanup and destroy client
     */
    async destroy(): Promise<void> {
        await this.leaveChannel();

        if (this.client) {
            this.client.removeAllListeners();
            this.client = null;
            console.log('✅ Agora client destroyed');
        }
    }

    /**
     * Get current channel info
     */
    getCurrentChannel(): { channelName: string | null; uid: UID | null } {
        return {
            channelName: this.currentChannelName,
            uid: this.currentUid
        };
    }
}

// Export singleton instance
export const agoraService = new AgoraService();
export default agoraService;

