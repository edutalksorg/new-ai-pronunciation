import React from 'react';
import UserLayout from '../../components/UserLayout';
import UserSubscriptions from './UserSubscriptions';

const SubscriptionsPage: React.FC = () => {
    return (
        <UserLayout>
            <UserSubscriptions />
        </UserLayout>
    );
};

export default SubscriptionsPage;
