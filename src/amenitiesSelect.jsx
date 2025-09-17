import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import HostWrapper from './HostWrapper';

function AmenitiesSelect({ onSaveAndExit, onNext, onBack, isSaving, hostId, onAmenitiesDataChange, progress, setProgress }) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    if (!isAuthenticated) return null;

    const [isMounted, setIsMounted] = useState(false);
    const [animationsDone, setAnimationsDone] = useState(false);

    useEffect(() => {
        const p = setTimeout(() => setProgress((prev) => Math.max(prev, 41)), 50);
        const m = setTimeout(() => setIsMounted(true), 0);
        return () => { clearTimeout(p); clearTimeout(m); };
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        const totalMs = 12 * 40 + 700;
        const doneTimer = setTimeout(() => setAnimationsDone(true), totalMs + 50);
        return () => clearTimeout(doneTimer);
    }, [isMounted]);

    const svgs = {
        wifi: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 8.5h.01M9 3v6l3-3 3 3V3M5 12h14M8 16h8M6 20h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        tv: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/><line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/></svg>',
        kitchen: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 2v7c0 1.1.9 2 2 2h4v11a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V11h4c1.1 0 2-.9 2-2V2H3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        washer: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="2"/><path d="M20 12c0 4.4-3.6 8-8 8s-8-3.6-8-8" stroke="currentColor" stroke-width="2"/></svg>',
        free_parking: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><path d="M7 7h10v4H7z" stroke="currentColor" stroke-width="2"/><path d="M7 15h6" stroke="currentColor" stroke-width="2"/></svg>',
        paid_parking: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><path d="M7 7h10v4H7z" stroke="currentColor" stroke-width="2"/><path d="M7 15h6" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="17" r="2" stroke="currentColor" stroke-width="2"/></svg>',
        pool: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12c0 5.5 4.5 10 10 10s10-4.5 10-10S17.5 2 12 2 2 6.5 2 12z" stroke="currentColor" stroke-width="2"/><path d="M8 12h8" stroke="currentColor" stroke-width="2"/><path d="M6 8h12" stroke="currentColor" stroke-width="2"/><path d="M6 16h12" stroke="currentColor" stroke-width="2"/></svg>',
        hot_tub: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><path d="M7 9h10" stroke="currentColor" stroke-width="2"/><path d="M7 13h10" stroke="currentColor" stroke-width="2"/><path d="M7 17h10" stroke="currentColor" stroke-width="2"/></svg>',
        patio: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21h18" stroke="currentColor" stroke-width="2"/><path d="M5 21V7l7-4 7 4v14" stroke="currentColor" stroke-width="2"/><path d="M9 9v12" stroke="currentColor" stroke-width="2"/><path d="M15 9v12" stroke="currentColor" stroke-width="2"/></svg>',
        bbq: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><path d="M9 9h6v6H9z" stroke="currentColor" stroke-width="2"/><path d="M12 3v18" stroke="currentColor" stroke-width="2"/></svg>',
        outdoor_dining: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><path d="M8 8h8v8H8z" stroke="currentColor" stroke-width="2"/><path d="M12 3v18" stroke="currentColor" stroke-width="2"/></svg>',
        fire_pit: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M8 12c0-2 2-4 4-4s4 2 4 4" stroke="currentColor" stroke-width="2"/><path d="M12 8v8" stroke="currentColor" stroke-width="2"/></svg>',
        pool_table: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="12" r="2" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="12" r="2" stroke="currentColor" stroke-width="2"/><path d="M12 8v8" stroke="currentColor" stroke-width="2"/></svg>',
        indoor_fireplace: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21h18" stroke="currentColor" stroke-width="2"/><path d="M5 21V7l7-4 7 4v14" stroke="currentColor" stroke-width="2"/><path d="M9 12c0-1.5 1.5-3 3-3s3 1.5 3 3" stroke="currentColor" stroke-width="2"/></svg>',
        piano: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><path d="M8 8v8" stroke="currentColor" stroke-width="2"/><path d="M16 8v8" stroke="currentColor" stroke-width="2"/><path d="M12 8v8" stroke="currentColor" stroke-width="2"/></svg>',
        smoke_alarm: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="2"/><path d="M12 2v4" stroke="currentColor" stroke-width="2"/><path d="M12 18v4" stroke="currentColor" stroke-width="2"/><path d="M2 12h4" stroke="currentColor" stroke-width="2"/><path d="M18 12h4" stroke="currentColor" stroke-width="2"/></svg>',
        first_aid: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><path d="M12 8v8" stroke="currentColor" stroke-width="2"/><path d="M8 12h8" stroke="currentColor" stroke-width="2"/></svg>',
        extinguisher: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2h12l-1 20H7L6 2z" stroke="currentColor" stroke-width="2"/><path d="M10 6h4" stroke="currentColor" stroke-width="2"/><path d="M12 2v4" stroke="currentColor" stroke-width="2"/></svg>',
        carbon_monoxide: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="2"/><path d="M12 2v4" stroke="currentColor" stroke-width="2"/><path d="M12 18v4" stroke="currentColor" stroke-width="2"/><path d="M2 12h4" stroke="currentColor" stroke-width="2"/><path d="M18 12h4" stroke="currentColor" stroke-width="2"/></svg>',
    };

    const favorites = useMemo(() => [
        { key: 'wifi', label: 'Wifi', svg: svgs.wifi },
        { key: 'tv', label: 'TV', svg: svgs.tv },
        { key: 'kitchen', label: 'Kitchen', svg: svgs.kitchen },
        { key: 'washer', label: 'Washer', svg: svgs.washer },
        { key: 'free_parking', label: 'Free parking on premises', svg: svgs.free_parking },
        { key: 'paid_parking', label: 'Paid parking on premises', svg: svgs.paid_parking },
    ], []);

    const standout = useMemo(() => [
        { key: 'pool', label: 'Pool', svg: svgs.pool },
        { key: 'hot_tub', label: 'Hot tub', svg: svgs.hot_tub },
        { key: 'patio', label: 'Patio', svg: svgs.patio },
        { key: 'bbq', label: 'BBQ grill', svg: svgs.bbq },
        { key: 'outdoor_dining', label: 'Outdoor dining area', svg: svgs.outdoor_dining },
        { key: 'fire_pit', label: 'Fire pit', svg: svgs.fire_pit },
        { key: 'pool_table', label: 'Pool table', svg: svgs.pool_table },
        { key: 'indoor_fireplace', label: 'Indoor fireplace', svg: svgs.indoor_fireplace },
        { key: 'piano', label: 'Piano', svg: svgs.piano },
    ], []);

    const safety = useMemo(() => [
        { key: 'smoke_alarm', label: 'Smoke alarm', svg: svgs.smoke_alarm },
        { key: 'first_aid', label: 'First aid kit', svg: svgs.first_aid },
        { key: 'extinguisher', label: 'Fire extinguisher', svg: svgs.extinguisher },
        { key: 'carbon_monoxide', label: 'Carbon monoxide alarm', svg: svgs.carbon_monoxide },
    ], []);

    const [selected, setSelected] = useState(new Set());
    const toggle = (key) => {
        setSelected((prev) => {
            const s = new Set(prev);
            if (s.has(key)) s.delete(key); else s.add(key);
            return s;
        });
    };

    // Function to notify parent component of amenities data changes
    const notifyAmenitiesDataChange = useCallback(() => {
        if (onAmenitiesDataChange) {
            onAmenitiesDataChange(Array.from(selected));
        }
    }, [selected, onAmenitiesDataChange]);

    // Notify parent when selected amenities change
    useEffect(() => {
        notifyAmenitiesDataChange();
    }, [notifyAmenitiesDataChange]);

    const Item = ({ item, delay }) => (
        <button
            onClick={() => toggle(item.key)}
            className={`text-left border rounded-2xl p-5 transition-colors ${selected.has(item.key) ? 'border-gray-800 bg-gray-50' : 'border-gray-300 hover:border-gray-800'} will-change-transform`}
            style={!isMounted ? { opacity: 0, transform: 'translateY(20px) scale(0.99)' } : animationsDone ? { opacity: 1, transform: 'none' } : { animation: 'card-in 700ms cubic-bezier(0.2,0.8,0.2,1) both', animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center gap-3">
                <div className="w-[32px] h-[32px]" dangerouslySetInnerHTML={{ __html: item.svg }} />
                <div className="font-medium text-gray-900">{item.label}</div>
            </div>
        </button>
    );

    return (
        <div className="min-h-screen bg-white">
            <style>{`
            @keyframes card-in { 0% { opacity: 0; transform: translateY(20px) scale(0.99);} 100% { opacity:1; transform: translateY(0) scale(1);} }
            `}</style>

            <div className="flex items-center justify-between px-8 py-4">
                <div className="w-8 h-8">
                    <svg onClick={() => navigate('/')} className="w-20 h-6 sm:w-24 sm:h-8 lg:w-28 lg:h-8" viewBox="0 0 3490 1080" style={{ display: 'block', color: '#ff385c', cursor: 'pointer' }}>
                        <path d="M1494.71 456.953..." fill="currentColor"></path>
                    </svg>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full hover:bg-gray-100 font-semibold">Questions?</button>
                    <button 
                        className={`px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full hover:bg-gray-100 font-semibold transition-colors ${
                            isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                        }`}
                        onClick={onSaveAndExit}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save & exit'}
                    </button>
                </div>
            </div>

            <div className="max-w-[55rem] mx-auto px-6">
                <h1 className="text-[2rem] font-semibold text-gray-900">Tell guests what your place has to offer</h1>
                <p className="text-gray-600 mt-2">You can add more amenities after you publish your listing.</p>

                <div className="mt-8">
                    <div className="text-lg font-semibold mb-3">What about these guest favorites?</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {favorites.map((it, i) => (<Item key={it.key} item={it} delay={i * 40} />))}
                    </div>
                </div>

                <div className="mt-10">
                    <div className="text-lg font-semibold mb-3">Do you have any standout amenities?</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {standout.map((it, i) => (<Item key={it.key} item={it} delay={i * 40} />))}
                    </div>
                </div>

                <div className="mt-10 mb-24">
                    <div className="text-lg font-semibold mb-3">Do you have any of these safety items?</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {safety.map((it, i) => (<Item key={it.key} item={it} delay={i * 40} />))}
                    </div>
                </div>
            </div>

            <div className="fixed left-0 right-0 bottom-0 bg-white border-t">
                <div className="h-1 w-full bg-gray-300 relative overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-black transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>

                <div className="flex items-center justify-between px-8 py-4">
                    <button onClick={onBack} className="text-gray-800 font-semibold underline">Back</button>
                    <button 
                        onClick={onNext}
                        disabled={isSaving}
                        className={`px-8 py-3 rounded-lg transition-colors ${
                            isSaving 
                                ? 'bg-black/30 text-white/70 cursor-not-allowed' 
                                : 'bg-black text-white'
                        }`}
                    >
                        {isSaving ? 'Saving...' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AmenitiesSelect;


