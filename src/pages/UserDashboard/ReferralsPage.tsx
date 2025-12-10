import React from 'react';
import UserLayout from '../../components/UserLayout';
import UserReferrals from './UserReferrals';

const ReferralsPage: React.FC = () => {
    return (
        <UserLayout>
            <UserReferrals />
        </UserLayout>
    );
};

export default ReferralsPage;
