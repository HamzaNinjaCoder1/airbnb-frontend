import React, { useState } from 'react';
import HostWrapper from './HostWrapper';
import TitleStep from './title';

const TitleWithHost = () => {
    const [progress, setProgress] = useState(47);
    
    return (
        <HostWrapper
            currentStep="title"
            nextPath="/aboutplace/highlights"
            backPath="/aboutplace/photos"
            progress={progress}
        >
            <TitleStep progress={progress} setProgress={setProgress} />
        </HostWrapper>
    );
};

export default TitleWithHost;
