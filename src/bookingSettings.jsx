import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';

const BookingSettings = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { isAuthenticated, user } = useAuth();
    const hostId = searchParams.get('hostId') || user?.id;
    const listingId = searchParams.get('listingId');
    const [progress, setProgress] = useState(71);
    const [isMounted, setIsMounted] = useState(false);
    const [selectedOption, setSelectedOption] = useState('approve');
    const [showLearnMore, setShowLearnMore] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const m = setTimeout(() => setIsMounted(true), 0);
        const t = setTimeout(() => setProgress(p => Math.max(p, 77)), 60);
        return () => { clearTimeout(m); clearTimeout(t); };
    }, []);

    const bookingOptions = [
        {
            id: 'approve',
            title: 'Approve your first 5 bookings',
            badge: 'Recommended',
            description: 'Start by reviewing reservation requests, then switch to Instant Book, so guests can book automatically.',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 16l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            )
        },
        {
            id: 'instant',
            title: 'Use Instant Book',
            description: 'Let guests book automatically.',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            )
        }
    ];

    const handleOptionSelect = (optionId) => {
        setSelectedOption(optionId);
    };

    const saveListingProgress = async (payload = {}) => {
        if (!hostId) return;
        try {
            await axios.patch(
                `http://localhost:5000/api/data/listings/save-exit?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}`,
                payload,
                { withCredentials: true }
            );
        } catch (error) {
            console.error('Error saving listing:', error);
            throw error;
        }
    };

    const handleSaveAndExit = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            if (hostId) {
                await saveListingProgress({ 
                    booking_type: selectedOption,
                    status: 'draft', 
                    current_step: 'booking_settings' 
                });
            }
            navigate(hostId ? `/listings/${hostId}` : '/listings');
        } catch (error) {
            console.error('Save & exit failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleNext = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            if (hostId) {
                await saveListingProgress({ 
                    booking_type: selectedOption,
                    current_step: 'guest_welcome' 
                });
            }
            const urlWithHostId = hostId ? `/guest-welcome?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}` : '/guest-welcome';
            navigate(urlWithHostId, { state: { progress } });
        } catch (error) {
            console.error('Next step failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-white">
            <div className="flex items-center justify-between px-8 py-4">
                <svg onClick={() => navigate('/')}
                    className={`w-20 h-6 sm:w-24 sm:h-8 lg:w-28 lg:h-8 transition-all duration-500 ${'scale-100'}`}
                    viewBox="0 0 3490 1080"
                    style={{ display: 'block', color: '#ff385c', cursor: 'pointer' }}
                >
                    <path d="M1494.71 456.953C1458.28 412.178 1408.46 389.892 1349.68 389.892C1233.51 389.892 1146.18 481.906 1146.18 605.892C1146.18 729.877 1233.51 821.892 1349.68 821.892C1408.46 821.892 1458.28 799.605 1494.71 754.83L1500.95 810.195H1589.84V401.588H1500.95L1494.71 456.953ZM1369.18 736.895C1295.33 736.895 1242.08 683.41 1242.08 605.892C1242.08 528.373 1295.33 474.888 1369.18 474.888C1443.02 474.888 1495.49 529.153 1495.49 605.892C1495.49 682.63 1443.8 736.895 1369.18 736.895ZM1656.11 810.195H1750.46V401.588H1656.11V810.195ZM948.912 666.715C875.618 506.859 795.308 344.664 713.438 184.809C698.623 155.177 670.554 98.2527 645.603 67.8412C609.736 24.1733 556.715 0.779785 502.915 0.779785C449.115 0.779785 396.094 24.1733 360.227 67.8412C335.277 98.2527 307.207 155.177 292.392 184.809C210.522 344.664 130.212 506.859 56.9187 666.715C47.5621 687.769 24.9504 737.675 16.3736 760.289C6.2373 787.581 0.779297 817.213 0.779297 846.845C0.779297 975.509 101.362 1079.22 235.473 1079.22C346.193 1079.22 434.3 1008.26 502.915 934.18C571.53 1008.26 659.638 1079.22 770.357 1079.22C904.468 1079.22 1005.83 975.509 1005.83 846.845C1005.83 817.213 999.593 787.581 989.457 760.289C980.88 737.675 958.268 687.769 948.912 666.715ZM502.915 810.195C447.555 738.455 396.094 649.56 396.094 577.819C396.094 506.079 446.776 470.209 502.915 470.209C559.055 470.209 610.516 508.419 610.516 577.819C610.516 647.22 558.275 738.455 502.915 810.195ZM770.357 998.902C688.362 998.902 618.032 941.557 555.741 872.656C619.966 792.541 690.826 679.121 690.826 577.819C690.826 458.513 598.04 389.892 502.915 389.892C407.79 389.892 315.784 458.513 315.784 577.819C315.784 679.098 386.145 792.478 450.144 872.593C387.845 941.526 317.491 998.902 235.473 998.902C146.586 998.902 81.0898 931.061 81.0898 846.845C81.0898 826.57 84.2087 807.856 91.2261 788.361C98.2436 770.426 120.855 720.52 130.212 701.025C203.505 541.17 282.256 380.534 364.126 220.679C378.941 191.047 403.891 141.921 422.605 119.307C442.877 94.3538 470.947 81.0975 502.915 81.0975C534.883 81.0975 562.953 94.3538 583.226 119.307C601.939 141.921 626.89 191.047 641.704 220.679C723.574 380.534 802.325 541.17 875.618 701.025C884.975 720.52 907.587 770.426 914.604 788.361C921.622 807.856 925.52 826.57 925.52 846.845C925.52 931.061 859.244 998.902 770.357 998.902ZM3285.71 389.892C3226.91 389.892 3175.97 413.098 3139.91 456.953V226.917H3045.56V810.195H3134.45L3140.69 754.83C3177.12 799.605 3226.94 821.892 3285.71 821.892C3401.89 821.892 3489.22 729.877 3489.22 605.892C3489.22 481.906 3401.89 389.892 3285.71 389.892ZM3266.22 736.895C3191.6 736.895 3139.91 682.63 3139.91 605.892C3139.91 529.153 3191.6 474.888 3266.22 474.888C3340.85 474.888 3393.32 528.373 3393.32 605.892C3393.32 683.41 3340.07 736.895 3266.22 736.895ZM2827.24 389.892C2766.15 389.892 2723.56 418.182 2699.37 456.953L2693.13 401.588H2604.24V810.195H2698.59V573.921C2698.59 516.217 2741.47 474.888 2800.73 474.888C2856.87 474.888 2888.84 513.097 2888.84 578.599V810.195H2983.19V566.903C2983.19 457.733 2923.15 389.892 2827.24 389.892ZM1911.86 460.072L1905.62 401.588H1816.73V810.195H1911.08V604.332C1911.08 532.592 1954.74 486.585 2027.26 486.585C2042.85 486.585 2058.44 488.144 2070.92 492.043V401.588C2059.22 396.91 2044.41 395.35 2028.04 395.35C1978.58 395.35 1936.66 421.177 1911.86 460.072ZM2353.96 389.892C2295.15 389.892 2244.21 413.098 2208.15 456.953V226.917H2113.8V810.195H2202.69L2208.93 754.83C2245.36 799.605 2295.18 821.892 2353.96 821.892C2470.13 821.892 2557.46 729.877 2557.46 605.892C2557.46 481.906 2470.13 389.892 2353.96 389.892ZM2334.46 736.895C2259.84 736.895 2208.15 682.63 2208.15 605.892C2208.15 529.153 2259.84 474.888 2334.46 474.888C2409.09 474.888 2461.56 528.373 2461.56 605.892C2461.56 683.41 2408.31 736.895 2334.46 736.895ZM1703.28 226.917C1669.48 226.917 1642.08 254.326 1642.08 288.13C1642.08 321.934 1669.48 349.343 1703.28 349.343C1737.09 349.343 1764.49 321.934 1764.49 288.13C1764.49 254.326 1737.09 226.917 1703.28 226.917Z" fill="currentColor"></path>
                </svg>
                <div className="w-8 h-8" />
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full hover:bg-gray-100 font-semibold">Questions?</button>
                    <button 
                        onClick={handleSaveAndExit}
                        disabled={isSaving}
                        className={`px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full font-semibold transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                    >
                        {isSaving ? 'Saving...' : 'Save & exit'}
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-4">
                <div className={`transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <h1 className="text-4xl font-semibold text-gray-900 text-center mb-4">Pick your booking settings</h1>
                    <p className="text-lg text-gray-600 text-center mb-12">
                        You can change this at any time. <span 
                            className="text-gray-800 underline cursor-pointer hover:text-blue-800"
                            onClick={() => setShowLearnMore(true)}
                        >
                            Learn more
                        </span>
                    </p>
                </div>

                <div className="space-y-4 -mt-4">
                    {bookingOptions.map((option, index) => (
                        <div
                            key={option.id}
                            className={`transition-all duration-700 delay-${index * 100} ${
                                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                        >
                            <button
                                onClick={() => handleOptionSelect(option.id)}
                                className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                                    selectedOption === option.id
                                        ? 'border-black bg-gray-50'
                                        : 'border-gray-300 bg-white hover:border-gray-400'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold text-gray-900">{option.title}</h3>
                                            {option.badge && (
                                                <span className="px-3 py-1 text-sm font-medium text-green-600 bg-green-50 rounded-full">
                                                    {option.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 leading-relaxed">{option.description}</p>
                                    </div>
                                    <div className={`ml-4 transition-colors duration-300 ${
                                        selectedOption === option.id ? 'text-black' : 'text-gray-400'
                                    }`}>
                                        {option.icon}
                                    </div>
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            {showLearnMore && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md mx-4 relative">
                        <button
                            onClick={() => setShowLearnMore(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Booking Settings Explained</h3>
                        <div className="space-y-4 text-gray-600">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Approve your first 5 bookings</h4>
                                <p className="text-sm">This option lets you review and approve each reservation request manually for your first 5 bookings. This gives you time to get comfortable with hosting while maintaining control over who stays at your place.</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Use Instant Book</h4>
                                <p className="text-sm">With Instant Book, guests can book your place immediately without waiting for approval. This can help you get more bookings faster, but you'll have less control over who books.</p>
                            </div>
                            <p className="text-sm text-gray-500 mt-4">
                                You can always change these settings later in your hosting dashboard.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed left-0 right-0 bottom-0 bg-white border-t">
                <div className="h-1 w-full bg-gray-300 relative overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-black transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>

                <div className="flex items-center justify-between px-8 py-4">
                    <button onClick={() => {
                        const urlWithHostId = hostId ? `/aboutplace/final?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}` : '/aboutplace/final';
                        navigate(urlWithHostId, { state: { progress } });
                    }} className="text-gray-800 font-semibold underline">Back</button>
                    <button 
                        onClick={handleNext}
                        disabled={isSaving}
                        className={`px-8 py-3 rounded-lg transition-colors ${!isSaving ? 'bg-black text-white hover:bg-gray-900' : 'bg-black/30 text-white/70 cursor-not-allowed'}`}
                    >
                        {isSaving ? 'Saving...' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingSettings;
