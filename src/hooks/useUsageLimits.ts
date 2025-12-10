import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import type { RootState } from '../store';
import { checkAndReset, activateTrial } from '../store/usageSlice';

export const useUsageLimits = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const usageData = useSelector((state: RootState) => state.usage);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Check if user has active subscription (unlimited access)
    const hasActiveSubscription = user?.subscriptionStatus === 'active';

    // Check and reset usage on mount and periodically
    useEffect(() => {
        dispatch(checkAndReset());

        // Activate trial if user is logged in and trial not yet activated
        if (user && !hasActiveSubscription && !usageData.trialActivatedAt) {
            dispatch(activateTrial());
        }

        // Check every minute for daily reset
        const interval = setInterval(() => {
            dispatch(checkAndReset());
        }, 60000);

        return () => clearInterval(interval);
    }, [dispatch, user, hasActiveSubscription, usageData.trialActivatedAt]);

    // Trial validity check
    const isTrialActive = () => {
        if (hasActiveSubscription) return true;

        if (!usageData.trialExpiresAt) return false;

        const expiresAt = new Date(usageData.trialExpiresAt);
        return new Date() < expiresAt;
    };

    const trialRemainingTime = () => {
        if (hasActiveSubscription) return 'Unlimited';

        if (!usageData.trialExpiresAt) return 'Not activated';

        const expiresAt = new Date(usageData.trialExpiresAt);
        const now = new Date();

        if (now >= expiresAt) return 'Expired';

        const diffMs = expiresAt.getTime() - now.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    };

    // Voice Call limits (5 min per session)
    const voiceCallRemainingSeconds = Math.max(
        0,
        usageData.voiceCallLimitSeconds - usageData.voiceCallUsedSeconds
    );

    const hasVoiceCallTimeRemaining = voiceCallRemainingSeconds > 0;

    // Trigger upgrade modal
    const triggerUpgradeModal = () => {
        setShowUpgradeModal(true);
    };

    const closeUpgradeModal = () => {
        setShowUpgradeModal(false);
    };

    return {
        hasActiveSubscription,

        // Trial access
        isTrialActive: isTrialActive(),
        trialRemainingTime: trialRemainingTime(),
        trialExpiresAt: usageData.trialExpiresAt,

        // Voice call session limits
        voiceCallRemainingSeconds,
        hasVoiceCallTimeRemaining,
        voiceCallUsedSeconds: usageData.voiceCallUsedSeconds,
        voiceCallLimitSeconds: usageData.voiceCallLimitSeconds,

        // Upgrade modal
        showUpgradeModal,
        triggerUpgradeModal,
        closeUpgradeModal,
    };
};
