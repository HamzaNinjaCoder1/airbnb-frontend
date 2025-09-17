import React, { useState } from 'react';
import HostWrapper from './HostWrapper';
import AboutPlace from './aboutplace';

const AboutPlaceWithHost = () => {
    const [progress, setProgress] = useState(0);
    
    return (
        <HostWrapper
            currentStep="aboutplace"
            nextPath="/aboutplace/type"
            backPath="/host-onboarding"
            progress={progress}
        >
            <AboutPlace progress={progress} setProgress={setProgress} />
        </HostWrapper>
    );
};

export default AboutPlaceWithHost;
