import React from 'react';
import UserLayout from '../../components/UserLayout';
import UserPronunciation from './UserPronunciation';

const AIPronunciationPage: React.FC = () => {
    return (
        <UserLayout>
            <UserPronunciation />
        </UserLayout>
    );
};

export default AIPronunciationPage;
