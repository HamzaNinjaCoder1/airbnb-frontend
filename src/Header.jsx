import React, { useState, useEffect, createContext, useContext, Fragment, useRef } from 'react'
import { Popover, Transition, Portal } from '@headlessui/react'
import { DateRange } from 'react-date-range'
import { format, addDays } from 'date-fns'
import CircularSlider from '@fseehawer/react-circular-slider'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import MenuButton from './MenuButton'
import HostDialog from './HostDialog'
import { checkHostListing } from './services/hostService'

// Create context for header scroll state
const HeaderContext = createContext()

export const useHeader = () => {
    const context = useContext(HeaderContext)
    if (!context) {
        throw new Error('useHeader must be used within a HeaderProvider')
    }
    return context
}

function Header({ isScrolled, isHeaderExpanded, setIsHeaderExpanded }) {
    const navigate = useNavigate()
    const { isAuthenticated, user, logout } = useAuth()
    const [showHostDialog, setShowHostDialog] = useState(false)
    const [selectedHostType, setSelectedHostType] = useState(null)
    const [adults, setAdults] = useState(1)
    const [children, setChildren] = useState(0)
    const [infants, setInfants] = useState(0)
    const [pets, setPets] = useState(0)
    const MAX_GUESTS = 6
    const MAX_INFANTS = 5
    const totalGuests = adults + children
    const whoRef = useRef(null)
    const whereRef = useRef(null)
    const [whoRect, setWhoRect] = useState(null)
    const [isWhoOpen, setIsWhoOpen] = useState(false)
    const [whereRect, setWhereRect] = useState(null)
    const [isWhereOpen, setIsWhereOpen] = useState(false)
    // Dates/Months popover state
    const [isDatesOpen, setIsDatesOpen] = useState(false)
    const [activeDateTab, setActiveDateTab] = useState('dates')
    const checkInRef = useRef(null)
    const checkOutRef = useRef(null)
    const searchBarRef = useRef(null)
    const [datesRect, setDatesRect] = useState(null)
    const [range, setRange] = useState([
        { startDate: new Date(), endDate: addDays(new Date(), 3), key: 'selection' }
    ])
    const [focusedRange, setFocusedRange] = useState([0, 0])
    const [hasUserSelectedHeaderDates, setHasUserSelectedHeaderDates] = useState(false)
    const [flexDays, setFlexDays] = useState(0)
    const [monthsDuration, setMonthsDuration] = useState(1)
    const [activeDateField, setActiveDateField] = useState(null)
    const [expandedFromScrolled, setExpandedFromScrolled] = useState(false)
    const [forceWhereOpen, setForceWhereOpen] = useState(false)
    const [forceWhoOpen, setForceWhoOpen] = useState(false)
    const [activeExpandedSection, setActiveExpandedSection] = useState(null)
    const [selectedDestination, setSelectedDestination] = useState(null)

    // Close any open popovers when the user starts scrolling the page
    useEffect(() => {
        let ticking = false
        const onScroll = () => {
            if (ticking) return
            ticking = true
            window.requestAnimationFrame(() => {
                // Close Where / Dates / Who
                setIsWhereOpen(false)
                setForceWhereOpen(false)
                setIsDatesOpen(false)
                setActiveDateField(null)
                setIsWhoOpen(false)
                setForceWhoOpen(false)
                setActiveExpandedSection(null)
                ticking = false
            })
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])
    const [selectedDates, setSelectedDates] = useState(null)
    const isAnyOpen = (isDatesOpen && activeDateTab === 'dates') || isWhoOpen || isWhereOpen

    // Ensure theme palette variables exist (for consistency with provided colors)
    useEffect(() => {
        const root = document.documentElement
        const set = (k, v) => { try { root.style.setProperty(k, v) } catch (_) { } }
        set('--linaria-theme_palette-bg-secondary', '#F7F7F7')
        set('--linaria-theme_palette-bg-secondary-core', 'linear-gradient(to right, #E61E4D 0%, #E31C5F 50%, #D70466 100%)')
        set('--linaria-theme_palette-bg-secondary-core-rtl', 'linear-gradient(to left, #E61E4D 0%, #E31C5F 50%, #D70466 100%)')
        set('--linaria-theme_palette-bg-secondary-plus', 'linear-gradient(to right, #BD1E59 0%, #92174D 50%, #861453 100%)')
        set('--linaria-theme_palette-bg-secondary-plus-rtl', 'linear-gradient(to left, #BD1E59 0%, #92174D 50%, #861453 100%)')
        set('--linaria-theme_palette-bg-secondary-luxe', 'linear-gradient(to right, #59086E 0%, #460479 50%, #440589 100%)')
        set('--linaria-theme_palette-bg-secondary-luxe-rtl', 'linear-gradient(to left, #59086E 0%, #460479 50%, #440589 100%)')
        set('--linaria-theme_palette-bg-secondary-core-hover', 'radial-gradient(circle at center, #FF385C 0%, #E61E4D 27.5%, #E31C5F 40%, #D70466 57.5%, #BD1E59 75%, #BD1E59 100%)')
        // Primary palette additions
        set('--linaria-theme_palette-bg-primary-plus', '#92174D')
        set('--linaria-theme_palette-bg-primary-inverse', '#222222')
        set('--linaria-theme_palette-bg-primary-inverse-hover', '#000000')
        set('--linaria-theme_palette-bg-primary-inverse-disabled', '#DDDDDD')
        set('--linaria-theme_palette-bg-primary-inverse-error', '#C13515')
        set('--linaria-theme_palette-bg-primary-inverse-error-hover', '#C13515')
    }, [])

    // Clear active date section styling when dates popover closes
    useEffect(() => {
        if (!isDatesOpen) {
            setActiveDateField(null)
        }
    }, [isDatesOpen])

    // Reset header expansion when all popovers are closed
    useEffect(() => {
        if (!isDatesOpen && !isWhereOpen && !isWhoOpen && expandedFromScrolled) {
            const timer = setTimeout(() => {
                // Only close if no section is actively being switched to
                if (!activeExpandedSection) {
                    setIsHeaderExpanded(false)
                    setExpandedFromScrolled(false)
                    setSelectedDestination(null)
                    setSelectedDates(null)
                }
            }, 500) // Increased delay to allow for smooth switching
            return () => clearTimeout(timer)
        }
    }, [isDatesOpen, isWhereOpen, isWhoOpen, expandedFromScrolled, activeExpandedSection])

    // Clear active section after a delay when no popovers are open
    useEffect(() => {
        if (!isDatesOpen && !isWhereOpen && !isWhoOpen && activeExpandedSection) {
            const timer = setTimeout(() => {
                setActiveExpandedSection(null)
            }, 1000) // Clear active section after 1 second of no activity
            return () => clearTimeout(timer)
        }
    }, [isDatesOpen, isWhereOpen, isWhoOpen, activeExpandedSection])

    // Reset header expansion when scrolling up (not scrolled)
    useEffect(() => {
        if (!isScrolled && isHeaderExpanded) {
            setIsHeaderExpanded(false)
            setExpandedFromScrolled(false)
            setActiveExpandedSection(null)
            setSelectedDestination(null)
            setSelectedDates(null)
        }
    }, [isScrolled, isHeaderExpanded])

    // Handle scroll behavior when header is expanded from scrolled state
    useEffect(() => {
        const handleScroll = () => {
            if (expandedFromScrolled && isScrolled) {
                // If user scrolls down while header is expanded from scrolled state,
                // collapse it back to scrolled state and close all popovers
                const scrollTop = window.scrollY
                if (scrollTop > 30) { // Reduced threshold for more responsive behavior
                    setIsHeaderExpanded(false)
                    setExpandedFromScrolled(false)
                    setActiveExpandedSection(null)
                    setSelectedDestination(null)
                    setSelectedDates(null)
                    // Close all popovers when scrolling
                    setIsDatesOpen(false)
                    setIsWhereOpen(false)
                    setIsWhoOpen(false)
                    setForceWhereOpen(false)
                    setForceWhoOpen(false)
                }
            }
        }

        if (expandedFromScrolled) {
            window.addEventListener('scroll', handleScroll, { passive: true })
            return () => window.removeEventListener('scroll', handleScroll)
        }
    }, [expandedFromScrolled, isScrolled])

    const validateGuestCounts = () => {
        if (adults < 1) setAdults(1)
        if (children < 0) setChildren(0)
        if (infants < 0) setInfants(0)
        if (pets < 0) setPets(0)
        if (totalGuests > MAX_GUESTS) {
            if (children > 0) setChildren(Math.max(0, MAX_GUESTS - adults))
            else setAdults(MAX_GUESTS)
        }
    }

    const resetGuestCounts = () => {
        setAdults(1)
        setChildren(0)
        setInfants(0)
        setPets(0)
    }

    const menuItems = [
        { title: "Messages", description: "Chat with guests and hosts" },
        { title: "Help Center", description: "Find answers to common questions" },
        { title: "Become a host", description: "Start hosting and earn income" },
        { title: "Refer a Host", description: "Invite and earn rewards" },
        { title: "Gift cards", description: "Buy or redeem gift cards" },
    ]

    const handleLoginClick = () => {
        navigate('/auth')
    }

    const handleBecomeHostClick = async () => {
        if (isAuthenticated) {
            const hostId = user?.id || user?.userId
            if (hostId) {
                try {
                    // Check if host ID exists in listings
                    const result = await checkHostListing(hostId)

                    if (result.exists) {
                        console.log(`Host ID ${hostId} already has a listing. Navigating to listings page.`)
                        navigate(`/listings/${hostId}`)
                    } else {
                        console.log(`Host ID ${hostId} does not have a listing. Showing host dialog.`)
                        setShowHostDialog(true)
                    }
                } catch (error) {
                    console.error('Error checking host listing:', error)
                    // Fallback to showing host dialog if check fails
                    setShowHostDialog(true)
                }
            } else {
                // Fallback to showing host dialog if no user ID available
                setShowHostDialog(true)
            }
        } else {
            navigate('/auth')
        }
    }

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-[60] bg-gradient-to-b from-white to-gray-100 border-b border-gray-200 w-full overflow-x-hidden transition-all duration-300 ease-in-out ${isScrolled ? 'py-2' : 'py-1.5'}`}>
                <nav className={`max-w-7xl mx-auto w-full px-3 sm:px-4 lg:px-6 transition-all duration-300 ease-in-out overflow-x-hidden ${isScrolled ? 'px-2 sm:px-3 lg:px-4' : 'px-3 sm:px-4 lg:px-6'}`}>
                    <div className={`flex items-center justify-between w-full max-w-full transition-all duration-300 ease-in-out ${isScrolled ? 'py-2.5 md:py-2 min-h-[80px] md:min-h-[60px]' : 'py-2 md:py-1.5 min-h-[84px] md:min-h-[56px]'}`}>
                        <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${isScrolled ? 'ml-2 sm:-ml-2 mt-1' : 'ml-2 sm:-ml-4'}`}>
                            <a href="/" className="flex items-center">
                                <svg
                                    className={`transition-all duration-300 ease-in-out ${isScrolled ? 'w-16 h-6 sm:w-24 sm:h-7 lg:w-28 lg:h-8' : 'w-16 h-6 sm:w-24 sm:h-8 lg:w-28 lg:h-8'}`}
                                    viewBox="0 0 3490 1080"
                                    style={{ display: 'block', color: '#ff385c' }}
                                >
                                    <path d="M1494.71 456.953C1458.28 412.178 1408.46 389.892 1349.68 389.892C1233.51 389.892 1146.18 481.906 1146.18 605.892C1146.18 729.877 1233.51 821.892 1349.68 821.892C1408.46 821.892 1458.28 799.605 1494.71 754.83L1500.95 810.195H1589.84V401.588H1500.95L1494.71 456.953ZM1369.18 736.895C1295.33 736.895 1242.08 683.41 1242.08 605.892C1242.08 528.373 1295.33 474.888 1369.18 474.888C1443.02 474.888 1495.49 529.153 1495.49 605.892C1495.49 682.63 1443.8 736.895 1369.18 736.895ZM1656.11 810.195H1750.46V401.588H1656.11V810.195ZM948.912 666.715C875.618 506.859 795.308 344.664 713.438 184.809C698.623 155.177 670.554 98.2527 645.603 67.8412C609.736 24.1733 556.715 0.779785 502.915 0.779785C449.115 0.779785 396.094 24.1733 360.227 67.8412C335.277 98.2527 307.207 155.177 292.392 184.809C210.522 344.664 130.212 506.859 56.9187 666.715C47.5621 687.769 24.9504 737.675 16.3736 760.289C6.2373 787.581 0.779297 817.213 0.779297 846.845C0.779297 975.509 101.362 1079.22 235.473 1079.22C346.193 1079.22 434.3 1008.26 502.915 934.18C571.53 1008.26 659.638 1079.22 770.357 1079.22C904.468 1079.22 1005.83 975.509 1005.83 846.845C1005.83 817.213 999.593 787.581 989.457 760.289C980.88 737.675 958.268 687.769 948.912 666.715ZM502.915 810.195C447.555 738.455 396.094 649.56 396.094 577.819C396.094 506.079 446.776 470.209 502.915 470.209C559.055 470.209 610.516 508.419 610.516 577.819C610.516 647.22 558.275 738.455 502.915 810.195ZM770.357 998.902C688.362 998.902 618.032 941.557 555.741 872.656C619.966 792.541 690.826 679.121 690.826 577.819C690.826 458.513 598.04 389.892 502.915 389.892C407.79 389.892 315.784 458.513 315.784 577.819C315.784 679.098 386.145 792.478 450.144 872.593C387.845 941.526 317.491 998.902 235.473 998.902C146.586 998.902 81.0898 931.061 81.0898 846.845C81.0898 826.57 84.2087 807.856 91.2261 788.361C98.2436 770.426 120.855 720.52 130.212 701.025C203.505 541.17 282.256 380.534 364.126 220.679C378.941 191.047 403.891 141.921 422.605 119.307C442.877 94.3538 470.947 81.0975 502.915 81.0975C534.883 81.0975 562.953 94.3538 583.226 119.307C601.939 141.921 626.89 191.047 641.704 220.679C723.574 380.534 802.325 541.17 875.618 701.025C884.975 720.52 907.587 770.426 914.604 788.361C921.622 807.856 925.52 826.57 925.52 846.845C925.52 931.061 859.244 998.902 770.357 998.902ZM3285.71 389.892C3226.91 389.892 3175.97 413.098 3139.91 456.953V226.917H3045.56V810.195H3134.45L3140.69 754.83C3177.12 799.605 3226.94 821.892 3285.71 821.892C3401.89 821.892 3489.22 729.877 3489.22 605.892C3489.22 481.906 3401.89 389.892 3285.71 389.892ZM3266.22 736.895C3191.6 736.895 3139.91 682.63 3139.91 605.892C3139.91 529.153 3191.6 474.888 3266.22 474.888C3340.85 474.888 3393.32 528.373 3393.32 605.892C3393.32 683.41 3340.07 736.895 3266.22 736.895ZM2827.24 389.892C2766.15 389.892 2723.56 418.182 2699.37 456.953L2693.13 401.588H2604.24V810.195H2698.59V573.921C2698.59 516.217 2741.47 474.888 2800.73 474.888C2856.87 474.888 2888.84 513.097 2888.84 578.599V810.195H2983.19V566.903C2983.19 457.733 2923.15 389.892 2827.24 389.892ZM1911.86 460.072L1905.62 401.588H1816.73V810.195H1911.08V604.332C1911.08 532.592 1954.74 486.585 2027.26 486.585C2042.85 486.585 2058.44 488.144 2070.92 492.043V401.588C2059.22 396.91 2044.41 395.35 2028.04 395.35C1978.58 395.35 1936.66 421.177 1911.86 460.072ZM2353.96 389.892C2295.15 389.892 2244.21 413.098 2208.15 456.953V226.917H2113.8V810.195H2202.69L2208.93 754.83C2245.36 799.605 2295.18 821.892 2353.96 821.892C2470.13 821.892 2557.46 729.877 2557.46 605.892C2557.46 481.906 2470.13 389.892 2353.96 389.892ZM2334.46 736.895C2259.84 736.895 2208.15 682.63 2208.15 605.892C2208.15 529.153 2259.84 474.888 2334.46 474.888C2409.09 474.888 2461.56 528.373 2461.56 605.892C2461.56 683.41 2408.31 736.895 2334.46 736.895ZM1703.28 226.917C1669.48 226.917 1642.08 254.326 1642.08 288.13C1642.08 321.934 1669.48 349.343 1703.28 349.343C1737.09 349.343 1764.49 321.934 1764.49 288.13C1764.49 254.326 1737.09 226.917 1703.28 226.917Z" fill="currentColor"></path>
                                </svg>
                            </a>
                        </div>

                        {/* Mobile center categories with labels */}
                        <div className="flex-1 md:hidden flex items-center justify-center gap-3 px-2 max-w-full overflow-hidden -mt-px">
                            <div className="flex items-center h-12 flex-col items-center">
                                <video className="w-12 h-12 rounded-full" playsInline poster="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-search-bar-icons/original/4aae4ed7-5939-4e76-b100-e69440ebeae4.png?im_w=240" preload="auto" autoPlay muted controls={false} disablePictureInPicture={true} controlsList="nodownload nofullscreen noremoteplayback" style={{ pointerEvents: 'none' }}>
                                    <source src="https://a0.muscache.com/videos/search-bar-icons/hevc/house-twirl-selected.mov" type='video/mp4; codecs="hvc1"' />
                                    <source src="https://a0.muscache.com/videos/search-bar-icons/webm/house-twirl-selected.webm" type="video/webm" />
                                </video>
                                <span className="text-[11px] -mt-1 text-gray-800 leading-none whitespace-nowrap">Homes</span>
                            </div>
                            <div className="flex items-center h-12 flex-col items-center -mt-px">
                                <video className="w-12 h-12 rounded-full" playsInline poster="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-search-bar-icons/original/e47ab655-027b-4679-b2e6-d1c99a5c33d.png?im_w=240" preload="auto" autoPlay muted controls={false} disablePictureInPicture={true} controlsList="nodownload nofullscreen noremoteplayback" style={{ pointerEvents: 'none' }}>
                                    <source src="https://a0.muscache.com/videos/search-bar-icons/hevc/balloon-twirl.mov" type='video/mp4; codecs="hvc1"' />
                                    <source src="https://a0.muscache.com/videos/search-bar-icons/webm/balloon-selected.webm" type="video/webm" />
                                </video>
                                <span className="text-[11px] -mt-1 text-gray-800 leading-none whitespace-nowrap">Experiences</span>
                            </div>
                            <div className="flex items-center h-12 flex-col items-center -mt-px">
                                <video className="w-12 h-12 rounded-full" playsInline poster="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-search-bar-icons/original/3d67e9a9-520a-49ee-b439-7b3a75ea814d.png?im_w=240" preload="auto" autoPlay muted controls={false} disablePictureInPicture={true} controlsList="nodownload nofullscreen noremoteplayback" style={{ pointerEvents: 'none' }}>
                                    <source src="https://a0.muscache.com/videos/search-bar-icons/hevc/consierge-twirl.mov" type='video/mp4; codecs="hvc1"' />
                                    <source src="https://a0.muscache.com/videos/search-bar-icons/webm/consierge-selected.webm" type="video/webm" />
                                </video>
                                <span className="text-[11px] -mt-1 text-gray-800 leading-none whitespace-nowrap">Services</span>
                            </div>
                        </div>

                        <div className={`hidden md:flex items-center space-x-2 lg:space-x-4 absolute left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-in-out ${isScrolled && !isHeaderExpanded ? 'opacity-0 scale-95 -translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`}>
                            <div className="flex items-center h-16">
                                <video className="w-16 h-16 lg:w-20 lg:h-20 rounded-full -mr-3 transition-transform duration-200 hover:scale-105" playsInline poster="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-search-bar-icons/original/4aae4ed7-5939-4e76-b100-e69440ebeae4.png?im_w=240" preload="auto" autoPlay muted controls={false} disablePictureInPicture={true} controlsList="nodownload nofullscreen noremoteplayback" style={{ pointerEvents: 'none' }}>
                                    <source src="https://a0.muscache.com/videos/search-bar-icons/hevc/house-twirl-selected.mov" type='video/mp4; codecs="hvc1"' />
                                    <source src="https://a0.muscache.com/videos/search-bar-icons/webm/house-twirl-selected.webm" type="video/webm" />
                                </video>
                                <button className="text-black font-medium px-3 py-2 rounded-2xl transition-colors duration-200 text-sm lg:text-base">
                                    Homes
                                </button>
                            </div>

                            <div className="flex items-center h-16">
                                <video className="w-16 h-16 lg:w-20 lg:h-20 rounded-full -mr-3 transition-transform duration-200 hover:scale-105" playsInline poster="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-search-bar-icons/original/e47ab655-027b-4679-b2e6-d1c99a5c33d.png?im_w=240" preload="auto" autoPlay muted controls={false} disablePictureInPicture={true} controlsList="nodownload nofullscreen noremoteplayback" style={{ pointerEvents: 'none' }}>
                                    <source src="https://a0.muscache.com/videos/search-bar-icons/hevc/balloon-twirl.mov" type='video/mp4; codecs="hvc1"' />
                                    <source src="https://a0.muscache.com/videos/search-bar-icons/webm/balloon-selected.webm" type="video/webm" />
                                </video>
                                <div className="relative flex items-center gap-2">
                                    <span className="absolute -top-2 -left-3 bg-slate-700 text-white text-[0.51rem] font-bold px-2 py-1 rounded-full shadow-sm [background:linear-gradient(357.5deg,#3e567c_1.59%,#3a5475_21.23%,#2d3c5b_58.6%,#809dc0_97.4%)] before:content-[''] before:absolute before:w-0 before:h-0 before:border-l-[4px] before:border-l-slate-700 before:border-r-[2px] before:border-r-transparent before:border-t-[2px] before:border-t-slate-700 before:border-b-[3px] before:border-b-transparent before:left-[4px] before:bottom-[-3px]">
                                        NEW
                                    </span>
                                    <button className="text-gray-500 font-normal px-3 py-2 rounded-2xl hover:text-black transition-all duration-200 text-sm lg:text-base">
                                        Experiences
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center h-16">
                                <video className="w-16 h-16 lg:w-20 lg:h-20 rounded-full -mr-3 transition-transform duration-200 hover:scale-105" playsInline poster="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-search-bar-icons/original/3d67e9a9-520a-49ee-b439-7b3a75ea814d.png?im_w=240" preload="auto" autoPlay muted controls={false} disablePictureInPicture={true} controlsList="nodownload nofullscreen noremoteplayback" style={{ pointerEvents: 'none' }}>
                                    <source src="https://a0.muscache.com/videos/search-bar-icons/hevc/consierge-twirl.mov" type='video/mp4; codecs="hvc1"' />
                                    <source src="https://a0.muscache.com/videos/search-bar-icons/webm/consierge-selected.webm" type="video/webm" />
                                </video>
                                <div className="relative flex items-center gap-2">
                                    <span className="absolute -top-2 -left-3 bg-slate-700 text-white text-[0.51rem] font-bold px-2 py-1 rounded-full shadow-sm [background:linear-gradient(357.5deg,#3e567c_1.59%,#3a5475_21.23%,#2d3c5b_58.6%,#809dc0_97.4%)] before:content-[''] before:absolute before:w-0 before:h-0 before:border-l-[4px] before:border-l-slate-700 before:border-r-[2px] before:border-r-transparent before:border-t-[2px] before:border-t-slate-700 before:border-b-[3px] before:border-b-transparent before:left-[4px] before:bottom-[-3px]">
                                        NEW
                                    </span>
                                    <button className="text-gray-500 font-normal px-3 py-2 rounded-2xl hover:text-black transition-all duration-200 text-sm lg:text-base">
                                        Services
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className={`hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2 transition-all duration-700 ease-out ${isScrolled && !isHeaderExpanded ? 'opacity-100 scale-100 translate-y-0 mt-1' : 'opacity-0 scale-95 translate-y-2'}`}>
                            <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1 group">
                                <div className="flex items-center mr-2">
                                    <video className="ml-1 w-12 h-12 rounded-full transition-transform duration-200 hover:scale-105" playsInline poster="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-search-bar-icons/original/4aae4ed7-5939-4e76-b100-e69440ebeae4.png?im_w=240" preload="auto" autoPlay muted controls={false} disablePictureInPicture={true} controlsList="nodownload nofullscreen noremoteplayback" style={{ pointerEvents: 'none' }}>
                                        <source src="https://a0.muscache.com/videos/search-bar-icons/hevc/house-twirl-selected.mov" type='video/mp4; codecs="hvc1"' />
                                        <source src="https://a0.muscache.com/videos/search-bar-icons/webm/house-twirl-selected.webm" type="video/webm" />
                                    </video>
                                </div>
                                <div 
                                    className="px-2 py-1 cursor-pointer hover:bg-gray-100 rounded-full transition-colors duration-200"
                                    onClick={() => {
                                        setIsHeaderExpanded(true)
                                        setExpandedFromScrolled(true)
                                        setActiveExpandedSection('where')
                                        // Close other popovers first
                                        setIsDatesOpen(false)
                                        setIsWhoOpen(false)
                                        setForceWhoOpen(false)
                                        // Then open the where popover
                                        setTimeout(() => {
                                            setIsWhereOpen(true)
                                            setForceWhereOpen(true)
                                        }, 50)
                                        // Set up where rect for proper positioning
                                        setTimeout(() => {
                                            try {
                                                const rect = whereRef.current?.getBoundingClientRect()
                                                if (rect) {
                                                    setWhereRect({
                                                        top: rect.top,
                                                        left: rect.left,
                                                        width: rect.width,
                                                        height: rect.height
                                                    })
                                                }
                                            } catch (_) { }
                                        }, 500)
                                    }}
                                >
                                    <span className="text-gray-900 font-medium text-base">Anywhere</span>
                                </div>
                                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                <div 
                                    className="px-2 py-1 cursor-pointer hover:bg-gray-100 rounded-full transition-colors duration-200"
                                    onClick={() => {
                                        setIsHeaderExpanded(true)
                                        setExpandedFromScrolled(true)
                                        setActiveExpandedSection('dates')
                                        // Close other popovers first
                                        setIsWhereOpen(false)
                                        setIsWhoOpen(false)
                                        setForceWhereOpen(false)
                                        setForceWhoOpen(false)
                                        // Then open the dates popover
                                        setTimeout(() => {
                                            setIsDatesOpen(true)
                                            setActiveDateTab('dates')
                                            setActiveDateField('checkin')
                                        }, 50)
                                        // Set up dates rect for proper positioning
                                        setTimeout(() => {
                                            try {
                                                const host = searchBarRef.current?.getBoundingClientRect()
                                                if (host) {
                                                    setDatesRect({ left: host.left, top: host.bottom + 8, width: host.width })
                                                }
                                            } catch (_) { }
                                        }, 500)
                                    }}
                                >
                                    <span className="text-gray-900 font-medium text-base">Anytime</span>
                                </div>
                                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                <div 
                                    className="px-2 py-1 cursor-pointer hover:bg-gray-100 rounded-full transition-colors duration-200"
                                    onClick={() => {
                                        setIsHeaderExpanded(true)
                                        setExpandedFromScrolled(true)
                                        setActiveExpandedSection('who')
                                        // Close other popovers first
                                        setIsDatesOpen(false)
                                        setIsWhereOpen(false)
                                        setForceWhereOpen(false)
                                        // Then open the who popover
                                        setTimeout(() => {
                                            setIsWhoOpen(true)
                                            setForceWhoOpen(true)
                                            // Ensure the who section is properly highlighted
                                            validateGuestCounts()
                                        }, 100)
                                        // Set up who rect for proper positioning
                                        setTimeout(() => {
                                            try {
                                                const rect = whoRef.current?.getBoundingClientRect()
                                                if (rect) {
                                                    setWhoRect({
                                                        top: rect.top,
                                                        left: rect.left,
                                                        width: rect.width,
                                                        height: rect.height
                                                    })
                                                }
                                            } catch (_) { }
                                        }, 500)
                                    }}
                                >
                                    <span className="text-gray-900 font-medium text-base">Add guests</span>
                                </div>
                                <button className="bg-red-500 hover:bg-red-600 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ml-2">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className={`flex items-center ml-auto transition-all duration-300 ease-in-out ${isScrolled ? 'space-x-2 sm:space-x-3 lg:space-x-3 mt-1' : 'space-x-2 sm:space-x-3 lg:space-x-4'}`}>
                            {isAuthenticated ? (
                                <button
                                    onClick={handleBecomeHostClick}
                                    className={`hidden sm:block text-black font-medium hover:bg-gray-100 rounded-2xl transition-all duration-300 ease-in-out ${isScrolled ? 'px-3 py-1.5 text-sm' : 'px-3 py-2 text-sm lg:text-base'}`}
                                >
                                    Become a host
                                </button>
                            ) : (
                                <button
                                    onClick={handleLoginClick}
                                    className={`hidden sm:block text-black font-medium hover:bg-gray-100 rounded-2xl transition-all duration-300 ease-in-out ${isScrolled ? 'px-3 py-1.5 text-sm' : 'px-3 py-2 text-sm lg:text-base'}`}
                                >
                                    Login
                                </button>
                            )}
                            <button className={`hidden md:flex bg-gray-100 rounded-full items-center justify-center hover:bg-gray-200 transition-all duration-300 ease-in-out flex-shrink-0 ${isScrolled ? 'w-8 h-8' : 'w-8 h-8 sm:w-10 sm:h-10'}`}>
                                <svg className={`text-black transition-all duration-300 ease-in-out ${isScrolled ? 'w-4 h-4' : 'w-4 h-4 sm:w-5 sm:h-5'}`} fill="currentColor" viewBox="0 0 17 17">
                                    <path d="M8 .25a7.77 7.77 0 0 1 7.75 7.78 7.75 7.75 0 0 1-7.52 7.72h-.25A7.75 7.75 0 0 1 .25 8.24v-.25A7.75 7.75 0 0 1 8 .25zm1.95 8.5h-3.9c.15 2.9 1.17 5.34 1.88 5.5H8c.68 0 1.72-2.37 1.93-5.23zm4.26 0h-2.76c-.09 1.96-.53 3.78-1.18 5.08A6.26 6.26 0 0 0 14.17 9zm-9.67 0H1.8a6.26 6.26 0 0 0 3.94 5.08 12.59 12.59 0 0 1-1.16-4.7l-.03-.38zm1.2-6.58-.12.05a6.26 6.26 0 0 0-3.83 5.03h2.75c.09-1.83.48-3.54 1.06-4.81zm2.25-.42c-.7 0-1.78 2.51-1.94 5.5h3.9c-.15-2.9-1.18-5.34-1.89-5.5h-.07zm2.28.43.03.05a12.95 12.95 0 0 1 1.15 5.02h2.75a6.28 6.28 0 0 0-3.93-5.07z"></path>
                                </svg>
                            </button>
                            <MenuButton menuItems={menuItems} onBecomeHostClick={handleBecomeHostClick} />
                        </div>
                    </div>

                    {/* Main Search Bar - Hidden when scrolled (Desktop) */}
                    <div className={`hidden md:flex justify-center transition-all duration-700 ease-out ${isScrolled && !isHeaderExpanded ? 'opacity-0 scale-95 -translate-y-8 h-0 overflow-hidden pb-0 pt-0' : 'opacity-100 scale-100 translate-y-0 h-auto pb-6 pt-4'}`}>
                        <div ref={searchBarRef} className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 max-w-4xl w-full group relative">
                            <Popover className="flex-1">
                                {({ open }) => {
                                    const isOpen = open || forceWhereOpen
                                    return (
                                    <div ref={whereRef} className={`rounded-full group relative ${isOpen ? 'bg-[#F5F5F5] shadow-sm' : 'cursor-pointer hover:bg-[#ebebeb] transition-colors duration-200'}`}>
                                        <Popover.Button as={Fragment}>
                                            <button type="button" className="w-full text-left px-6 py-3 outline-none" onClick={() => {
                                                try {
                                                    const rect = whereRef.current?.getBoundingClientRect()
                                                    if (rect) {
                                                        setWhereRect({
                                                            top: rect.top,
                                                            left: rect.left,
                                                            width: rect.width,
                                                            height: rect.height
                                                        })
                                                    }
                                                } catch (_) { }
                                                // Only set active section if expanded from scrolled
                                                if (expandedFromScrolled) {
                                                    setActiveExpandedSection('where')
                                                }
                                                setIsDatesOpen(false)
                                                // Close other popovers when switching
                                                setIsWhoOpen(false)
                                                setForceWhoOpen(false)
                                            }}>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-900 text-sm">Where</div>
                                    <div className="text-gray-600 text-sm flex items-center gap-2 flex-wrap">
                                        {selectedDestination ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-2 py-0.5 bg-white text-gray-700">
                                                {selectedDestination}
                                                <button
                                                    type="button"
                                                    aria-label="Clear destination"
                                                    className="text-gray-500 hover:text-gray-700"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        setSelectedDestination(null)
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ) : (
                                            'Search destinations'
                                        )}
                                    </div>
                                </div>
                                            </button>
                                        </Popover.Button>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-400"
                                            enterFrom="opacity-0 -translate-y-6 scale-[0.9]"
                                            enterTo="opacity-100 translate-y-0 scale-100"
                                            leave="transition ease-in duration-250"
                                            leaveFrom="opacity-100 translate-y-0 scale-100"
                                            leaveTo="opacity-0 -translate-y-6 scale-[0.9]"
                                            show={isOpen}
                                            beforeEnter={() => setIsWhereOpen(true)}
                                            afterLeave={() => {
                                                setIsWhereOpen(false)
                                                setForceWhereOpen(false)
                                            }}
                                        >
                                            <Portal>
                                                <Popover.Panel static className="fixed z-[70]" style={{ 
                                                    left: (whereRect?.left ?? 0) + 'px', 
                                                    top: ((whereRect?.top ?? 0) + (whereRect?.height ?? 0) + 8) + 'px', 
                                                    width: `${Math.min((searchBarRef.current?.getBoundingClientRect()?.width || (whereRect?.width ?? 0)), Math.max((whereRect?.width ?? 0), 400))}px`,
                                                    position: 'fixed',
                                                    transform: 'translateZ(0)',
                                                    zIndex: 70
                                                }}>
                                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-[620px] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                                        <div className="text-gray-600 text-lg mb-2">Suggested destinations</div>
                                                        <div className="flex flex-col gap-4">
                                                            {[
                                                                { title: 'Islamabad, Pakistan', subtitle: 'For sights like Faisal Mosque', img: 'https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-hawaii-autosuggest-destination-icons-1/original/ef838e5e-251c-424a-85f8-cfb218717f75.png' },
                                                                { title: 'Nathia Gali, Pakistan', subtitle: 'A hidden gem', img: 'https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-hawaii-autosuggest-destination-icons-2/original/c23eddbf-55e4-4e3d-ab64-85c11f551be3.png' },
                                                                { title: 'Rawalpindi, Pakistan', subtitle: 'For its stunning architecture', img: 'https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-hawaii-autosuggest-destination-icons-1/original/2a08b260-09ac-40f4-9580-7d418cd0bb2f.png' },
                                                                { title: 'United Arab Emirates', subtitle: 'Popular beach destination', img: 'https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-hawaii-autosuggest-destination-icons-2/original/2ddfa4b7-298d-4c4a-95d1-dacb51ac741a.png' },
                                                                { title: 'Lahore, Pakistan', subtitle: 'For sights like Buckingham Palace', img: 'https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-hawaii-autosuggest-destination-icons-2/original/43b6be43-d8d8-4a97-9c17-e52b6e65ce66.png' },
                                                            ].map((item) => (
                                                                <button 
                                                                    key={item.title} 
                                                                    type="button" 
                                                                    className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 text-left"
                                                                    onClick={() => {
                                                                        setSelectedDestination(item.title)
                                                                        setIsWhereOpen(false)
                                                                        setForceWhereOpen(false)
                                                                    }}
                                                                >
                                                                    <img alt="" src={item.img} className="w-11 h-11 rounded-lg object-contain" />
                                                                    <div className="flex flex-col">
                                                                        <span className="text-base font-semibold text-gray-900">{item.title}</span>
                                                                        <span className="text-sm text-gray-600">{item.subtitle}</span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </Popover.Panel>
                                            </Portal>
                                        </Transition>
                            </div>
                                    )
                                }}
                            </Popover>
                            {/* Mobile Search - visible on small screens */}
                            <div className="md:hidden px-3 pb-1">
                                <button className="mx-auto w-full max-w-md flex items-center gap-3 bg-white border border-gray-200 rounded-full px-4 py-2.5 shadow-sm">
                                    <div className="bg-red-500 w-9 h-9 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="text-[15px] leading-tight text-gray-900">Where to?</div>
                                        <div className="text-[12px] text-gray-500">Anywhere • Any week • Add guests</div>
                                    </div>
                                </button>
                            </div>

                            {(() => { const hideSeparators = (isDatesOpen && activeDateTab === 'dates') || isWhoOpen || isWhereOpen; return (
                                <div className={`w-px h-8 bg-gray-300 group-hover:bg-transparent transition-all duration-200 ${hideSeparators ? 'opacity-0' : 'opacity-100'}`}></div>
                            ) })()}

                            <div ref={checkInRef} className={`flex-[0.3] px-6 py-2 cursor-pointer rounded-full group transition-all duration-300 ${activeDateField === 'checkin' && isDatesOpen ? 'bg-[#F5F5F5] shadow-sm scale-[1.01]' : 'hover:bg-[#ebebeb]'}`} onClick={() => {
                                try {
                                    const host = searchBarRef.current?.getBoundingClientRect()
                                    if (host) {
                                        setDatesRect({ left: host.left, top: host.bottom + 8, width: host.width })
                                    }
                                } catch (_) { }
                                setActiveExpandedSection('dates')
                                setFocusedRange([0, 0])
                                setIsDatesOpen(true)
                                setActiveDateTab('dates')
                                setActiveDateField('checkin')
                                // Close other popovers when switching
                                setIsWhereOpen(false)
                                setForceWhereOpen(false)
                                setIsWhoOpen(false)
                                setForceWhoOpen(false)
                            }}>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-900 text-sm">Check in</div>
                                    <div className="text-gray-600 text-sm flex items-center gap-2 flex-wrap">
                                        {selectedDates ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-2 py-0.5 bg-white text-gray-700">
                                                {format(selectedDates.startDate, 'MMM d')}
                                                <button
                                                    type="button"
                                                    aria-label="Clear dates"
                                                    className="text-gray-500 hover:text-gray-700"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        setSelectedDates(null)
                                                        setHasUserSelectedHeaderDates(false)
                                                        setRange([{ startDate: new Date(), endDate: addDays(new Date(), 3), key: 'selection' }])
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ) : (
                                            'Add dates'
                                        )}
                                    </div>
                                </div>
                            </div>

                            {(() => { const hideSeparators = (isDatesOpen && activeDateTab === 'dates') || isWhoOpen || isWhereOpen; return (
                                <div className={`w-px h-8 bg-gray-300 group-hover:bg-transparent transition-all duration-200 ${hideSeparators ? 'opacity-0' : 'opacity-100'}`}></div>
                            ) })()}

                            <div ref={checkOutRef} className={`flex-[0.3] px-6 py-2 cursor-pointer rounded-full group transition-all duration-300 ${activeDateField === 'checkout' && isDatesOpen ? 'bg-[#F5F5F5] shadow-sm scale-[1.01]' : 'hover:bg-[#ebebeb]'}`} onClick={() => {
                                try {
                                    const host = searchBarRef.current?.getBoundingClientRect()
                                    if (host) {
                                        setDatesRect({ left: host.left, top: host.bottom + 8, width: host.width })
                                    }
                                } catch (_) { }
                                setActiveExpandedSection('dates')
                                setFocusedRange([0, 1])
                                setIsDatesOpen(true)
                                setActiveDateTab('dates')
                                setActiveDateField('checkout')
                                // Close other popovers when switching
                                setIsWhereOpen(false)
                                setForceWhereOpen(false)
                                setIsWhoOpen(false)
                                setForceWhoOpen(false)
                            }}>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-900 text-sm">Check out</div>
                                    <div className="text-gray-600 text-sm flex items-center gap-2 flex-wrap">
                                        {selectedDates ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-2 py-0.5 bg-white text-gray-700">
                                                {format(selectedDates.endDate, 'MMM d')}
                                                <button
                                                    type="button"
                                                    aria-label="Clear dates"
                                                    className="text-gray-500 hover:text-gray-700"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        setSelectedDates(null)
                                                        setHasUserSelectedHeaderDates(false)
                                                        setRange([{ startDate: new Date(), endDate: addDays(new Date(), 3), key: 'selection' }])
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ) : (
                                            'Add dates'
                                        )}
                                    </div>
                                </div>
                            </div>

                            {(() => { const hideSeparators = (isDatesOpen && activeDateTab === 'dates') || isWhoOpen || isWhereOpen; return (
                                <div className={`w-px h-8 bg-gray-300 group-hover:bg-transparent transition-all duration-200 ${hideSeparators ? 'opacity-0' : 'opacity-100'}`}></div>
                            ) })()}

                            <Popover className="flex-1">
                                {({ open }) => {
                                    const isOpen = open || forceWhoOpen
                                    return (
                                    <div ref={whoRef} className={`px-6 py-2 rounded-full group flex items-center justify-between relative ${isOpen ? 'bg-[#F5F5F5] shadow-sm' : 'cursor-pointer hover:bg-[#ebebeb] transition-colors duration-200'}`}>
                                        <Popover.Button as={Fragment}>
                                            <button type="button" className="flex items-center justify-between w-full outline-none" onClick={() => {
                                                validateGuestCounts()
                                                try {
                                                    const rect = whoRef.current?.getBoundingClientRect()
                                                    if (rect) {
                                                        setWhoRect({
                                                            top: rect.top,
                                                            left: rect.left,
                                                            width: rect.width,
                                                            height: rect.height
                                                        })
                                                    }
                                                } catch (_) { }
                                                // Only set active section if expanded from scrolled
                                                if (expandedFromScrolled) {
                                                    setActiveExpandedSection('who')
                                                }
                                                setIsDatesOpen(false)
                                                // Close other popovers when switching
                                                setIsWhereOpen(false)
                                                setForceWhereOpen(false)
                                            }}>
                                                <div className="text-left">
                                                    <div className="font-semibold text-gray-900 text-sm">Who</div>
                                                    <div className="text-gray-600 text-sm flex items-center gap-2 flex-wrap">
                                                        {(adults !== 1 || children > 0 || infants > 0 || pets > 0) ? (
                                                            <>
                                                                {(adults !== 1 || children > 0) && (
                                                                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-2 py-0.5 bg-white text-gray-700">
                                                                        {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}
                                                                        <button
                                                                            type="button"
                                                                            aria-label="Clear guests"
                                                                            className="text-gray-500 hover:text-gray-700"
                                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAdults(1); setChildren(0); }}
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </span>
                                                                )}
                                                                {infants > 0 && (
                                                                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-2 py-0.5 bg-white text-gray-700">
                                                                        {infants} infant{infants !== 1 ? 's' : ''}
                                                                        <button
                                                                            type="button"
                                                                            aria-label="Clear infants"
                                                                            className="text-gray-500 hover:text-gray-700"
                                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setInfants(0); }}
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </span>
                                                                )}
                                                                {pets > 0 && (
                                                                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-2 py-0.5 bg-white text-gray-700">
                                                                        {pets} pet{pets !== 1 ? 's' : ''}
                                                                        <button
                                                                            type="button"
                                                                            aria-label="Clear pets"
                                                                            className="text-gray-500 hover:text-gray-700"
                                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPets(0); }}
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : 'Add guests'}
                                                    </div>
                                                </div>
                                                <span className={`bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 ml-5 ${isAnyOpen ? 'w-auto h-12 px-4 gap-2' : 'w-12 h-12'}`}
                                                    onClick={(e) => {
                                                        try { e.preventDefault(); e.stopPropagation(); } catch(_) {}
                                                        const cityParam = (selectedDestination || '').split(',')[0].trim();
                                                        const params = new URLSearchParams();
                                                        if (selectedDates) {
                                                            try {
                                                                params.set('check_in', format(selectedDates.startDate, 'yyyy-MM-dd'))
                                                                params.set('check_out', format(selectedDates.endDate, 'yyyy-MM-dd'))
                                                            } catch(_) {}
                                                        }
                                                        const totalGuestsCalc = Math.max(1, adults + children)
                                                        params.set('guests', String(totalGuestsCalc))
                                                        if (infants > 0) params.set('infants', String(infants))
                                                        if (pets > 0) params.set('pets', String(pets))
                                                        const pathCity = cityParam ? encodeURIComponent(cityParam) : 'all'
                                                        navigate(`/explore/${pathCity}?${params.toString()}`)
                                                    }}
                                                >
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                    {isAnyOpen && (
                                                        <span className="text-white font-semibold text-sm">Search</span>
                                                    )}
                                                </span>
                                            </button>
                                        </Popover.Button>

                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-400"
                                            enterFrom="opacity-0 -translate-y-6 scale-[0.9]"
                                            enterTo="opacity-100 translate-y-0 scale-100"
                                            leave="transition ease-in duration-250"
                                            leaveFrom="opacity-100 translate-y-0 scale-100"
                                            leaveTo="opacity-0 -translate-y-6 scale-[0.9]"
                                            show={isOpen}
                                            beforeEnter={() => setIsWhoOpen(true)}
                                            afterLeave={() => {
                                                setIsWhoOpen(false)
                                                setForceWhoOpen(false)
                                            }}
                                        >
                                            <Portal>
                                                <Popover.Panel static className="fixed z-[70]" style={{ 
                                                    left: (whoRect?.left ?? 0) + 'px', 
                                                    top: ((whoRect?.top ?? 0) + (whoRect?.height ?? 0) + 8) + 'px', 
                                                    width: `${Math.min((searchBarRef.current?.getBoundingClientRect()?.width || (whoRect?.width ?? 0)), Math.max((whoRect?.width ?? 0), 320))}px`,
                                                    position: 'fixed',
                                                    transform: 'translateZ(0)',
                                                    zIndex: 70
                                                }}>
                                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-5 max-h-[620px] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                                            <div className="flex-1">
                                                                <div className="text-gray-900 font-semibold text-base">Adults</div>
                                                                <div className="text-gray-500 text-sm">Age 13+</div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <button
                                                                    className={`w-9 h-9 rounded-full border flex items-center justify-center text-base font-semibold transition-all duration-200 ${adults <= 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100'}`}
                                                                    onClick={() => { if (adults > 1) setAdults(adults - 1) }}
                                                                    disabled={adults <= 1}
                                                                    type="button"
                                                                >
                                                                    −
                                                                </button>
                                                                <div className="w-8 text-center text-base font-semibold text-gray-900">{adults}</div>
                                                                <button
                                                                    className={`w-9 h-9 rounded-full border flex items-center justify-center text-base font-semibold transition-all duration-200 ${totalGuests >= MAX_GUESTS ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100'}`}
                                                                    onClick={() => { if (totalGuests < MAX_GUESTS) setAdults(adults + 1) }}
                                                                    disabled={totalGuests >= MAX_GUESTS}
                                                                    type="button"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                                            <div className="flex-1">
                                                                <div className="text-gray-900 font-semibold text-base">Children</div>
                                                                <div className="text-gray-500 text-sm">Ages 2–12</div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <button
                                                                    className={`w-9 h-9 rounded-full border flex items-center justify-center text-base font-semibold transition-all duration-200 ${children <= 0 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100'}`}
                                                                    onClick={() => { if (children > 0) setChildren(children - 1) }}
                                                                    disabled={children <= 0}
                                                                    type="button"
                                                                >
                                                                    −
                                                                </button>
                                                                <div className="w-8 text-center text-base font-semibold text-gray-900">{children}</div>
                                                                <button
                                                                    className={`w-9 h-9 rounded-full border flex items-center justify-center text-base font-semibold transition-all duration-200 ${totalGuests >= MAX_GUESTS ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100'}`}
                                                                    onClick={() => { if (totalGuests < MAX_GUESTS) setChildren(children + 1) }}
                                                                    disabled={totalGuests >= MAX_GUESTS}
                                                                    type="button"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                                            <div className="flex-1">
                                                                <div className="text-gray-900 font-semibold text-base">Infants</div>
                                                                <div className="text-gray-500 text-sm">Under 2</div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <button
                                                                    className={`w-9 h-9 rounded-full border flex items-center justify-center text-base font-semibold transition-all duration-200 ${infants <= 0 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100'}`}
                                                                    onClick={() => { if (infants > 0) setInfants(infants - 1) }}
                                                                    disabled={infants <= 0}
                                                                    type="button"
                                                                >
                                                                    −
                                                                </button>
                                                                <div className="w-8 text-center text-base font-semibold text-gray-900">{infants}</div>
                                                                <button
                                                                    className={`w-9 h-9 rounded-full border flex items-center justify-center text-base font-semibold transition-all duration-200 ${infants >= MAX_INFANTS ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100'}`}
                                                                    onClick={() => { if (infants < MAX_INFANTS) setInfants(infants + 1) }}
                                                                    disabled={infants >= MAX_INFANTS}
                                                                    type="button"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between py-3">
                                                            <div className="flex-1">
                                                                <div className="text-gray-900 font-semibold text-base">Pets</div>
                                                                <a className="text-gray-600 underline text-sm hover:text-gray-800 transition-colors" href="#" onClick={(e) => e.preventDefault()}>Bringing a service animal?</a>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <button
                                                                    className={`w-9 h-9 rounded-full border flex items-center justify-center text-base font-semibold transition-all duration-200 ${pets <= 0 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100'}`}
                                                                    onClick={() => { if (pets > 0) setPets(pets - 1) }}
                                                                    disabled={pets <= 0}
                                                                    type="button"
                                                                >
                                                                    −
                                                                </button>
                                                                <div className="w-8 text-center text-base font-semibold text-gray-900">{pets}</div>
                                                                <button className="w-9 h-9 rounded-full border border-gray-200 text-gray-300 cursor-not-allowed flex items-center justify-center text-base font-semibold" disabled type="button">+</button>
                                                            </div>
                                                        </div>
                                                        <div className="text-gray-500 text-sm mt-4 pt-3 border-t border-gray-100">This place has a maximum of {MAX_GUESTS} guests, not including infants. Pets aren't allowed.</div>
                                                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                                                            <button className="text-gray-600 hover:text-gray-800 text-base font-medium transition-colors" onClick={resetGuestCounts} type="button">Reset</button>
                                                            <Popover.Button as={Fragment}>
                                                                <button type="button" className="text-gray-900 hover:text-gray-700 text-base font-medium transition-colors">Close</button>
                                                            </Popover.Button>
                                                        </div>
                                                    </div>
                                                </Popover.Panel>
                                            </Portal>
                                        </Transition>
                                    </div>
                                    )
                                }}
                            </Popover>
                            {/* Backdrop for Where popover */}
                            {isWhereOpen && expandedFromScrolled && (
                                <div className="fixed inset-0 z-[65]" onClick={() => {
                                    setIsWhereOpen(false)
                                    setForceWhereOpen(false)
                                    setActiveExpandedSection(null)
                                    setSelectedDestination(null)
                                    setSelectedDates(null)
                                    // Close header after a short delay
                                    setTimeout(() => {
                                        setIsHeaderExpanded(false)
                                        setExpandedFromScrolled(false)
                                    }, 100)
                                }} />
                            )}
                            {/* Backdrop for Who popover */}
                            {isWhoOpen && expandedFromScrolled && (
                                <div className="fixed inset-0 z-[65]" onClick={() => {
                                    setIsWhoOpen(false)
                                    setForceWhoOpen(false)
                                    setActiveExpandedSection(null)
                                    setSelectedDestination(null)
                                    setSelectedDates(null)
                                    // Close header after a short delay
                                    setTimeout(() => {
                                        setIsHeaderExpanded(false)
                                        setExpandedFromScrolled(false)
                                    }, 100)
                                }} />
                            )}
                        </div>
                    </div>
                </nav>
            </header>
            {/* Dates/Months Popover */}
            {isDatesOpen && (
                <Portal>
                    <Transition
                        show={isDatesOpen}
                        as="div"
                            enter="transition ease-out duration-400"
                            enterFrom="opacity-0 -translate-y-6 scale-[0.9]"
                        enterTo="opacity-100 translate-y-0 scale-100"
                            leave="transition ease-in duration-250"
                        leaveFrom="opacity-100 translate-y-0 scale-100"
                            leaveTo="opacity-0 -translate-y-6 scale-[0.9]"
                        >
                        <div className="fixed z-[70]" style={{ 
                            left: (datesRect?.left ?? 0) + 'px', 
                            top: (datesRect?.top ?? 0) + 'px', 
                            width: (datesRect?.width ?? 560) + 'px',
                            position: 'fixed',
                            transform: 'translateZ(0)',
                            zIndex: 70
                        }}>
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                <div className="px-3 pt-3 w-full flex justify-center">
                                    <div className="inline-flex bg-gray-100 rounded-full p-1">
                                        <button className={`px-4 py-1 rounded-full text-sm font-medium ${activeDateTab === 'dates' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`} onClick={() => setActiveDateTab('dates')}>Dates</button>
                                        <button className={`px-4 py-1 rounded-full text-sm font-medium ${activeDateTab === 'months' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`} onClick={() => setActiveDateTab('months')}>Months</button>
                                    </div>
                                </div>
                                {activeDateTab === 'dates' ? (
                                    <div className="p-3 -mt-2">
                                        <div className="w-full -mt-1 flex items-start justify-center">
                                            <div className="scale-[0.93] origin-top">
                                                <DateRange
                                                    months={2}
                                                    direction="horizontal"
                                                    onChange={(item) => { 
                                                        setHasUserSelectedHeaderDates(true)
                                                        setRange([item.selection])
                                                        // Set selected dates for display
                                                        if (item.selection.startDate && item.selection.endDate) {
                                                            setSelectedDates({
                                                                startDate: item.selection.startDate,
                                                                endDate: item.selection.endDate
                                                            })
                                                        }
                                                    }}
                                                    moveRangeOnFirstSelection={false}
                                                    ranges={range}
                                                    focusedRange={focusedRange}
                                                    onRangeFocusChange={setFocusedRange}
                                                    showDateDisplay={false}
                                                />
                                            </div>
                                        </div>
                                        <div className="-mt-8 w-full flex items-center justify-center">
                                            <div className="flex items-center gap-2 flex-wrap px-1 pt-2">
                                                {[
                                                    { label: 'Exact dates', value: 0 },
                                                    { label: '± 1 day', value: 1 },
                                                    { label: '± 2 days', value: 2 },
                                                    { label: '± 3 days', value: 3 },
                                                    { label: '± 7 days', value: 7 },
                                                    { label: '± 14 days', value: 14 },
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => setFlexDays(opt.value)}
                                                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${flexDays === opt.value ? 'border-gray-900 text-gray-900 bg-gray-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 pt-3 px-2">
                                            <div className="text-xs text-gray-600">Flexibility: {flexDays === 0 ? 'Exact dates' : `± ${flexDays} day${flexDays > 1 ? 's' : ''}`}</div>
                                            <button className="text-gray-700 underline" onClick={() => { setHasUserSelectedHeaderDates(false); setRange([{ startDate: new Date(), endDate: addDays(new Date(), 3), key: 'selection' }]) }}>Clear dates</button>
                                            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg" onClick={() => setIsDatesOpen(false)}>Close</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 flex flex-col items-center">
                                        <div className="text-gray-900 text-lg font-medium mb-2">When’s your trip?</div>
                                        <div className="relative w-[420px] h-[280px] flex items-center justify-center cs-clean">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <CircularSlider
                                                    width={290}
                                                    min={1}
                                                    max={12}
                                                    initialValue={monthsDuration}
                                                    className="months-circular-slider"
                                                    knobColor="black"
                                                    knobSize={60}
                                                    progressColorFrom="#E61E4D"
                                                    progressColorTo="#D70466"
                                                    progressSize={60}
                                                    trackColor="#F7F7F7"
                                                    trackSize={60}
                                                    label=""
                                                    labelColor="transparent"
                                                    onChange={(val) =>
                                                        setMonthsDuration(Math.max(1, Number(val) || 1))
                                                    }
                                                />

                                            </div>
                                            <div className="absolute text-center">
                                                <div className="text-6xl font-semibold text-gray-900">{monthsDuration}</div>
                                                <div className="text-xl text-gray-600">months</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-gray-900 font-medium">{format(range[0].startDate, 'EEE, MMM d')} to {format(addDays(range[0].startDate, monthsDuration * 30), 'EEE, MMM d')}</div>
                                        <div className="flex items-center justify-end gap-3 w-full pt-6">
                                            <button className="-mt-10 text-gray-700 underline" onClick={() => { setMonthsDuration(1) }}>Reset</button>
                                            <button className="-mt-10 bg-gray-900 text-white px-4 py-2 rounded-lg" onClick={() => setIsDatesOpen(false)}>Close</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="fixed inset-0 z-[65]" onClick={() => {
                            setIsDatesOpen(false)
                            if (expandedFromScrolled) {
                                setActiveExpandedSection(null)
                                setSelectedDestination(null)
                                setSelectedDates(null)
                                // Close header after a short delay
                                setTimeout(() => {
                                    setIsHeaderExpanded(false)
                                    setExpandedFromScrolled(false)
                                }, 100)
                            }
                        }} />
                    </Transition>
                </Portal>
            )}
            {/* Dark backdrop overlay when header is expanded from scrolled state */}
            {isHeaderExpanded && expandedFromScrolled && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-[10] transition-opacity duration-300"
                    onClick={() => {
                        // Close all popovers and header when clicking backdrop
                        setIsDatesOpen(false)
                        setIsWhereOpen(false)
                        setIsWhoOpen(false)
                        setForceWhereOpen(false)
                        setForceWhoOpen(false)
                        setActiveExpandedSection(null)
                        setSelectedDestination(null)
                        setSelectedDates(null)
                        // Close header after a short delay
                        setTimeout(() => {
                            setIsHeaderExpanded(false)
                            setExpandedFromScrolled(false)
                        }, 100)
                    }}
                />
            )}

            <HostDialog
                showHostDialog={showHostDialog}
                setShowHostDialog={setShowHostDialog}
                selectedHostType={selectedHostType}
                setSelectedHostType={setSelectedHostType}
            />
        </>
    )
}

// Content wrapper component that adjusts spacing based on header state
export const ContentWrapper = ({ children, className = "" }) => {
    const { isScrolled, isHeaderExpanded } = useHeader()

    return (
        <div className={`transition-all duration-300 ease-in-out ${isScrolled && !isHeaderExpanded ? 'pt-8 md:pt-24' : 'pt-16 md:pt-40'} ${className}`}>
            {children}
        </div>
    )
}

// Main wrapper component that manages scroll state and provides it to both header and content
export const HeaderWithContent = ({ children }) => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            setIsScrolled(scrollTop > 0)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <HeaderContext.Provider value={{ isScrolled, isHeaderExpanded, setIsHeaderExpanded }}>
            <Header isScrolled={isScrolled} isHeaderExpanded={isHeaderExpanded} setIsHeaderExpanded={setIsHeaderExpanded} />
            {children}
        </HeaderContext.Provider>
    )
}

export default Header;
