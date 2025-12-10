import React from 'react';
import UserLayout from '../../components/UserLayout';
import UserTopicBrowser from './UserTopicBrowser';

const DailyTopicsPage: React.FC = () => {
    return (
        <UserLayout>
            <UserTopicBrowser />
        </UserLayout>
    );
};

export default DailyTopicsPage;
