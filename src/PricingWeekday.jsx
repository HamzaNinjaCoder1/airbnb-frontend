import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from './api';

const PricingWeekday = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { isAuthenticated, user } = useAuth();
    const hostId = searchParams.get('hostId') || user?.id;
    const listingId = searchParams.get('listingId');
    const editMode = searchParams.get('editMode') === 'true';
    const returnUrl = searchParams.get('returnUrl') || `/listings/${hostId}`;
    const [progress, setProgress] = useState(82);
    const [isMounted, setIsMounted] = useState(false);
    const [price, setPrice] = useState(25);
    const [didHydrate, setDidHydrate] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showGuestBreakdown, setShowGuestBreakdown] = useState(false);
    const [showHostBreakdown, setShowHostBreakdown] = useState(false);
    const [showPricingInfo, setShowPricingInfo] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const m = setTimeout(() => setIsMounted(true), 0);
        const t = setTimeout(() => setProgress(p => Math.max(p, 88)), 60);
        return () => { clearTimeout(m); clearTimeout(t); };
    }, []);

    // Prefill from existing price if available (server or local)
    useEffect(() => {
        if (didHydrate) return;
        try {
            const id = listingId || 'new';
            const key = `listing:${hostId || 'anon'}:${id}`;
            let initial = null;
            // Try to get from location.state.existingData if provided
            const injected = location?.state?.existingData;
            initial = (injected && (injected.price_per_night || injected.weekday_price || injected.base_price)) ?? null;
            if (initial == null) {
                const localRaw = localStorage.getItem(key);
                const local = localRaw ? JSON.parse(localRaw) : {};
                initial = local.price_per_night ?? local.weekday_price ?? local.base_price;
            }
            if (initial != null && !Number.isNaN(Number(initial))) {
                setPrice(parseInt(initial, 10));
            }
        } catch (_) {}
        setDidHydrate(true);
    }, [didHydrate, hostId, listingId, location]);

    const guestServiceFee = 4; 
    const hostServiceFee = -1; 

    const guestBeforeTaxes = useMemo(() => Math.max(0, Number(price) + guestServiceFee), [price]);
    const youEarn = useMemo(() => Math.max(0, Number(price) + hostServiceFee), [price]);

    const onChangePrice = (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        setPrice(raw === '' ? 0 : parseInt(raw, 10));
    };

    const saveListingProgress = async (payload = {}) => {
        if (!hostId) return;
        try {
            await api.patch(
                `/api/data/listings/save-exit?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}`,
                payload
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
                    price_per_night: price,
                    status: 'draft', 
                    current_step: 'pricing_weekday' 
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
                if (editMode) {
                    // In edit mode, just update the price and return to listings
                    await saveListingProgress({ 
                        price_per_night: price,
                        status: 'published' // Keep as published
                    });
                    navigate(returnUrl);
                } else {
                    // Normal flow - go to next step
                    await saveListingProgress({ 
                        price_per_night: price,
                        current_step: 'pricing_weekend' 
                    });
                    const urlWithHostId = hostId ? `/pricing-weekend?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}` : '/pricing-weekend';
                    navigate(urlWithHostId, { state: { progress, basePrice: price, guestServiceFee } });
                }
            }
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
                <div className="w-8 h-8">
                    <svg onClick={() => navigate('/')} className={`w-20 h-6 sm:w-24 sm:h-8 lg:w-28 lg:h-8 transition-all duration-500 ${'scale-100'}`} viewBox="0 0 3490 1080" style={{ display: 'block', color: '#ff385c', cursor: 'pointer' }}>
                        <path d="M1494.71 456.953C1458.28 412.178 1408.46 389.892 1349.68 389.892C1233.51 389.892 1146.18 481.906 1146.18 605.892C1146.18 729.877 1233.51 821.892 1349.68 821.892C1408.46 821.892 1458.28 799.605 1494.71 754.83L1500.95 810.195H1589.84V401.588H1500.95L1494.71 456.953ZM1369.18 736.895C1295.33 736.895 1242.08 683.41 1242.08 605.892C1242.08 528.373 1295.33 474.888 1369.18 474.888C1443.02 474.888 1495.49 529.153 1495.49 605.892C1495.49 682.63 1443.8 736.895 1369.18 736.895ZM1656.11 810.195H1750.46V401.588H1656.11V810.195ZM948.912 666.715C875.618 506.859 795.308 344.664 713.438 184.809C698.623 155.177 670.554 98.2527 645.603 67.8412C609.736 24.1733 556.715 0.779785 502.915 0.779785C449.115 0.779785 396.094 24.1733 360.227 67.8412C335.277 98.2527 307.207 155.177 292.392 184.809C210.522 344.664 130.212 506.859 56.9187 666.715C47.5621 687.769 24.9504 737.675 16.3736 760.289C6.2373 787.581 0.779297 817.213 0.779297 846.845C0.779297 975.509 101.362 1079.22 235.473 1079.22C346.193 1079.22 434.3 1008.26 502.915 934.18C571.53 1008.26 659.638 1079.22 770.357 1079.22C904.468 1079.22 1005.83 975.509 1005.83 846.845C1005.83 817.213 999.593 787.581 989.457 760.289C980.88 737.675 958.268 687.769 948.912 666.715ZM502.915 810.195C447.555 738.455 396.094 649.56 396.094 577.819C396.094 506.079 446.776 470.209 502.915 470.209C559.055 470.209 610.516 508.419 610.516 577.819C610.516 647.22 558.275 738.455 502.915 810.195ZM770.357 998.902C688.362 998.902 618.032 941.557 555.741 872.656C619.966 792.541 690.826 679.121 690.826 577.819C690.826 458.513 598.04 389.892 502.915 389.892C407.79 389.892 315.784 458.513 315.784 577.819C315.784 679.098 386.145 792.478 450.144 872.593C387.845 941.526 317.491 998.902 235.473 998.902C146.586 998.902 81.0898 931.061 81.0898 846.845C81.0898 826.57 84.2087 807.856 91.2261 788.361C98.2436 770.426 120.855 720.52 130.212 701.025C203.505 541.17 282.256 380.534 364.126 220.679C378.941 191.047 403.891 141.921 422.605 119.307C442.877 94.3538 470.947 81.0975 502.915 81.0975C534.883 81.0975 562.953 94.3538 583.226 119.307C601.939 141.921 626.89 191.047 641.704 220.679C723.574 380.534 802.325 541.17 875.618 701.025C884.975 720.52 907.587 770.426 914.604 788.361C921.622 807.856 925.52 826.57 925.52 846.845C925.52 931.061 859.244 998.902 770.357 998.902ZM3285.71 389.892C3226.91 389.892 3175.97 413.098 3139.91 456.953V226.917H3045.56V810.195H3134.45L3140.69 754.83C3177.12 799.605 3226.94 821.892 3285.71 821.892C3401.89 821.892 3489.22 729.877 3489.22 605.892C3489.22 481.906 3401.89 389.892 3285.71 389.892ZM3266.22 736.895C3191.6 736.895 3139.91 682.63 3139.91 605.892C3139.91 529.153 3191.6 474.888 3266.22 474.888C3340.85 474.888 3393.32 528.373 3393.32 605.892C3393.32 683.41 3340.07 736.895 3266.22 736.895ZM2827.24 389.892C2766.15 389.892 2723.56 418.182 2699.37 456.953L2693.13 401.588H2604.24V810.195H2698.59V573.921C2698.59 516.217 2741.47 474.888 2800.73 474.888C2856.87 474.888 2888.84 513.097 2888.84 578.599V810.195H2983.19V566.903C2983.19 457.733 2923.15 389.892 2827.24 389.892ZM1911.86 460.072L1905.62 401.588H1816.73V810.195H1911.08V604.332C1911.08 532.592 1954.74 486.585 2027.26 486.585C2042.85 486.585 2058.44 488.144 2070.92 492.043V401.588C2059.22 396.91 2044.41 395.35 2028.04 395.35C1978.58 395.35 1936.66 421.177 1911.86 460.072ZM2353.96 389.892C2295.15 389.892 2244.21 413.098 2208.15 456.953V226.917H2113.8V810.195H2202.69L2208.93 754.83C2245.36 799.605 2295.18 821.892 2353.96 821.892C2470.13 821.892 2557.46 729.877 2557.46 605.892C2557.46 481.906 2470.13 389.892 2353.96 389.892ZM2334.46 736.895C2259.84 736.895 2208.15 682.63 2208.15 605.892C2208.15 529.153 2259.84 474.888 2334.46 474.888C2409.09 474.888 2461.56 528.373 2461.56 605.892C2461.56 683.41 2408.31 736.895 2334.46 736.895ZM1703.28 226.917C1669.48 226.917 1642.08 254.326 1642.08 288.13C1642.08 321.934 1669.48 349.343 1703.28 349.343C1737.09 349.343 1764.49 321.934 1764.49 288.13C1764.49 254.326 1737.09 226.917 1703.28 226.917Z" fill="currentColor"></path>
                    </svg>
                </div>
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

            <div className="max-w-3xl mx-auto px-6 mt-6">
                <div className={`transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <h1 className="text-[2rem] font-semibold text-gray-900 text-center">Now, set a weekday base price</h1>
                    <p className="text-gray-600 text-center ">Tip: ${25}. You’ll set a weekend price next.</p>
                </div>

                <div className="mt-4 flex flex-col items-center">
                    <div className="relative">
                        {!isEditing ? (
                            <div className="flex items-center gap-2">
                                <div className="text-[7rem] leading-none font-bold text-gray-900 select-none">
                                    ${price}
                                </div>
                                <button onClick={() => setIsEditing(true)} className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition mt-16 -ml-1" aria-label="Edit price">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-label="Edit" role="img" focusable="false" style={{ display: 'block', height: 16, width: 16, fill: 'currentColor' }}>
                                        <path d="m18.23 7.35 6.42 6.42L10 28.4c-.38.38-.88.59-1.41.59H3v-5.59c0-.52.21-1.04.59-1.41L18.23 7.35zm9.98-3.56a4.54 4.54 0 0 0-6.42 0l-1.44 1.44 6.42 6.42 1.44-1.44a4.54 4.54 0 0 0 0-6.42z"></path>
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-[4rem] font-bold">$</span>
                                <input
                                    autoFocus
                                    value={price}
                                    onChange={onChangePrice}
                                    onBlur={() => setIsEditing(false)}
                                    className="text-[6rem] font-bold outline-none border-b-2 border-black w-40 text-center"
                                />
                            </div>
                        )}
                    </div>

                    <div className="mt-4 text-gray-700">Guest price before taxes ${guestBeforeTaxes}
                        <button onClick={() => setShowGuestBreakdown(v => !v)} className="ml-2 text-gray-600 hover:text-gray-800 underline align-middle">{showGuestBreakdown ? 'Show less' : 'Show more'}</button>
                    </div>

                    {showGuestBreakdown && (
                        <div className="mt-4 w-full max-w-[20rem] border rounded-xl p-4 shadow-sm bg-white">
                            <div className="flex items-center justify-between text-gray-700">
                                <span>Base price</span>
                                <span>${price}</span>
                            </div>
                            <div className="my-3 h-px bg-gray-200" />
                            <div className="flex items-center justify-between text-gray-700">
                                <span>Guest service fee</span>
                                <span>${guestServiceFee}</span>
                            </div>
                            <div className="mt-3 font-semibold flex items-center justify-between">
                                <span>Guest price before taxes</span>
                                <span>${guestBeforeTaxes}</span>
                            </div>
                        </div>
                    )}

                    <button onClick={() => setShowHostBreakdown(v => !v)} className="mt-6 w-full max-w-[20rem] border rounded-xl p-3 bg-white hover:border-gray-400 transition px-4">
                        <div className="flex items-center justify-between font-medium">
                            <span>You earn</span>
                            <span>${youEarn}</span>
                        </div>
                    </button>

                    {showHostBreakdown && (
                        <div className="mt-3 w-full max-w-[20rem] border rounded-xl p-4 shadow-sm bg-white ">
                            <div className="flex items-center justify-between text-gray-700">
                                <span>Base price</span>
                                <span>${price}</span>
                            </div>
                            <div className="my-3 h-px bg-gray-200" />
                            <div className="flex items-center justify-between text-gray-700">
                                <span>Host service fee</span>
                                <span>{hostServiceFee < 0 ? '-' : ''}${Math.abs(hostServiceFee)}</span>
                            </div>
                            <div className="mt-3 font-semibold flex items-center justify-between">
                                <span>You earn</span>
                                <span>${youEarn}</span>
                            </div>
                        </div>
                    )}

                    <button className="mt-6 px-4 py-2 rounded-full shadow-lg text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: 18, width: 18, fill: 'black' }}><path d="M8 .5C4.96.5 2.5 3 2.5 6s1.83 6.08 5.5 9.25C11.67 12.08 13.5 9 13.5 6A5.5 5.5 0 0 0 8 .5zM8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"></path></svg>
                        <span className="text-sm">View similar listings</span>
                    </button>
                    <button onClick={() => setShowPricingInfo(true)} className="mt-3 text-xs text-gray-500 underline">Learn more about pricing</button>
                </div>
            </div>

            {showPricingInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-xl">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-semibold">More about pricing</h2>
                            <button onClick={() => setShowPricingInfo(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100">×</button>
                        </div>
                        <div className="text-sm text-gray-700 space-y-4 max-h-[60vh] overflow-auto pr-1">
                            <p>You choose your price, and you can change it anytime. Bookings aren’t guaranteed.</p>
                            <div>
                                <h3 className="font-medium text-gray-900 mb-1">Per night price</h3>
                                <p>The suggested price is based on factors like your listing’s location and amenities, as well as guest demand and similar listings.</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 mb-1">Guest price details</h3>
                                <p>When you’re setting a price and a price breakdown is shown, the guest service fee and/or taxes, if applicable, may vary depending on booked trip details (like the length of stay or number of guests).</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 mb-1">Comparing similar listings</h3>
                                <p>To determine listings that are similar to yours, we consider criteria like location, listing type, rooms, amenities, reviews, ratings, and the listings that guests often view alongside yours. We also avoid including listings that aren’t especially active—for example, we’ll never include a listing that hasn’t been booked in the past year, or one that doesn’t have upcoming availability. Average per night prices are shown for booked and/or available listings. When you choose a range of dates, a listing may show on the map as booked and unbooked if it has both booked and available nights.</p>
                            </div>
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
                        const urlWithHostId = hostId ? `/guest-welcome?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}` : '/guest-welcome';
                        navigate(urlWithHostId, { state: { progress } });
                    }} className="text-gray-800 font-semibold underline">Back</button>
                    <button 
                        onClick={handleNext}
                        disabled={isSaving}
                        className={`px-8 py-3 rounded-lg transition-colors ${!isSaving ? 'bg-black text-white hover:bg-gray-900' : 'bg-black/30 text-white/70 cursor-not-allowed'}`}
                    >
                        {isSaving ? 'Saving...' : (editMode ? 'Edit' : 'Next')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PricingWeekday;


