import React, { useState } from 'react';
import HostWrapper from './HostWrapper';
import PhotosUpload from './Photosupload';

const PhotosWithHost = () => {
    const [progress, setProgress] = useState(41);
    
    return (
        <HostWrapper
            currentStep="photos"
            nextPath="/aboutplace/title"
            backPath="/aboutplace/amenities"
            progress={progress}
        >
            <PhotosUpload progress={progress} setProgress={setProgress} />
        </HostWrapper>
    );
};

export default PhotosWithHost;
