import React from 'react';
import { Clock } from 'lucide-react';

interface VoiceCallTimerProps {
    remainingSeconds: number;
    limitSeconds: number;
    compact?: boolean;
}

const VoiceCallTimer: React.FC<VoiceCallTimerProps> = ({
    remainingSeconds,
    limitSeconds,
    compact = false,
}) => {
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = (): number => {
        return (remainingSeconds / limitSeconds) * 100;
    };

    const getColor = (): string => {
        const percentage = getProgressPercentage();
        if (percentage > 50) return 'text-green-600 dark:text-green-400';
        if (percentage > 20) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    if (compact) {
        return (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                <Clock className={`w-3 h-3 ${getColor()}`} />
                <span className={`text-xs font-medium tabular-nums ${getColor()}`}>
                    {formatTime(remainingSeconds)}
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <Clock className={`w-4 h-4 ${getColor()}`} />
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Session Time</span>
                    <span className={`text-sm font-bold tabular-nums ${getColor()}`}>
                        {formatTime(remainingSeconds)}
                    </span>
                </div>
                <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${getProgressPercentage() > 50
                                ? 'bg-green-500'
                                : getProgressPercentage() > 20
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                            }`}
                        style={{ width: `${getProgressPercentage()}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default VoiceCallTimer;
