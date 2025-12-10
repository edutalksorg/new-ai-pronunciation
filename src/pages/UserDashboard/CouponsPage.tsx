import React from 'react';
import UserLayout from '../../components/UserLayout';
import UserCoupons from './UserCoupons';

const CouponsPage: React.FC = () => {
    return (
        <UserLayout>
            <UserCoupons />
        </UserLayout>
    );
};

export default CouponsPage;
