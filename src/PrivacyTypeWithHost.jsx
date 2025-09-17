import React, { useState } from 'react';
import HostWrapper from './HostWrapper';
import PrivacyType from './privacytyp';

const PrivacyTypeWithHost = () => {
    const [selectedPrivacyType, setSelectedPrivacyType] = useState(null);
    const [progress, setProgress] = useState(12);

    const handlePrivacyTypeChange = (privacyType) => {
        setSelectedPrivacyType(privacyType);
    };

    return (
        <HostWrapper
            currentStep="privacy_type"
            nextPath="/aboutplace/location"
            backPath="/aboutplace/type"
            additionalData={selectedPrivacyType ? { property_type: selectedPrivacyType } : {}}
            progress={progress}
        >
            <PrivacyType onPrivacyTypeChange={handlePrivacyTypeChange} progress={progress} setProgress={setProgress} />
        </HostWrapper>
    );
};

export default PrivacyTypeWithHost;
