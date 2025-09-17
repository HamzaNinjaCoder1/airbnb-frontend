import React from 'react'
function HostDetails({ data }) {
    return (
        <>
            <div className="flex items-center mt-8 sm:mt-10 px-4 sm:px-6 lg:px-8">
                <h2 className="text-gray-900 text-xl sm:text-2xl lg:text-[1.47rem] font-medium">
                    Meet your host
                </h2>
            </div>
            <div className="flex flex-col lg:flex-row items-start mt-4 px-4 sm:px-6 lg:px-8 gap-6 lg:gap-10">
                <div className="flex gap-3 sm:gap-4 w-full lg:w-[34%] bg-white rounded-xl shadow-[0_0_10px_2px_rgba(0,0,0,0.1)] justify-center items-center h-[200px] sm:h-[220px] lg:h-[240px] cursor-pointer">
                    <div className="flex flex-col gap-0.5 sm:gap-0.9 justify-center items-center w-[60%] mt-2 sm:mt-3 -ml-1 sm:-ml-2">
                        <img src={data.HostImage} alt="Host Image" className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full object-cover" />
                        <div className="flex flex-col leading-tight">
                            <h2 className="text-gray-900 text-lg sm:text-xl lg:text-[1.5rem] font-medium text-center">
                                {data.HostName}
                            </h2>
                        </div>
                        <div className="flex flex-col leading-tight">
                            <h2 className="text-gray-600 text-xs sm:text-sm lg:text-[0.8rem] font-medium">
                                Host
                            </h2>
                        </div>
                    </div>
                    <div className="flex flex-col w-[20%] -mt-2 sm:-mt-4">
                        <h2 className="text-gray-900 text-lg sm:text-xl lg:text-[1.4rem] font-bold">{data?.reviewsData?.length ?? 0}</h2>
                        <h3 className="text-gray-800 text-xs sm:text-sm lg:text-[0.7rem] font-medium">
                            Reviews
                        </h3>
                        <div className='border-b border-gray-300 w-[130%] mt-1'></div>
                        <h3 className="flex items-center gap-1 text-gray-900 text-lg sm:text-xl lg:text-[1.4rem] font-bold">
                            {Number(data.rating).toFixed(1)}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 32 32"
                                aria-hidden="true"
                                role="presentation"
                                focusable="false"
                                style={{
                                    display: 'block',
                                    height: '10px',
                                    width: '10px',
                                    fill: 'currentcolor',
                                }}
                                className="sm:h-[12px] sm:w-[12px]"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="m15.1 1.58-4.13 8.88-9.86 1.27a1 1 0 0 0-.54 1.74l7.3 6.57-1.97 9.85a1 1 0 0 0 1.48 1.06l8.62-5 8.63 5a1 1 0 0 0 1.48-1.06l-1.97-9.85 7.3-6.57a1 1 0 0 0-.55-1.73l-9.86-1.28-4.12-8.88a1 1 0 0 0-1.82 0z"
                                ></path>
                            </svg>
                        </h3>
                        <h3 className="text-gray-800 text-xs sm:text-sm lg:text-[0.7rem] font-medium">
                            Raiting
                        </h3>
                    </div>
                </div>
                <div className="flex flex-col w-full lg:w-[48%]">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-gray-900 text-lg sm:text-xl lg:text-[1.3rem] font-medium">
                            Host Details
                        </h2>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-1 sm:gap-0.9">
                                <h2 className="text-gray-700 text-sm sm:text-base lg:text-[1.05rem] font-medium">
                                    Response rate: 100%
                                </h2>
                                <h2 className="text-gray-700 text-sm sm:text-base lg:text-[1.05rem] font-medium">
                                    Responds within an hour
                                </h2>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="bg-[#f2f2f2] w-full sm:w-[30%] h-10 sm:h-12 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 mt-4">
                                <h2 className="text-black text-sm sm:text-base lg:text-[1.1rem] font-medium">
                                    Message Host
                                </h2>
                            </button>
                        </div>
                        <div className='border-b border-gray-300 w-[100%] mt-4 mb-4'></div>
                        <div className="flex gap-2">
                            <svg
                                viewBox="0 0 48 48"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                role="presentation"
                                focusable="false"
                                width={20}
                                height={20}
                                style={{
                                    display: "block",
                                    height: 20,
                                    width: 20,
                                    fill: "rgb(227, 28, 95)",
                                    stroke: "currentColor"
                                }}
                                className="sm:h-6 sm:w-6 flex-shrink-0"
                            >
                                <g>
                                    <g stroke="none">
                                        <path
                                            d="m25 5 .5846837.00517475c4.2905015.07574932 8.8374917.98334075 13.644943 2.73687823l.7703733.28794702v27.3705076l-.0084766.1301365c-.0392237.2994207-.2122236.5656263-.4699074.7230756l-.1154775.0605995-11.4234694 5.0774159c.0623636-.7458456-.0433445-1.4943022-.3209346-2.2783707-.2495178-.7044496-.7667703-1.7805075-1.0418654-2.3950548-1.9094732-4.1561789-3.9589781-8.3688465-6.0912876-12.5211487l-.3317555-.6369277c-.4686141-.9115826-.8248653-1.6297768-1.3147672-2.2052384-.743401-.8737317-1.7668654-1.3549948-2.8821508-1.3549948-1.1154695 0-2.1391179.4816323-2.8828868 1.3557332-.6050254.7114646-1.0306408 1.6819288-1.6457867 2.8412431-.4956822.9653459-.9868615 1.9338929-1.47282629 2.9041739l.00159179-19.0721502.769087-.28647781c4.798406-1.75037189 9.3373349-2.65799308 13.6207364-2.73688762z"
                                            fillOpacity=".2"
                                        />
                                        <path
                                            d="m25 1c5.5985197 0 11.5175072 1.27473768 17.7548231 3.81642897.7027419.28641855 1.1783863.94329535 1.2386823 1.69066764l.0064946.16143432v28.73197667c0 1.8999458-1.0758761 3.6285379-2.7638433 4.4721215l-.2054644.0969363-15.0427818 6.6856808c-.4614217.2050763-1.8621146.3276624-2.7955525.3430957l-.192358.0016581.0009065-1.0005013c.6483674-.0069073 1.2843321-.1330366 1.8784107-.3747752.8327784-.3388673 1.5457548-.8939986 2.0790671-1.5885618l13.2600311-5.8942194c1.023196-.4547538 1.7028179-1.4383245 1.7751735-2.5449525l.0064111-.1964822v-28.73197667l-.6916987-.27704554c-5.7517231-2.26330416-11.1871718-3.39148539-16.3083013-3.39148539-5.1211255 0-10.5565697 1.12817946-16.3082877 3.39148006l-.6917123.27707479-.00030284 24.49382405c-.68067737 1.4079172-1.34834149 2.8151846-2.00083161 4.2173468l.00113445-28.71117085c0-.81311953.4922453-1.5453083 1.24525131-1.85215622 6.23725069-2.54166294 12.15623339-3.81639863 17.75474869-3.81639863z"
                                        />
                                    </g>

                                    <path
                                        d="m15.999908 41.6930234.6867258-.8851772c1.5957359-2.0328613 2.5919668-3.8873951 2.9612752-5.511912.2804314-1.2318637.2318527-2.5167089-.4804505-3.5591688-.6801015-.9952012-1.8642067-1.5894421-3.1673665-1.5894421-1.3033438 0-2.487633.5940563-3.1675505 1.5890729-.7099111 1.039137-.761802 2.3201055-.4810025 3.5580612.3689403 1.6247015 1.3653552 3.4796045 2.9616432 5.5133888l.6867258.8851772.6447715.7192179c1.1495113 1.2599236 2.1735278 2.122579 3.2227536 2.7149739.8151649.4602182 1.6400823.7413704 2.4521191.8358878.8812245.1033783 1.7585843-.0123685 2.559765-.3383795 1.6422905-.6682672 2.8186673-2.1775918 3.0700251-3.9387151.1205267-.8438257.0264975-1.6854363-.2876078-2.572644-.2495178-.7044496-.7667703-1.7805075-1.0418654-2.3950548-1.9094732-4.1561789-3.9589781-8.3688465-6.0912876-12.5211487-.6486357-1.2222643-1.0477537-2.1388241-1.6465227-2.8421661-.743401-.8737317-1.7668654-1.3549948-2.8821508-1.3549948-1.1154695 0-2.1391179.4816323-2.8828868 1.3557332-.6050254.7114646-1.0306408 1.6819288-1.6457867 2.8412431-2.1326775 4.1534098-4.1819984 8.3660775-6.0912876 12.5211487-.2822716.6306079-.7930837 1.6933742-1.0416814 2.3948702-.3141053.8872077-.4081345 1.7288182-.2876078 2.5731978.2511738 1.7609394 1.4273666 3.2700787 3.0696571 3.9385305.8193971.3333951 1.6941813.4397271 2.559581.3385641.8129568-.0948866 1.6380583-.3760386 2.4524871-.8360721 1.0492258-.592225 2.0732422-1.4550503 3.2227536-2.7149739z"
                                        fill="none"
                                        strokeWidth={2}
                                    />
                                </g>
                            </svg>

                            <h2 className="text-gray-900 text-xs sm:text-sm lg:text-[0.8rem] font-medium break-words">
                                To help protect your payment, always use Airbnb to send money and communicate with hosts.
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2 mt-6 px-4 sm:px-6 lg:px-9 w-full lg:w-[35%]">
                <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" fill="currentColor" className="flex-shrink-0 mt-1">
                        <path d="M31.47 10.12l-15-8a1 1 0 0 0-.94 0l-15 8a1 1 0 0 0 0 1.76L4 13.73V23a1 1 0 0 0 .52.88l11 6a1 1 0 0 0 .96 0l11-6A1 1 0 0 0 28 23v-9.27l2-1.06V23h2V11a1 1 0 0 0-.53-.88zM26 22.4l-10 5.45-10-5.45V14.8l9.53 5.08a1 1 0 0 0 .94 0L26 14.8v7.6zm-10-4.54L3.12 11 16 4.13 28.88 11 16 17.87z" />
                    </svg>
                    <h2 className="text-gray-600 text-sm sm:text-base lg:text-[1.1rem] font-medium break-words">
                        Where I went to school: {data.HostEducation}
                    </h2>
                </div>
                <div className='flex items-start gap-2'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" fill="currentColor" className="flex-shrink-0 mt-1">
                    <path d="M20 2a2 2 0 0 1 2 1.85V6h6a3 3 0 0 1 3 2.82V27a3 3 0 0 1-2.82 3H4a3 3 0 0 1-3-2.82V9a3 3 0 0 1 2.82-3H10V4a2 2 0 0 1 1.85-2H20zm8 6H4a1 1 0 0 0-1 .88V12a3 3 0 0 0 2.82 3H13v2H6a4.98 4.98 0 0 1-3-1v11a1 1 0 0 0 .88 1H28a1 1 0 0 0 1-.88V16c-.78.59-1.74.95-2.78 1h-7.17v-2H26a3 3 0 0 0 3-2.82V9a1 1 0 0 0-.88-1zm-10 4a1 1 0 0 1 1 .88V19a1 1 0 0 1-.88 1H14a1 1 0 0 1-1-.88V13a1 1 0 0 1 .88-1H18zm-1 2h-2v4h2zm3-10h-8v2h8z" />
                </svg>

                <h2 className="text-gray-600 text-sm sm:text-base lg:text-[1.1rem] font-medium break-words">
                    My work: {data.HostWork}
                </h2>
                </div>
                <h2 className="text-gray-600 text-sm sm:text-base lg:text-[1.03rem] font-medium px-1 break-words">
                    {data.Hostinfo}
                </h2>
            </div>
        </>
    )
}

export default HostDetails;