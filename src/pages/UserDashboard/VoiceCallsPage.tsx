import React from 'react';
import UserLayout from '../../components/UserLayout';
import UserVoiceCall from './UserVoiceCall';

const VoiceCallsPage: React.FC = () => {
    return (
        <UserLayout>
            <UserVoiceCall />
        </UserLayout>
    );
};

export default VoiceCallsPage;
