import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Islamabad, Rawalpindi } from "./data";
import { Rooms } from "./Rooms";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useLayoutEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useAuth } from './AuthContext';
import api from './api';
gsap.registerPlugin(ScrollTrigger);

function Photos() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated, user } = useAuth();
    const hostId = searchParams.get('hostId') || user?.id;
    const listingId = searchParams.get('listingId');
    const allData = [...Islamabad, ...Rawalpindi];
    const data = allData.find((item) => item.id === Number(id));
    const roomTitleRefs = useRef([]);
    const propertyImages = [data?.img1, data?.img2, data?.img3, data?.img4, data?.img5].filter(Boolean);
    const roomImages = Rooms.flatMap((room) => [room.img1, room.img2, room.img3].filter(Boolean));
    const allImages = [...propertyImages, ...roomImages];
    const imageIndexMap = new Map(allImages.map((src, idx) => [src, idx]));

    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    const openLightbox = (index) => {
        setCurrentIndex(index ?? 0);
        setIsLightboxOpen(true);
    };
    const closeLightbox = () => setIsLightboxOpen(false);

    const scrollToRoom = (index) => {
        const target = roomTitleRefs.current[index];
        if (target && typeof target.scrollIntoView === 'function') {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const PrevArrow = (props) => {
        const { className, style, onClick } = props;
        return (
            <button
                type="button"
                aria-label="Previous"
                className={`${className} !flex items-center justify-center !left-6 !z-[10000] !w-8 !h-8 !py-4 !rounded-full !bg-white/90 hover:!bg-white text-black shadow !mt-48`}
                style={{ ...style }}
                onClick={onClick}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 -ml-[33px] ">
                    <path fillRule="evenodd" d="M15.78 4.22a.75.75 0 010 1.06L10.06 11l5.72 5.72a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z" clipRule="evenodd" />
                </svg>
            </button>
        );
    };

    const NextArrow = (props) => {
        const { className, style, onClick } = props;
        return (
            <button
                type="button"
                aria-label="Next"
                className={`${className} !flex items-center justify-center !right-6 !z-[10000] !w-8 !h-8 !rounded-full !bg-white/90 hover:!bg-white text-black shadow !mt-48`}
                style={{ ...style }}
                onClick={onClick}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 -ml-[23px]">
                    <path fillRule="evenodd" d="M8.22 19.78a.75.75 0 010-1.06L13.94 13 8.22 7.28a.75.75 0 111.06-1.06l6.25 6.25a.75.75 0 010 1.06l-6.25 6.25a.75.75 0 01-1.06 0z" clipRule="evenodd" />
                </svg>
            </button>
        );
    };

    React.useEffect(() => {
        if (!isLightboxOpen) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isLightboxOpen]);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            roomTitleRefs.current.forEach((el) => {
                if (!el) return;
                gsap.fromTo(
                    el,
                    { y: 60, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        ease: "none",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 90%",
                            end: "+=300",
                            scrub: 0.6,
                            invalidateOnRefresh: true,
                        },
                    }
                );
            });
        });
        return () => ctx.revert();
    }, []);

    const saveListingProgress = async (payload = {}) => {
        if (!isAuthenticated || !user?.id) return;
        await api.patch(
            `/api/data/listings/save-exit?hostId=${user.id}${listingId ? `&listingId=${listingId}` : ''}`,
            payload
        );
    };

    const handleSaveAndExit = async () => {
        if (!isAuthenticated || isSaving) return navigate('/');
        setIsSaving(true);
        try {
            await saveListingProgress({ status: 'draft', current_step: 'photos' });
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
            navigate('/');
        }
    };

    const handleNext = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            if (isAuthenticated && user?.id) {
                await saveListingProgress({ current_step: 'title' });
            }
            const urlWithHostId = hostId ? `/aboutplace/title?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}` : '/aboutplace/title';
            navigate(urlWithHostId);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="pt-8 pb-10 max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 rounded-full bg-black text-white font-semibold text-base px-4 py-2 shadow hover:bg-gray-800 transition-colors ml-6"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5"
                        >
                            <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Go back
                    </button>
                    <button
                        onClick={handleSaveAndExit}
                        disabled={isSaving}
                        className={`px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full font-semibold transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                    >
                        {isSaving ? 'Saving...' : 'Save & exit'}
                    </button>
                </div>
                <div className="flex mt-4">
                    <h1 className="text-gray-900 text-[1.6rem] font-semibold mt-2 ml-8 underline">Photo tour</h1>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <div className="flex gap-24 mt-8">
                        {Rooms.map((room, index) => (
                            <div key={room.id} className="flex flex-col items-center justify-center">
                                <img
                                    src={room.image}
                                    alt="Property detail"
                                    className="w-40 h-40 object-cover rounded-lg hover:scale-[1.02] transition-transform duration-300 shadow-lg cursor-pointer"
                                    loading="eager"
                                    decoding="sync"
                                    onClick={() => scrollToRoom(index)}
                                />
                                <h2 className="text-gray-600 text-[1.02rem] font-semibold mt-2">{room.title}</h2>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex gap-16 mt-8 flex-col">
                    {Rooms.map((room, index) => (
                        <div key={room.id} className="flex flex-col">
                            <h1
                                className="text-gray-900 text-[1.6rem] font-semibold mt-2 ml-8 underline opacity-0"
                                ref={(el) => (roomTitleRefs.current[index] = el)}
                            >
                                {room.title}
                            </h1>
                            <div className="flex flex-col gap-4 justify-center items-center ml-96 ">
                                <img
                                    src={room.img1}
                                    alt="Property detail"
                                    className="w-[800px] h-[350px] object-cover rounded-lg hover:scale-[1.02] transition-transform duration-300 shadow-lg cursor-pointer"
                                    onClick={() => openLightbox(imageIndexMap.get(room.img1) ?? 0)}
                                    loading="eager"
                                    decoding="sync"
                                />
                                <div className="flex gap-4">
                                    <img
                                        src={room.img2}
                                        alt="Property detail"
                                        className="w-[390px] h-[200px] object-cover rounded-lg hover:scale-[1.02] transition-transform duration-300 shadow-lg cursor-pointer"
                                        onClick={() => openLightbox(imageIndexMap.get(room.img2) ?? 0)}
                                        loading="eager"
                                        decoding="sync"
                                    />
                                    <img
                                        src={room.img3}
                                        alt="Property detail"
                                        className="w-[390px] h-[200px] object-cover rounded-lg hover:scale-[1.02] transition-transform duration-300 shadow-lg cursor-pointer"
                                        onClick={() => openLightbox(imageIndexMap.get(room.img3) ?? 0)}
                                        loading="eager"
                                        decoding="sync"
                                    />
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
            {isLightboxOpen && (
                <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col" onClick={closeLightbox}>
                    <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 text-white z-[10050] cursor-pointer" onClick={closeLightbox}>
                        <button type="button" aria-label="Close" className="flex items-center gap-2 cursor-pointer" onClick={closeLightbox} >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mt-1">
                                <path fillRule="evenodd" d="M6.225 4.811a1 1 0 011.414 0L12 9.172l4.361-4.361a1 1 0 111.414 1.414L13.414 10.586l4.361 4.361a1 1 0 01-1.414 1.414L12 12l-4.361 4.361a1 1 0 01-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="text-lg">Close</span>
                        </button>
                        <div className="text-center flex-1 -ml-24 select-none">
                            <span className="text-white text-lg">{currentIndex + 1} / {allImages.length}</span>
                        </div>
                        <div className="w-16" />
                    </div>
                    <div className="flex-1 flex items-center justify-center px-4 pt-16" onClick={(e) => e.stopPropagation()}>
                        <Slider
                            key={currentIndex}
                            initialSlide={currentIndex}
                            infinite={true}
                            slidesToShow={1}
                            slidesToScroll={1}
                            dots={false}
                            arrows={true}
                            beforeChange={(_, next) => setCurrentIndex(next)}
                            prevArrow={<PrevArrow />}
                            nextArrow={<NextArrow />}
                            className="w-full max-w-6xl"
                        >
                            {allImages.map((src, idx) => (
                                <div key={`${src}-${idx}`} className="flex items-center justify-center">
                                    <img src={src} alt="Full view" className="max-h-[80vh] max-w-[90vw] object-contain mx-auto" />
                                </div>
                            ))}
                        </Slider>
                    </div>
                </div>
            )}
            <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
                <div />
                <button
                    onClick={handleNext}
                    disabled={isSaving}
                    className={`px-8 py-3 rounded-lg transition-colors ${!isSaving ? 'bg-black text-white' : 'bg-black/30 text-white/70 cursor-not-allowed'}`}
                >
                    {isSaving ? 'Saving...' : 'Next'}
                </button>
            </div>
        </div>
    );
}

export default Photos;