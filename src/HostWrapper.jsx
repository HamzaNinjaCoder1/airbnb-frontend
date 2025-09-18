import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from './api';

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
    const [existingData, setExistingData] = useState(null);

    // Build a stable localStorage key per listing
    const storageKey = useMemo(() => {
        const id = listingId || 'new';
        return `listing:${hostId || 'anon'}:${id}`;
    }, [hostId, listingId]);

    // Load existing data from backend (if ids present) and merge with local storage snapshot
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                let server = null;
                if (hostId && listingId) {
                    try {
                        const res = await api.get(`/api/data/listing/${listingId}`);
                        server = res?.data || null;
                    } catch (_) {
                        // ignore fetch errors; we'll still show local data
                    }
                }
                const localRaw = localStorage.getItem(storageKey);
                const local = localRaw ? JSON.parse(localRaw) : {};
                const merged = { ...(server || {}), ...(local || {}) };
                if (!cancelled) setExistingData(merged);
            } catch (_) {
                if (!cancelled) setExistingData(null);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [hostId, listingId, storageKey]);

    // Helper to persist partial step data locally for steps not saved to DB
    const persistLocal = (partial) => {
        try {
            const prev = localStorage.getItem(storageKey);
            const obj = prev ? JSON.parse(prev) : {};
            const next = { ...obj, ...(partial || {}) };
            localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (_) {}
    };


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

            const response = await api.patch(
                `/api/data/listings/save-exit?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}`,
                requestData,
                { withCredentials: true }
            );
            
            console.log('Listing saved successfully:', response.data);
            // Mirror to local storage as well
            persistLocal(requestData);
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

            const response = await api.patch(
                `/api/data/listings/save-exit?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}`,
                requestData,
                { withCredentials: true }
            );
            
            console.log('Listing saved successfully:', response.data);
            // Mirror to local storage as well
            persistLocal(requestData);
            
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
                listingId,
                existingData,
                persistLocal
            });
        }
        return child;
    });

    return <>{childrenWithProps}</>;
};

export default HostWrapper;
