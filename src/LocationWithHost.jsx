import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import HostWrapper from './HostWrapper';
import LocationStep from './location';

const LocationWithHost = () => {
    const [searchParams] = useSearchParams();
    const editMode = searchParams.get('editMode') === 'true';
    
    const [locationData, setLocationData] = useState({
        address: 'The Garden Spice, Canal Rd, adjacent Green Forts 2, Jhelum Block Green Forts 2, Lahore, 54000',
        city: 'Lahore',
        country: 'Pakistan',
        latitude: null,
        longitude: null
    });
    const [progress, setProgress] = useState(18);

    const handleLocationDataChange = useCallback((newLocationData) => {
        setLocationData(newLocationData);
    }, []);

    return (
        <HostWrapper
            currentStep="location"
            nextPath="/aboutplace/basics"
            backPath="/aboutplace/privacy"
            additionalData={{
                // Note: address field needs to be added to backend updatableFields if not already present
                address: locationData.address,
                city: locationData.city,
                country: locationData.country,
                latitude: locationData.latitude,
                longitude: locationData.longitude
            }}
            progress={progress}
        >
            <LocationStep onLocationDataChange={handleLocationDataChange} progress={progress} setProgress={setProgress} editMode={editMode} />
        </HostWrapper>
    );
};

export default LocationWithHost;
