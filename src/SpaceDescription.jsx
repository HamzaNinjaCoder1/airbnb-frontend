import React from 'react'
import { useState } from 'react'

function SpaceDescription({ text, Space, Guest }) {
    const [showMore, setShowMore] = useState(false)

    return (
        <>
            <div className="mt-6 px-4 sm:px-6 lg:px-8">
                <h2 className="text-gray-800 text-lg sm:text-xl lg:text-[1.1rem] font-medium">
                    The Space
                </h2>
                <p className="text-gray-900 text-sm sm:text-base lg:text-[1.06rem] font-normal w-full lg:w-[56%] break-words leading-relaxed">{text}</p>
                <button className="bg-[#f2f2f2] w-full sm:w-[15%] lg:w-[11%] h-10 sm:h-12 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 mt-4" onClick={() => setShowMore(!showMore)}>
                    <h2 className="text-black text-sm sm:text-base lg:text-[1.1rem] font-medium">
                        Show more
                    </h2>
                </button>
            </div>

            {showMore && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full p-4 sm:p-6 relative overflow-y-auto max-h-[85vh]">
                        <button
                            onClick={() => setShowMore(false)}
                            className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 text-gray-600 text-lg cursor-pointer hover:text-gray-800 hover:bg-gray-200 rounded-full transition-all duration-300 ease-out"
                        >
                            ✕
                        </button>

                        <h2 className="text-gray-900 text-xl sm:text-2xl font-bold mb-4">About this space</h2>
                        <p className="text-gray-900 text-sm sm:text-base lg:text-[1.06rem] font-normal break-words whitespace-pre-line leading-relaxed">
                            {text}
                        </p>
                        <h2 className="text-gray-900 text-base sm:text-lg font-semibold mt-4">The Space</h2>
                        <p className="text-gray-900 text-sm sm:text-base lg:text-[1.06rem] font-normal break-words whitespace-pre-line mt-2 leading-relaxed">
                            {Space}
                        </p>
                        <h2 className="text-gray-900 text-base sm:text-lg font-semibold mt-4">Guest access</h2>
                        <p className="text-gray-900 text-sm sm:text-base lg:text-[1.06rem] font-normal break-words whitespace-pre-line mt-2 leading-relaxed">
                            {Guest}
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
export default SpaceDescription;