import React, { useState } from 'react';
import HostWrapper from './HostWrapper';
import StandOut from './standout';

const StandOutWithHost = () => {
    const [progress, setProgress] = useState(29);
    
    return (
        <HostWrapper
            currentStep="standout"
            nextPath="/aboutplace/amenities"
            backPath="/aboutplace/basics"
            progress={progress}
        >
            <StandOut progress={progress} setProgress={setProgress} />
        </HostWrapper>
    );
};

export default StandOutWithHost;

