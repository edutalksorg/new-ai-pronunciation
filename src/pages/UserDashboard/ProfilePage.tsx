import React from 'react';
import UserLayout from '../../components/UserLayout';
import UserProfile from './UserProfile';

const ProfilePage: React.FC = () => {
    return (
        <UserLayout>
            <UserProfile />
        </UserLayout>
    );
};

export default ProfilePage;
