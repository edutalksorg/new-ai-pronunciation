import React from 'react';

interface UserStatusIndicatorProps {
    isOnline?: boolean;
    status?: string;
    availability?: string;
    showLabel?: boolean;
}

const UserStatusIndicator: React.FC<UserStatusIndicatorProps> = ({
    isOnline,
    status,
    availability,
    showLabel = false
}) => {
    // Determine if user is online based on various possible API fields
    const userIsOnline = isOnline === true ||
        status === 'online' ||
        status === 'Online' ||
        availability === 'Online';

    if (showLabel) {
        return (
            <div className="flex items-center gap-2">
                <div className={`relative w-2.5 h-2.5 rounded-full ${userIsOnline ? 'bg-green-500' : 'bg-gray-400'}`}>
                    {userIsOnline && (
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                    )}
                </div>
                <span className={`text-sm font-medium ${userIsOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {userIsOnline ? 'Online' : 'Offline'}
                </span>
            </div>
        );
    }

    return (
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white dark:border-slate-900 rounded-full ${userIsOnline ? 'bg-green-500' : 'bg-red-500'}`}>
            {userIsOnline && (
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
            )}
        </div>
    );
};

export default UserStatusIndicator;
