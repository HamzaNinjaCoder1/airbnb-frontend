import React, { useState } from 'react'
import amenties from './amenties.jsx';

function ThingsAvailibility() {
    const [showMore, setShowMore] = useState(false);
    
    return (
        <>
            <div className="flex items-center mt-6 sm:mt-8 px-4 sm:px-6 lg:px-8">
                <h2 className="text-gray-900 text-xl sm:text-2xl lg:text-[1.47rem] font-medium">
                    What this place offers
                </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 items-start mt-3 px-4 sm:px-6 lg:px-8 gap-3 sm:gap-5 w-full lg:w-[56%]">
                {amenties.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3 sm:gap-5">
                        {amenity.icon && (
                            <div className="flex-shrink-0">
                                {amenity.icon}
                            </div>
                        )}
                        <h2 className="text-gray-900 text-sm sm:text-base lg:text-[1.06rem] font-normal">
                            {amenity.available ?
                                <span className="text-gray-700 text-sm sm:text-base lg:text-[1.07rem] font-semibold leading-tight break-words">
                                    {amenity.name}
                                </span>
                                :
                                <span className="text-gray-700 line-through text-sm sm:text-base lg:text-[1.07rem] font-semibold leading-tight break-words">
                                    {amenity.name}
                                </span>
                            }
                        </h2>
                    </div>
                ))}
            </div>
            <div className="flex items-center mt-3 px-4 sm:px-6 lg:px-8 gap-5 w-full lg:w-[56%]">
                <button className="bg-[#f2f2f2] w-full sm:w-[28%] h-10 sm:h-12 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 mt-4" onClick={() => setShowMore(!showMore)}>
                    <h2 className="text-black text-sm sm:text-base lg:text-[1.1rem] font-medium">
                        Show all amenities
                    </h2>
                </button>
            </div>
        </>
    )
}
export default ThingsAvailibility;