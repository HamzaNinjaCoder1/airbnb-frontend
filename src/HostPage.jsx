import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import SecondHeader from './SecondHeader'
import AuthPage from './AuthPage'
import Footer from './Footer'

function HostPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [showAuth, setShowAuth] = useState(true);

    useEffect(() => {
        // If user is already authenticated, redirect to main page
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleAuthSuccess = () => {
        setShowAuth(false);
        // The AuthContext will update the authentication state
        // and the useEffect above will handle the redirect
    };

    // If already authenticated, don't show anything (redirect will happen)
    if (isAuthenticated) {
        return null;
    }

    return (
        <>
            <SecondHeader />
            <div className="pt-20">
                <AuthPage 
                    onAuthSuccess={handleAuthSuccess}
                    authMethod="email"
                />
            </div>
            <Footer />
        </>
    )
}

export default HostPage
