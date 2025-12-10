import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface VoiceCall {
  id: string;
  callerId: string;
  calleeId: string;
  callerName: string;
  calleeName: string;
  topicId?: string;
  status: 'initiated' | 'ringing' | 'accepted' | 'ongoing' | 'completed' | 'rejected' | 'missed';
  duration?: number;
  startedAt?: string;
  endedAt?: string;
  rating?: number;
  notes?: string;
  recordingUrl?: string;
}

export interface AvailableUser {
  id: string;
  name: string;
  avatar?: string;
  level: string;
  topicsOfInterest?: string[];
  isOnline: boolean;
}

interface CallState {
  calls: VoiceCall[];
  currentCall: VoiceCall | null;
  availableUsers: AvailableUser[];
  callHistory: VoiceCall[];
  isLoading: boolean;
  error: string | null;
  isCallActive: boolean;
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

const initialState: CallState = {
  calls: [],
  currentCall: null,
  availableUsers: [],
  callHistory: [],
  isLoading: false,
  error: null,
  isCallActive: false,
  peerConnection: null,
  localStream: null,
  remoteStream: null,
};

export const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setAvailableUsers: (state, action: PayloadAction<AvailableUser[]>) => {
      state.availableUsers = action.payload;
    },
    setCurrentCall: (state, action: PayloadAction<VoiceCall | null>) => {
      state.currentCall = action.payload;
    },
    updateCurrentCall: (state, action: PayloadAction<Partial<VoiceCall>>) => {
      if (state.currentCall) {
        state.currentCall = { ...state.currentCall, ...action.payload };
      }
    },
    setCallActive: (state, action: PayloadAction<boolean>) => {
      state.isCallActive = action.payload;
    },
    addCallToHistory: (state, action: PayloadAction<VoiceCall>) => {
      state.callHistory.unshift(action.payload);
      state.calls.unshift(action.payload);
    },
    setCallHistory: (state, action: PayloadAction<VoiceCall[]>) => {
      state.callHistory = action.payload;
    },
    setLocalStream: (state, action: PayloadAction<MediaStream | null>) => {
      state.localStream = action.payload;
    },
    setRemoteStream: (state, action: PayloadAction<MediaStream | null>) => {
      state.remoteStream = action.payload;
    },
    setPeerConnection: (state, action: PayloadAction<RTCPeerConnection | null>) => {
      state.peerConnection = action.payload;
    },
    endCall: (state) => {
      state.currentCall = null;
      state.isCallActive = false;
      state.peerConnection = null;
      state.localStream = null;
      state.remoteStream = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setAvailableUsers,
  setCurrentCall,
  updateCurrentCall,
  setCallActive,
  addCallToHistory,
  setCallHistory,
  setLocalStream,
  setRemoteStream,
  setPeerConnection,
  endCall,
} = callSlice.actions;

export default callSlice.reducer;
