import React, { useState, useCallback } from 'react';
import HostWrapper from './HostWrapper';
import AmenitiesSelect from './amenitiesSelect';

const AmenitiesWithHost = () => {
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [progress, setProgress] = useState(35);

    const handleAmenitiesDataChange = useCallback((amenities) => {
        setSelectedAmenities(amenities);
    }, []);

    return (
        <HostWrapper
            currentStep="amenities"
            nextPath="/aboutplace/photos"
            backPath="/aboutplace/standout"
            additionalData={selectedAmenities.length > 0 ? { amenities: selectedAmenities } : {}}
            progress={progress}
        >
            <AmenitiesSelect onAmenitiesDataChange={handleAmenitiesDataChange} progress={progress} setProgress={setProgress} />
        </HostWrapper>
    );
};

export default AmenitiesWithHost;
