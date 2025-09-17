import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import api from './api'
import { format, addDays, differenceInDays } from 'date-fns';
import { DateRange } from 'react-date-range';
import { enUS } from 'date-fns/locale';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Islamabad, Rawalpindi } from './data';

gsap.registerPlugin(ScrollTrigger)

function Reserve({ selectedDates, setSelectedDates }) {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const rightSidebarRef = useRef(null);
    const endMarkerRef = useRef(null);
    const diamondRef = useRef(null);
    const [isEmailExist, setIsEmailExist] = useState(null);
    const [isPhoneExist, setIsPhoneExist] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Get product data from navigation state
    const productDataFromState = location.state?.productData;
    const selectedDatesFromState = location.state?.selectedDates;
    const guestDataFromState = location.state?.guestData;
    const totalPriceFromState = location.state?.totalPrice;
    
    const [country, setCountry] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('Pakistan');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [dialCode, setDialCode] = useState("+223");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [authMethod, setAuthMethod] = useState('phone');
    const [showError, setShowError] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showsignup, setShowsignup] = useState(true);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const [isSignupFlow, setIsSignupFlow] = useState(false);
    const [paymentStep, setPaymentStep] = useState(1); // 1: payment method, 2: message to host, 3: review request
    const [messageToHost, setMessageToHost] = useState('');
    const [isMessageValid, setIsMessageValid] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        streetAddress: '',
        appSuite: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Pakistan'
    });
    const [isCardFormValid, setIsCardFormValid] = useState(false);

    // Function to validate card form
    const validateCardForm = () => {
        const { cardNumber, expiryDate, cvv, streetAddress, city, state, zipCode } = cardDetails;
        const isValid = cardNumber.trim() !== '' && 
                       expiryDate.trim() !== '' && 
                       cvv.trim() !== '' && 
                       streetAddress.trim() !== '' && 
                       city.trim() !== '' && 
                       state.trim() !== '' && 
                       zipCode.trim() !== '';
        setIsCardFormValid(isValid);
        return isValid;
    };

    // Function to handle card details update
    const updateCardDetails = (field, value) => {
        const newDetails = {
            ...cardDetails,
            [field]: value
        };
        setCardDetails(newDetails);
        
        // Validate form after update
        const { cardNumber, expiryDate, cvv, streetAddress, city, state, zipCode } = newDetails;
        const isValid = cardNumber.trim() !== '' && 
                       expiryDate.trim() !== '' && 
                       cvv.trim() !== '' && 
                       streetAddress.trim() !== '' && 
                       city.trim() !== '' && 
                       state.trim() !== '' && 
                       zipCode.trim() !== '';
        setIsCardFormValid(isValid);
    };

    // GSAP ScrollTrigger animation for right sidebar (includes diamond section)
    useLayoutEffect(() => {
        const rightSidebarEl = rightSidebarRef.current;
        const endMarkerEl = endMarkerRef.current;
        
        if (!rightSidebarEl || !endMarkerEl) return;

        // Create specific triggers and clean them up reliably
        const triggers = [];
        const ctx = gsap.context(() => {
            // Right sidebar animation (includes diamond section as it's now inside the container)
            // Only pin on desktop/large screens, not on mobile
            const t1 = ScrollTrigger.create({
                trigger: rightSidebarEl,
                pin: window.innerWidth >= 1024 ? rightSidebarEl : false, // Only pin on lg+ screens
                start: window.innerWidth >= 1024 ? `top+=106 22%` : false, // Only start pinning on lg+ screens
                endTrigger: window.innerWidth >= 1024 ? endMarkerEl : false, // Only use end trigger on lg+ screens
                end: window.innerWidth >= 1024 ? `top+=96 1%` : false, // Only end pinning on lg+ screens
                pinSpacing: false,
                anticipatePin: 1
            });
            triggers.push(t1);
        });

        // Ensure layout is up-to-date
        ScrollTrigger.refresh();

        // Add resize listener to handle screen size changes
        const handleResize = () => {
            ScrollTrigger.refresh();
        };
        
        window.addEventListener('resize', handleResize);

        return () => {
            // Remove resize listener
            window.removeEventListener('resize', handleResize);
            // Kill created triggers and clear inline styles GSAP may have applied
            triggers.forEach((t) => {
                try { t.kill(); } catch (_) {}
            });
            if (rightSidebarEl) {
                try { gsap.set(rightSidebarEl, { clearProps: "all" }); } catch (_) {}
            }
            ctx.revert();
        };
    }, [data, loading]);

    // Function to handle Next button click for card payment
    const handleCardNext = () => {
        if (validateCardForm()) {
            setPaymentStep(2);
        }
    };

    // Function to validate message to host
    const validateMessage = (message) => {
        const isValid = message.trim().length > 0;
        setIsMessageValid(isValid);
        return isValid;
    };

    // Function to handle message input change
    const handleMessageChange = (e) => {
        const message = e.target.value;
        setMessageToHost(message);
        validateMessage(message);
    };

    // Function to handle Next button click for step 2 (message to host)
    const handleMessageNext = () => {
        if (validateMessage(messageToHost)) {
            setPaymentStep(3);
        }
    };

    // Function to navigate between steps
    const navigateToStep = (step) => {
        if (step === 1 || (step === 2 && paymentStep >= 2) || (step === 3 && paymentStep >= 3)) {
            setPaymentStep(step);
        }
    };

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [marketingOptOut, setMarketingOptOut] = useState(false);
    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [birthDateError, setBirthDateError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // Date range state - Set to today and next 4 days
    const today = new Date();
    const fourDaysLater = new Date(today);
    fourDaysLater.setDate(today.getDate() + 4);
    
    const defaultStartDate = selectedDates?.startDate || today;
    const defaultEndDate = selectedDates?.endDate || fourDaysLater;
    
    // Ensure default dates are valid
    const validStartDate = (defaultStartDate instanceof Date && !isNaN(defaultStartDate)) ? defaultStartDate : today;
    const validEndDate = (defaultEndDate instanceof Date && !isNaN(defaultEndDate)) ? defaultEndDate : fourDaysLater;
    
    const [range, setRange] = useState([
        {
            startDate: validStartDate,
            endDate: validEndDate,
            key: 'selection',
        },
    ]);

    const displayData = [
        {
            Login: "1. Log in or sign up",
            PaymentMethod: "1. Add a payment method",
            Review: "2. Review your request",
        }
    ];

    const countries = [
        { name: "Pakistan" },
        { name: "India" },
        { name: "United States" },
        { name: "United Kingdom" },
        { name: "Canada" },
        { name: "Australia" },
        { name: "New Zealand" },
        { name: "South Africa" },
    ];

    const customLocale = {
        ...enUS,
        localize: {
            ...enUS.localize,
            day: (n) => ["S", "M", "T", "W", "T", "F", "S"][n],
        },
    };
    // Update range when selectedDates changes
    useEffect(() => {
        // Priority 1: Use dates from navigation state
        if (selectedDatesFromState && selectedDatesFromState.startDate && selectedDatesFromState.endDate &&
            selectedDatesFromState.startDate instanceof Date && !isNaN(selectedDatesFromState.startDate) &&
            selectedDatesFromState.endDate instanceof Date && !isNaN(selectedDatesFromState.endDate)) {
            setRange([
                {
                    startDate: selectedDatesFromState.startDate,
                    endDate: selectedDatesFromState.endDate,
                    key: 'selection',
                },
            ]);
            // Also update the parent component's selectedDates
            if (setSelectedDates) {
                setSelectedDates(selectedDatesFromState);
            }
        }
        // Priority 2: Use dates from props
        else if (selectedDates && selectedDates.startDate && selectedDates.endDate &&
            selectedDates.startDate instanceof Date && !isNaN(selectedDates.startDate) &&
            selectedDates.endDate instanceof Date && !isNaN(selectedDates.endDate)) {
            setRange([
                {
                    startDate: selectedDates.startDate,
                    endDate: selectedDates.endDate,
                    key: 'selection',
                },
            ]);
        }
    }, [selectedDates, selectedDatesFromState, setSelectedDates]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                console.log('Starting data fetch...');
                console.log('Product data from state:', productDataFromState);
                console.log('URL params:', params);
                
                // Priority 1: Use product data passed from ProductsDetails
                if (productDataFromState) {
                    console.log('Using product data from state');
                    
                    // Map the product data to the expected format
                    const mappedData = {
                        id: productDataFromState.id,
                        title: productDataFromState.title || 'Apartment',
                        pricePerNight: productDataFromState.pricePerNight || 150,
                        city: productDataFromState.city || 'Islamabad',
                        rating: productDataFromState.rating || 4.5,
                        reviews: productDataFromState.reviews || 128,
                        // Use img1 as the main image, with proper URL construction for database images
                        image: productDataFromState.img1 
                            ? (productDataFromState.img1.startsWith('http') 
                                ? productDataFromState.img1 
                                : `https://dynamic-tranquility-production.up.railway.app/uploads/${productDataFromState.img1}`)
                            : productDataFromState.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
                        host_id: productDataFromState.host_id,
                        isDatabaseListing: Boolean(productDataFromState.host_id && productDataFromState.host_id > 1),
                        HostName: productDataFromState.HostName || 'Danyal',
                        HostImage: productDataFromState.HostImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
                    };
                    
                    console.log('Mapped data from state:', mappedData);
                    setData(mappedData);
                    setLoading(false);
                    return;
                }
                
                // Priority 2: Try to fetch from database using URL parameter
                if (params.id) {
                    try {
                        console.log('Fetching listing from database with ID:', params.id);
                        const response = await api.get(`/api/data/listing/${params.id}`);
                        
                        console.log('Database response:', response.data);
                        
                        if (response.data && response.data.id) {
                            const listing = response.data;
                            
                            // Get the first image from the images relation, or use fallback
                            const firstImage = listing.images && listing.images.length > 0 
                                ? (listing.images[0].image_url.startsWith('http') 
                                    ? listing.images[0].image_url 
                                    : `https://dynamic-tranquility-production.up.railway.app/uploads/${listing.images[0].image_url}`)
                                : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
                            
                            const databaseData = {
                                id: listing.id,
                                title: listing.title || 'Apartment',
                                pricePerNight: listing.price_per_night || 150,
                                city: listing.city || 'Islamabad',
                                rating: listing.rating || 4.5,
                                reviews: listing.reviews_count || 128,
                                image: firstImage,
                                images: listing.images || [],
                                host_id: listing.host_id,
                                isDatabaseListing: true,
                                HostName: listing.host_name || 'Danyal',
                                HostImage: listing.host_image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
                            };
                            
                            console.log('Loaded database listing:', databaseData);
                            setData(databaseData);
                            setLoading(false);
                            return; // Successfully loaded from database
                        }
                    } catch (dbError) {
                        console.error('Database fetch error:', dbError);
                        console.error('Error response:', dbError.response?.data);
                        console.error('Error status:', dbError.response?.status);
                    }
                }
                
                // Priority 3: Try to fetch all listings from database
                try {
                    console.log('Fetching all listings from database...');
                    const response = await api.get('/api/data/listing');
                    
                    console.log('All listings response:', response.data);
                    
                    // Handle both array and grouped object responses from backend
                    let listings = [];
                    if (Array.isArray(response.data)) {
                        listings = response.data;
                    } else if (typeof response.data === 'object' && response.data !== null) {
                        // If response is grouped by city, get the first city's listings
                        const firstCity = Object.keys(response.data)[0];
                        if (firstCity && Array.isArray(response.data[firstCity])) {
                            listings = response.data[firstCity];
                        }
                    }
                    
                    if (listings.length > 0) {
                        const firstListing = listings[0];
                        
                        // Get the first image from the images relation, or use fallback
                        const firstImage = firstListing.images && firstListing.images.length > 0 
                            ? (firstListing.images[0].image_url.startsWith('http') 
                                ? firstListing.images[0].image_url 
                                : `https://dynamic-tranquility-production.up.railway.app/uploads/${firstListing.images[0].image_url}`)
                            : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
                        
                        const databaseData = {
                            id: firstListing.id,
                            title: firstListing.title || 'Apartment',
                            pricePerNight: firstListing.price_per_night || 150,
                            city: firstListing.city || 'Islamabad',
                            rating: firstListing.rating || 4.5,
                            reviews: firstListing.reviews_count || 128,
                            image: firstImage,
                            images: firstListing.images || [],
                            host_id: firstListing.host_id,
                            isDatabaseListing: true,
                            HostName: firstListing.host_name || 'Danyal',
                            HostImage: firstListing.host_image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
                        };
                        
                        console.log('Loaded database listing from all listings:', databaseData);
                        setData(databaseData);
                        setLoading(false);
                        return; // Successfully loaded from database
                    }
                } catch (dbError) {
                    console.error('All listings fetch error:', dbError);
                    console.error('Error response:', dbError.response?.data);
                    console.error('Error status:', dbError.response?.status);
                }
                
                // Priority 4: Fallback to static data from data.js
                console.log('Falling back to static data...');
                const allStaticListings = [...Islamabad, ...Rawalpindi];
                if (allStaticListings.length > 0) {
                    const staticListing = allStaticListings[0];
                    
                    setData({
                        id: staticListing.id,
                        title: staticListing.title || 'Apartment',
                        pricePerNight: staticListing.pricePerNight || 150,
                        city: staticListing.city || 'Islamabad',
                        rating: staticListing.rating || 4.5,
                        reviews: staticListing.reviews || 128,
                        image: staticListing.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
                        host_id: staticListing.host_id || null,
                        isDatabaseListing: false,
                        HostName: staticListing.HostName || 'Danyal',
                        HostImage: staticListing.HostImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
                    });
                } else {
                    // Ultimate fallback
                    setData({
                        id: 1,
                        title: "Apartment",
                        pricePerNight: 150,
                        city: "Islamabad",
                        rating: 4.5,
                        reviews: 128,
                        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
                        host_id: null,
                        isDatabaseListing: false,
                        HostName: 'Danyal',
                        HostImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
                    });
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load listing data. Using fallback data.');
                // Set fallback data on error
                setData({
                    id: 1,
                    title: "Apartment",
                    pricePerNight: 150,
                    city: "Islamabad",
                    rating: 4.5,
                    reviews: 128,
                    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
                    host_id: 1,
                    HostName: 'Danyal',
                    HostImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [productDataFromState, params.id]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(false), 3500);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Functions
    const sendBookingNotification = async (listingData, bookingData) => {
        try {
            // Get the correct image from database or fallback
            const notificationImage = listingData.images && listingData.images.length > 0 
                ? (listingData.images[0].image_url ? 
                    (listingData.images[0].image_url.startsWith('http') 
                        ? listingData.images[0].image_url 
                        : `https://dynamic-tranquility-production.up.railway.app/uploads/${listingData.images[0].image_url}`)
                    : listingData.image)
                : listingData.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';

            // Send push notification to host
            const notificationData = {
                title: "New Booking Confirmed!",
                body: `A new booking has been made for your listing "${listingData.title}".`,
                image: notificationImage,
                icon: "/icons/booking-icon.png",
                badge: "/icons/badge-icon.png",
                tag: `booking-${bookingData.listing_id}`,
                requireInteraction: true,
                data: {
                    type: 'booking_confirmation',
                    listing_id: listingData.id,
                    listing_title: listingData.title,
                    listing_image: notificationImage,
                    host_id: listingData.host_id,
                    booking_id: bookingData.listing_id,
                    check_in: bookingData.check_in_date,
                    check_out: bookingData.check_out_date,
                    guests: bookingData.guests,
                    total_price: bookingData.total_price
                }
            };

            // Send notification via API
            try {
                await api.post('/api/data/notifications/send-booking', {
                    host_id: listingData.host_id,
                    notification: notificationData
                }, { withCredentials: true });
                console.log('Booking notification sent successfully');
            } catch (apiError) {
                console.warn('Failed to send notification via API, but booking was successful:', apiError);
                // Don't throw error here as booking was successful
            }
        } catch (error) {
            console.error('Error sending booking notification:', error);
            throw error;
        }
    };

    const handleBookingConfirmation = async () => {
        if (!selectedDatesFromState || !guestDataFromState || !data || !isAuthenticated) {
            alert('Please complete all required fields and ensure you are logged in.');
            return;
        }

        // Validate that we have a real database listing, not static fallback data
        if (!data.isDatabaseListing || !data.host_id) {
            alert('Cannot book this listing. Please select a valid listing from the database.');
            return;
        }

        // Additional validation to prevent sending default/static host_id
        if (data.host_id === 1 || data.host_id <= 0) {
            console.error('Invalid host data detected:', {
                listing_id: data.id,
                host_id: data.host_id,
                isDatabaseListing: data.isDatabaseListing,
                title: data.title
            });
            alert('Invalid host data detected. Please refresh the page and select a valid listing.');
            return;
        }

        // Validate that the host ID is a reasonable database ID (not a fallback)
        if (!Number.isInteger(data.host_id) || data.host_id < 2) {
            console.error('Invalid host ID format:', data.host_id);
            alert('Invalid host ID. Please select a valid listing from the database.');
            return;
        }

        // Get listing ID from URL parameters
        const urlListingId = parseInt(params.id);
        
        console.log('URL parameters:', params);
        console.log('Extracted listing ID from URL:', urlListingId);
        
        // Validate URL listing ID
        if (!urlListingId || urlListingId <= 1) {
            alert('Invalid listing ID from URL. Please navigate from a valid listing page.');
            return;
        }

        setIsBooking(true);
        try {
            // Normalize dates to avoid past/UTC off-by-one issues
            const toLocalISODate = (dateObj) => {
                const yr = dateObj.getFullYear();
                const mo = String(dateObj.getMonth() + 1).padStart(2, '0');
                const da = String(dateObj.getDate()).padStart(2, '0');
                return `${yr}-${mo}-${da}`;
            };

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let checkIn = new Date(selectedDatesFromState.startDate);
            let checkOut = new Date(selectedDatesFromState.endDate);

            if (checkIn < today) {
                checkIn = new Date(today);
                checkIn.setDate(checkIn.getDate() + 1);
            }
            if (checkOut <= checkIn) {
                checkOut = new Date(checkIn);
                checkOut.setDate(checkOut.getDate() + 1);
            }

            const msPerDay = 24 * 60 * 60 * 1000;
            const nights = Math.max(1, Math.round((checkOut - checkIn) / msPerDay));
            const nightly = (data.pricePerNight || data.price || 150);
            const subtotal = nights * nightly;
            const fees = Math.round(subtotal * 0.1);

            // Prepare booking data with URL listing ID and normalized values
            const bookingData = {
                listing_id: urlListingId, // Use URL parameter instead of data.id
                check_in_date: toLocalISODate(checkIn),
                check_out_date: toLocalISODate(checkOut),
                guests: guestDataFromState.adults + guestDataFromState.children,
                total_price: subtotal + fees
            };

            console.log('Booking with URL listing ID:', {
                url_listing_id: urlListingId,
                data_listing_id: data.id,
                host_id: data.host_id,
                title: data.title
            });

            // Final validation before sending to backend
            if (bookingData.listing_id <= 1 || !bookingData.listing_id || !data.host_id) {
                throw new Error('Invalid listing data: Cannot send default or invalid IDs to backend');
            }

            // Send booking confirmation to backend
            const response = await api.post(
                '/api/data/bookings/confirm',
                bookingData,
                { withCredentials: true }
            );

            if (response.data.success) {
                // Send booking notification to host
                try {
                    await sendBookingNotification(data, bookingData);
                } catch (notificationError) {
                    console.error('Failed to send booking notification:', notificationError);
                }
                
                // Show success message
                alert('Booking confirmed! You will be redirected to messages to chat with your host.');
                
                // Debug: Log the data being passed
                console.log('Data object for booking notification:', data);
                console.log('Booking data:', bookingData);
                
                // Navigate to messages page with listing data
                const bookingNotificationData = {
                    type: 'booking_confirmed',
                    listing: {
                        id: data.id,
                        title: data.title || 'Unknown Listing',
                        image: data.images && data.images.length > 0 
                            ? (data.images[0].image_url ? 
                                (data.images[0].image_url.startsWith('http') 
                                    ? data.images[0].image_url 
                                    : `https://dynamic-tranquility-production.up.railway.app/uploads/${data.images[0].image_url}`)
                                : data.image)
                            : data.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
                        host_id: data.host_id,
                        isDatabaseListing: data.isDatabaseListing
                    },
                    booking: bookingData
                };
                
                console.log('Booking notification data:', bookingNotificationData);
                
                navigate('/messages', { 
                    state: { 
                        bookingNotification: bookingNotificationData
                    } 
                });
            } else {
                alert('Booking failed: ' + (response.data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Booking error:', error);
            alert('Booking failed: ' + (error.response?.data?.message || error.message || 'Unknown error'));
        } finally {
            setIsBooking(false);
        }
    };

    const fetchDataByCity = async (city) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Fetching data for city:', city);
            
            // Try to fetch from database first
            try {
                const response = await api.get(`/api/data/listing?city=${encodeURIComponent(city)}`);
                
                console.log('City listings response:', response.data);
                
                // Handle both array and grouped object responses from backend
                let listings = [];
                if (Array.isArray(response.data)) {
                    listings = response.data;
                } else if (typeof response.data === 'object' && response.data !== null) {
                    // If response is grouped by city, get the first city's listings
                    const firstCity = Object.keys(response.data)[0];
                    if (firstCity && Array.isArray(response.data[firstCity])) {
                        listings = response.data[firstCity];
                    }
                }
                
                if (listings.length > 0) {
                    const listing = listings[0];
                    
                    // Get the first image from the images relation, or use fallback
                    const firstImage = listing.images && listing.images.length > 0 
                        ? (listing.images[0].image_url.startsWith('http') 
                            ? listing.images[0].image_url 
                            : `https://dynamic-tranquility-production.up.railway.app/uploads/${listing.images[0].image_url}`)
                        : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
                    
                    const databaseData = {
                        id: listing.id,
                        title: listing.title || 'Apartment',
                        pricePerNight: listing.price_per_night || 150,
                        city: listing.city || city,
                        rating: listing.rating || 4.5,
                        reviews: listing.reviews_count || 128,
                        image: firstImage,
                        images: listing.images || [],
                        host_id: listing.host_id,
                        isDatabaseListing: true,
                        HostName: listing.host_name || 'Danyal',
                        HostImage: listing.host_image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
                    };
                    
                    console.log('Loaded database listing by city:', databaseData);
                    setData(databaseData);
                    setLoading(false);
                    return; // Successfully loaded from database
                }
            } catch (dbError) {
                console.error('Database fetch error for city:', dbError);
                console.error('Error response:', dbError.response?.data);
                console.error('Error status:', dbError.response?.status);
            }
            
            // Fallback to static data from data.js
            console.log('Falling back to static data for city:', city);
            const allStaticListings = [...Islamabad, ...Rawalpindi];
            const cityListings = allStaticListings.filter(listing => 
                listing.city && listing.city.toLowerCase() === city.toLowerCase()
            );
            
            if (cityListings.length > 0) {
                const staticListing = cityListings[0];
                
                setData({
                    id: staticListing.id,
                    title: staticListing.title || 'Apartment',
                    pricePerNight: staticListing.pricePerNight || 150,
                    city: staticListing.city || city,
                    rating: staticListing.rating || 4.5,
                    reviews: staticListing.reviews || 128,
                    image: staticListing.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
                    host_id: staticListing.host_id || 1,
                    isDatabaseListing: false,
                    HostName: staticListing.HostName || 'Danyal',
                    HostImage: staticListing.HostImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
                });
            } else {
                setError(`No listings found for ${city} in both database and static data`);
            }
        } catch (err) {
            console.error('Failed to fetch data by city:', err);
            setError(`Failed to load listings for ${city}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setShowError(true);
        if (!phoneNumber.trim()) {
            setErrorMessage("Enter your phone number");
            return;
        }
        if (phoneNumber.length < 11 || phoneNumber.length > 12) {
            setErrorMessage("Enter a valid phone number");
            return;
        }
        setErrorMessage("");
        setShowError(false);
        setIsLoginOpen(false);
        setSuccessMessage(true);
        setIsLoggedIn(true);
        setShowsignup(false);
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setShowError(true);
        if (!email.trim()) {
            setErrorMessage("Enter your email");
            return;
        }
        if (!email.includes("@") || !email.includes(".")) {
            setErrorMessage("Enter a valid email");
            return;
        }
        try {
            await api.post(`/api/users/checkemailexist`, { email });
                    setIsEmailExist(false);
            setIsSignupFlow(true);
            setShowError(false);
            setErrorMessage("");
            setFirstName("");
            setLastName("");
            setBirthDate("");
            setPassword("");
            return;
        } catch (err) {
            console.error('Email check failed:', err);
            const status = err?.response?.status;
            const serverMessage = err?.response?.data?.error || err?.response?.data?.message;
            if (serverMessage) {
                if (serverMessage.toLowerCase().includes('exists')) {
                    setIsEmailExist(true);
                    setErrorMessage("");
                    setShowError(false);
                    return;
                }
                setErrorMessage(serverMessage);
            } else if (!err?.response && err?.request) {
                setErrorMessage("Cannot reach server. Is the API running at https://dynamic-tranquility-production.up.railway.app?","check route /api/users/checkemailexist");
            } else if (status === 404) {
                setErrorMessage("Endpoint not found: /api/users/checkemailexist");
            } else if (status === 500) {
                setErrorMessage("Server error while verifying email. Please try again later.");
            } else {
                setErrorMessage("Unable to verify email right now. Please try again.");
            }
            return;
        }
    };

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setShowError(true);
        if (!password.trim()) {
            setErrorMessage("Enter your password");
            return;
        }
        try {
            await api.post(`/api/users/login`, { email, password });
        } catch (err) {
            const status = err?.response?.status;
            const serverMessage = err?.response?.data?.error || err?.response?.data?.message;
            if (serverMessage) {
                setErrorMessage(serverMessage);
            } else if (status === 401) {
                setErrorMessage("Invalid email or password");
            } else if (!err?.response && err?.request) {
                setErrorMessage("Cannot reach server. Is the API running at https://dynamic-tranquility-production.up.railway.app?");
            } else {
                setErrorMessage("Unable to log in right now. Please try again.");
            }
            return;
        }
        setErrorMessage("");
        setShowError(false);
        setIsLoginOpen(false);
        setSuccessMessage(true);
        setIsLoggedIn(true);
        setShowsignup(false);
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setFirstNameError("");
        setLastNameError("");
        setBirthDateError("");
        setPasswordError("");
        let hasError = false;
        if (!firstName.trim()) { setFirstNameError("Enter your first name"); hasError = true; }
        if (!lastName.trim()) { setLastNameError("Enter your last name"); hasError = true; }
        if (!birthDate) { setBirthDateError("Enter your birthdate"); }
        if (!password.trim()) { setPasswordError("Enter your password"); hasError = true; }
        if (password && password.length < 8) { setPasswordError("Password must be at least 8 characters"); hasError = true; }
        if (hasError) return;
        try {
            const res = await api.post(`/api/users/register`, {
                first_name: firstName,
                last_name: lastName,
                email,
                password
            });
            if (res?.status === 201) {
                setErrorMessage("");
                setShowError(false);
                setIsLoginOpen(false);
                setSuccessMessage(true);
                setIsLoggedIn(true);
                setShowsignup(false);
            }
        } catch (err) {
            const serverMessage = err?.response?.data?.error || err?.response?.data?.message;
            if (serverMessage?.toLowerCase().includes('email')) {
                setErrorMessage(serverMessage);
            } else if (serverMessage) {
                setPasswordError(serverMessage);
            } else {
                setPasswordError("Unable to sign up right now. Please try again.");
            }
        }
    };

    // Show loading state while fetching data
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading listing data...</p>
                </div>
            </div>
        );
    }

    // Show error state if data failed to load
    if (error && !data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Failed to Load Data</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className='space-y-3'>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 mr-3"
                        >
                            Retry
                        </button>
                        <button 
                            onClick={() => {
                                setError(null);
                                setLoading(true);
                                // Re-fetch data
                                const refetchData = async () => {
                                    try {
                                        // Try database first
                                        try {
                                            const response = await api.get('/api/data/listing');
                                            // Handle both array and grouped object responses from backend
                                            let listings = [];
                                            if (Array.isArray(response.data)) {
                                                listings = response.data;
                                            } else if (typeof response.data === 'object' && response.data !== null) {
                                                // If response is grouped by city, get the first city's listings
                                                const firstCity = Object.keys(response.data)[0];
                                                if (firstCity && Array.isArray(response.data[firstCity])) {
                                                    listings = response.data[firstCity];
                                                }
                                            }
                                            
                                            if (listings.length > 0) {
                                                const firstListing = listings[0];
                                                
                                                // Get the first image from the images relation, or use fallback
                                                const firstImage = firstListing.images && firstListing.images.length > 0 
                                                    ? (firstListing.images[0].image_url.startsWith('http') 
                                                        ? firstListing.images[0].image_url 
                                                        : `https://dynamic-tranquility-production.up.railway.app/uploads/${firstListing.images[0].image_url}`)
                                                    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
                                                
                                                
                                                setData({
                                                    id: firstListing.id,
                                                    title: firstListing.title || 'Apartment',
                                                    pricePerNight: firstListing.price_per_night || 150,
                                                    city: firstListing.city || 'Islamabad',
                                                    rating: firstListing.rating || 4.5,
                                                    reviews: firstListing.reviews_count || 128,
                                                    image: firstImage,
                                                    host_id: firstListing.host_id,
                                                    isDatabaseListing: true,
                                                    HostName: firstListing.host_name || 'Danyal',
                                                    HostImage: firstListing.host_image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
                                                });
                                                return;
                                            }
                                        } catch (dbError) {
                                        }
                                        
                                        // Fallback to static data
                                        const allStaticListings = [...Islamabad, ...Rawalpindi];
                                        if (allStaticListings.length > 0) {
                                            const staticListing = allStaticListings[0];
                                            
                                            setData({
                                                id: staticListing.id,
                                                title: staticListing.title || 'Apartment',
                                                pricePerNight: staticListing.pricePerNight || 150,
                                                city: staticListing.city || 'Islamabad',
                                                rating: staticListing.rating || 4.5,
                                                reviews: staticListing.reviews || 128,
                                                image: staticListing.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
                                                host_id: staticListing.host_id || 1,
                                                HostName: staticListing.HostName || 'Danyal',
                                                HostImage: staticListing.HostImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
                                            });
                                        }
                                    } catch (err) {
                                        setError('Still unable to load data. Please check your backend connection.');
                                    } finally {
                                        setLoading(false);
                                    }
                                };
                                refetchData();
                            }} 
                            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                        >
                            Refresh Data
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className='mt-10 mx-auto lg:ml-4 lg:sm:ml-8 lg:md:ml-16 lg:ml-32 xl:ml-52 px-4 lg:px-0'>
                <div className='flex items-center gap-3 sm:gap-6'>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="black"
                        className="w-10 h-10 cursor-pointer bg-gray-100 rounded-full p-2"
                        onClick={() => navigate(-1)}
                    >
                        <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    <h1 className='text-lg sm:text-xl lg:text-2xl xl:text-[2.1rem] font-semibold -mt-2'>Request to book</h1>
                </div>

                <div className='flex flex-col lg:flex-row gap-4 lg:gap-8 mt-6 sm:mt-8 lg:mt-10 items-center lg:items-start'>
                    <div className='flex flex-col gap-6 sm:gap-8 lg:gap-12 w-full lg:w-auto max-w-lg lg:max-w-none'>
                        {displayData.map((item, index) => (
                            <div key={index} className='gap-8 flex flex-col'>
                                {/* Show login step only if user is not authenticated */}
                                {!isAuthenticated && (
                                    <div className='w-full sm:w-[120%] lg:w-[150%] h-auto min-h-[80px] sm:h-[90px] bg-white rounded-xl p-4 sm:pl-6 shadow-[0_0_10px_2px_rgba(0,0,0,0.1)] items-center flex flex-col sm:flex-row justify-between gap-3 sm:gap-0'>
                                    <h1 className='text-[1.2rem] font-semibold'>{item.Login}</h1>
                                    {!isLoggedIn && (
                                        <button onClick={() => setIsLoginOpen(true)} className="w-full sm:w-[32%] sm:mr-4 mt-2 bg-gradient-to-r from-[#ff385c] via-[#ff385c] via-[#ff385c] via-[#d42d4a] via-[#ff385c] to-[#ff385c] text-white font-semibold py-3 px-4 rounded-3xl text-sm sm:text-base mb-2 hover:from-[#e62e4f] hover:via-[#e62e4f] hover:via-[#e62e4f] hover:via-[#c42a45] hover:via-[#e62e4f] hover:to-[#e62e4f] transition-all duration-200">
                                            Continue
                                        </button>
                                    )}
                                    {isLoggedIn && (
                                        <div className='w-full sm:w-[32%] sm:mr-4 mt-2 flex items-center justify-center'>
                                            <div className='h-10 w-10 rounded-full bg-green-100 flex items-center justify-center'>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" className='text-green-600'>
                                                    <path d="M9 16.17l-3.88-3.88-1.41 1.41L9 19 20.29 7.71l-1.41-1.41z" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                    {isLoginOpen && (
                                            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40' onClick={() => setIsLoginOpen(false)}>
                                                <form onSubmit={authMethod === 'phone' ? handleLoginSubmit : (isEmailExist ? handlePasswordLogin : (isSignupFlow ? handleSignupSubmit : handleEmailSubmit))}>
                                                    <div className={`bg-white rounded-3xl w-full max-w-[570px] h-auto relative shadow-xl mx-4 sm:mx-0 overflow-hidden`} onClick={(e) => e.stopPropagation()}>
                                                        <button type="button" className='absolute top-4 right-6 text-gray-600 text-xl hover:text-gray-800 transition-colors cursor-pointer' onClick={() => setIsLoginOpen(false)}>✕</button>
                                                        <h2 className={`text-lg font-semibold text-gray-900 text-center ${isSignupFlow ? 'mt-3 pt-4' : 'mt-6 pt-6'}`}>{isSignupFlow ? 'Finish signing up' : 'Log in or sign up to book'}</h2>
                                                        <div className={`border-b border-gray-300/80 w-full ${isSignupFlow ? 'mt-2' : 'mt-4'}`}></div>
                                                        <div className={`px-6 mt-5 pb-6 ${isSignupFlow ? 'max-h-[75vh] overflow-y-auto' : ''}`}>
                                                        {authMethod === 'phone' ? (
                                                            <div className="w-full border border-gray-500/80 rounded-xl overflow-hidden">
                                                                <label
                                                                    htmlFor="country"
                                                                    className="block text-sm text-gray-600 px-3 pt-[1px] mb-[2px] pb-0 translate-y-1"
                                                                >
                                                                    Country code
                                                                </label>

                                                                <div className="relative">
                                                                    <select
                                                                        id="country"
                                                                        value={dialCode}
                                                                        onChange={(e) => setDialCode(e.target.value)}
                                                                        className="w-full h-7 pl-3 pr-10 text-gray-900 bg-white focus:outline-none appearance-none tracking-tight "
                                                                    >
                                                                        <option value="+223">Mali (+223)</option>
                                                                        <option value="+92">Pakistan (+92)</option>
                                                                        <option value="+91">India (+91)</option>
                                                                        <option value="+86">China (+86)</option>
                                                                        <option value="+1">United States (+1)</option>
                                                                        <option value="+44">United Kingdom (+44)</option>
                                                                        <option value="+1">Canada (+1)</option>
                                                                        <option value="+61">Australia (+61)</option>
                                                                        <option value="+49">Germany (+49)</option>
                                                                        <option value="+33">France (+33)</option>
                                                                        <option value="+966">Saudi Arabia (+966)</option>
                                                                    </select>
                                                                    <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            viewBox="0 0 309.143 309.143"
                                                                            className="w-3 h-3 text-gray-600 transform -rotate-90 -mt-2 mr-2"
                                                                            fill="black"
                                                                        >
                                                                            <path d="M112.855,154.571L240.481,26.946c2.929-2.929,2.929-7.678,0-10.606L226.339,2.197 
                                                                                 C224.933,0.79,223.025,0,221.036,0c-1.989,0-3.897,0.79-5.303,2.197L68.661,149.268
                                                                                 c2.929,2.929,2.929-7.678,0,10.606 l147.071,147.071c1.406,1.407,3.314,2.197,5.303,2.197
                                                                                 c1.989,0,3.897-0.79,5.303-2.197l14.142-14.143c2.929-2.929,2.929-7.678,0-10.606L112.855,154.571z"/>
                                                                        </svg>

                                                                    </span>
                                                                </div>

                                                                <div className="relative" >
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 select-none">{dialCode}</span>
                                                                    <input
                                                                        type="tel"
                                                                        placeholder="Phone number"
                                                                        value={phoneNumber}
                                                                        onChange={(e) => { setPhoneNumber(e.target.value); setErrorMessage(""); setShowError(false); }}
                                                                        className="w-full h-12 pl-16 pr-3 border-t border-gray-500/80 focus:outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                                <>
                                                                    {!isEmailExist && !isSignupFlow && (
                                                            <div className="w-full border  rounded-xl overflow-hidden">
                                                                <input
                                                                    id="email"
                                                                    type="email"
                                                                    placeholder="Email"
                                                                    value={email}
                                                                    onChange={(e) => { setEmail(e.target.value); setErrorMessage(""); setShowError(false); }}
                                                                    className="w-full h-12 px-3 border rounded-xl border-gray-500/80 focus:outline-none"
                                                                />
                                                            </div>
                                                        )}
                                                                    {!isEmailExist && isSignupFlow && (
                                                                        <div className='w-full'>
                                                                            <div className='mb-3'>
                                                                                <label className='block text-sm text-gray-700 mb-1'>Legal name</label>
                                                                                <div className='w-full'>
                                                                                    <input type='text' placeholder='First name on ID' value={firstName} onChange={(e) => { setFirstName(e.target.value); setFirstNameError(""); }} className='w-full h-11 px-3 border border-gray-500/80 rounded-t-xl focus:outline-none' />
                                                                                    <input type='text' placeholder='Last name on ID' value={lastName} onChange={(e) => { setLastName(e.target.value); setLastNameError(""); }} className='w-full h-11 px-3 border border-t-0 border-gray-500/80 rounded-b-xl focus:outline-none' />
                                                                                </div>
                                                                                 {firstNameError || lastNameError ? (
                                                                                     <div className='text-red-600 text-sm mt-2 ml-1'>{firstNameError || lastNameError}</div>
                                                                                 ) : null}
                                                                                 <p className='text-xs text-gray-600 mt-1'>Make sure this matches the name on your government ID.</p>
                                                                            </div>
                                                                            <div className='mb-3'>
                                                                                <label className='block text-sm text-gray-700 mb-1'>Date of birth</label>
                                                                                <input type='date' value={birthDate} onChange={(e) => { setBirthDate(e.target.value); setBirthDateError(""); }} className='w-full h-11 px-3 border rounded-xl border-gray-500/80 focus:outline-none' />
                                                                                {birthDateError && <div className='text-red-600 text-sm mt-2 ml-1'>{birthDateError}</div>}
                                                                                <p className='text-xs text-gray-600 mt-1'>To sign up, you need to be at least 18.</p>
                                                                            </div>
                                                                            <div className='mb-3'>
                                                                                <label className='block text-sm text-gray-700 mb-1'>Contact info</label>
                                                                                <input type='email' value={email} disabled className='w-full h-11 px-3 border rounded-xl border-gray-300 bg-gray-100 text-gray-700' />
                                                                                <p className='text-xs text-gray-600 mt-1'>We'll email you trip confirmations and receipts.</p>
                                                                            </div>
                                                                            <div className='mb-1'>
                                                                                <label className='block text-sm text-gray-700 mb-1'>Password</label>
                                                                                <div className="w-full border rounded-xl overflow-hidden relative">
                                                                                    <input
                                                                                        id="signupPassword"
                                                                                        type={isPasswordVisible ? "text" : "password"}
                                                                                        placeholder="Password"
                                                                                        value={password}
                                                                                        onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                                                                                        className="w-full h-12 pl-3 pr-16 border rounded-xl border-gray-500/80 focus:outline-none"
                                                                                    />
                                                                                    <button type='button' className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-black text-sm font-medium' onClick={() => setIsPasswordVisible(!isPasswordVisible)}>{isPasswordVisible ? 'Hide' : 'Show'}</button>
                                                                                </div>
                                                                                {passwordError && <div className='text-red-600 text-sm mt-2 ml-1'>{passwordError}</div>}
                                                                                <p className='text-xs text-gray-600 mt-2'>By selecting Agree and continue, you agree to the Terms and Privacy Policy.</p>
                                                                            </div>
                                                                            <button type='submit' className='w-[99%] mt-4 bg-gradient-to-r from-[#ff385c] via-[#ff385c] via-[#d42d4a] to-[#ff385c] text-white font-semibold py-3 px-4 rounded-lg text-base hover:from-[#e62e4f] hover:to-[#e62e4f] transition-all duration-200'>Agree and continue</button>
                                                                            <div className='mt-4 flex items-center gap-2'>
                                                                                <input type='checkbox' id='marketingOptOut' checked={marketingOptOut} onChange={(e) => setMarketingOptOut(e.target.checked)} className='h-4 w-4' />
                                                                                <label htmlFor='marketingOptOut' className='text-sm text-gray-800'>I don't want to receive marketing messages.</label>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {isEmailExist && (
                                                                        <div className='w-full'>
                                                                            <div className="w-full border rounded-xl overflow-hidden relative">
                                                                                <input
                                                                                    id="password"
                                                                                    type={isPasswordVisible ? "text" : "password"}
                                                                                    placeholder="Password"
                                                                                    value={password}
                                                                                    onChange={(e) => { setPassword(e.target.value); setErrorMessage(""); setShowError(false); }}
                                                                                    className="w-full h-12 pl-3 pr-16 border rounded-xl border-gray-500/80 focus:outline-none"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                                                                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-black text-sm font-medium'
                                                                                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                                                                >
                                                                                    {isPasswordVisible ? 'Hide' : 'Show'}
                                                                                </button>
                                                                            </div>
                                                        {showError && errorMessage && <div className='text-red-600 text-sm mt-2 ml-2 flex items-center gap-1'>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 16 16"
                                                                aria-label="Error"
                                                                role="img"
                                                                focusable="false"
                                                                className="w-3 h-3 text-red-600"
                                                                fill="currentColor"
                                                            >
                                                                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm0 10.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm.8-6.6H7.2v5.2h1.6z" />
                                                            </svg>
                                                            {errorMessage}</div>}
                                                                            <button type='submit' className='w-[99%] mt-4 bg-gradient-to-r from-[#ff385c] via-[#ff385c] via-[#d42d4a] to-[#ff385c] text-white font-semibold py-3 px-4 rounded-lg text-base hover:from-[#e62e4f] hover:to-[#e62e4f] transition-all duration-200'>Log in</button>
                                                                            <div className='mt-3 px-1'>
                                                                                <button type='button' className='underline text-black font-medium'>Forgot password?</button>
                                                                            </div>
                                                                            <div className='mt-4 px-1'>
                                                                                <button type='button' className='underline text-black font-medium' onClick={() => { setAuthMethod('phone'); setIsEmailExist(null); setIsSignupFlow(false); setPassword(""); setIsPasswordVisible(false); setErrorMessage(""); setShowError(false); }}>More login options</button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}

                                                            
                                                        {authMethod === 'phone' ? (
                                                            <p className='text-xs text-gray-600 mt-2'>We'll call or text you to confirm your number. Standard message and data rates apply. <a href='#' className='underline'>Privacy Policy</a></p>
                                                        ) : (
                                                            ""
                                                        )}
                                                            {!isEmailExist && !isSignupFlow && (
                                                                <button type='submit' className='w-[99%] mt-3 mb-4 bg-gradient-to-r from-[#ff385c] via-[#ff385c] via-[#ff385c] via-[#d42d4a] via-[#ff385c] to-[#ff385c] text-white font-semibold py-3 px-4 rounded-lg text-base mb-2 hover:from-[#e62e4f] hover:via-[#e62e4f] hover:via-[#e62e4f] hover:via-[#c42a45] hover:via-[#e62e4f] hover:to-[#e62e4f] transition-all duration-200' >Continue</button>
                                                            )}
                                                            {!isEmailExist && !isSignupFlow && (
                                                        <div className='flex items-center gap-3 my-4'>
                                                            <div className='flex-1 -mt-6 border-t border-gray-300'></div>
                                                            <span className='text-sm -mt-6 text-gray-600'>or</span>
                                                            <div className='flex-1 -mt-6 border-t border-gray-300'></div>
                                                        </div>
                                                            )}
                                                            {!isEmailExist && !isSignupFlow && (
                                                        <div className='grid grid-cols-3 gap-4 -mt-2'>
                                                                <button type="button" className='h-12 border border-black rounded-xl flex items-center justify-center hover:bg-gray-50'>
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#1877F2"><path d="M22 12.06C22 6.478 17.523 2 11.94 2 6.357 2 1.88 6.477 1.88 12.06c0 4.994 3.657 9.136 8.437 9.94v-7.03H7.898v-2.91h2.42V9.845c0-2.39 1.423-3.712 3.6-3.712 1.043 0 2.134.187 2.134.187v2.348h-1.202c-1.184 0-1.552.735-1.552 1.49v1.793h2.64l-.422 2.91h-2.218v7.03C18.343 21.196 22 17.053 22 12.06z" /></svg>
                                                            </button>
                                                                <button type="button" className='h-12 border border-black rounded-xl flex items-center justify-center hover:bg-gray-50'>
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="22" height="22">
                                                                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.046 6.053 28.761 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                                                                    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 14 24 14c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.046 6.053 28.761 4 24 4c-7.682 0-14.314 4.43-17.694 10.691z"/>
                                                                    <path fill="#4CAF50" d="M24 44c4.695 0 8.964-1.802 12.207-4.742l-5.639-4.727C28.813 35.59 26.52 36 24 36c-5.202 0-9.619-3.317-11.281-7.953l-6.541 5.036C9.496 39.556 16.227 44 24 44z"/>
                                                                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.793 2.238-2.231 4.166-4.18 5.571 0 0 0 0 0 0l6.033 4.689C35.914 38.198 44 32 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                                                                </svg>
                                                            </button>
                                                                <button type="button" className='h-12 border border-black rounded-xl flex items-center justify-center hover:bg-gray-50'>
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className='text-black'><path d="M16.365 1.43c.146 1.714-.496 3.178-1.29 4.18-.783.988-2.148 1.94-3.493 1.83-.166-1.64.51-3.24 1.29-4.227C13.667 2.117 15.19 1.21 16.365 1.43zM20.5 17.21c-.72 1.586-1.466 3.172-2.644 4.77-.935 1.297-2.025 2.914-3.506 2.94-1.53.03-1.93-.95-3.593-.95-1.665 0-2.106.91-3.612 .98-1.526 .07-2.688-1.4-3.627-2.69-1.979-2.7-3.486-7.62-1.457-10.94 1.02-1.67 2.854-2.73 4.854-2.76 1.515-.03 2.95 1.03 3.593 1.03.643 0 2.46-1.27 4.156-1.08.707 .03 2.69 .29 3.963 2.18-.1 .06-2.36 1.38-2.33 4.12 .03 3.28 2.88 4.38 2.91 4.39z"/></svg>
                                                            </button>
                                                        </div>
                                                            )}
                                                            {!isEmailExist && !isSignupFlow && (
                                                            <button type="button" className='w-full mt-4 h-12 mb-2  border border-black rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50' onClick={() => { setAuthMethod(authMethod === 'phone' ? 'email' : 'phone'); setErrorMessage(''); setShowError(false); }}>
                                                            {authMethod === 'phone' ? (
                                                                <>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className='text-gray-700'><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z" /></svg>
                                                                    <span className='text-gray-900 font-medium'>Continue with email</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className='text-gray-700'><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V21a1 1 0 01-1 1C10.4 22 2 13.6 2 3a1 1 0 011-1h3.49a1 1 0 011 1c0 1.24.2 2.45.57 3.57a1 1 0 01-.24 1.02l-2.2 2.2z" /></svg>
                                                                    <span className='text-gray-900 font-medium'>Continue with phone</span>
                                                                </>
                                                            )}
                                                        </button>
                                                            )}
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                                )}
                                    {(isAuthenticated || isLoggedIn) && (
                                    <div className={`w-full sm:w-[400px] lg:w-[420px] h-auto rounded-xl p-4 sm:pl-6 shadow-[0_0_10px_2px_rgba(0,0,0,0.1)] items-center ${
                                        paymentStep === 1 ? 'bg-white border-2 border-blue-500' : 'bg-gray-50 border border-gray-200'
                                    }`}>
                                        <div className='flex justify-between items-center mt-2'>
                                            <div className='flex items-center gap-3'>
                                                <h1 
                                                    className={`text-[1.2rem] font-semibold ${paymentStep > 1 ? 'cursor-pointer hover:text-blue-600' : ''}`}
                                                    onClick={() => navigateToStep(1)}
                                                >
                                                    1. Add a payment method
                                                </h1>
                                                {paymentStep > 1 && (
                                                    <div className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center'>
                                                        <svg className='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
                                                            <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className='flex mt-2 justify-between'>
                                            <div className='flex items-center gap-4'>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
                                                    <path d="M29 5H3a2 2 0 0 0-2 2v18c0 1.1.9 2 2 2h26a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-7.5 19a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM29 11.5H3v-3h26v3z" fill="currentColor" />
                                                </svg>
                                                <div className='flex flex-col'>
                                                    <h1 className='text-[1rem] font-medium text-gray-500'>Credit or debit card</h1>
                                                    <div className='flex gap-2 -mt-1'>
                                                        <img src="https://a0.muscache.com/airbnb/static/packages/assets/frontend/legacy-shared/svgs/payments/logo_visa.0adea522bb26bd90821a8fade4911913.svg" alt="visa" className='w-6 h-6' />
                                                        <img src="https://a0.muscache.com/airbnb/static/packages/assets/frontend/legacy-shared/svgs/payments/logo_mastercard.f18379cf1f27d22abd9e9cf44085d149.svg" alt="mastercard" className='w-6 h-6' />
                                                        <img src="https://a0.muscache.com/airbnb/static/packages/assets/frontend/legacy-shared/svgs/payments/logo_amex.84088b520ca1b3384cb71398095627da.svg" alt="amex" className='w-6 h-6' />
                                                        <img src="https://a0.muscache.com/airbnb/static/packages/assets/frontend/legacy-shared/svgs/payments/logo_discover.7f05c82f07d62a0f8a69d54dbcd7c8be.svg" alt="discover" className='w-6 h-6' />
                                                        <img src="https://a0.muscache.com/airbnb/static/packages/assets/frontend/legacy-shared/svgs/payments/logo_jcb.2cf0077e2220c67895e5f3058813e601.svg" alt="maestro" className='w-6 h-6' />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='flex items-center justify-center mr-4 -ml-6'>
                                                <input name="paymentMethod" type="radio" value="card" checked={selectedPaymentMethod === 'card'} onChange={() => {
                                                    setSelectedPaymentMethod('card');
                                                    setPaymentStep(1);
                                                    setMessageToHost('');
                                                    setIsMessageValid(false);
                                                }} aria-label="Select credit or debit card" className={`appearance-none h-6 w-6 mr-2 rounded-full cursor-pointer transition-all ${selectedPaymentMethod === 'card' ? 'border-[7px] border-black bg-white' : 'border-2 border-gray-300 bg-white'}`}
                                                />
                                            </div>
                                        </div>
                                        {selectedPaymentMethod === 'card' && (
                                            <>
                                                <input 
                                                    type="text" 
                                                    className='border border-gray-500 mt-4 h-14 sm:h-16 w-full rounded-tl-xl rounded-tr-xl p-2 text-sm sm:text-base' 
                                                    placeholder='Card number' 
                                                    value={cardDetails.cardNumber}
                                                    onChange={(e) => updateCardDetails('cardNumber', e.target.value)}
                                                />
                                                <div className='flex'>
                                                    <input 
                                                        type="text" 
                                                        className='border-b border-r border-l border-gray-500 h-12 sm:h-14 w-[50%] rounded-bl-xl p-2 text-sm sm:text-base' 
                                                        placeholder='MM/YY' 
                                                        value={cardDetails.expiryDate}
                                                        onChange={(e) => updateCardDetails('expiryDate', e.target.value)}
                                                    />
                                                    <input 
                                                        type="text" 
                                                        className='border-b border-r border-gray-500 h-12 sm:h-14 w-[50%] rounded-br-xl p-2 text-sm sm:text-base' 
                                                        placeholder='CVV' 
                                                        value={cardDetails.cvv}
                                                        onChange={(e) => updateCardDetails('cvv', e.target.value)}
                                                    />
                                                </div>
                                                <h1 className='text-lg text-gray-800 font-semibold mt-2'>Billing address</h1>
                                                <input 
                                                    type="text" 
                                                    className='border border-gray-500 mt-4 h-14 sm:h-16 w-full rounded-tl-xl rounded-tr-xl p-2 text-sm sm:text-base' 
                                                    placeholder='Street address' 
                                                    value={cardDetails.streetAddress}
                                                    onChange={(e) => updateCardDetails('streetAddress', e.target.value)}
                                                />
                                                <input 
                                                    type="text" 
                                                    className='border border-gray-500 border-t-0 h-14 sm:h-16 w-full p-2 text-sm sm:text-base' 
                                                    placeholder='App or suite number' 
                                                    value={cardDetails.appSuite}
                                                    onChange={(e) => updateCardDetails('appSuite', e.target.value)}
                                                />
                                                <input 
                                                    type="text" 
                                                    className='border border-gray-500 border-t-0 h-14 sm:h-16 w-full p-2 text-sm sm:text-base' 
                                                    placeholder='City' 
                                                    value={cardDetails.city}
                                                    onChange={(e) => updateCardDetails('city', e.target.value)}
                                                />
                                                <div className='flex'>
                                                    <input 
                                                        type="text" 
                                                        className='border-b border-r border-l border-gray-500 h-12 sm:h-14 w-[50%] rounded-bl-xl p-2 text-sm sm:text-base' 
                                                        placeholder='State' 
                                                        value={cardDetails.state}
                                                        onChange={(e) => updateCardDetails('state', e.target.value)}
                                                    />
                                                    <input 
                                                        type="text" 
                                                        className='border-b border-r border-gray-500 h-12 sm:h-14 w-[50%] rounded-br-xl p-2 text-sm sm:text-base' 
                                                        placeholder='Zip code' 
                                                        value={cardDetails.zipCode}
                                                        onChange={(e) => updateCardDetails('zipCode', e.target.value)}
                                                    />
                                                </div>
                                                <div className='flex flex-col mt-4 border border-gray-500 rounded-lg h-12 sm:h-14 w-full cursor-pointer' onClick={() => setCountry(true)}>
                                                    <label htmlFor="save-card" className='text-sm text-gray-600 pt-1 pl-2'>Country/region</label>
                                                    <span>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 309.143 309.143"
                                                            className="w-4 h-4 text-gray-600 transform -rotate-90 -mt-2 ml-auto mr-2"
                                                            fill="black"
                                                        >
                                                            <path d="M112.855,154.571L240.481,26.946c2.929-2.929,2.929-7.678,0-10.606L226.339,2.197 
                                                                                     C224.933,0.79,223.025,0,221.036,0c-1.989,0-3.897,0.79-5.303,2.197L68.661,149.268
                                                                                     c2.929,2.929,2.929-7.678,0,10.606 l147.071,147.071c1.406,1.407,3.314,2.197,5.303,2.197
                                                                                     c1.989,0,3.897-0.79,5.303-2.197l14.142-14.143c2.929-2.929,2.929-7.678,0-10.606L112.855,154.571z"/>
                                                        </svg>
                                                    </span>
                                                    <span className='text-gray-900 font-medium pl-2 -mt-2'>{selectedCountry}</span>
                                                </div>
                                            </>
                                        )}
                                        <div className='border-b border-gray-400 w-full mt-6 mb-4'></div>
                                        <div className='flex items-center justify-between gap-2'>
                                            <div className='flex items-center gap-2'>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 32 32"
                                                    width="28"
                                                    height="28"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        fill="#0079c1"
                                                        d="m13.26 17.76.02-.1c.1-.34.39-.59.73-.64h2.17c3.36-.07 5.98-1.47 6.85-5.34l.05-.28.07-.36.04-.28.02-.27.02-.26v-.54l-.03-.26-.1-.49c.05.15.07.3.1.45l.02.27.02.25v.32l-.03.26-.06.55c.33.17.63.4.88.68.78.9.93 2.17.64 3.7-.7 3.55-3.02 4.84-6.02 4.9h-.71a.77.77 0 0 0-.74.56l-.03.1-.04.2-.6 3.84-.03.16a.77.77 0 0 1-.66.65h-3.31a.46.46 0 0 1-.46-.45v-.08z"
                                                    />
                                                    <path
                                                        fill="#00457c"
                                                        d="M17.6 6c2.13 0 3.8.45 4.71 1.5a3.85 3.85 0 0 1 .63.97c.28.65.36 1.38.25 2.3l-.04.27-.07.36c-.79 4.08-3.46 5.55-6.9 5.61h-2.05c-.4 0-.74.27-.85.65l-.02.1-.93 5.87h-3.8a.53.53 0 0 1-.53-.52v-.09l2.57-16.28c.07-.39.38-.69.77-.73l.1-.01z"
                                                    />
                                                </svg>
                                                <span className='text-gray-900 font-medium'>PayPal</span>
                                            </div>
                                            <input name='paymentMethod' type='radio' value='paypal' checked={selectedPaymentMethod === 'paypal'} onChange={() => {
                                                setSelectedPaymentMethod('paypal');
                                                setPaymentStep(1);
                                                setMessageToHost('');
                                                setIsMessageValid(false);
                                            }} aria-label='Select PayPal' className={`appearance-none h-6 w-6 rounded-full cursor-pointer transition-all mr-6  ${selectedPaymentMethod === 'paypal' ? 'border-[7px] border-black bg-white' : 'border-2 border-gray-300 bg-white'}`} />
                                        </div>
                                        <div className='border-b border-gray-400 w-full mt-6 mb-4'></div>
                                        <div className='flex items-center justify-between gap-2 mb-4'>
                                            <div className='flex items-center gap-2'>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 32 32"
                                                    width="32"
                                                    height="32"
                                                    aria-hidden="true"

                                                >
                                                    <path
                                                        fill="#3c4043"
                                                        d="M15.24 15.51v3.31h-1.03v-8.17h2.74c.66-.01 1.3.24 1.77.71.94.9 1 2.38.12 3.34l-.12.11c-.48.47-1.07.7-1.77.7zm0-3.85v2.85h1.74c.38.01.75-.14 1.02-.43.54-.57.52-1.47-.03-2.02a1.4 1.4 0 0 0-1-.4zm6.61 1.39c.76 0 1.37.2 1.81.62.44.4.66.98.66 1.7v3.45h-.99v-.77h-.04c-.43.63-1 .95-1.71.95a2.2 2.2 0 0 1-1.52-.54c-.4-.34-.62-.85-.61-1.37 0-.58.22-1.04.65-1.38.43-.35 1-.52 1.72-.52.62 0 1.12.12 1.52.34v-.24c0-.36-.15-.7-.42-.93a1.57 1.57 0 0 0-2.36.36l-.92-.58a2.44 2.44 0 0 1 2-1.08zm-1.34 4.06c0 .27.13.52.35.68.23.18.5.28.8.27.43 0 .85-.17 1.16-.48.34-.33.51-.71.51-1.16-.32-.26-.77-.39-1.34-.38-.42 0-.78.1-1.06.3a.94.94 0 0 0-.4.64zM30 13.23l-3.46 8.05h-1.06l1.28-2.82-2.26-5.23h1.12l1.64 4.01h.02l1.6-4z"
                                                    />
                                                    <path
                                                        fill="#4285f4"
                                                        d="M11.06 14.8c0-.32-.02-.64-.07-.96H6.63v1.8h2.5c-.1.59-.44 1.1-.93 1.43v1.18h1.49a4.6 4.6 0 0 0 1.37-3.46z"
                                                    />
                                                    <path
                                                        fill="#34a853"
                                                        d="M6.63 19.38c1.24 0 2.3-.42 3.06-1.13l-1.5-1.18a2.77 2.77 0 0 1-4.17-1.49H2.51v1.22a4.61 4.61 0 0 0 4.13 2.58z"
                                                    />
                                                    <path
                                                        fill="#fbbc04"
                                                        d="M4.03 15.59c-.2-.58-.2-1.21 0-1.8v-1.2H2.5a4.71 4.71 0 0 0 0 4.2z"
                                                    />
                                                    <path
                                                        fill="#ea4335"
                                                        d="M6.63 11.86c.66-.02 1.3.24 1.77.7l1.32-1.34A4.43 4.43 0 0 0 6.62 10c-1.74 0-3.34 1-4.12 2.59l1.53 1.2a2.77 2.77 0 0 1 2.6-1.93z"
                                                    />
                                                </svg>
                                                <span className='text-gray-900 font-medium'>Google</span>
                                            </div>
                                            <input name='paymentMethod' type='radio' value='google' checked={selectedPaymentMethod === 'google'} onChange={() => {
                                                setSelectedPaymentMethod('google');
                                                setPaymentStep(2);
                                                setMessageToHost('');
                                                setIsMessageValid(false);
                                            }} aria-label='Select Google' className={`appearance-none h-6 w-6 rounded-full cursor-pointer transition-all mr-6  ${selectedPaymentMethod === 'google' ? 'border-[7px] border-black bg-white' : 'border-2 border-gray-300 bg-white'}`} />
                                        </div>
                                        <div className='border-b border-gray-400 w-full mt-6 mb-4'></div>
                                        <button 
                                            className={`h-10 text-white w-20 sm:w-24 rounded-xl mt-2 mb-6 text-sm sm:text-base font-semibold ml-auto ${
                                                selectedPaymentMethod === 'card' && !isCardFormValid 
                                                    ? 'bg-gray-400 cursor-not-allowed' 
                                                    : 'bg-black hover:bg-gray-900 cursor-pointer'
                                            }`}
                                            onClick={selectedPaymentMethod === 'card' ? handleCardNext : undefined}
                                            disabled={selectedPaymentMethod === 'card' && !isCardFormValid}
                                        >
                                            {selectedPaymentMethod === 'card' ? 'Next' : 
                                             selectedPaymentMethod === 'paypal' ? 'PayPal' : 
                                             selectedPaymentMethod === 'google' ? 'Google Pay' : 'Next'}
                                        </button>
                                </div>
                                )}
                                <div className='-mt-8'>
                                        {(selectedPaymentMethod === 'google' || (selectedPaymentMethod === 'card' && paymentStep >= 2)) && (
                                            <div className={`w-full sm:w-[400px] lg:w-[420px] h-auto rounded-xl pt-2 p-4 sm:pl-6 shadow-[0_0_10px_2px_rgba(0,0,0,0.1)] items-center mt-4 ${
                                                paymentStep === 2 ? 'bg-white border-2 border-blue-500' : 'bg-gray-50 border border-gray-200'
                                            }`}>
                                                <div className='flex items-center gap-3 mt-2'>
                                                    <h1 
                                                        className={`text-[1.2rem] font-semibold ${paymentStep > 2 ? 'cursor-pointer hover:text-blue-600' : ''}`}
                                                        onClick={() => navigateToStep(2)}
                                                    >
                                                        2. Write a message to the host
                                                    </h1>
                                                    {paymentStep > 2 && (
                                                        <div className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center'>
                                                            <svg className='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
                                                                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className='text-gray-600 mt-2 text-sm'>Before you can continue, let {data.HostName} know a little about your trip and why their place is a good fit.</p>
                                                
                                                <div className='flex items-center gap-3 mt-4'>
                                                    <div className='w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center'>
                                                        <img src={data.HostImage} alt="hostImage" className='h-12 w-12 rounded-full object-contain' />
                                                    </div>
                                                    <div>
                                                        <h3 className='font-semibold text-gray-900'>{data.HostName}</h3>
                                                        <p className='text-gray-600 text-sm'>Hosting since 2022</p>
                                                    </div>
                                                </div>
                                                
                                                <textarea 
                                                    className='w-full h-28 sm:h-32 border border-gray-300 rounded-lg p-3 mt-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base'
                                                    placeholder="Example: 'Hi Danyal, my partner and I are going to a friend's wedding and your place is right down the street.'"
                                                    value={messageToHost}
                                                    onChange={handleMessageChange}
                                                />
                                                
                                                <div className='flex justify-end mt-4 mb-4'>
                                                    <button 
                                                        className={`ml-2 mb-4 text-white px-6 py-2 rounded-lg font-semibold ${
                                                            !isMessageValid 
                                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                                : 'bg-black hover:bg-gray-900 cursor-pointer'
                                                        }`}
                                                        onClick={handleMessageNext}
                                                        disabled={!isMessageValid}
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {(selectedPaymentMethod === 'google' || (selectedPaymentMethod === 'card' && paymentStep >= 2)) && paymentStep >= 3 && (
                                            <div className={`w-full sm:w-[400px] lg:w-[420px] h-auto rounded-xl pt-2 p-4 sm:pl-6 shadow-[0_0_10px_2px_rgba(0,0,0,0.1)] items-center mt-4 ${
                                                paymentStep === 3 ? 'bg-white border-2 border-blue-500' : 'bg-gray-50 border border-gray-200'
                                            }`}>
                                                <div className='flex items-center gap-3 mt-2'>
                                                    <h1 
                                                        className='text-[1.2rem] font-semibold cursor-pointer hover:text-blue-600'
                                                        onClick={() => navigateToStep(3)}
                                                    >
                                                        3. Review your request
                                                    </h1>
                                                    <div className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center'>
                                                        <svg className='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
                                                            <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                                                        </svg>
                                                    </div>
                                                </div>
                                                
                                                {/* Booking Summary */}
                                                <div className='mt-4 mb-6'>
                                                    {/* Property Details */}
                                                    <div className='bg-gray-50 rounded-lg p-4 mb-4'>
                                                        <h3 className='font-semibold text-gray-900 mb-3'>Booking Details</h3>
                                                        <div className='flex items-start gap-3'>
                                                            <img 
                                                                src={data?.image} 
                                                                alt="Property" 
                                                                className='w-16 h-16 rounded-lg object-cover'
                                                                onError={(e) => {
                                                                    e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
                                                                }}
                                                            />
                                                            <div className='flex-1'>
                                                                <h4 className='font-medium text-gray-900'>{data?.title || 'Property'} in {data?.city || 'City'}</h4>
                                                                <p className='text-sm text-gray-600'>Entire {data?.title || 'property'}</p>
                                                                <p className='text-sm text-gray-600'>
                                                                    {selectedDatesFromState && selectedDatesFromState.startDate && selectedDatesFromState.endDate ? 
                                                                        `${format(selectedDatesFromState.startDate, 'MMM d')} - ${format(selectedDatesFromState.endDate, 'MMM d, yyyy')}` :
                                                                        range[0]?.startDate && range[0]?.endDate ?
                                                                            `${format(range[0].startDate, 'MMM d')} - ${format(range[0].endDate, 'MMM d, yyyy')}` :
                                                                            'Select dates'
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Guest Information */}
                                                    <div className='bg-gray-50 rounded-lg p-4 mb-4'>
                                                        <h3 className='font-semibold text-gray-900 mb-2'>Guest Information</h3>
                                                        <p className='text-gray-700'>
                                                            {guestDataFromState ? 
                                                                `${guestDataFromState.totalGuests} ${guestDataFromState.totalGuests === 1 ? 'guest' : 'guests'}` :
                                                                '1 guest'
                                                            }
                                                            {guestDataFromState && guestDataFromState.infants > 0 && `, ${guestDataFromState.infants} infant${guestDataFromState.infants !== 1 ? 's' : ''}`}
                                                        </p>
                                                        <p className='text-gray-700'>
                                                            Check-in: {selectedDatesFromState && selectedDatesFromState.startDate ? 
                                                                format(selectedDatesFromState.startDate, 'MMM d, yyyy') :
                                                                range[0]?.startDate ? 
                                                                    format(range[0].startDate, 'MMM d, yyyy') : 
                                                                    'Select date'
                                                            }
                                                        </p>
                                                        <p className='text-gray-700'>
                                                            Check-out: {selectedDatesFromState && selectedDatesFromState.endDate ? 
                                                                format(selectedDatesFromState.endDate, 'MMM d, yyyy') :
                                                                range[0]?.endDate ? 
                                                                    format(range[0].endDate, 'MMM d, yyyy') : 
                                                                    'Select date'
                                                            }
                                                        </p>
                                                    </div>
                                                    
                                                    {/* Message to Host */}
                                                    {messageToHost && (
                                                        <div className='bg-gray-50 rounded-lg p-4 mb-4'>
                                                            <h3 className='font-semibold text-gray-900 mb-2'>Message to {data?.HostName}:</h3>
                                                            <p className='text-gray-700 italic bg-white p-3 rounded border-l-4 border-blue-500'>"{messageToHost}"</p>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Payment Information */}
                                                    <div className='bg-gray-50 rounded-lg p-4 mb-4'>
                                                        <h3 className='font-semibold text-gray-900 mb-3'>Payment Information</h3>
                                                        <div className='flex items-center gap-3 mb-3'>
                                                            {selectedPaymentMethod === 'card' && (
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
                                                                    <path d="M29 5H3a2 2 0 0 0-2 2v18c0 1.1.9 2 2 2h26a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-7.5 19a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM29 11.5H3v-3h26v3z" fill="currentColor" />
                                                                </svg>
                                                            )}
                                                            {selectedPaymentMethod === 'google' && (
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
                                                                    <path fill="#4285f4" d="M30 13.23l-3.46 8.05h-1.06l1.28-2.82-2.26-5.23h1.12l1.64 4.01h.02l1.6-4z"/>
                                                                    <path fill="#34a853" d="M6.63 19.38c1.24 0 2.3-.42 3.06-1.13l-1.5-1.18a2.77 2.77 0 0 1-4.17-1.49H2.51v1.22a4.61 4.61 0 0 0 4.13 2.58z"/>
                                                                </svg>
                                                            )}
                                                            {selectedPaymentMethod === 'paypal' && (
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
                                                                    <path fill="#0079c1" d="m13.26 17.76.02-.1c.1-.34.39-.59.73-.64h2.17c3.36-.07 5.98-1.47 6.85-5.34l.05-.28.07-.36.04-.28.02-.27.02-.26v-.54l-.03-.26-.1-.49c.05.15.07.3.1.45l.02.27.02.25v.32l-.03.26-.06.55c.33.17.63.4.88.68.78.9.93 2.17.64 3.7-.7 3.55-3.02 4.84-6.02 4.9h-.71a.77.77 0 0 0-.74.56l-.03.1-.04.2-.6 3.84-.03.16a.77.77 0 0 1-.66.65h-3.31a.46.46 0 0 1-.46-.45v-.08z"/>
                                                                </svg>
                                                            )}
                                                            <span className='font-medium text-gray-900'>
                                                                {selectedPaymentMethod === 'card' ? 'Credit/Debit Card' : 
                                                                 selectedPaymentMethod === 'google' ? 'Google Pay' : 
                                                                 selectedPaymentMethod === 'paypal' ? 'PayPal' : 'N/A'}
                                                            </span>
                                                        </div>
                                                        
                                                        {selectedPaymentMethod === 'card' && cardDetails.cardNumber && (
                                                            <div className='bg-white p-3 rounded border'>
                                                                <p className='text-sm text-gray-600'>Card ending in ****{cardDetails.cardNumber.slice(-4)}</p>
                                                                <p className='text-sm text-gray-600'>Expires: {cardDetails.expiryDate}</p>
                                                            </div>
                                                        )}
                                                        
                                                        <div className='mt-3 pt-3 border-t border-gray-200'>
                                                            <div className='flex justify-between text-sm'>
                                                                <span className='text-gray-600'>
                                                                    {selectedDatesFromState && selectedDatesFromState.nights ? 
                                                                        `${selectedDatesFromState.nights} nights × $${data?.pricePerNight || data?.price || 150}` :
                                                                        'Select dates'
                                                                    }
                                                                </span>
                                                                <span className='font-semibold'>
                                                                    {selectedDatesFromState && selectedDatesFromState.nights ? 
                                                                        `$${((selectedDatesFromState.nights * (data?.pricePerNight || data?.price || 150))).toFixed(2)}` :
                                                                        '--'
                                                                    }
                                                                </span>
                                                            </div>
                                                            {guestDataFromState && guestDataFromState.totalGuests > 1 && (
                                                                <div className='flex justify-between text-sm mt-1'>
                                                                    <span className='text-gray-600'>
                                                                        Extra guest fee ({(guestDataFromState.totalGuests - 1)} guest{guestDataFromState.totalGuests - 1 !== 1 ? 's' : ''})
                                                                    </span>
                                                                    <span className='font-semibold'>
                                                                        {selectedDatesFromState && selectedDatesFromState.nights ? 
                                                                            `$${(((guestDataFromState.totalGuests - 1) * 15 * selectedDatesFromState.nights)).toFixed(2)}` :
                                                                            '--'
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {guestDataFromState && guestDataFromState.infants > 0 && (
                                                                <div className='flex justify-between text-sm mt-1'>
                                                                    <span className='text-gray-600'>
                                                                        Infant fee ({guestDataFromState.infants} infant{guestDataFromState.infants !== 1 ? 's' : ''})
                                                                    </span>
                                                                    <span className='font-semibold'>
                                                                        {selectedDatesFromState && selectedDatesFromState.nights ? 
                                                                            `$${((guestDataFromState.infants * 5 * selectedDatesFromState.nights)).toFixed(2)}` :
                                                                            '--'
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className='flex justify-between text-sm mt-1'>
                                                                <span className='text-gray-600'>Service fee</span>
                                                                <span className='font-semibold'>
                                                                    {totalPriceFromState ? 
                                                                        `$${Math.round(totalPriceFromState * 0.1).toFixed(2)}` :
                                                                        selectedDatesFromState && selectedDatesFromState.nights ? 
                                                                            `$${Math.round((selectedDatesFromState.nights * (data?.pricePerNight || data?.price || 150)) * 0.1).toFixed(2)}` :
                                                                            '--'
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className='flex justify-between text-lg font-semibold mt-2 pt-2 border-t border-gray-200'>
                                                                <span>Total</span>
                                                                <span>
                                                                    {totalPriceFromState ? 
                                                                        `$${(totalPriceFromState + Math.round(totalPriceFromState * 0.1)).toFixed(2)}` :
                                                                        selectedDatesFromState && selectedDatesFromState.nights ? 
                                                                            `$${((selectedDatesFromState.nights * (data?.pricePerNight || data?.price || 150)) + Math.round((selectedDatesFromState.nights * (data?.pricePerNight || data?.price || 150)) * 0.1)).toFixed(2)}` :
                                                                            '--'
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className='flex justify-end mt-4 mb-6'>
                                                    <button 
                                                        className='bg-black ml-2 text-white px-8 py-3 rounded-lg hover:bg-gray-900 font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed'
                                                        onClick={handleBookingConfirmation}
                                                        disabled={!selectedDatesFromState || !guestDataFromState || !data || isBooking || !data?.isDatabaseListing}
                                                    >
                                                        {isBooking ? 'Confirming...' : 
                                                         !data?.isDatabaseListing ? 'Select a valid listing to book' : 
                                                         'Confirm and Book'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        
                                </div>
                                {!isAuthenticated && showsignup && (
                                    <div className='w-full sm:w-[120%] lg:w-[150%] h-auto min-h-[70px] sm:h-[80px] bg-white rounded-xl p-4 sm:pl-6 border border-gray-300 items-center flex'>
                                        <h1 className='text-base sm:text-[1.2rem] font-semibold'>2. Add a payment method</h1>
                                    </div>
                                )}
                                {!isAuthenticated && showsignup && (
                                <div className='w-full sm:w-[120%] lg:w-[150%] h-auto min-h-[70px] sm:h-[80px] bg-white rounded-xl p-4 sm:pl-6 border border-gray-300 items-center flex'>
                                    <div className='flex items-center gap-3'>
                                        <h1 className='text-base sm:text-[1.2rem] font-semibold'>3. Review your request</h1>
                                        <div className='w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 rounded-full flex items-center justify-center'>
                                            <svg className='w-3 h-3 sm:w-4 sm:h-4 text-gray-600' fill='currentColor' viewBox='0 0 20 20'>
                                                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className={`w-full lg:w-auto lg:ml-16 xl:ml-52 max-w-lg lg:max-w-none flex justify-center lg:justify-start ${(!isAuthenticated && showsignup) ? 'lg:ml-52' : ''}`} >
                        <div id="reservation" ref={rightSidebarRef} className='w-full max-w-[400px] bg-white rounded-xl border shadow-lg p-4 lg:-ml-20'>
                            {data && (
                                <>
                                    <div className='flex items-start gap-3 mb-4'>
                                        <div className='w-16 h-16 rounded-lg overflow-hidden flex-shrink-0'>
                                            <img 
                                                src={data.image} 
                                                alt={data.title || 'Property'} 
                                                className='w-full h-full object-cover'
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
                                                }}
                                            />
                                        </div>
                                        <div className='flex-1'>
                                            <h2 className='text-base font-semibold text-gray-900 mb-1 flex items-center gap-2'>
                                                {data.title || 'Apartment'} in {data.city || 'Islamabad'}
                                                {data.isDatabaseListing && data.host_id ? (
                                                    <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                                        ✓ Valid Listing (ID: {params.id})
                                                    </span>
                                                ) : (
                                                    <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                                                        ⚠ Demo Data
                                                    </span>
                                                )}
                                            </h2>
                                            <h3 className='text-sm font-medium text-gray-800 mb-1'>Entire {data.title || 'Apartment'} in {data.city || 'Islamabad'}, {data.city || 'Islamabad'}</h3>
                                            <div className='flex items-center gap-2 text-sm text-gray-600'>
                                                <span className='flex items-center gap-1'>
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                    {Number(data.rating || 4.5).toFixed(1)} ({data.reviews || 128})
                                                </span>
                                                <span className='flex items-center gap-1'>
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                    </svg>
                                                    Guest favorite
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            {data && (
                                <>
                                    <div className='mb-4'>
                                        <h3 className='font-bold text-gray-600 '>Free cancellation</h3>
                                        <p className='text-sm text-gray-600 mb-1'>
                                            {selectedDates && selectedDates.startDate && selectedDates.startDate instanceof Date && !isNaN(selectedDates.startDate) ?
                                                `Cancel before ${format(addDays(selectedDates.startDate, -1), 'MMM d')} for a full refund.` :
                                                'Cancel before check-in for a full refund.'
                                            }
                                            <button className='text-sm font-bold text-gray-500 underline ml-1'>Full policy</button>
                                        </p>
                                    </div>

                                    <div className='border-b border-gray-200 w-[100%] -mt-1'></div>
                                    <div className='mb-2 mt-3'>
                                        <h3 className='font-semibold text-gray-900 mb-2'>Dates & guests</h3>
                                        <div className='flex items-center justify-between'>
                                            <div className='text-sm text-gray-800 font-semibold'>
                                                <p>
                                                    {selectedDatesFromState && selectedDatesFromState.startDate && selectedDatesFromState.endDate && 
                                                     selectedDatesFromState.startDate instanceof Date && !isNaN(selectedDatesFromState.startDate) &&
                                                     selectedDatesFromState.endDate instanceof Date && !isNaN(selectedDatesFromState.endDate) ?
                                                        `${format(selectedDatesFromState.startDate, 'MMM d')} – ${format(selectedDatesFromState.endDate, 'MMM d, yyyy')}` :
                                                        'Select dates'
                                                    }
                                                </p>
                                                <p className='text-sm text-gray-800 font-semibold'>
                                                    {guestDataFromState ? 
                                                        `${guestDataFromState.totalGuests} ${guestDataFromState.totalGuests === 1 ? 'guest' : 'guests'}` :
                                                        '1 adult'
                                                    }
                                                </p>
                                            </div>
                                            <button onClick={() => setIsCalendarOpen(true)} className='text-sm text-gray-800 font-semibold bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200'>Change</button>
                                        </div>
                                    </div>
                                    <div className='border-b border-gray-200 w-[100%] mt-3'></div>
                                    <div className='mb-4 mt-3'>
                                        <h3 className='font-semibold text-gray-900 mb-2'>Price details</h3>
                                        <div className='flex justify-between text-sm text-gray-600 mb-2'>
                                            <span>
                                                {selectedDatesFromState && selectedDatesFromState.nights && typeof selectedDatesFromState.nights === 'number' && !isNaN(selectedDatesFromState.nights) ?
                                                    `${selectedDatesFromState.nights} nights x $${data.pricePerNight || 150}` :
                                                    'Select dates'
                                                }
                                            </span>
                                            <span className='text-sm text-gray-800 font-semibold mr-4'>
                                                {selectedDatesFromState && selectedDatesFromState.nights && typeof selectedDatesFromState.nights === 'number' && !isNaN(selectedDatesFromState.nights) ?
                                                    `$${((selectedDatesFromState.nights * (data.pricePerNight || 150))).toFixed(2)}` :
                                                    '--'
                                                }
                                            </span>
                                        </div>
                                        {/* Show extra guest fees if applicable */}
                                        {guestDataFromState && guestDataFromState.totalGuests > 1 && (
                                            <div className='flex justify-between text-sm text-gray-600 mb-2'>
                                                <span>
                                                    Extra guest fee ({(guestDataFromState.totalGuests - 1)} guest{guestDataFromState.totalGuests - 1 !== 1 ? 's' : ''})
                                                </span>
                                                <span className='text-sm text-gray-800 font-semibold mr-4'>
                                                    {selectedDatesFromState && selectedDatesFromState.nights && typeof selectedDatesFromState.nights === 'number' && !isNaN(selectedDatesFromState.nights) ?
                                                        `$${(((guestDataFromState.totalGuests - 1) * 15 * selectedDatesFromState.nights)).toFixed(2)}` :
                                                        '--'
                                                    }
                                                </span>
                                            </div>
                                        )}
                                        {/* Show infant fees if applicable */}
                                        {guestDataFromState && guestDataFromState.infants > 0 && (
                                            <div className='flex justify-between text-sm text-gray-600 mb-2'>
                                                <span>
                                                    Infant fee ({guestDataFromState.infants} infant{guestDataFromState.infants !== 1 ? 's' : ''})
                                                </span>
                                                <span className='text-sm text-gray-800 font-semibold mr-4'>
                                                    {selectedDatesFromState && selectedDatesFromState.nights && typeof selectedDatesFromState.nights === 'number' && !isNaN(selectedDatesFromState.nights) ?
                                                        `$${((guestDataFromState.infants * 5 * selectedDatesFromState.nights)).toFixed(2)}` :
                                                        '--'
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className='border-t border-gray-200 pt-3'>
                                        <div className='flex justify-between items-center mb-1'>
                                            <h3 className='font-semibold text-gray-900'>Total <span className='underline'>USD</span></h3>
                                            <span className='text-lg font-semibold text-gray-900'>
                                                {totalPriceFromState ? 
                                                    `$${totalPriceFromState.toFixed(2)}` :
                                                    (selectedDates && selectedDates.nights && typeof selectedDates.nights === 'number' && !isNaN(selectedDates.nights) ?
                                                        `$${((selectedDates.nights * (data.pricePerNight || 150))).toFixed(2)}` :
                                                        '--')
                                                }
                                            </span>
                                        </div>
                                        <button className='text-sm text-gray-900 underline'>Price breakdown</button>
                                    </div>
                                    
                                    {/* Diamond section - moved inside the right sidebar container */}
                                    {data && (
                                        <div id="diamond" ref={diamondRef} className='flex gap-2 mt-3'>
                                            <svg
                                                viewBox="0 0 48 48"
                                                xmlns="http://www.w3.org/2000/svg"
                                                aria-hidden="true"
                                                focusable="false"
                                                className='mt-2'
                                                style={{
                                                    display: "block",
                                                    height: "40px",
                                                    width: "40px",
                                                    fill: "rgb(227, 28, 95)"
                                                }}
                                            >
                                                <g stroke="none">
                                                    <path
                                                        d="m32.62 6 9.526 11.114-18.146 23.921-18.147-23.921 9.526-11.114z"
                                                        fillOpacity="0.2"
                                                    />
                                                    <path d="m34.4599349 2 12.8243129 14.9616983-23.2842478 30.6928721-23.28424779-30.6928721 12.82431289-14.9616983zm-17.9171827 16h-12.52799999l18.25899999 24.069zm27.441 0h-12.528l-5.73 24.069zm-14.583 0h-10.802l5.4012478 22.684zm-15.92-12.86-9.30799999 10.86h11.89399999zm19.253-1.141h-17.468l2.857 12.001h11.754zm1.784 1.141-2.586 10.86h11.894z" />
                                                </g>
                                            </svg>
                                            <div className='flex flex-col mt-2 '>
                                                <h1 className='text-sm text-black font-semibold'>This is a rare find</h1>
                                                <p className='text-sm text-gray-800 font-semibold'>{data.HostName || 'Host'} place is usually booked.</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isCalendarOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40" onClick={() => setIsCalendarOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-xl mt-4 sm:mt-10 w-full max-w-[900px] mx-4 sm:mx-0" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between px-6 py-4 border-b">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Select dates</h2>
                                <p className="text-sm text-gray-600 mt-1">Add your travel dates for exact pricing</p>
                            </div>
                        </div>
                        <div className="px-6 pt-4">
                            <DateRange
                                months={2}
                                direction="horizontal"
                                moveRangeOnFirstSelection={false}
                                ranges={range}
                                onChange={(item) => setRange([item.selection])}
                                shownDate={range[0].startDate}
                                minDate={new Date(2025, 7, 1)}
                                maxDate={new Date(2025, 12, 31)}
                                showDateDisplay={false}
                                disabledDates={[new Date(2025, 8, 9), new Date(2025, 8, 21), new Date(2025, 9, 3)]}
                                monthDisplayFormat="MMMM yyyy"
                                locale={customLocale}
                            />
                        </div>
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <button onClick={() => { setSelectedDates(null); }} className="text-gray-700 underline">Clear dates</button>
                            <button onClick={() => { 
                                const s = range[0].startDate; 
                                const e = range[0].endDate; 
                                if (s && e && s instanceof Date && e instanceof Date && !isNaN(s) && !isNaN(e)) {
                                    setSelectedDates({ startDate: s, endDate: e, nights: differenceInDays(e, s) }); 
                                    setIsCalendarOpen(false);
                                }
                            }} className="bg-gray-900 text-white px-4 py-2 rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}
            {successMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSuccessMessage(false)}>
                    <div className="relative bg-white rounded-3xl w-full max-w-[560px] mx-4 sm:mx-0 p-6 sm:p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <button className="absolute top-4 right-6 text-gray-500 hover:text-gray-700 text-xl cursor-pointer" onClick={() => setSuccessMessage(false)}>✕</button>
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <span className="absolute inset-0 rounded-full bg-rose-400/30 animate-ping"></span>
                                <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="46" height="46" className="text-white" fill="currentColor">
                                        <path d="M9 16.17l-3.88-3.88-1.41 1.41L9 19 20.29 7.71l-1.41-1.41z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900">You're all set!</h3>
                            <p className="text-gray-600 mt-2 text-[0.98rem]">
                                We just confirmed your {authMethod === 'phone' ? 'phone number' : 'email'}.
                            </p>
                            <div className="mt-3 text-gray-900 font-medium">
                                {authMethod === 'phone' ? `${dialCode} ${phoneNumber}` : email}
                            </div>
                            <p className="text-gray-600 mt-3 text-sm">You can continue your booking now.</p>
                            <button className="mt-5 bg-gray-900 text-white px-5 py-2.5 rounded-2xl hover:bg-black transition-colors" onClick={() => { setSuccessMessage(false); }}>
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {country && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40" onClick={() => setCountry(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-[560px] mx-4 sm:mx-0 mt-4 sm:mt-10 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                            <button className='text-xl' onClick={() => setCountry(false)}>✕</button>
                            <h3 className='text-base font-semibold'>Country/region</h3>
                            <span className='w-6'></span>
                        </div>
                        <div className='max-h-[60vh] overflow-auto'>
                            {countries.map((c) => (
                                <button
                                    key={c.name}
                                    className={`w-full text-left px-6 py-4 border-b hover:bg-gray-50 flex items-center justify-between ${selectedCountry === c.name ? 'font-semibold' : ''}`}
                                    onClick={() => { setSelectedCountry(c.name); setCountry(false); }}
                                >
                                    <span>{c.name}</span>
                                    {selectedCountry === c.name && (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className='text-gray-800'>
                                            <path d="M20.285 2.859l-11.4 11.4-5.657-5.657-2.828 2.828 8.485 8.485 14.228-14.228z" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* End marker for right sidebar pinning */}
            <div id="reserve-end" ref={endMarkerRef} style={{ height: 1 }} />
        </>
    )
}

export default Reserve;