import React from 'react';
import UserLayout from '../../components/UserLayout';
import UserQuizInterface from './UserQuizInterface';

const QuizzesPage: React.FC = () => {
    return (
        <UserLayout>
            <UserQuizInterface />
        </UserLayout>
    );
};

export default QuizzesPage;
