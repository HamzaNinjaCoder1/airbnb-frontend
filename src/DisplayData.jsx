import React from 'react';
import { Islamabad, Rawalpindi } from './data';

function DisplayData() {

    const allData = [...Islamabad, ...Rawalpindi];
    console.log(allData);
    const data = allData.find((item) => item.id === Number(1));

    return (
        <>
            <div className="flex flex-col lg:flex-row items-center lg:items-start mt-4 sm:mt-6 lg:mt-8 px-4 sm:px-6 lg:px-8 gap-4 sm:gap-6 lg:gap-12">
                <div className="hidden lg:flex flex-col w-full lg:w-auto items-center lg:items-start">
                    <h3 className="text-gray-900 text-sm sm:text-base lg:text-[1.01rem] font-medium mb-2">
                        Overall rating
                    </h3>
                    <div className="flex flex-col-reverse">
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <div key={rating} className="flex items-center gap-2">
                                <span className={`text-gray-600 -ml-2 text-xs font-medium w-4 text-right ${rating === 1 ? '-ml-2.5' : ''}`}>
                                    {rating}
                                </span>
                                <div
                                    className={`h-1 rounded-full transition-all duration-300 ${rating === Math.floor(data.rating)
                                        ? 'bg-black w-24 sm:w-28 lg:w-32'
                                        : 'bg-gray-200 w-24 sm:w-28 lg:w-32'
                                        }`}
                                ></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:flex lg:flex-wrap items-start gap-2 sm:gap-4 lg:gap-12 w-full lg:w-auto justify-center lg:justify-start">
                    {data.detailedRatings.map((rating) => (
                        <div key={rating.category} className="flex flex-col px-1 sm:px-4 relative min-w-0 lg:flex-none items-center lg:items-start">
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 -ml-1"></div>
                            <div className="flex flex-col gap-2 sm:gap-4 lg:gap-11 mb-1 sm:mb-2 text-center lg:text-left">
                                <span className="text-gray-900 text-xs sm:text-sm lg:text-[1.01rem] font-medium break-words">
                                    {rating.category} <br /> <span className="text-gray-900 text-sm sm:text-base lg:text-[1.1rem] font-medium">{Number(rating.score).toFixed(1)}</span>
                                </span>
                            </div>

                            <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 mt-1 sm:mt-2 lg:mt-4 flex-shrink-0">
                                {rating.category === "Cleanliness" && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '32px', width: '32px', fill: 'currentcolor' }}>
                                        <path d="M24 0v6h-4.3c.13 1.4.67 2.72 1.52 3.78l.2.22-1.5 1.33a9.05 9.05 0 0 1-2.2-5.08c-.83.38-1.32 1.14-1.38 2.2v4.46l4.14 4.02a5 5 0 0 1 1.5 3.09l.01.25.01.25v8.63a3 3 0 0 1-2.64 2.98l-.18.01-.21.01-12-.13A3 3 0 0 1 4 29.2L4 29.02v-8.3a5 5 0 0 1 1.38-3.45l.19-.18L10 12.9V8.85l-4.01-3.4.02-.7A5 5 0 0 1 10.78 0H11zm-5.03 25.69a8.98 8.98 0 0 1-6.13-2.41l-.23-.23A6.97 6.97 0 0 0 6 21.2v7.82c0 .51.38.93.87 1H7l11.96.13h.13a1 1 0 0 0 .91-.88l.01-.12v-3.52c-.34.04-.69.06-1.03.06zM17.67 2H11a3 3 0 0 0-2.92 2.3l-.04.18-.01.08 3.67 3.1h2.72l.02-.1a4.29 4.29 0 0 1 3.23-3.4zM30 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-3-2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-5 0h-2.33v2H22zm8-2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM20 20.52a3 3 0 0 0-.77-2l-.14-.15-4.76-4.61v-4.1H12v4.1l-5.06 4.78a3 3 0 0 0-.45.53 9.03 9.03 0 0 1 7.3 2.34l.23.23A6.98 6.98 0 0 0 20 23.6z"></path>
                                    </svg>
                                )}
                                {rating.category === "Accuracy" && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '32px', width: '32px', fill: 'currentcolor' }}>
                                        <path d="M16 1a15 15 0 1 1 0 30 15 15 0 0 1 0-30zm0 2a13 13 0 1 0 0 26 13 13 0 0 0 0-26zm7 7.59L24.41 12 13.5 22.91 7.59 17 9 15.59l4.5 4.5z"></path>
                                    </svg>
                                )}
                                {rating.category === "Check-in" && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '32px', width: '32px', fill: 'currentcolor' }}>
                                        <path d="M16.84 27.16v-3.4l-.26.09c-.98.32-2.03.51-3.11.55h-.7A11.34 11.34 0 0 1 1.72 13.36v-.59A11.34 11.34 0 0 1 12.77 1.72h.59c6.03.16 10.89 5.02 11.04 11.05V13.45a11.3 11.3 0 0 1-.9 4.04l-.13.3 7.91 7.9v5.6H25.7l-4.13-4.13zM10.31 7.22a3.1 3.1 0 1 1 0 6.19 3.1 3.1 0 0 1 0-6.2zm0 2.06a1.03 1.03 0 1 0 0 2.06 1.03 1.03 0 0 0 0-2.06zM22.43 25.1l4.12 4.13h2.67v-2.67l-8.37-8.37.37-.68.16-.3c.56-1.15.9-2.42.96-3.77v-.64a9.28 9.28 0 0 0-9-9h-.55a9.28 9.28 0 0 0-9 9v.54a9.28 9.28 0 0 0 13.3 8.1l.3-.16 1.52-.8v4.62z"></path>
                                    </svg>
                                )}
                                {rating.category === "Communication" && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '32px', width: '32px', stroke: 'currentcolor', strokeWidth: '2.66667', overflow: 'visible' }}>
                                        <path fill="none" d="M26 3a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4h-6.32L16 29.5 12.32 25H6a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z"></path>
                                    </svg>
                                )}
                                {rating.category === "Location" && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '32px', width: '32px', fill: 'currentcolor' }}>
                                        <path d="M30.95 3.81a2 2 0 0 0-2.38-1.52l-7.58 1.69-10-2-8.42 1.87A1.99 1.99 0 0 0 1 5.8v21.95a1.96 1.96 0 0 0 .05.44 2 2 0 0 0 2.38 1.52l7.58-1.69 10 2 8.42-1.87A1.99 1.99 0 0 0 31 26.2V4.25a1.99 1.99 0 0 0-.05-.44zM12 4.22l8 1.6v21.96l-8-1.6zM3 27.75V5.8l-.22-.97.22.97 7-1.55V26.2zm26-1.55-7 1.55V5.8l7-1.55z"></path>
                                    </svg>
                                )}
                                {rating.category === "Value" && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '32px', width: '32px', fill: 'currentcolor' }}>
                                        <path d="M16.17 2a3 3 0 0 1 1.98.74l.14.14 11 11a3 3 0 0 1 .14 4.1l-.14.14L18.12 29.3a3 3 0 0 1-4.1.14l-.14-.14-11-11A3 3 0 0 1 2 16.37l-.01-.2V5a3 3 0 0 1 2.82-3h11.35zm0 2H5a1 1 0 0 0-1 .88v11.29a1 1 0 0 0 .2.61l.1.1 11 11a1 1 0 0 0 1.31.08l.1-.08L27.88 16.7a1 1 0 0 0 .08-1.32l-.08-.1-11-11a1 1 0 0 0-.58-.28L16.17 4zM9 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"></path>
                                    </svg>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {/* Grey line below ratings on mobile */}
                <div className="flex items-center mt-3 px-4 sm:px-6 lg:px-8 lg:hidden">
                    <div className="border-b border-gray-300 w-full"></div>
                </div>
            </div>
        </>
    );
}

export default DisplayData;