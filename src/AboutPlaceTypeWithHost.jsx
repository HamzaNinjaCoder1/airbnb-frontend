import React, { useState } from 'react';
import HostWrapper from './HostWrapper';
import AboutPlaceType from './aboutplace_type';

const AboutPlaceTypeWithHost = () => {
    const [selectedStayType, setSelectedStayType] = useState(null);
    const [progress, setProgress] = useState(6);

    const handleStayTypeChange = (stayType) => {
        setSelectedStayType(stayType);
    };

    return (
        <HostWrapper
            currentStep="aboutplace_type"
            nextPath="/aboutplace/privacy"
            backPath="/aboutplace"
            additionalData={selectedStayType ? { stay_type: selectedStayType } : {}}
            progress={progress}
        >
            <AboutPlaceType onStayTypeChange={handleStayTypeChange} progress={progress} setProgress={setProgress} />
        </HostWrapper>
    );
};

export default AboutPlaceTypeWithHost;
