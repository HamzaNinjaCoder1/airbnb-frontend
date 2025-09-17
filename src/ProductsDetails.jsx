import React, { useState, useLayoutEffect, useRef, useEffect, useMemo } from "react";
import { DateRange } from "react-date-range";
import { enUS } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from './api';
import { Islamabad, Rawalpindi } from "./data";
import SpaceDescription from './SpaceDescription';
import ThingsAvailibility from './ThingsAvailibility';
import DisplayData from './DisplayData';
import ReviewsDialog from './ReviewsDialog';
import Calender from './Calender';
import Knowingthings from './knowingthings';
import HostDetails from './HostDetails';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
import { format, differenceInDays, parse, isValid, addDays, isAfter, isBefore, isSameDay } from "date-fns";
import bookingService from './services/bookingService';

function ProductsDetails({ setSelectedDates }) {
    const { id } = useParams();
    const location = useLocation();
    const listingFromState = location.state?.listing;
    const customLocale = {
        ...enUS,
        localize: {
            ...enUS.localize,
            day: (n) => ["S", "M", "T", "W", "T", "F", "S"][n],
        },
    };
    const allData = [...Islamabad, ...Rawalpindi];
    const staticData = allData.find((item) => item.id === Number(id));
    const [dbListing, setDbListing] = useState(listingFromState || null);
    const [isLoadingListing, setIsLoadingListing] = useState(false);
    const [bookedRanges, setBookedRanges] = useState([]);
    const [bookedDisabledDates, setBookedDisabledDates] = useState([]);
    const [isLoadingBookedDates, setIsLoadingBookedDates] = useState(false);
    
    // Get default host details and reviews from the first complete listing (ID 1)
    const defaultHostData = allData.find((item) => item.id === 1) || {};
    
    // Create hybrid data: database listing + static fallback data
    const data = useMemo(() => {
        if (dbListing) {
            // For database listings, use static data for host details and reviews, with fallback to default
            const sourceData = staticData || defaultHostData;
            
            return {
                ...sourceData, // Use static data or default as base (reviews, host details, etc.)
                // Override with database fields
                title: dbListing.stay_type || sourceData?.title,
                subtitle: dbListing.title || sourceData?.subtitle,
                description: dbListing.description || sourceData?.description,
                address: dbListing.address || [dbListing?.city, dbListing?.state || dbListing?.province, dbListing?.country].filter(Boolean).join(', ') || sourceData?.address,
                pricePerNight: dbListing.price_per_night || dbListing.price || sourceData?.pricePerNight,
                city: dbListing.city || sourceData?.city,
                country: dbListing.country || sourceData?.country,
                latitude: dbListing.latitude || sourceData?.latitude,
                longitude: dbListing.longitude || sourceData?.longitude,
                guests: dbListing.max_guests ? `${dbListing.max_guests} guest${dbListing.max_guests !== 1 ? 's' : ''}` : 
                        dbListing.guests ? `${dbListing.guests} guest${dbListing.guests !== 1 ? 's' : ''}` : 
                        sourceData?.guests,
                bedrooms: dbListing.bedrooms ? `${dbListing.bedrooms} bedroom${dbListing.bedrooms !== 1 ? 's' : ''}` : 
                         sourceData?.bedrooms,
                beds: dbListing.beds ? `${dbListing.beds} bed${dbListing.beds !== 1 ? 's' : ''}` : 
                      sourceData?.beds,
                baths: dbListing.baths ? `${dbListing.baths} bath${dbListing.baths !== 1 ? 's' : ''}` : 
                       sourceData?.baths,
                rating: dbListing.rating || sourceData?.rating,
                reviews: dbListing.reviews_count || dbListing.reviews || sourceData?.reviews,
                map: dbListing.map_url || sourceData?.map,
                // Include the first image from database or static data
                img1: dbListing.images && dbListing.images.length > 0 
                    ? (dbListing.images[0].image_url || dbListing.images[0].imageUrl || dbListing.images[0].url || dbListing.images[0].path)
                    : sourceData?.img1,
                // Always use static/default data for host details and reviews
                reviewsData: sourceData?.reviewsData || [],
                HostName: sourceData?.HostName || 'Host',
                HostImage: sourceData?.HostImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
                Hostmonth: sourceData?.Hostmonth || 0,
                HostWork: sourceData?.HostWork || [],
                HostEducation: sourceData?.HostEducation || [],
                Hostinfo: sourceData?.Hostinfo || [],
                detailedRatings: sourceData?.detailedRatings || [],
                houseRules: sourceData?.houseRules || [],
                safety: sourceData?.safety || [],
                cancellationPolicy: sourceData?.cancellationPolicy || [],
                // Include host_id and listing_id for database listings
                host_id: dbListing.host_id || dbListing.hostId || null,
                listing_id: dbListing.id || dbListing.listing_id || dbListing.listingId || null
            };
        }
        // For static data, ensure we have proper fallbacks and parse string values
        if (staticData) {
            return {
                ...staticData,
                // Keep formatted strings for display
                guests: staticData.guests || '1 guest',
                bedrooms: staticData.bedrooms || '1 bedroom',
                beds: staticData.beds || '1 bed',
                baths: staticData.baths || '1 bath',
                rating: staticData.rating || 4.5,
                reviews: staticData.reviews || 0,
                pricePerNight: staticData.pricePerNight || 50,
                // Ensure we have default values for missing properties, with fallback to default host data
                reviewsData: staticData.reviewsData || defaultHostData.reviewsData || [],
                HostName: staticData.HostName || defaultHostData.HostName || 'Host',
                HostImage: staticData.HostImage || defaultHostData.HostImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
                Hostmonth: staticData.Hostmonth || defaultHostData.Hostmonth || 0,
                HostWork: staticData.HostWork || defaultHostData.HostWork || [],
                HostEducation: staticData.HostEducation || defaultHostData.HostEducation || [],
                Hostinfo: staticData.Hostinfo || defaultHostData.Hostinfo || [],
                detailedRatings: staticData.detailedRatings || defaultHostData.detailedRatings || [],
                houseRules: staticData.houseRules || defaultHostData.houseRules || [],
                safety: staticData.safety || defaultHostData.safety || [],
                cancellationPolicy: staticData.cancellationPolicy || defaultHostData.cancellationPolicy || [],
                // For static data, set host_id and listing_id to null since they're not from database
                host_id: null,
                listing_id: staticData.id || null
            };
        }
        // If no static data found, use default host data
        return {
            ...defaultHostData,
            guests: '1 guest',
            bedrooms: '1 bedroom',
            beds: '1 bed',
            baths: '1 bath',
            rating: 4.5,
            reviews: 0,
            pricePerNight: 50,
            // For default data, set host_id and listing_id to null
            host_id: null,
            listing_id: null
        };
    }, [dbListing, staticData, defaultHostData]);
    const dayCount = 11;
    const [isShare, setIsShare] = useState(false);
    const diamondRef = useRef(null);
    const reservationRef = useRef(null);
    // const reportRef = useRef(null);
    const navigate = useNavigate();
    const defaultStartDate = new Date(2025, 8, 16);
    const defaultEndDate = new Date(2025, 8, 20);
    const minDate = new Date(2025, 7, 1);
    const maxDate = new Date(2025, 12, 31);
    const [range, setRange] = useState([
        {
            startDate: defaultStartDate,
            endDate: defaultEndDate,
            key: "selection"
        }
    ]);
    const [focusedRange, setFocusedRange] = useState([0, 0]);
    const [shownDate, setShownDate] = useState(new Date(2025, 8, 16));
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [hasUserSelectedDates, setHasUserSelectedDates] = useState(false);
    const [checkInInput, setCheckInInput] = useState(format(defaultStartDate, "MM/dd/yyyy"));
    const [checkOutInput, setCheckOutInput] = useState(format(defaultEndDate, "MM/dd/yyyy"));
    const [isGuestsOpen, setIsGuestsOpen] = useState(false);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [pets, setPets] = useState(0);
    const [guestUpdateKey, setGuestUpdateKey] = useState(0); 
    const MAX_GUESTS = 6;
    const MAX_INFANTS = 5;
    const totalGuests = adults + children;
    const INCLUDED_GUESTS = 1; 
    const EXTRA_GUEST_FEE_PER_NIGHT = 15; 
    const INFANT_FEE_PER_NIGHT = 5; 

    const nights = useMemo(() => differenceInDays(range[0].endDate, range[0].startDate), [range]);

    // Fetch booked dates for the current listing
    const fetchBookedDates = async (listingId) => {
        if (!listingId) {
            console.log('No listing ID provided for fetching booked dates');
            return;
        }
        
        console.log(`Fetching booked dates for listing ID: ${listingId}`);
        
        try {
            setIsLoadingBookedDates(true);
            const response = await bookingService.getBookedRanges(listingId);
            
            console.log('Booking API response:', response);
            
            if (response.success && response.disabled_dates) {
                console.log('Setting disabled dates from backend:', response.disabled_dates);
                console.log('Number of disabled dates from backend:', response.count);
                
                // Convert string dates to Date objects
                const disabledDatesArray = bookingService.convertDisabledDatesToDateObjects(response.disabled_dates);
                console.log('Setting disabled dates:', disabledDatesArray);
                setBookedDisabledDates(disabledDatesArray);
                
                // For hover tooltips, we can still use ranges if available, or create them from disabled dates
                if (response.ranges) {
                    setBookedRanges(response.ranges);
                } else {
                    // Create ranges from disabled dates for hover functionality
                    setBookedRanges([]);
                }
            } else {
                console.log('No disabled dates found or API response unsuccessful');
                console.log('Response success:', response.success);
                console.log('Response disabled_dates:', response.disabled_dates);
                console.log('Response count:', response.count);
                setBookedRanges([]);
                setBookedDisabledDates([]);
            }
        } catch (error) {
            console.error('Error fetching booked dates:', error);
            setBookedRanges([]);
            setBookedDisabledDates([]);
        } finally {
            setIsLoadingBookedDates(false);
        }
    };

    // Test function to manually test API with a specific listing ID
    const testBookingAPI = async (testListingId = 1) => {
        console.log(`Testing booking API with listing ID: ${testListingId}`);
        try {
            const response = await bookingService.getBookedRanges(testListingId);
            console.log('Test API response:', response);
        } catch (error) {
            console.error('Test API error:', error);
        }
    };

    // Expose test function to window for manual testing
    useEffect(() => {
        window.testBookingAPI = testBookingAPI;
        console.log('Test function available as window.testBookingAPI(listingId)');
    }, []);
    const pricePerNight = data?.pricePerNight || 100;
    const formatPrice = (value) => {
        const num = Number(value || 0);
        const fixed = num.toFixed(2);
        if (fixed.endsWith('.00')) return String(Math.round(num));
        return fixed.replace(/(\.\d)0$/, '$1');
    };
    const totalPrice = useMemo(() => {
        const chargeableGuests = Math.max(0, (adults + children) - INCLUDED_GUESTS);
        const base = pricePerNight * nights;
        const extrasGuests = chargeableGuests * EXTRA_GUEST_FEE_PER_NIGHT * nights;
        const infantsExtras = infants * INFANT_FEE_PER_NIGHT * nights;
        return base + extrasGuests + infantsExtras;
    }, [adults, children, infants, nights, pricePerNight]);
    const disabledDates = [
        new Date(2025, 8, 9),
        new Date(2025, 8, 21),
        new Date(2025, 9, 3)
    ];
    const isDateAllowed = (date) => {
        if (!date) return false;
        if (isBefore(date, minDate) || isAfter(date, maxDate)) return false;
        return !disabledDates.some((d) => isSameDay(d, date));
    };

    const handleChangeDates = (startDate, endDate) => {
        setRange([{ startDate, endDate, key: "selection" }]);
        setCheckInInput(format(startDate, "MM/dd/yyyy"));
        setCheckOutInput(format(endDate, "MM/dd/yyyy"));
        setHasUserSelectedDates(true);
    };

    const applyCheckInInput = () => {
        const parsed = parse(checkInInput, "MM/dd/yyyy", new Date());
        if (!isValid(parsed) || !isDateAllowed(parsed)) return; 
        let newStart = parsed;
        let newEnd = range[0].endDate;
        if (!newEnd || !isAfter(newEnd, newStart)) {
            newEnd = addDays(newStart, 1);
        }
        handleChangeDates(newStart, newEnd);
        setFocusedRange([0, 1]);
        setShownDate(newStart);
    };

    const applyCheckOutInput = () => {
        const parsed = parse(checkOutInput, "MM/dd/yyyy", new Date());
        if (!isValid(parsed) || !isDateAllowed(parsed)) return;
        let newEnd = parsed;
        let newStart = range[0].startDate;
        if (!newStart || !isBefore(newStart, newEnd)) {
            newStart = addDays(newEnd, -1);
        }
        handleChangeDates(newStart, newEnd);
        setFocusedRange([0, 1]);
        setShownDate(newStart);
    };
    const scrollToCalendar = () => {
        const el = document.getElementById("calendar");
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };
    const handleCheckInClick = () => {
        setFocusedRange([0, 0]);
        setShownDate(range[0].startDate);
        setIsCalendarOpen(true);
    };
    const handleCheckOutClick = () => {
        setFocusedRange([0, 1]);
        setShownDate(range[0].endDate);
        setIsCalendarOpen(true);
    };
    const handleClearDates = () => {
        setRange([{ startDate: defaultStartDate, endDate: defaultEndDate, key: "selection" }]);
    };

    // Helper function to ensure guest counts are valid
    const validateGuestCounts = () => {
        if (adults < 1) setAdults(1);
        if (children < 0) setChildren(0);
        if (infants < 0) setInfants(0);
        if (pets < 0) setPets(0);
        
        // Ensure total guests doesn't exceed maximum
        if (totalGuests > MAX_GUESTS) {
            if (children > 0) {
                setChildren(Math.max(0, MAX_GUESTS - adults));
            } else {
                setAdults(MAX_GUESTS);
            }
        }
    };

    // Reset guest counts to defaults
    const resetGuestCounts = () => {
        setAdults(1);
        setChildren(0);
        setInfants(0);
        setPets(0);
        setGuestUpdateKey(prev => prev + 1);
    };
    
    useEffect(() => {
        validateGuestCounts();
    }, [adults, children, infants, pets]);

    // Fetch booked dates when component mounts or listing changes
    useEffect(() => {
        const listingId = data?.listing_id;
        console.log('useEffect triggered - data:', data);
        console.log('Extracted listing_id:', listingId);
        console.log('Data type of listing_id:', typeof listingId);
        
        if (listingId) {
            console.log('Calling fetchBookedDates with listingId:', listingId);
            fetchBookedDates(listingId);
        } else {
            console.log('No listing_id found in data, skipping fetchBookedDates');
            console.log('Available data keys:', Object.keys(data || {}));
            
            // Fallback: try to get listing ID from URL params or other sources
            const urlListingId = id; // from useParams
            console.log('Trying fallback with URL ID:', urlListingId);
            if (urlListingId && !isNaN(parseInt(urlListingId))) {
                console.log('Using URL ID as listing ID:', urlListingId);
                fetchBookedDates(parseInt(urlListingId));
            }
        }
    }, [data?.listing_id, id]);

    useLayoutEffect(() => {
        const diamondEl = diamondRef.current;
        const reservationEl = reservationRef.current;
        const calendarEl = document.getElementById("calendar");
        if (!diamondEl || !calendarEl) return;

        // Check if we're on mobile (screen width < 1024px)
        const isMobile = window.innerWidth < 1024;
        
        // If mobile, completely skip GSAP animations
        if (isMobile) {
            // Just ensure elements are visible and reset any GSAP styles
            if (reservationEl) {
                gsap.set(reservationEl, { 
                    clearProps: "all",
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    position: "static",
                    transform: "none"
                });
                
                // Force reset inline styles
                if (reservationEl.style) {
                    reservationEl.style.position = "static";
                    reservationEl.style.transform = "none";
                    reservationEl.style.top = "auto";
                    reservationEl.style.left = "auto";
                    reservationEl.style.right = "auto";
                    reservationEl.style.bottom = "auto";
                }
            }
            
            // Also reset diamond element on mobile
            if (diamondEl) {
                gsap.set(diamondEl, { 
                    clearProps: "all",
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    position: "static",
                    transform: "none"
                });
                
                // Force reset inline styles
                if (diamondEl.style) {
                    diamondEl.style.position = "static";
                    diamondEl.style.transform = "none";
                    diamondEl.style.top = "auto";
                    diamondEl.style.left = "auto";
                    diamondEl.style.right = "auto";
                    diamondEl.style.bottom = "auto";
                }
            }
            return;
        }

        // Create specific triggers and clean them up reliably (Desktop only)
        const triggers = [];
        const ctx = gsap.context(() => {
            const t1 = ScrollTrigger.create({
                trigger: diamondEl,
                pin: diamondEl,
                start: `top+=96 30%`,
                endTrigger: calendarEl,
                end: `top+=96 10%`,
                pinSpacing: false,
                anticipatePin: 1
            });
            triggers.push(t1);

            if (reservationEl) {
                const t2 = ScrollTrigger.create({
                    trigger: reservationEl,
                    pin: reservationEl,
                    start: `top+=96 40%`,
                    endTrigger: calendarEl,
                    end: `top+=96 10%`,
                    pinSpacing: false,
                    anticipatePin: 1
                });
                triggers.push(t2);
            }
        });

        // Ensure layout is up-to-date
        ScrollTrigger.refresh();

        return () => {
            // Kill created triggers and clear inline styles GSAP may have applied
            triggers.forEach((t) => {
                try { t.kill(); } catch (_) {}
            });
            if (diamondEl) {
                try { gsap.set(diamondEl, { clearProps: "all" }); } catch (_) {}
            }
            if (reservationEl) {
                try { gsap.set(reservationEl, { clearProps: "all" }); } catch (_) {}
            }
            ctx.revert();
        };
    }, [data, dbListing, staticData]);

    useEffect(() => {
        if (dbListing || listingFromState) return;
        const controller = new AbortController();
        const loadListing = async () => {
            try {
                setIsLoadingListing(true);
                const res = await api.get('/api/data/listing', { signal: controller.signal });
                const grouped = res.data || {};
                let found = null;
                Object.values(grouped).forEach((arr) => {
                    if (Array.isArray(arr)) {
                        const m = arr.find((p) => String(p?.id) === String(id));
                        if (m && !found) found = m;
                    }
                });
                if (found) setDbListing(found);
            } catch (_) {
            } finally {
                setIsLoadingListing(false);
            }
        };
        loadListing();
        return () => controller.abort();
    }, [dbListing, listingFromState, id]);

    // Additional effect to ensure animations are set up after data loading
    useEffect(() => {
        if (!isLoadingListing && (data || dbListing || staticData)) {
            // Force a small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                ScrollTrigger.refresh();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isLoadingListing, data, dbListing, staticData]);

    // Handle window resize to update GSAP behavior
    useEffect(() => {
        const handleResize = () => {
            ScrollTrigger.refresh();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Add CSS to ensure mobile behavior
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 1023px) {
                .mobile-no-gsap {
                    position: static !important;
                    transform: none !important;
                    top: auto !important;
                    left: auto !important;
                    right: auto !important;
                    bottom: auto !important;
                    margin-top: 0 !important;
                    margin-left: auto !important;
                    margin-right: auto !important;
                }
                
                #diamond {
                    position: static !important;
                    transform: none !important;
                    top: auto !important;
                    left: auto !important;
                    right: auto !important;
                    bottom: auto !important;
                }
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const baseUploads = 'https://dynamic-tranquility-production.up.railway.app/uploads/';
    const dbImages = (dbListing?.images || [])
        .map((img) => {
            if (!img) return null;
            if (typeof img === 'string') return `${baseUploads}${img}`;
            const u = img.image_url || img.imageUrl || img.url || img.path;
            if (!u) return null;
            return /^https?:\/\//.test(u) ? u : `${baseUploads}${u}`;
        })
        .filter(Boolean);
    const placeholders = new Array(5).fill("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2070&q=80");
    
    // Use database images if available, otherwise use static data images, then fallback to placeholders
    const staticImages = [data?.img1, data?.img2, data?.img3, data?.img4, data?.img5].filter(Boolean);
    
    // For product ID 1, prioritize static data images to show the 5 specific images
    const images = (id === '1' && staticImages.length > 0)
        ? [...staticImages, ...placeholders].slice(0, 5)
        : dbListing && dbImages.length > 0 
            ? [...dbImages, ...placeholders].slice(0, 5)
            : staticImages.length > 0 
                ? [...staticImages, ...placeholders].slice(0, 5)
                : placeholders;
    const [img1, img2, img3, img4, img5] = images;

    // Use the hybrid data structure
    const displaySubtitle = data?.subtitle || 'Listing';
    const propertyType = data?.title || 'Home';
    const displayGuests = data?.guests || '1 guest';
    const displayBedrooms = data?.bedrooms || '1 bedroom';
    const displayBeds = data?.beds || '1 bed';
    const displayBaths = data?.baths || '1 bath';
    const displayRating = data?.rating ?? 4.5;
    const displayAddress = data?.address || 'Address not available';
    const mergedData = data || {};
    
    // Debug: Log the data being passed to components
    console.log('Product ID:', id);
    console.log('Static Data:', staticData);
    console.log('DB Listing:', dbListing);
    console.log('Default Host Data:', defaultHostData);
    console.log('Merged Data:', mergedData);
    console.log('Reviews Data:', mergedData.reviewsData);
    console.log('Host Name:', mergedData.HostName);
    console.log('Host Image:', mergedData.HostImage);
    
    // Show loading state while fetching data
    if (isLoadingListing && !dbListing && !listingFromState) {
        return (
            <div className="flex flex-col py-2 px-8 mt-5 overflow-x-hidden mb-8 pt-20 px-8">
                {/* Header Skeleton */}
                <div className='flex justify-between items-center mb-4 px-8'>
                    <div className='flex items-center justify-center'>
                        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-3">
                        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>

                {/* Image Gallery Skeleton */}
                <div className="grid grid-cols-4 gap-2 mt-2 w-full mx-auto px-8">
                    <div className="col-span-2 row-span-2 h-[330px] w-full bg-gray-200 rounded-l-xl animate-pulse"></div>
                    <div className="col-span-1 h-[160px] w-full bg-gray-200 animate-pulse"></div>
                    <div className="col-span-1 h-[160px] w-full bg-gray-200 rounded-r-xl animate-pulse"></div>
                    <div className="col-span-1 h-[160px] w-full bg-gray-200 animate-pulse"></div>
                    <div className="col-span-1 h-[160px] w-full bg-gray-200 rounded-r-xl animate-pulse"></div>
                </div>

                {/* Main Content Skeleton */}
                <div className="grid grid-cols-3 gap-8 mt-8 px-8">
                    <div className="col-span-2">
                        {/* Title and Rating Skeleton */}
                        <div className="mb-4">
                            <div className="h-8 w-96 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        
                        {/* Description Skeleton */}
                        <div className="mb-6">
                            <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                        </div>

                        {/* Amenities Skeleton */}
                        <div className="mb-6">
                            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
                            <div className="grid grid-cols-2 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Booking Card Skeleton */}
                    <div className="col-span-1">
                        <div className="sticky-element -mt-36 bg-white rounded-xl p-4 shadow-lg border border-gray-100 w-[95%] shadow-[0_0_10px_2px_rgba(0,0,0,0.1)] top-24 ml-auto -mt-12 px-6 relative">
                            <div className="mb-3 flex items-center">
                                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse ml-2"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="border border-gray-200 rounded-lg p-2">
                                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                                <div className="border border-gray-200 rounded-lg p-2">
                                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-2 mb-3">
                                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mb-1"></div>
                                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="h-12 w-full bg-gray-200 rounded-3xl animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Loading Message */}
                <div className="flex items-center justify-center mt-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading property details...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show fallback loading state if no data is available
    if (!data || (!dbListing && !staticData)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Loading Property Details</h2>
                    <p className="text-lg text-gray-600">Preparing property information...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className='flex flex-col py-2 px-4 sm:px-6 lg:px-8 mt-5 overflow-x-hidden mb-8 pt-16 sm:pt-20'>
                {/* Header Section - Mobile Responsive */}
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 px-4 sm:px-6 lg:px-8 gap-4'>
                    <div className='flex items-center justify-center sm:justify-start'>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mt-2 text-center sm:text-left break-words">{displaySubtitle}</h1>
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-3 flex-wrap">
                        <div className="flex items-center justify-center gap-2 underline hover:bg-gray-100 rounded-xl p-1 cursor-pointer w-[86px] px-4">
                            <svg
                                viewBox="0 0 32 32"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                role="presentation"
                                focusable="false"
                                style={{
                                    display: "block",
                                    fill: "none",
                                    height: "16px",
                                    width: "16px",
                                    stroke: "currentColor",
                                    strokeWidth: 2,
                                    overflow: "visible",
                                }}
                            >
                                <path
                                    d="m27 18v9c0 1.1046-.8954 2-2 2h-18c-1.10457 0-2-.8954-2-2v-9m11-15v21m-10-11 9.2929-9.29289c.3905-.39053 1.0237-.39053 1.4142 0l9.2929 9.29289"
                                    fill="none"
                                ></path>
                            </svg>
                            <button
                                className="text-black font-semibold"
                                onClick={() => setIsShare(!isShare)}
                            >
                                Share
                            </button>

                            {isShare && (
                                <div
                                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 cursor-default p-4"
                                    onClick={() => setIsShare(false)}
                                >
                                    <div
                                        className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-[600px] max-h-[90vh] h-auto sm:h-[500px] relative shadow-lg overflow-y-auto"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            className="absolute top-4 right-6 text-gray-600 text-xl hover:text-gray-800 transition-colors cursor-pointer"
                                            onClick={() => setIsShare(false)}
                                        >
                                            ✕
                                        </button>

                                        <h2 className="text-gray-900 text-xl sm:text-2xl lg:text-3xl font-medium">Share this place</h2>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3">
                                            <img
                                                src={data?.image || img1}
                                                alt=""
                                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover flex-shrink-0"
                                            />
                                            <div className="text-sm sm:text-base lg:text-lg text-gray-700">
                                                <p className="font-medium break-words">{displaySubtitle}</p>
                                                <p className="text-xs sm:text-sm">★{Number(displayRating).toFixed(1)} · {displayBedrooms} · {displayBeds} · {displayBaths}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                                            <button className="flex items-center gap-2 border rounded-lg px-4 py-3 text-sm hover:bg-gray-50 cursor-default">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" role="presentation" focusable="false" style={{ display: "block", height: "20px", width: "20px", fill: "currentcolor" }}><path d="M11.5 3A2.5 2.5 0 0 1 14 5.34v7.16a2.5 2.5 0 0 1-2.34 2.5H6.5A2.5 2.5 0 0 1 4 12.66V5.5A2.5 2.5 0 0 1 6.34 3h5.16zM12 .25v1.5H6a3.25 3.25 0 0 0-3.25 3.07V11h-1.5V5A4.75 4.75 0 0 1 5.78.25H12z"></path></svg>
                                                <span>Copy Link</span>
                                            </button>

                                            <button className="flex items-center gap-2 border rounded-lg px-4 py-3 text-sm hover:bg-gray-50 cursor-default">
                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 32 32"
                                                    width="20" height="20"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                    focusable="false">
                                                    <path d="M32 2v28a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2C0 .9.9 0 2 0h28a2 2 0 0 1 2 2z" />
                                                    <path fill="#fff" d="M7.01 9.1c-.17 0-.33.03-.48.09l3.01 3.1 3.05 3.15.05.07.1.09.08.09.18.19 2.61 2.68c.04.02.17.14.27.19.13.06.26.12.4.13.16 0 .31-.04.45-.11.1-.05.15-.12.27-.21l3.02-3.13 3.06-3.14 2.94-3.03a1.3 1.3 0 0 0-.62-.16zm-.92.38c-.32.3-.52.76-.52 1.28v10.17c0 .42.13.8.35 1.1l.42-.4 3.15-3.06 2.79-2.7-.06-.07-3.05-3.14L6.1 9.5zm20.33.1-2.98 3.08-3.04 3.14-.06.06 2.9 2.8 3.15 3.06.19.18c.17-.27.26-.6.26-.97V10.76c0-.46-.16-.88-.42-1.18zm-13.79 6.65-2.77 2.7L6.7 22l-.4.39c.21.13.45.22.71.22H25.4c.31 0 .6-.12.83-.31l-.2-.2-3.15-3.06-2.9-2.8-2.61 2.7c-.14.09-.24.19-.38.25-.22.1-.46.2-.7.19-.25 0-.5-.1-.71-.2-.11-.06-.17-.12-.3-.23z" />
                                                </svg>

                                                <span>Email</span>
                                            </button>

                                            <button className="flex items-center gap-2 border rounded-lg px-4 py-3 text-sm hover:bg-gray-50 cursor-default">
                                                <span>Messages</span>
                                            </button>

                                            <button className="flex items-center gap-2 border rounded-lg px-4 py-3 text-sm hover:bg-gray-50 cursor-default">
                                                <svg
                                                    viewBox="0 0 32 32"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    aria-hidden="true"
                                                    role="presentation"
                                                    focusable="false"
                                                    className="h-5 w-5 fill-current"
                                                >
                                                    <path d="m26.4996694 5.42690083c-2.7964463-2.80004133-6.5157025-4.34283558-10.4785124-4.3442562-8.16570245 0-14.81136692 6.64495868-14.81420824 14.81280987-.00142066 2.6110744.68118843 5.1596695 1.97750579 7.4057025l-2.10180992 7.6770248 7.85319008-2.0599173c2.16358679 1.1805785 4.59995039 1.8020661 7.07895869 1.8028099h.0063636c8.1642975 0 14.8107438-6.6457025 14.8135547-14.8135537.001404-3.9585124-1.5378522-7.67985954-4.3350423-10.47990913zm-10.4785124 22.79243797h-.0049587c-2.2090909-.0006611-4.3761983-.5945454-6.26702475-1.7161157l-.44965289-.2670248-4.66034711 1.2223967 1.24375207-4.5438843-.29265289-.4659504c-1.23238843-1.9604132-1.8837438-4.2263636-1.88232464-6.552562.0028453-6.78846276 5.5262172-12.31184293 12.31825021-12.31184293 3.2886777.00142149 6.38 1.28353719 8.7047934 3.61122314 2.3248761 2.32698347 3.6041323 5.42111569 3.6027285 8.71053719-.0028938 6.7891736-5.5261995 12.312562-12.3125632 12.312562zm6.7536364-9.2212396c-.3700827-.1853719-2.1898347-1.0804132-2.5294215-1.203967-.3395041-.1236363-.5859504-.1853719-.8324793.1853719-.2464463.3708265-.9560331 1.2047108-1.1719835 1.4511571-.2159504.24719-.4319008.2777686-.8019835.092314-.37-.1853719-1.5626446-.5760331-2.9768595-1.8368595-1.1002479-.9816529-1.8433058-2.1933884-2.0591735-2.5642149-.2159505-.3707438-.0227273-.5710744.1619008-.7550413.1661983-.1661983.3700826-.432562.5554545-.6485124.1854546-.2159504.246529-.3707438.3700827-.6172727.1236363-.2471901.0618182-.4630579-.0304959-.6485124-.0923967-.1853719-.8324793-2.0073554-1.1414876-2.74818183-.3004959-.72166116-.6058678-.62363637-.8324793-.63571075-.2159504-.01066116-.4623967-.01278512-.7095868-.01278512s-.6478512.09233884-.98735538.46312396c-.33950413.37074381-1.29561157 1.26644624-1.29561157 3.08768594s1.32619008 3.5821488 1.51156195 3.8293389c.1853719.24719 2.6103306 3.9855371 6.3231405 5.5894214.8829752.381405 1.5726447.6094215 2.1103306.7799174.8865289.2819835 1.6933884.2422314 2.3312397.1470248.7110744-.1065289 2.1899173-.8957025 2.4981818-1.7601653s.3082645-1.6060331.2159504-1.7601653c-.092314-.1541322-.3395041-.2471901-.7095868-.432562z"></path>
                                                </svg>

                                                <span>WhatsApp</span>
                                            </button>

                                            <button className="flex items-center gap-2 border rounded-lg px-4 py-3 text-sm hover:bg-gray-50 cursor-default">
                                                <svg
                                                    viewBox="0 0 32 32"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    aria-hidden="true"
                                                    role="presentation"
                                                    focusable="false"
                                                    className="h-5 w-5 fill-current"
                                                >
                                                    <path d="m15.9700599 1c-8.43293415 0-14.9700599 6.17724551-14.9700599 14.5209581 0 4.3646706 1.78862275 8.1353293 4.7011976 10.7407185.24491018.2185629.39221557.5257485.40239521.8532935l.08143713 2.663473c.0257485.8491018.90359281 1.4017964 1.68023952 1.0586826l2.97125744-1.311976c.2520959-.1107784.5341318-.1317365.7994012-.0580838 1.3658683.3754491 2.8185629.5754491 4.333533.5754491 8.4329341 0 14.9700599-6.1772455 14.9700599-14.5209581 0-8.34371259-6.536527-14.5215569-14.9694611-14.5215569zm9.2766467 10.6461078-5.2119761 8.0550898c-.2646706.408982-.8101796.5257485-1.2191616.2610778l-4.8281438-3.123952c-.1868263-.1209581-.4287425-.1173653-.611976.008982l-5.44191617 3.7532934c-.79401197.5473054-1.76467065-.3946108-1.24071856-1.2041916l5.21257483-8.0550898c.2646707-.4089821.8101797-.5257485 1.2185629-.2610779l4.8293413 3.1245509c.1868264.1209581.4287425.1173653.6119761-.008982l5.4407185-3.7526946c.794012-.54790422 1.7646707.3946108 1.2407186 1.2041916z"></path>
                                                </svg>

                                                <span>Messenger</span>
                                            </button>

                                            <button className="flex items-center gap-2 border rounded-lg px-4 py-3 text-sm hover:bg-gray-50 cursor-default">
                                                <svg
                                                    viewBox="0 0 32 32"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    aria-hidden="true"
                                                    role="presentation"
                                                    focusable="false"
                                                    className="h-5 w-5 fill-current"
                                                >
                                                    <path d="m15.9700599 1c-8.26766469 0-14.9700599 6.70239521-14.9700599 14.9700599 0 7.0203593 4.83353293 12.9113772 11.3538922 14.5293413v-9.954491h-3.08682633v-4.5748503h3.08682633v-1.9712575c0-5.09520959 2.305988-7.45688623 7.3083832-7.45688623.948503 0 2.58503.18622754 3.2544911.37185629v4.14670654c-.3532934-.0371257-.9670659-.0556886-1.7293414-.0556886-2.454491 0-3.402994.9299401-3.402994 3.3473054v1.6179641h4.8898204l-.8401198 4.5748503h-4.0497006v10.2856287c7.4125749-.8952096 13.1562875-7.2065868 13.1562875-14.860479-.0005988-8.26766469-6.702994-14.9700599-14.9706587-14.9700599z"></path>
                                                </svg>

                                                <span>Facebook</span>
                                            </button>

                                            <button className="flex items-center gap-2 border rounded-lg px-4 py-3 text-sm hover:bg-gray-50 cursor-default">
                                                <svg
                                                    viewBox="0 0 32 32"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    aria-hidden="true"
                                                    role="presentation"
                                                    focusable="false"
                                                    className="h-5 w-5 fill-current"
                                                >
                                                    <path d="m18.461198 13.6964303 10.9224206-12.6964303h-2.5882641l-9.4839364 11.024132-7.57479218-11.024132h-8.73662592l11.4545721 16.6704401-11.4545721 13.3141565h2.58841076l10.01528114-11.6418582 7.9995355 11.6418582h8.7366259l-11.879291-17.2881663zm-3.5451833 4.1208802-1.1605868-1.66-9.23437656-13.20879216h3.97564793l7.45224943 10.65991686 1.1605868 1.66 9.6870415 13.8562592h-3.9756479l-7.9049144-11.3067482z"></path>
                                                </svg>

                                                <span>Twitter</span>
                                            </button>

                                            <button className="flex items-center gap-2 border rounded-lg px-4 py-3 text-sm hover:bg-gray-50 cursor-default">
                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 16 16"
                                                    width="20" height="20"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                    focusable="false">
                                                    <path d="M8.78 2.78l1.44.44-3 10-1.44-.44 3-10zM3.95 3.48l1.1 1.03L1.78 8l3.27 3.49-1.1 1.02-3.75-4a.75.75 0 0 1 0-1.04l3.75-4zM12.05 3.48l3.75 4a.75.75 0 0 1 0 1.04l-3.75 4-1.1-1.03L14.22 8l-3.27-3.49 1.1-1.03z" />
                                                </svg>

                                                <span>Embed</span>
                                            </button>
                                        </div>

                                        <button className="w-full border rounded-lg px-4 py-3 text-sm mt-4 hover:bg-gray-50 flex items-center justify-center gap-2 cursor-default">
                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 32 32"
                                                width="32" height="32"
                                                fill="currentColor"
                                                aria-hidden="true"
                                                focusable="false">
                                                <path d="M6 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm10-2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm10-2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
                                            </svg>

                                            <span>More options</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                        <div className="flex items-center justify-center gap-2 underline hover:bg-gray-100 rounded-xl p-1 cursor-pointer w-[86px] px-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 32 32"
                                aria-hidden="true"
                                role="presentation"
                                focusable="false"
                                style={{
                                    display: "block",
                                    fill: "none",
                                    height: "16px",
                                    width: "16px",
                                    stroke: "currentColor",
                                    strokeWidth: 2,
                                    overflow: "visible",
                                }}
                            >
                                <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path>
                            </svg>
                            <button className="text-gray-900 font-semibold">Save</button>
                        </div>
                    </div>

                </div>
                {/* Image Gallery - Mobile Responsive */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 w-full mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Main Image - Mobile: 2 columns, Desktop: 2 columns */}
                    <div className="col-span-2 row-span-2 h-[200px] sm:h-[250px] lg:h-[330px] w-full">
                        <img
                            src={img1}
                            alt="Main property view"
                            className="w-full h-full object-cover rounded-tl-xl sm:rounded-l-xl hover:scale-[1.02] transition-transform duration-300 shadow-lg cursor-pointer"
                            onClick={() => navigate(`/products/${id}/photos`)}
                            loading="eager"
                            decoding="sync"
                        />
                    </div>
                    
                    {/* Second Image */}
                    <div className="col-span-1 h-[98px] sm:h-[123px] lg:h-[160px] w-full">
                        <img
                            src={img2}
                            alt="Property detail"
                            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 shadow-lg cursor-pointer"
                            onClick={() => navigate(`/products/${id}/photos`)}
                            loading="eager"
                            decoding="sync"
                        />
                    </div>
                    
                    {/* Third Image */}
                    <div className="col-span-1 h-[98px] sm:h-[123px] lg:h-[160px] w-full">
                        <img
                            src={img3}
                            alt="Property detail"
                            className="w-full h-full object-cover rounded-tr-xl sm:rounded-r-xl hover:scale-[1.02] transition-transform duration-300 shadow-lg cursor-pointer"
                            onClick={() => navigate(`/products/${id}/photos`)}
                            loading="eager"
                            decoding="sync"
                        />
                    </div>
                    
                    {/* Fourth Image */}
                    <div className="col-span-1 h-[98px] sm:h-[123px] lg:h-[160px] w-full">
                        <img
                            src={img4}
                            alt="Property detail"
                            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 shadow-lg cursor-pointer"
                            onClick={() => navigate(`/products/${id}/photos`)}
                            loading="eager"
                            decoding="sync"
                        />
                    </div>
                    
                    {/* Fifth Image with Show All Button */}
                    <div className="col-span-1 h-[98px] sm:h-[123px] lg:h-[160px] w-full relative">
                        <img 
                            src={img5} 
                            alt="Property detail" 
                            className="w-full h-full object-cover rounded-br-xl sm:rounded-r-xl hover:scale-[1.02] transition-transform duration-300 shadow-lg cursor-pointer" 
                            loading="eager" 
                            decoding="sync" 
                            onClick={() => navigate(`/products/${id}/photos`)} 
                        />
                        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
                            <button
                                className="bg-white text-gray-900 px-2 py-1 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-1 sm:gap-2 border border-black text-xs sm:text-sm"
                                onClick={() => navigate(`/products/${id}/photos`)}
                            >
                                <span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 16 16"
                                        aria-hidden="true"
                                        role="presentation"
                                        focusable="false"
                                        style={{
                                            display: "block",
                                            height: "16px",
                                            width: "16px",
                                            fill: "currentColor",
                                        }}
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M3 11.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-10-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-10-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"
                                        />
                                    </svg>
                                </span>
                                <span>Show all photos</span>
                            </button>
                        </div>
                    </div>
                </div>
                {/* Property Details - Mobile Responsive */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-4 mt-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex-1 items-center justify-center gap-2 text-center sm:text-left">
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-black break-words">Entire {propertyType}, Pakistan</h1>
                        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                            <h2 className="text-sm sm:text-base lg:text-[1.04rem] font-normal text-gray-900">
                                {displayGuests} • {displayBedrooms} • {displayBeds} • {displayBaths}
                            </h2>
                        </div>
                    </div>
                    <div className="Stick-element flex gap-2 items-center justify-center h-10 sm:h-12 w-full sm:w-[30%] rounded-xl bg-white shadow-[0_0_10px_2px_rgba(0,0,0,0.1)] px-3 sm:px-4" id="diamond" ref={diamondRef}>
                        <svg fill="#fd3a75" width="35" height="35" viewBox="-7.04 -7.04 46.08 46.08" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#fd3a75" strokeWidth="0.096" transform="rotate(0)">
                            <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" stroke="#757575" strokeWidth="0.256">
                                <title>diamond</title>
                                <path d="M2.103 12.052l13.398 16.629-5.373-16.629h-8.025zM11.584 12.052l4.745 16.663 4.083-16.663h-8.828zM17.051 28.681l12.898-16.629h-7.963l-4.935 16.629zM29.979 10.964l-3.867-6.612-3.869 6.612h7.736zM24.896 3.973h-7.736l3.867 6.839 3.869-6.839zM19.838 10.964l-3.867-6.612-3.868 6.612h7.735zM14.839 3.973h-7.735l3.868 6.839 3.867-6.839zM5.889 4.352l-3.867 6.612h7.735l-3.868-6.612z" />
                            </g>
                            <g id="SVGRepo_iconCarrier">
                                <title>diamond</title>
                                <path d="M2.103 12.052l13.398 16.629-5.373-16.629h-8.025zM11.584 12.052l4.745 16.663 4.083-16.663h-8.828zM17.051 28.681l12.898-16.629h-7.963l-4.935 16.629zM29.979 10.964l-3.867-6.612-3.869 6.612h7.736zM24.896 3.973h-7.736l3.867 6.839 3.869-6.839zM19.838 10.964l-3.867-6.612-3.868 6.612h7.735zM14.839 3.973h-7.735l3.868 6.839 3.867-6.839zM5.889 4.352l-3.867 6.612h7.735l-3.868-6.612z" />
                            </g>
                        </svg>
                        <div className="flex flex-col items-center justify-center">
                            <h2 className="text-gray-900 text-xs sm:text-sm lg:text-[0.98rem] font-semibold -mt-1 px-1 sm:px-2 text-center">
                                <span className="hidden sm:inline">Rare find! This place is usually booked</span>
                                <span className="sm:hidden">Rare find!</span>
                            </h2>
                        </div>
                    </div>
                </div>
                <div className="hidden sm:flex items-center mt-6 sm:mt-10 px-4 sm:px-6 lg:px-8">
                    <div className="border-b border-gray-300 w-[56%]"></div>
                </div>
                {/* Main Content Grid - Mobile Responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 px-4 sm:px-6 lg:px-8">
                    <div className="lg:col-span-2 order-2 lg:order-1">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <img src={data?.HostImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"} alt="Host Image" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0" />
                            <div className="flex flex-col leading-tight min-w-0">
                                <h2 className="text-gray-900 text-base sm:text-lg lg:text-[1.1rem] font-medium break-words">
                                    Hosted by {data?.HostName || 'Host'}
                                </h2>
                                <h2 className="text-gray-500 text-sm sm:text-base lg:text-[0.98rem] font-normal">
                                    {data?.Hostmonth || '0'} months on Airbnb
                                </h2>
                            </div>
                        </div>
                        <div className="flex items-center mt-6">
                            <div className="border-b border-gray-300 w-[85%]"></div>
                        </div>
                        <div className="flex items-start gap-4 sm:gap-7 mt-6 px-2">
                            <img src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-GuestFavorite/original/4d090f93-f9a5-4f06-95e4-ca737c0d0ab5.png" alt="Guest Favorite" className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-1" />
                            <div className="flex flex-col min-w-0">
                                <h2 className="text-gray-900 text-sm sm:text-base lg:text-[0.98rem] font-medium">
                                    Top 10% of homes
                                </h2>
                                <h2 className="text-gray-500 text-xs sm:text-sm lg:text-[0.98rem] font-normal break-words">
                                    This home is highly ranked based on ratings, reviews, and reliability.
                                </h2>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 sm:gap-7 mt-6 px-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '20px', width: '20px', fill: 'currentcolor' }} className="flex-shrink-0 mt-1 sm:h-6 sm:w-6"><path d="M24.33 1.67a2 2 0 0 1 2 1.85v24.81h3v2H2.67v-2h3V3.67a2 2 0 0 1 1.85-2h.15zm-4 2H7.67v24.66h12.66zm4 0h-2v24.66h2zm-7 11a1.33 1.33 0 1 1 0 2.66 1.33 1.33 0 0 1 0-2.66z"></path></svg>
                            <div className="flex flex-col min-w-0">
                                <h2 className="text-gray-900 text-sm sm:text-base lg:text-[0.98rem] font-medium">
                                    Self check-in
                                </h2>
                                <h2 className="text-gray-500 text-xs sm:text-sm lg:text-[0.98rem] font-normal break-words">
                                    Check yourself in with the lockbox.
                                </h2>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 sm:gap-7 mt-6 px-2 sm:px-3">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '20px', width: '20px', fill: 'currentcolor' }} className="flex-shrink-0 mt-1 sm:h-6 sm:w-6"><path d="M11.67 0v1.67h8.66V0h2v1.67h6a2 2 0 0 1 2 1.85v16.07a2 2 0 0 1-.46 1.28l-.12.13L21 29.75a2 2 0 0 1-1.24.58H6.67a5 5 0 0 1-5-4.78V3.67a2 2 0 0 1 1.85-2h6.15V0zm16.66 11.67H3.67v13.66a3 3 0 0 0 2.82 3h11.18v-5.66a5 5 0 0 1 4.78-5h5.88zm-.08 8h-5.58a3 3 0 0 0-3 2.82v5.76zm-18.58-16h-6v6h24.66v-6h-6v1.66h-2V3.67h-8.66v1.66h-2z"></path></svg>
                            <div className="flex flex-col min-w-0">
                                <h2 className="text-gray-900 text-sm sm:text-base lg:text-[0.98rem] font-medium">
                                    Free cancellation before Sep 26
                                </h2>
                                <h2 className="text-gray-500 text-xs sm:text-sm lg:text-[0.98rem] font-normal break-words">
                                    Get a full refund if you change your mind.
                                </h2>
                            </div>
                        </div>
                    </div>
                    {/* Reservation Card - Mobile Responsive */}
                    <div className="lg:col-span-1 order-1 lg:order-2">
                        <div className="sticky-element -mt-0 lg:-mt-36 bg-white rounded-xl p-4 shadow-lg border border-gray-100 w-full lg:w-[95%] shadow-[0_0_10px_2px_rgba(0,0,0,0.1)] top-4 lg:top-24 ml-auto lg:-mt-12 px-4 sm:px-6 relative mobile-no-gsap" id="reservation" ref={reservationRef}>
                            <div className="mb-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className="text-xl sm:text-2xl font-bold underline">${formatPrice(totalPrice)}</span>
                                <span className="text-gray-600 font-medium text-sm sm:text-base lg:text-[1.08rem]">for {nights} nights</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="border border-black rounded-lg p-2 cursor-pointer" onClick={handleCheckInClick}>
                                    <label className="block text-xs font-medium text-gray-700 uppercase">CHECK-IN</label>
                                    <div className="text-gray-900 text-xs sm:text-sm mt-1 truncate">{format(range[0].startDate, "MM/dd/yyyy")}</div>
                                </div>
                                <div className="border border-black rounded-lg p-2 cursor-pointer" onClick={handleCheckOutClick}>
                                    <label className="block text-xs font-medium text-gray-700 uppercase">CHECKOUT</label>
                                    <div className="text-gray-900 text-xs sm:text-sm mt-1 truncate">{format(range[0].endDate, "MM/dd/yyyy")}</div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="border border-black rounded-lg p-2 mb-3 cursor-pointer" onClick={() => {
                                    setIsGuestsOpen(true);
                                    validateGuestCounts();
                                }}>
                                    <label className="block text-xs font-medium text-gray-700 uppercase">GUESTS</label>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="text-gray-900 text-xs sm:text-sm min-w-0 flex-1">
                                            <div className="truncate">
                                                {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}
                                            </div>
                                            {(infants > 0 || pets > 0) && (
                                                <div className="text-gray-600 text-xs truncate">
                                                    {infants > 0 && `${infants} infant${infants !== 1 ? 's' : ''}`}
                                                    {infants > 0 && pets > 0 && ', '}
                                                    {pets > 0 && `${pets} pet${pets !== 1 ? 's' : ''}`}
                                                </div>
                                            )}
                                        </div>
                                        <svg className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                {isGuestsOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-[999] bg-transparent" 
                                            onClick={() => setIsGuestsOpen(false)}
                                        />
                                        <div 
                                            className="absolute left-0 z-[1000] -mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                <div className="flex-1">
                                                    <div className="text-gray-900 font-semibold text-sm">Adults</div>
                                                    <div className="text-gray-500 text-xs">Age 13+</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                                                            adults <= 1 
                                                                ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                                                                : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100'
                                                        }`}
                                                        onClick={() => {
                                                            if (adults > 1) {
                                                                setAdults(adults - 1);
                                                            }
                                                        }}
                                                        disabled={adults <= 1}
                                                        type="button"
                                                    >
                                                        −
                                                    </button>
                                                    <div className="w-6 text-center text-sm font-semibold text-gray-900">{adults}</div>
                                                    <button
                                                        className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                                                            totalGuests >= MAX_GUESTS 
                                                                ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                                                                : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100'
                                                        }`}
                                                        onClick={() => {
                                                            if (totalGuests < MAX_GUESTS) {
                                                                setAdults(adults + 1);
                                                            }
                                                        }}
                                                        disabled={totalGuests >= MAX_GUESTS}
                                                        type="button"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                </div>
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                <div className="flex-1">
                                                    <div className="text-gray-900 font-semibold text-sm">Children</div>
                                                    <div className="text-gray-500 text-xs">Ages 2–12</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                                                            children <= 0 
                                                                ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                                                                : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100'
                                                        }`}
                                                        onClick={() => {
                                                            if (children > 0) {
                                                                setChildren(children - 1);
                                                            }
                                                        }}
                                                        disabled={children <= 0}
                                                        type="button"
                                                    >
                                                        −
                                                    </button>
                                                    <div className="w-6 text-center text-sm font-semibold text-gray-900">{children}</div>
                                                    <button
                                                        className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                                                            totalGuests >= MAX_GUESTS 
                                                                ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                                                                : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100'
                                                        }`}
                                                        onClick={() => {
                                                            if (totalGuests < MAX_GUESTS) {
                                                                setChildren(children + 1);
                                                            }
                                                        }}
                                                        disabled={totalGuests >= MAX_GUESTS}
                                                        type="button"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Infants Section */}
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                <div className="flex-1">
                                                    <div className="text-gray-900 font-semibold text-sm">Infants</div>
                                                    <div className="text-gray-500 text-xs">Under 2</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                                                            infants <= 0 
                                                                ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                                                                : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100'
                                                        }`}
                                                        onClick={() => {
                                                            if (infants > 0) {
                                                                setInfants(infants - 1);
                                                            }
                                                        }}
                                                        disabled={infants <= 0}
                                                        type="button"
                                                    >
                                                        −
                                                    </button>
                                                    <div className="w-6 text-center text-sm font-semibold text-gray-900">{infants}</div>
                                                    <button
                                                        className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                                                            infants >= MAX_INFANTS 
                                                                ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                                                                : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100'
                                                        }`}
                                                        onClick={() => {
                                                            if (infants < MAX_INFANTS) {
                                                                setInfants(infants + 1);
                                                            }
                                                        }}
                                                        disabled={infants >= MAX_INFANTS}
                                                        type="button"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Pets Section */}
                                            <div className="flex items-center justify-between py-2">
                                                <div className="flex-1">
                                                    <div className="text-gray-900 font-semibold text-sm">Pets</div>
                                                    <a 
                                                        className="text-gray-600 underline text-xs hover:text-gray-800 transition-colors" 
                                                        href="#" 
                                                        onClick={(e) => e.preventDefault()}
                                                    >
                                                        Bringing a service animal?
                                                    </a>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                                                            pets <= 0 
                                                                ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                                                                : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100'
                                                        }`}
                                                        onClick={() => {
                                                            if (pets > 0) {
                                                                setPets(pets - 1);
                                                            }
                                                        }}
                                                        disabled={pets <= 0}
                                                        type="button"
                                                    >
                                                        −
                                                    </button>
                                                    <div className="w-6 text-center text-sm font-semibold text-gray-900">{pets}</div>
                                                    <button 
                                                        className="w-7 h-7 rounded-full border border-gray-200 text-gray-300 cursor-not-allowed flex items-center justify-center text-sm font-medium" 
                                                        disabled
                                                        title="Pets are not allowed at this property"
                                                        type="button"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Info text */}
                                            <div className="text-gray-500 text-xs mt-3 pt-2 border-t border-gray-100">
                                                This place has a maximum of {MAX_GUESTS} guests, not including infants. Pets aren't allowed.
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                                                <button 
                                                    className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors" 
                                                    onClick={() => resetGuestCounts()}
                                                    type="button"
                                                >
                                                    Reset
                                                </button>
                                                <button 
                                                    className="text-gray-900 hover:text-gray-700 text-sm font-medium transition-colors" 
                                                    onClick={() => setIsGuestsOpen(false)}
                                                    type="button"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                    </div>
                                    </>
                                )}
                            </div>
                            <button className="w-full bg-gradient-to-r from-[#ff385c] via-[#ff385c] via-[#ff385c] via-[#d42d4a] via-[#ff385c] to-[#ff385c] text-white font-semibold py-3 px-4 rounded-3xl text-base mb-2 hover:from-[#e62e4f] hover:via-[#e62e4f] hover:via-[#e62e4f] hover:via-[#c42a45] hover:via-[#e62e4f] hover:to-[#e62e4f] transition-all duration-200" onClick={() => {
                                setSelectedDates({
                                    startDate: range[0].startDate,
                                    endDate: range[0].endDate,
                                    nights: differenceInDays(range[0].endDate, range[0].startDate)
                                });
                                navigate(`/products/${id}/reserve`, { 
                                    state: { 
                                        productData: data,
                                        selectedDates: {
                                            startDate: range[0].startDate,
                                            endDate: range[0].endDate,
                                            nights: differenceInDays(range[0].endDate, range[0].startDate)
                                        },
                                        guestData: {
                                            adults: adults,
                                            children: children,
                                            infants: infants,
                                            pets: pets,
                                            totalGuests: totalGuests
                                        },
                                        totalPrice: totalPrice
                                    } 
                                });
                            }}>
                                Reserve
                            </button>
                            <div className="text-center text-gray-700 font-medium text-[0.9rem] mt-1">
                                You won't be charged yet
                            </div>
                        </div>
                        
                    </div>
                </div>
                <div className="flex items-center mt-4 px-4 sm:px-6 lg:px-8">
                    <div className="border-b border-gray-300 w-full sm:w-[80%] lg:w-[56%]"></div>
                </div>
                <div className="flex items-center gap-4 sm:gap-7 mt-6 px-4 sm:px-6 lg:px-10">
                    <p className="text-gray-900 text-sm sm:text-base lg:text-[1.06rem] font-normal w-full lg:w-[56%] break-words leading-relaxed">Step into Aurora Retreat, a stylish 1BHK in Islamabad's prime. Located in the centre of Islamabad, enjoy a spacious bedroom, cozy lounge with Smart TV, fully equipped kitchen, modern bathroom, high-speed WiFi, lift, and secure parking. Perfect for solo travelers, couples, or business visitors seeking comfort and peace near top restaurants and transport. Book now for a premium, relaxing stay!</p>
                </div>
                <div className="px-2 sm:px-4">
                    <SpaceDescription text={`Step into Aurora Retreat, a stylish 1BHK in Islamabad's prime. Located in the centre of Islamabad, enjoy a spacious bedroom, cozy lounge with Smart TV, fully equipped kitchen, modern bathroom, high-speed WiFi, lift, and secure parking. Perfect for solo travelers, couples, or business visitors seeking comfort and peace near top restaurants and transport. Book now for a premium, relaxing stay!`} Space={`The space Aurora Retreat is 1BHK apartment located in the centre of Islamabad. It has one bed room with attached bath and a living room with an open kitchen. This bed room contains a queen size bed with plush bedding a beige upholstered headboard. Behind the bed is a feature wall with dark brown wooden slats. There are two matching beige nightstands on either side of the bed. The room gives off a clean, organized, and calming vibe. The beige and brown tones paired with minimal decor make it feel luxurious, ideal for relaxation and comfort.`} Guest={`Guest access This is a full unit in which guests can approach any part of the property, the bed room with attached bathroom and even the private living room with open kitchen. All the spaces shown in the pictures can be easily accessed. Guests have access to other things as well once they book this property such as Lift and Parking.`} />
                </div>
                <div className="flex items-center mt-6 sm:mt-8 px-4 sm:px-6 lg:px-8">
                    <div className="border-b border-gray-300 w-full sm:w-[80%] lg:w-[56%]"></div>
                </div>
                <div className="px-2 sm:px-4">
                    <ThingsAvailibility />
                </div>
                <div className="flex items-center mt-6 sm:mt-8 px-4 sm:px-6 lg:px-8">
                    <div className="border-b border-gray-300 w-full sm:w-[80%] lg:w-[60%]"></div>
                </div>
                <div id="calendar" className='flex items-center mt-6 sm:mt-8 px-4 sm:px-6 lg:px-8'>
                    <Calender
                        data={data}
                        dayCount={dayCount}
                        onChangeDates={handleChangeDates}
                        range={range}
                        focusedRange={focusedRange}
                        onFocusChange={setFocusedRange}
                        shownDate={shownDate}
                        disabledDates={bookedDisabledDates}
                        bookingRanges={bookedRanges}
                    />
                </div>
                {isCalendarOpen && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40" onClick={() => setIsCalendarOpen(false)}>
                        <div className="bg-white rounded-2xl shadow-xl mt-10 w-[900px] max-w-[95%]" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between px-6 py-4 border-b">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Select dates</h2>
                                    <p className="text-sm text-gray-600 mt-1">Add your travel dates for exact pricing</p>
                                </div>
                                <div className="flex gap-3 w-[420px]">
                                    <div className="flex-1 border border-black rounded-xl px-3 py-2 bg-white">
                                        <label className="block text-[11px] font-semibold text-gray-700 uppercase">CHECK-IN</label>
                                        <input
                                            className="w-full text-gray-900 text-sm mt-1 outline-none"
                                            placeholder="MM/DD/YYYY"
                                            value={checkInInput}
                                            onChange={(e) => setCheckInInput(e.target.value)}
                                            onBlur={applyCheckInInput}
                                            onKeyDown={(e) => { if (e.key === 'Enter') applyCheckInInput(); }}
                                        />
                                    </div>
                                    <div className={`flex-1 border border-black rounded-xl px-3 py-2 ${hasUserSelectedDates ? 'bg-white' : 'bg-gray-100'}`}> 
                                        <label className="block text-[11px] font-semibold text-gray-700 uppercase">CHECKOUT</label>
                                        <input
                                            className="w-full text-gray-900 text-sm mt-1 outline-none placeholder-gray-400"
                                            placeholder="Add date"
                                            value={checkOutInput}
                                            onChange={(e) => setCheckOutInput(e.target.value)}
                                            onBlur={applyCheckOutInput}
                                            onKeyDown={(e) => { if (e.key === 'Enter') applyCheckOutInput(); }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 pt-4">
                                <DateRange
                                    months={window.innerWidth < 640 ? 1 : 2}
                                    direction="horizontal"
                                    onChange={(item) => { setHasUserSelectedDates(true); handleChangeDates(item.selection.startDate, item.selection.endDate); }}
                                    moveRangeOnFirstSelection={false}
                                    ranges={range}
                                    focusedRange={focusedRange}
                                    onRangeFocusChange={setFocusedRange}
                                    shownDate={shownDate}
                                    minDate={new Date(2025, 7, 1)}
                                    maxDate={new Date(2025, 12, 31)}
                                    showDateDisplay={false}
                                    disabledDates={bookedDisabledDates}
                                    monthDisplayFormat="MMMM yyyy"
                                    locale={customLocale}
                                />
                            </div>
                            <div className="flex items-center justify-end gap-4 px-6 py-4 border-t">
                                <button onClick={handleClearDates} className="text-gray-700 underline">Clear dates</button>
                                <button onClick={() => setIsCalendarOpen(false)} className="bg-gray-900 text-white px-4 py-2 rounded-lg">Close</button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-center mt-6 sm:mt-8 px-4 sm:px-6 lg:px-8 gap-1 sm:gap-1.5">
                    <img src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-GuestFavorite/original/059619e1-1751-42dd-84e4-50881483571a.png" alt="Guest Favorite" className="w-16 h-20 sm:w-20 sm:h-24 lg:w-22 lg:h-32 mt-2 sm:mt-3" />
                    <h1 className="text-black text-[4rem] sm:text-[5rem] lg:text-[7rem] font-medium leading-tight -mt-6 sm:-mt-8 lg:-mt-12">
                        {Number(displayRating).toFixed(1)}
                    </h1>
                    <img src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-GuestFavorite/original/33b80859-e87e-4c86-841c-645c786ba4c1.png" alt="Guest Favorite" className="w-16 h-20 sm:w-20 sm:h-24 lg:w-22 lg:h-32 mt-2 sm:mt-3" />
                </div>
                <div className="flex flex-col items-center justify-center -mt-2 sm:-mt-1 px-4 sm:px-6 lg:px-8 gap-1">
                    <h2 className="text-gray-900 text-xl sm:text-2xl lg:text-[1.5rem] font-medium text-center">
                        Guest favorite
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base lg:text-[1.2rem] font-semibold w-full sm:w-[80%] lg:w-[33%] break-words text-center">
                        This home is in the <span className="text-black font-semibold">top 10%</span> of eligible listings based on ratings, reviews, and reliability
                    </p>
                </div>
                <div className="mt-6 justify-center px-4 sm:px-6">
                    <DisplayData />
                </div>
                <div className="flex items-center mt-8 sm:mt-10 px-4 sm:px-6 lg:px-8">
                    <div className="border-b border-gray-300 w-[106%]"></div>
                </div>
                <div className="px-2 sm:px-4">
                    <ReviewsDialog data={mergedData} />
                </div>
                <div className="flex items-center mt-8 sm:mt-10 px-4 sm:px-6 lg:px-8">
                    <div className="border-b border-gray-300 w-[106%]"></div>
                </div>
                <div className="flex items-center mt-8 sm:mt-10 px-4 sm:px-6 lg:px-8">
                    <h2 className="text-gray-900 text-xl sm:text-2xl lg:text-[1.47rem] font-medium">
                        Where you'll be
                    </h2>
                </div>
                <div className="flex items-center mt-4 px-4 sm:px-6 lg:px-8">
                    <h2 className="text-gray-600 text-sm sm:text-base lg:text-[1.05rem] font-medium break-words">
                        {displayAddress}
                    </h2>
                </div>
                <div className="flex items-center mt-6 sm:mt-10 px-4 sm:px-6 lg:px-8">
                    <iframe 
                        src={data?.map || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d-74.00425878459418!3d40.74844097932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1623865470!5m2!1sen!2sus"} 
                        width="100%" 
                        height="250px" 
                        style={{ border: '0' }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade" 
                        className='rounded-xl w-full h-[250px] sm:h-[300px] lg:h-[400px]'
                    ></iframe>
                </div>

                <div className="flex items-center mt-12 sm:mt-16 px-4 sm:px-6 lg:px-8">
                    <div className="border-b border-gray-300 w-[106%]"></div>
                </div>
                <div className="items-center px-2 sm:px-4">
                    <HostDetails data={mergedData} />
                </div>
                <div className="flex items-center mt-8 sm:mt-12 px-4 sm:px-6 lg:px-8">
                    <div className="border-b border-gray-300 w-[106%]"></div>
                </div>
                <div className="px-2 sm:px-4">
                    <Knowingthings data={mergedData} />
                </div>
            </div>
        </>
    );
}

export default ProductsDetails;
