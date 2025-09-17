import { useState } from "react";

export default function Reviews({ data }) {
    const [selectedReview, setSelectedReview] = useState(null);
    const [showReviewInfo, setShowReviewInfo] = useState(false);

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 items-start mt-6 sm:mt-8 px-4 sm:px-8 lg:px-16 gap-y-8 sm:gap-y-14 gap-x-8 sm:gap-x-16 lg:gap-x-32 justify-center w-full lg:w-[93%]">
                {(data?.reviewsData || []).map((review, index) => (
                    <div key={index}>
                        <div className="flex items-center gap-2">
                            <img src={review.avatar} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0" />
                            <div className="min-w-0">
                                <h2 className="font-medium text-sm sm:text-base break-words">{review.name}</h2>
                                {review.location && (
                                    <p className="text-gray-500 text-xs sm:text-sm break-words">{review.location}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center text-gray-800 text-xs sm:text-sm gap-1 mt-1 font-medium flex-wrap">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 32 32"
                                    aria-hidden="true"
                                    role="presentation"
                                    focusable="false"
                                    style={{
                                        display: 'block',
                                        height: '8px',
                                        width: '8px',
                                        fill: 'currentcolor',
                                    }}
                                    className="sm:h-[10px] sm:w-[10px]"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="m15.1 1.58-4.13 8.88-9.86 1.27a1 1 0 0 0-.54 1.74l7.3 6.57-1.97 9.85a1 1 0 0 0 1.48 1.06l8.62-5 8.63 5a1 1 0 0 0 1.48-1.06l-1.97-9.85 7.3-6.57a1 1 0 0 0-.55-1.73l-9.86-1.28-4.12-8.88a1 1 0 0 0-1.82 0z"
                                    ></path>
                                </svg>
                            ))}
                            <span className="mx-1">·</span>
                            <span className="break-words">{review.timeAgo}</span>
                            <span className="mx-1">·</span>
                            <span className="break-words">{review.stayType}</span>
                        </div>
                        <p className="text-gray-800 text-sm sm:text-base lg:text-[1.1rem] line-clamp-3 mt-1 break-words">{review.comment}</p>
                        <button
                            className="text-black font-medium underline text-sm sm:text-base lg:text-[1.02rem]"
                            onClick={() => setSelectedReview(review)}
                        >
                            Show more
                        </button>
                    </div>
                ))}
            </div>
            {selectedReview && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedReview(null)}
                >
                    <div
                        className="bg-white p-4 sm:p-6 rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 sm:right-6 text-gray-600 text-xl hover:text-gray-800 transition-colors"
                            onClick={() => setSelectedReview(null)}
                        >
                            ✕
                        </button>
                        <div className="flex items-center gap-3 mb-4">
                            <img
                                src={selectedReview.avatar}
                                alt=""
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0"
                            />
                            <div className="min-w-0">
                                <h2 className="font-medium text-base sm:text-lg break-words">{selectedReview.name}</h2>
                                {selectedReview.location && (
                                    <p className="text-gray-500 text-xs sm:text-sm break-words">{selectedReview.location}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center text-gray-800 text-sm gap-1 font-medium mb-3">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 32 32"
                                    aria-hidden="true"
                                    role="presentation"
                                    focusable="false"
                                    style={{
                                        display: 'block',
                                        height: '12px',
                                        width: '12px',
                                        fill: 'currentcolor',
                                    }}
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="m15.1 1.58-4.13 8.88-9.86 1.27a1 1 0 0 0-.54 1.74l7.3 6.57-1.97 9.85a1 1 0 0 0 1.48 1.06l8.62-5 8.63 5a1 1 0 0 0 1.48-1.06l-1.97-9.85 7.3-6.57a1 1 0 0 0-.55-1.73l-9.86-1.28-4.12-8.88a1 1 0 0 0-1.82 0z"
                                    ></path>
                                </svg>
                            ))}
                            <span className="mx-1">·</span>
                            <span>{selectedReview.timeAgo}</span>
                            <span className="mx-1">·</span>
                            <span>{selectedReview.stayType}</span>
                        </div>
                        <p className="text-gray-800 text-[1.1rem]">{selectedReview.comment}</p>
                    </div>
                </div>
            )}
            {showReviewInfo && (
                <div className="absolute left-12 mt-24 ml-32 z-50">
                    <div className="bg-black/90 backdrop-blur-md border border-gray-600/30 p-6 rounded-2xl w-[300px] max-h-[500px] overflow-y-auto relative shadow-2xl">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-l-transparent border-r-transparent border-b-black/90"></div>
                        
                        <button
                            className="absolute top-4 right-4 text-white/80 text-lg hover:text-white transition-colors cursor-pointer"
                            onClick={() => setShowReviewInfo(false)}
                        >
                            ✕
                        </button>
                        <div className="text-white space-y-4">
                            <h2 className="text-xl font-semibold text-white/90">How Reviews Work</h2>
                            
                            <div className="space-y-3">
                                <p className="text-white/80 leading-relaxed text-sm">
                                    Reviews from past guests help our community learn more about each home. By default, reviews are sorted by relevancy. Relevancy is based on recency, length, and information that you provide to us, such as your booking search, your country, and your language preferences.
                                </p>
                                
                                <p className="text-white/80 leading-relaxed text-sm">
                                    Only the guest who booked the reservation can leave a review, and Airbnb only moderates reviews flagged for not following our policies.
                                </p>
                                
                                <p className="text-white/80 leading-relaxed text-sm">
                                    To be eligible for a percentile ranking or guest favorite label, listings need 5 or more recent reviews. Criteria is subject to change.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex flex-col sm:flex-row items-center mt-6 px-4 sm:px-8 lg:px-12 gap-3 sm:gap-0.5">
                <button className="bg-[#f2f2f2] w-full sm:w-[15%] h-10 sm:h-12 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 mt-4">
                    <h2 className="text-black text-sm sm:text-base lg:text-[1.1rem] font-medium">
                        Show all {(data?.reviewsData?.length ?? 0)} reviews
                    </h2>
                </button>
                <button 
                    className="w-full sm:w-[15%] h-10 sm:h-12 rounded-xl flex items-center justify-center cursor-pointer mt-4"
                    onClick={() => setShowReviewInfo(true)}
                >
                    <h2 className="text-gray-700 text-xs sm:text-sm lg:text-[0.8rem] font-medium underline cursor-pointer hover:text-gray-900">
                        Learn how reviews work
                    </h2>
                </button>
            </div>
        </>
    );
}
