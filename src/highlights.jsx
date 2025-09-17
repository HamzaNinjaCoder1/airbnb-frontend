import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';

function HighlightsStep() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const hostId = searchParams.get('hostId') || user?.id;
    const listingId = searchParams.get('listingId');

    const [progress, setProgress] = useState(53);
    const [isMounted, setIsMounted] = useState(false);
    const [selected, setSelected] = useState(new Set());

    useEffect(() => {
        const m = setTimeout(() => setIsMounted(true), 0);
        const t = setTimeout(() => setProgress(p => Math.max(p, 59)), 60);
        return () => { clearTimeout(m); clearTimeout(t); };
    }, []);

    const svgs = {
        rare: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 24px; width: 24px; fill: currentcolor;"><path d="M24 3a1 1 0 0 1 .72.31l.08.09 6 8a1 1 0 0 1 .04 1.15l-.08.1-14 16.5a1 1 0 0 1-1.44.08l-.08-.08-14-16.5a1 1 0 0 1-.1-1.15l.06-.1 6-8a1 1 0 0 1 .68-.4H24zm-2.57 10H10.57L16 24.63 21.43 13zM8.36 13h-4.2l9.34 11-5.14-11zm19.48 0h-4.2L18.5 24l9.34-11zM12.6 5H8.5L4 11h4.47l4.13-6zm10.9 0h-4.1l4.13 6H28l-4.5-6zm-6.53 0h-1.94l-4.13 6h10.2l-4.13-6z"></path></svg>',
        rustic: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 24px; width: 24px; fill: currentcolor;"><path d="M31 6v2h-1v23h-6V13H8v18H2V8H1V6zm-15.37 9 .96.7c3.32 2.42 5.14 5.06 5.38 7.93l.02.28v.21l.01.14c0 3.18-2.7 5.74-6 5.74a5.9 5.9 0 0 1-5.99-5.39v-.21l-.01-.15a9.3 9.3 0 0 1 1.64-4.99l.22-.34.68-.98 1.24.79zM28 8H4v21h2V13a2 2 0 0 1 1.7-1.98l.15-.01L8 11h16a2 2 0 0 1 2 1.85V29h2zM16 25.36l-.1.09c-.61.65-.9 1.23-.9 1.72 0 .42.41.83 1 .83s1-.4 1-.83c0-.45-.24-.97-.76-1.56l-.15-.16zm.35-7.32-1.77 3.56-1.46-.93-.15.27a7.28 7.28 0 0 0-.94 2.75l-.02.29-.01.26v.12c.03.92.4 1.76 1.03 2.4.14-1.14.86-2.24 2.1-3.33l.23-.2.64-.53.64.53c1.38 1.16 2.19 2.32 2.33 3.53A3.6 3.6 0 0 0 20 24.49l.01-.22V24c-.1-1.86-1.12-3.7-3.13-5.5l-.27-.24zM31 2v2H1V2z"></path></svg>',
        nature: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 24px; width: 24px; fill: currentcolor;"><path d="M16 1a5 5 0 0 1 5 5 5 5 0 0 1 0 10 5 5 0 0 1-4 4.9v4.29A9.04 9.04 0 0 1 23.95 22a8.94 8.94 0 0 1 3.74.81l.31.15v2.33A6.96 6.96 0 0 0 23.95 24a6.88 6.88 0 0 0-6.93 5.87l-.02.15v.1a1 1 0 0 1-.88.87L16 31a1 1 0 0 1-.97-.77l-.02-.12A6.95 6.95 0 0 0 7.97 24 6.96 6.96 0 0 0 4 25.23v-2.31a9.16 9.16 0 0 1 11 2.3V20.9a5 5 0 0 1-4-4.68V16h-.22a5 5 0 0 1 0-10H11v-.22A5 5 0 0 1 16 1zm2.86 14.1a4.98 4.98 0 0 1-5.72 0l-.07.23a3 3 0 1 0 5.85 0zM11 8a3 3 0 1 0 .67 5.93l.23-.07A4.98 4.98 0 0 1 11 11c0-1.06.33-2.05.9-2.86l-.23-.07A3.01 3.01 0 0 0 11 8zm10 0c-.23 0-.45.03-.67.07l-.23.07c.57.8.9 1.8.9 2.86a4.98 4.98 0 0 1-.9 2.86l.23.07A3 3 0 1 0 21 8zm-5 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0-5a3 3 0 0 0-2.93 3.67l.07.23a4.98 4.98 0 0 1 5.72 0l.07-.23A3 3 0 0 0 16 3z"></path></svg>',
        memorable: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 24px; width: 24px; fill: currentcolor;"><path d="M27 3a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM8.89 19.04l-.1.08L3 24.92V25a2 2 0 0 0 1.85 2H18.1l-7.88-7.88a1 1 0 0 0-1.32-.08zm12.5-6-.1.08-7.13 7.13L20.92 27H27a2 2 0 0 0 2-1.85v-5.73l-6.3-6.3a1 1 0 0 0-1.31-.08zM27 5H5a2 2 0 0 0-2 2v15.08l4.38-4.37a3 3 0 0 1 4.1-.14l.14.14 1.13 1.13 7.13-7.13a3 3 0 0 1 4.1-.14l.14.14L29 16.59V7a2 2 0 0 0-1.85-2zM8 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"></path></svg>',
        romantic: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 24px; width: 24px; fill: currentcolor;"><path d="M28 2a2 2 0 0 1 2 1.85V28a2 2 0 0 1-1.85 2H4a2 2 0 0 1-2-1.85V4a2 2 0 0 1 1.85-2H4zM13.59 17H4v11h11v-9.59l-4.3 4.3-1.4-1.42zM28 17h-9.59l4.3 4.3-1.42 1.4L17 18.42V28h11zM15 4H4v11h3.54a4 4 0 0 1 6.28-4.84c.29.28.68.85 1.18 1.74zm6 7c-.53 0-.98.17-1.42.6-.21.2-.63.87-1.22 1.98l-.25.47-.5.95H21a2 2 0 0 0 1.98-1.7l.01-.15L23 13a2 2 0 0 0-2-2zm7-7H17v7.9c.5-.89.89-1.46 1.18-1.74A4 4 0 0 1 24.46 15H28zm-17 7a2 2 0 0 0-2 2v.15A2 2 0 0 0 11 15h3.38l-.49-.95-.36-.69c-.54-.98-.91-1.58-1.1-1.76-.45-.43-.9-.6-1.43-.6z"></path></svg>',
        historic: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 24px; width: 24px; fill: currentcolor;"><path d="M24 1H8a5 5 0 0 0-5 5 5 5 0 0 0 4 4.9V29c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V10.9A5 5 0 0 0 24 1zm0 8h-1v20H9V9H8a3 3 0 0 1 0-6h16a3 3 0 0 1 0 6zM11 8h10v19h-2V10h-2v17h-2V10h-2v17h-2V8zM9 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm16 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path></svg>'
    };

    const options = [
        { key: 'rare', label: 'Rare', svg: svgs.rare },
        { key: 'rustic', label: 'Rustic', svg: svgs.rustic },
        { key: 'nature', label: 'In nature', svg: svgs.nature },
        { key: 'memorable', label: 'Memorable', svg: svgs.memorable },
        { key: 'romantic', label: 'Romantic', svg: svgs.romantic },
        { key: 'historic', label: 'Historic', svg: svgs.historic }
    ];

    const toggle = (key) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else if (next.size < 2) {
                next.add(key);
            }
            return next;
        });
    };

    const isNextEnabled = selected.size > 0;

    return (
        <div className="min-h-screen ml-20 bg-white">
            <div className="flex items-center justify-between px-8 py-4">
                <svg onClick={() => navigate('/')}
                    className={`w-20 h-6 sm:w-24 sm:h-8 lg:w-28 lg:h-8 transition-all -ml-20 duration-500 ${'scale-100'}`}
                    viewBox="0 0 3490 1080"
                    style={{ display: 'block', color: '#ff385c', cursor: 'pointer' }}
                >
                    <path d="M1494.71 456.953C1458.28 412.178 1408.46 389.892 1349.68 389.892C1233.51 389.892 1146.18 481.906 1146.18 605.892C1146.18 729.877 1233.51 821.892 1349.68 821.892C1408.46 821.892 1458.28 799.605 1494.71 754.83L1500.95 810.195H1589.84V401.588H1500.95L1494.71 456.953ZM1369.18 736.895C1295.33 736.895 1242.08 683.41 1242.08 605.892C1242.08 528.373 1295.33 474.888 1369.18 474.888C1443.02 474.888 1495.49 529.153 1495.49 605.892C1495.49 682.63 1443.8 736.895 1369.18 736.895ZM1656.11 810.195H1750.46V401.588H1656.11V810.195ZM948.912 666.715C875.618 506.859 795.308 344.664 713.438 184.809C698.623 155.177 670.554 98.2527 645.603 67.8412C609.736 24.1733 556.715 0.779785 502.915 0.779785C449.115 0.779785 396.094 24.1733 360.227 67.8412C335.277 98.2527 307.207 155.177 292.392 184.809C210.522 344.664 130.212 506.859 56.9187 666.715C47.5621 687.769 24.9504 737.675 16.3736 760.289C6.2373 787.581 0.779297 817.213 0.779297 846.845C0.779297 975.509 101.362 1079.22 235.473 1079.22C346.193 1079.22 434.3 1008.26 502.915 934.18C571.53 1008.26 659.638 1079.22 770.357 1079.22C904.468 1079.22 1005.83 975.509 1005.83 846.845C1005.83 817.213 999.593 787.581 989.457 760.289C980.88 737.675 958.268 687.769 948.912 666.715ZM502.915 810.195C447.555 738.455 396.094 649.56 396.094 577.819C396.094 506.079 446.776 470.209 502.915 470.209C559.055 470.209 610.516 508.419 610.516 577.819C610.516 647.22 558.275 738.455 502.915 810.195ZM770.357 998.902C688.362 998.902 618.032 941.557 555.741 872.656C619.966 792.541 690.826 679.121 690.826 577.819C690.826 458.513 598.04 389.892 502.915 389.892C407.79 389.892 315.784 458.513 315.784 577.819C315.784 679.098 386.145 792.478 450.144 872.593C387.845 941.526 317.491 998.902 235.473 998.902C146.586 998.902 81.0898 931.061 81.0898 846.845C81.0898 826.57 84.2087 807.856 91.2261 788.361C98.2436 770.426 120.855 720.52 130.212 701.025C203.505 541.17 282.256 380.534 364.126 220.679C378.941 191.047 403.891 141.921 422.605 119.307C442.877 94.3538 470.947 81.0975 502.915 81.0975C534.883 81.0975 562.953 94.3538 583.226 119.307C601.939 141.921 626.89 191.047 641.704 220.679C723.574 380.534 802.325 541.17 875.618 701.025C884.975 720.52 907.587 770.426 914.604 788.361C921.622 807.856 925.52 826.57 925.52 846.845C925.52 931.061 859.244 998.902 770.357 998.902ZM3285.71 389.892C3226.91 389.892 3175.97 413.098 3139.91 456.953V226.917H3045.56V810.195H3134.45L3140.69 754.83C3177.12 799.605 3226.94 821.892 3285.71 821.892C3401.89 821.892 3489.22 729.877 3489.22 605.892C3489.22 481.906 3401.89 389.892 3285.71 389.892ZM3266.22 736.895C3191.6 736.895 3139.91 682.63 3139.91 605.892C3139.91 529.153 3191.6 474.888 3266.22 474.888C3340.85 474.888 3393.32 528.373 3393.32 605.892C3393.32 683.41 3340.07 736.895 3266.22 736.895ZM2827.24 389.892C2766.15 389.892 2723.56 418.182 2699.37 456.953L2693.13 401.588H2604.24V810.195H2698.59V573.921C2698.59 516.217 2741.47 474.888 2800.73 474.888C2856.87 474.888 2888.84 513.097 2888.84 578.599V810.195H2983.19V566.903C2983.19 457.733 2923.15 389.892 2827.24 389.892ZM1911.86 460.072L1905.62 401.588H1816.73V810.195H1911.08V604.332C1911.08 532.592 1954.74 486.585 2027.26 486.585C2042.85 486.585 2058.44 488.144 2070.92 492.043V401.588C2059.22 396.91 2044.41 395.35 2028.04 395.35C1978.58 395.35 1936.66 421.177 1911.86 460.072ZM2353.96 389.892C2295.15 389.892 2244.21 413.098 2208.15 456.953V226.917H2113.8V810.195H2202.69L2208.93 754.83C2245.36 799.605 2295.18 821.892 2353.96 821.892C2470.13 821.892 2557.46 729.877 2557.46 605.892C2557.46 481.906 2470.13 389.892 2353.96 389.892ZM2334.46 736.895C2259.84 736.895 2208.15 682.63 2208.15 605.892C2208.15 529.153 2259.84 474.888 2334.46 474.888C2409.09 474.888 2461.56 528.373 2461.56 605.892C2461.56 683.41 2408.31 736.895 2334.46 736.895ZM1703.28 226.917C1669.48 226.917 1642.08 254.326 1642.08 288.13C1642.08 321.934 1669.48 349.343 1703.28 349.343C1737.09 349.343 1764.49 321.934 1764.49 288.13C1764.49 254.326 1737.09 226.917 1703.28 226.917Z" fill="currentColor"></path>
                </svg>
                <div className="w-8 h-8" />
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full hover:bg-gray-100 font-semibold">Questions?</button>
                    <button onClick={() => navigate('/')} className="px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full hover:bg-gray-100 font-semibold">Save & exit</button>
                </div>
            </div>

            <div className="max-w-[50rem] mx-auto px-6 mt-16">
                <div className={`transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <h1 className="text-[2.3rem] font-semibold text-gray-900">Next, let's describe your earth home</h1>
                    <p className="text-gray-600 text-[1.05rem] font-medium mt-2">Choose up to 2 highlights. We'll use these to get your description started.</p>

                    <div className="mt-8 grid grid-cols-1 gap-3">
                        <div className="flex flex-wrap gap-3">
                            {options.map((opt, idx) => (
                                <button
                                    key={opt.key}
                                    onClick={() => toggle(opt.key)}
                                    className={`group flex items-center gap-3 px-6 py-5 rounded-3xl border transition-all duration-300 ${selected.has(opt.key) ? 'bg-black text-white border-black' : 'border-gray-400 hover:border-black'}`}
                                    style={{ animation: isMounted ? `fade-in 0.5s ease ${idx * 60}ms both` : 'none' }}
                                >
                                    <span className="w-6 h-6" dangerouslySetInnerHTML={{ __html: opt.svg }} />
                                    <span className="text-xl font-semibold">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <div className="fixed left-0 right-0 bottom-0 bg-white border-t">
                <div className="h-1 w-full bg-gray-300 relative overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-black transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>

                <div className="flex items-center justify-between px-8 py-4">
                    <button onClick={() => {
                        const urlWithHostId = hostId ? `/aboutplace/title?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}` : '/aboutplace/title';
                        navigate(urlWithHostId, { state: { progress } });
                    }} className="text-gray-800 font-semibold underline">Back</button>
                    <button
                        onClick={() => {
                            if (isNextEnabled) {
                                const urlWithHostId = hostId ? `/aboutplace/description?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}` : '/aboutplace/description';
                                navigate(urlWithHostId, { state: { progress, selected: Array.from(selected) } });
                            }
                        }}
                        disabled={!isNextEnabled}
                        className={`px-8 py-3 rounded-lg transition-colors ${isNextEnabled ? 'bg-black text-white' : 'bg-black/30 text-white/70 cursor-not-allowed'}`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HighlightsStep;
