import React from 'react';
import UserLayout from '../../components/UserLayout';
import UserWallet from './UserWallet';

const WalletPage: React.FC = () => {
    return (
        <UserLayout>
            <UserWallet />
        </UserLayout>
    );
};

export default WalletPage;
