import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import api from './api';

function HostDialog({ showHostDialog, setShowHostDialog, selectedHostType, setSelectedHostType }) {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    if (!showHostDialog) return null;
    if (!isAuthenticated) {
        return null;
    }

    const handleNextClick = async () => {
        if (!selectedHostType) return;
        try {
            const hostId = user?.id || user?._id;
            if (hostId) {
                const today = new Date();
                const title = `Your listing started ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
                // Use save-exit endpoint to create a new draft (no listingId => create)
                const res = await api.patch(
                    `/api/data/listings/save-exit?hostId=${hostId}`,
                    {
                        title,
                        stay_type: selectedHostType,
                        status: 'draft',
                        current_step: 'aboutplace'
                    },
                    { withCredentials: true }
                );
                const newListingId = res?.data?.data?.id || res?.data?.data?.listing_id;
                setShowHostDialog(false);
                setSelectedHostType(null);
                // Navigate to host onboarding with both hostId and listingId
                if (newListingId) {
                    navigate(`/host-onboarding?hostId=${hostId}&listingId=${newListingId}`);
                    return;
                }
                navigate(`/host-onboarding?hostId=${hostId}`);
                return;
            }
        } catch (err) {
            console.error('Failed to create listing:', err);
        }
        // Fallback navigation
        setShowHostDialog(false);
        setSelectedHostType(null);
        navigate('/aboutplace');
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20" onClick={() => setShowHostDialog(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-4 p-8" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-8">
                    <button 
                        onClick={() => {
                            setShowHostDialog(false);
                            setSelectedHostType(null);
                        }}
                        className="text-2xl text-gray-400 hover:text-gray-600 transition-colors hover:scale-110 transform duration-200"
                    >
                        ✕
                    </button>
                    <h2 className="text-2xl font-semibold text-gray-900">What would you like to host?</h2>
                    <div className="w-6"></div> 
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-8">
                    <div 
                        onClick={() => setSelectedHostType('home')}
                        className={`border rounded-xl p-10 transition-all duration-300 cursor-pointer group transform ${
                            selectedHostType === 'home' 
                                ? 'border-gray-400 bg-gray-50 shadow-lg scale-105' 
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-lg hover:scale-102'
                        }`}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-36 h-36 mb-6 flex items-center justify-center">
                                <img 
                                    src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-ActivitySetup/original/b5a7ef95-2d3a-4aaa-b9d7-6f8c4a91aa2d.png"
                                    alt="Home"
                                    className="w-32 h-32 object-contain"
                                />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900">Home</h3>
                        </div>
                    </div>
                    <div 
                        onClick={() => setSelectedHostType('experience')}
                        className={`border rounded-xl p-10 transition-all duration-300 cursor-pointer group transform ${
                            selectedHostType === 'experience' 
                                ? 'border-gray-400 bg-gray-50 shadow-lg scale-105' 
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-lg hover:scale-102'
                        }`}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-36 h-36 mb-6 flex items-center justify-center">
                                <img 
                                    src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-ActivitySetup/original/02579423-5d4b-4c71-bedb-0ea18cd293f8.png"
                                    alt="Experience"
                                    className="w-32 h-32 object-contain"
                                />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900">Experience</h3>
                        </div>
                    </div>
                    <div 
                        onClick={() => setSelectedHostType('service')}
                        className={`border rounded-xl p-10 transition-all duration-300 cursor-pointer group transform ${
                            selectedHostType === 'service' 
                                ? 'border-gray-400 bg-gray-50 shadow-lg scale-105' 
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-lg hover:scale-102'
                        }`}
                    >
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-36 h-36 mb-6 flex items-center justify-center">
                                <img 
                                    src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-ActivitySetup/original/1de966ec-197f-4b72-bbb1-cf4c91876dfa.png"
                                    alt="Service"
                                    className="w-32 h-32 object-contain"
                                />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900">Service</h3>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button 
                        onClick={handleNextClick}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                            selectedHostType 
                                ? 'bg-black text-white hover:bg-gray-800 hover:scale-105' 
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!selectedHostType}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HostDialog;
