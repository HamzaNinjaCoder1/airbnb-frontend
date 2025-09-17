import React from 'react'
function Knowingthings({ data }) {
    return (
        <>
            <div className="flex items-center mt-8 sm:mt-10 px-4 sm:px-6 lg:px-8">
                <h2 className="text-gray-900 text-xl sm:text-2xl lg:text-[1.47rem] font-medium">
                    Things to know before you go
                </h2>
            </div>
            <div className='flex flex-col lg:flex-row'>
            <div className="items-start mt-6 px-4 sm:px-6 lg:px-8 w-full lg:w-[30%]">
                <div className="flex items-center">
                    <h2 className="text-gray-900 text-base sm:text-lg lg:text-[1.05rem] font-medium">
                        House rules
                    </h2>
                </div>
                {(data?.houseRules || []).map((rule, index) => (
                    <div key={index} className="flex items-start mt-4">
                        <h2 className="text-gray-700 text-sm sm:text-base lg:text-[1.03rem] font-medium break-words">
                            {rule}
                        </h2>
                    </div>
                ))}
                <div className="flex items-center mt-1">
                    <button className="text-gray-900 text-sm sm:text-base lg:text-[1.04rem] font-medium py-2 underline cursor-pointer">
                        Show more
                    </button>
                    <div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 32 32"
                            aria-hidden="true"
                            role="presentation"
                            focusable="false"
                            className="w-3 h-3 text-black mt-1 ml-1"
                        >
                            <path
                                fill="none"
                                stroke="black"
                                strokeWidth="5.33333"
                                d="m12 4 11.3 11.3a1 1 0 0 1 0 1.4L12 28"
                            />
                        </svg>
                    </div>
                </div>
            </div>
            <div className="mt-6 px-4 sm:px-6 lg:px-12 w-full lg:w-[40%]">
                <div className="flex items-center">
                    <h2 className="text-gray-900 text-base sm:text-lg lg:text-[1.05rem] font-medium">
                        Safety & property
                    </h2>
                </div>
                {(data?.safety || []).map((rule, index) => (
                    <div key={index} className="flex items-start mt-4">
                        <h2 className="text-gray-700 text-sm sm:text-base lg:text-[1.03rem] font-medium break-words">
                            {rule}
                        </h2>
                    </div>
                ))}
                <div className="flex items-center mt-1">
                    <button className="text-gray-900 text-sm sm:text-base lg:text-[1.04rem] font-medium py-2 underline cursor-pointer">
                        Show more
                    </button>
                    <div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 32 32"
                            aria-hidden="true"
                            role="presentation"
                            focusable="false"
                            className="w-3 h-3 text-black mt-1 ml-1"
                        >
                            <path
                                fill="none"
                                stroke="black"
                                strokeWidth="5.33333"
                                d="m12 4 11.3 11.3a1 1 0 0 1 0 1.4L12 28"
                            />
                        </svg>
                    </div>
                </div>
            </div>
            <div className="mt-6 px-4 sm:px-6 lg:px-12 w-full lg:w-[40%]">
                <div className="flex items-center">
                    <h2 className="text-gray-900 text-base sm:text-lg lg:text-[1.05rem] font-medium">
                        Cancellation policy
                    </h2>
                </div>
                {(data?.cancellationPolicy || []).map((rule, index) => (
                    <div key={index} className="flex items-start mt-4">
                        <h2 className="text-gray-700 text-sm sm:text-base lg:text-[1.03rem] font-medium break-words">
                            {rule}
                        </h2>
                    </div>
                ))}
                <div className="flex items-center mt-1">
                    <button className="text-gray-900 text-sm sm:text-base lg:text-[1.04rem] font-medium py-2 underline cursor-pointer">
                        Show more
                    </button>
                    <div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 32 32"
                            aria-hidden="true"
                            role="presentation"
                            focusable="false"
                            className="w-3 h-3 text-black mt-1 ml-1"
                        >
                            <path
                                fill="none"
                                stroke="black"
                                strokeWidth="5.33333"
                                d="m12 4 11.3 11.3a1 1 0 0 1 0 1.4L12 28"
                            />
                        </svg>
                    </div>
                </div>
            </div>
            </div>
        </>
    )
}

export default Knowingthings;