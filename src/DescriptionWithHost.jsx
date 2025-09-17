import React from 'react';
import HostWrapper from './HostWrapper';
import DescriptionStep from './description';

const DescriptionWithHost = () => {
    return (
        <HostWrapper
            currentStep="description"
            nextPath="/aboutplace/final"
            backPath="/aboutplace/highlights"
        >
            <DescriptionStep />
        </HostWrapper>
    );
};

export default DescriptionWithHost;
