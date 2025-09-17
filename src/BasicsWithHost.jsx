import React, { useState, useCallback } from 'react';
import HostWrapper from './HostWrapper';
import BasicsStep from './basics';

const BasicsWithHost = () => {
    const [basicsData, setBasicsData] = useState({
        max_guests: 4,
        bedrooms: 1,
        beds: 1,
        baths: 1
    });
    const [progress, setProgress] = useState(24);

    const handleBasicsDataChange = useCallback((newBasicsData) => {
        setBasicsData(newBasicsData);
    }, []);

    return (
        <HostWrapper
            currentStep="basics"
            nextPath="/aboutplace/standout"
            backPath="/aboutplace/location"
            additionalData={basicsData}
            progress={progress}
        >
            <BasicsStep onBasicsDataChange={handleBasicsDataChange} progress={progress} setProgress={setProgress} />
        </HostWrapper>
    );
};

export default BasicsWithHost;
