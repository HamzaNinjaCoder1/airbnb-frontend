import React from 'react';
import HostWrapper from './HostWrapper';
import FinalStep from './final';

const FinalWithHost = () => {
    return (
        <HostWrapper
            currentStep="final"
            nextPath="/booking-settings"
            backPath="/aboutplace/description"
        >
            <FinalStep />
        </HostWrapper>
    );
};

export default FinalWithHost;


