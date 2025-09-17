import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import { Islamabad as IslamabadStatic, Rawalpindi as RawalpindiStatic } from './data'

function ImageCarousel({ images = [], height = 220 }) {
    const [index, setIndex] = useState(0)
    const total = images.length || 1
    const go = (next) => {
        setIndex((prev) => {
            const n = next ? prev + 1 : prev - 1
            if (n < 0) return 0
            if (n > total - 1) return total - 1
            return n
        })
    }
    const handleNavClick = (e) => {
        try {
            e.preventDefault()
            e.stopPropagation()
        } catch (_) { }
    }
    return (
        <div className="relative group mini-carousel" style={{ height: `${height}px` }}>
            <div className="overflow-hidden w-full h-full rounded-none">
                <div
                    className="flex w-full h-full transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${index * 100}%)` }}
                >
                    {(images.length ? images : [images]).map((src, i) => (
                        <img key={i} src={src} alt={`slide-${i}`} className="w-full h-full object-cover flex-shrink-0" />
                    ))}
                </div>
            </div>
            {total > 1 && (
                <>
                    <button type="button" className="mini-prev" onClick={(e) => { handleNavClick(e); go(false) }} onMouseDown={handleNavClick} aria-label="Previous" />
                    <button type="button" className="mini-next" onClick={(e) => { handleNavClick(e); go(true) }} onMouseDown={handleNavClick} aria-label="Next" />
                    <div className="mini-dots" onClick={handleNavClick} onMouseDown={handleNavClick}>
                        {images.map((_, i) => (
                            <button key={i} type="button" className={`mini-dot ${i === index ? 'active' : ''}`} onClick={(e) => { handleNavClick(e); setIndex(i) }} aria-label={`Go to slide ${i + 1}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

const cityToStatic = {
    Islamabad: IslamabadStatic,
    Rawalpindi: RawalpindiStatic,
}

function CityExplore() {
    const { city } = useParams()
    const location = useLocation()
    const qs = new URLSearchParams(location.search)
    const checkIn = qs.get('check_in')
    const checkOut = qs.get('check_out')
    const guests = parseInt(qs.get('guests') || '0') || 0
    const normalizedCity = useMemo(() => (city || '').trim(), [city])
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const perPage = 7

    useEffect(() => {
        let mounted = true
        const fetchListings = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await axios.get('http://localhost:5000/api/data/listing')
                const grouped = res?.data || {}
                let raw = []
                if (!normalizedCity || normalizedCity.toLowerCase() === 'all') {
                    for (const key of Object.keys(grouped)) {
                        const arr = Array.isArray(grouped[key]) ? grouped[key] : []
                        raw.push(...arr)
                    }
                } else {
                    raw = grouped[normalizedCity] || []
                }
                const filtered = Array.isArray(raw)
                    ? raw.filter((p) => {
                          const status = String(p?.status || '').toLowerCase()
                          const step = String(p?.current_step || p?.step || p?.stage || '').toLowerCase()
                          if (status) return status === 'published'
                          if (step) return step === 'publish' || step === 'finish' || step === 'published'
                          return true
                      })
                      .filter((p) => {
                          if (guests && Number(p?.guests || p?.max_guests || 0) > 0) {
                              return Number(p.guests || p.max_guests) >= guests
                          }
                          return true
                      })
                    : []
                if (mounted) setListings(filtered)
            } catch (e) {
                console.error('Failed to load listings', e)
                if (mounted) setError('Failed to load listings')
            } finally {
                if (mounted) setLoading(false)
            }
        }
        fetchListings()
        return () => {
            mounted = false
        }
        setPage(1)
    }, [normalizedCity])

    const defaultMapSrc = useMemo(() => {
        const staticArr = cityToStatic[normalizedCity]
        const embed = Array.isArray(staticArr) && staticArr.length > 0 ? staticArr[0]?.map : ''
        if (embed) return embed
        const q = encodeURIComponent(normalizedCity)
        return `https://www.google.com/maps?q=${q}&output=embed`
    }, [normalizedCity])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-40">
                <p className="text-red-500">{error}</p>
            </div>
        )
    }

    const totalPages = Math.max(1, Math.ceil(listings.length / perPage))
    const startIdx = (page - 1) * perPage
    const pageItems = listings.slice(startIdx, startIdx + perPage)

    const sliderSettings = {
        dots: true,
        arrows: true,
        infinite: false,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: false,
        autoplay: false,
    }

    const Pager = () => (
        <div className="flex items-center justify-center gap-3 mt-6 select-none">
            <button
                type="button"
                className={`w-24 -mt-2 h-24 text-3xl sm:w-12 sm:h-12 flex items-center justify-center rounded-full ${page === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
            >
                ‹
            </button>
            {(() => {
                const items = []
                const maxToShow = 5
                const showLast = totalPages > maxToShow
                const count = Math.min(totalPages, maxToShow)
                for (let i = 1; i <= count; i++) {
                    items.push(
                        <button
                            key={i}
                            type="button"
                            className={`w-12 h-12 flex items-center justify-center rounded-full ${page === i ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                            onClick={() => setPage(i)}
                        >
                            {i}
                        </button>
                    )
                }
                if (showLast) {
                    items.push(<span key="ellipsis" className="px-1 text-gray-500">…</span>)
                    items.push(
                        <button
                            key={totalPages}
                            type="button"
                            className={`w-24 -mt-2 h-24 text-3xl sm:w-12 sm:h-12 flex items-center justify-center rounded-full ${page === totalPages ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                            onClick={() => setPage(totalPages)}
                        >
                            {totalPages}
                        </button>
                    )
                }
                return items
            })()}
            <button
                type="button"
                className={`w-24 -mt-2 h-24 text-3xl sm:w-12 sm:h-12 flex items-center justify-center rounded-full ${page === totalPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
            >
                ›
            </button>
        </div>
    )

    return (
        <div className="mb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 py-3">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                    <h1 className="text-base sm:text-xl md:text-2xl font-semibold leading-snug">Explore amazing homes in {normalizedCity}</h1>
                    {/* Desktop/tablet homes count next to heading */}
                    <span className="hidden sm:inline text-sm md:text-base font-medium text-gray-600">{listings.length} homes</span>
                    {/* Mobile row: homes count + See all cities */}
                    <div className="flex sm:hidden items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-gray-600">{listings.length} homes</span>
                        <Link to="/" className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-gray-300 hover:bg-gray-50 text-xs font-medium">See all cities</Link>
                    </div>
                </div>
                {/* Desktop/tablet: See all cities on the right */}
                <Link to="/" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 hover:bg-gray-50 text-sm font-medium">See all cities</Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="min-h-[50vh] lg:col-span-7">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {pageItems.map((p) => {
                            const baseUploads = 'http://localhost:5000/uploads/'
                            let imageSrc = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2070&q=80'
                            const first = Array.isArray(p?.images) ? p.images[0] : null
                            if (first) {
                                if (typeof first === 'string') imageSrc = `${baseUploads}${first}`
                                else if (typeof first === 'object') {
                                    const objUrl = first.image_url || first.imageUrl || first.url || first.path
                                    imageSrc = objUrl ? (/^https?:\/\//.test(objUrl) ? objUrl : `${baseUploads}${objUrl}`) : imageSrc
                                }
                            } else if (p?.image_url || p?.image) {
                                const fallback = p.image_url || p.image
                                imageSrc = /^https?:\/\//.test(fallback) ? fallback : `${baseUploads}${fallback}`
                            }
                            const slides = []
                            slides.push(imageSrc)
                            if (Array.isArray(p?.images)) {
                                for (const img of p.images) {
                                    let src = ''
                                    if (typeof img === 'string') src = `${baseUploads}${img}`
                                    else if (typeof img === 'object') {
                                        const objUrl = img.image_url || img.imageUrl || img.url || img.path
                                        src = objUrl ? (/^https?:\/\//.test(objUrl) ? objUrl : `${baseUploads}${objUrl}`) : ''
                                    }
                                    if (src && !slides.includes(src)) slides.push(src)
                                }
                            }
                            return (
                                <Link key={p.id} to={`/products/${p.id}`} className="block">
                                    <div className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-white">
                                        <ImageCarousel images={slides} height={220} />
                                        <div className="p-3">
                                            <div className="text-gray-800 text-sm font-semibold line-clamp-1">{p.title}</div>
                                            <div className="text-gray-500 text-[12px] font-semibold">${Number(p.price_per_night).toFixed() || Number(p.price).toFixed(2) || '150'} for 2 nights</div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                        {pageItems.length === 0 && (
                            <div className="text-gray-600">No listings found for {normalizedCity}.</div>
                        )}
                    </div>
                    <Pager />
                </div>
                <div className="hidden lg:block lg:col-span-5">
                    <div className="sticky-element">
                        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                            <iframe
                                title={`${normalizedCity} map`}
                                src={defaultMapSrc}
                                width="100%"
                                height="500"
                                style={{ border: 0 }}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CityExplore