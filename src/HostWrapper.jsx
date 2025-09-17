import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const HostWrapper = ({ 
    children, 
    currentStep, 
    nextPath, 
    backPath, 
    onSaveAndExit, 
    onNext, 
    onBack,
    additionalData = {},
    progress = 0
}) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const hostId = searchParams.get('hostId');
    const listingId = searchParams.get('listingId');
    const editMode = searchParams.get('editMode') === 'true';
    const returnUrl = searchParams.get('returnUrl') || `/listings/${hostId}`;
    const [isSaving, setIsSaving] = useState(false);


    const handleSaveAndExit = async () => {
        if (!hostId) {
            console.warn('No host ID found in URL, proceeding without saving to database');
            if (onSaveAndExit) {
                onSaveAndExit();
            } else {
                navigate(hostId ? `/listings/${hostId}` : '/listings');
            }
            return;
        }

        setIsSaving(true);
        try {
            const requestData = {
                current_step: currentStep,
                status: 'draft',
                ...additionalData
            };

            const response = await axios.patch(
                `http://localhost:5000/api/data/listings/save-exit?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}`,
                requestData,
                { withCredentials: true }
            );
            
            console.log('Listing saved successfully:', response.data);
            if (onSaveAndExit) {
                onSaveAndExit();
            } else {
                navigate(hostId ? `/listings/${hostId}` : '/listings');
            }
        } catch (error) {
            console.error('Error saving listing:', error);
            if (onSaveAndExit) {
                onSaveAndExit();
            } else {
                navigate('/');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleNext = async () => {
        if (!hostId) {
            console.warn('No host ID found in URL, proceeding without saving to database');
            if (onNext) {
                onNext();
            } else if (nextPath) {
                navigate(nextPath);
            }
            return;
        }

        setIsSaving(true);
        try {
            const requestData = {
                current_step: currentStep,
                status: editMode ? 'published' : 'draft', // Keep as published in edit mode
                ...additionalData
            };

            const response = await axios.patch(
                `http://localhost:5000/api/data/listings/save-exit?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}`,
                requestData,
                { withCredentials: true }
            );
            
            console.log('Listing saved successfully:', response.data);
            
            if (editMode) {
                // In edit mode, return to listings page
                navigate(returnUrl);
            } else if (onNext) {
                onNext();
            } else if (nextPath) {
                // Preserve hostId in URL when navigating
                const urlWithHostId = hostId ? `${nextPath}?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}` : nextPath;
                navigate(urlWithHostId, { state: { progress } });
            }
        } catch (error) {
            console.error('Error saving listing:', error);
            if (editMode) {
                // In edit mode, return to listings page even on error
                navigate(returnUrl);
            } else if (onNext) {
                onNext();
            } else if (nextPath) {
                // Preserve hostId in URL when navigating
                const urlWithHostId = hostId ? `${nextPath}?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}` : nextPath;
                navigate(urlWithHostId, { state: { progress } });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (backPath) {
            // Preserve hostId in URL when navigating back
            const urlWithHostId = hostId ? `${backPath}?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}` : backPath;
            navigate(urlWithHostId);
        }
    };

    // Clone children and inject the handler functions and loading state
    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                onSaveAndExit: handleSaveAndExit,
                onNext: handleNext,
                onBack: handleBack,
                isSaving,
                hostId,
                listingId
            });
        }
        return child;
    });

    return <>{childrenWithProps}</>;
};

export default HostWrapper;
