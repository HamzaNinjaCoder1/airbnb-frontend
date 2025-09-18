import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from './api';

function PhotosUpload({ progress, setProgress, existingData }) {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const hostId = searchParams.get('hostId') || user?.id;
    const listingId = searchParams.get('listingId');
    if (!isAuthenticated) return null;

    const [showModal, setShowModal] = useState(false);
    const [uploadedPhotos, setUploadedPhotos] = useState([]);
    const [isMounted, setIsMounted] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadTargetIndex, setUploadTargetIndex] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setProgress((prev) => Math.max(prev, 47)), 50);
        const m = setTimeout(() => setIsMounted(true), 0);
        return () => { clearTimeout(t); clearTimeout(m); };
    }, []);

    // Hydrate previously uploaded images (server or local) into the display grid
    useEffect(() => {
        try {
            const serverImages = Array.isArray(existingData?.images) ? existingData.images : [];
            const normalizedServer = serverImages
                .filter(Boolean)
                .map((src) => ({ id: `${src}-${Math.random()}`, file: null, url: src.startsWith('http') ? src : src }));

            const key = `listing:${hostId || 'anon'}:${listingId || 'new'}`;
            const localRaw = localStorage.getItem(key);
            const local = localRaw ? JSON.parse(localRaw) : {};
            const localImages = Array.isArray(local.images) ? local.images : [];
            const normalizedLocal = localImages
                .filter(Boolean)
                .map((src) => ({ id: `${src}-${Math.random()}`, file: null, url: src }));

            const combined = [...normalizedServer, ...normalizedLocal];
            if (combined.length > 0) {
                setUploadedPhotos(combined);
            }
        } catch (_) {}
    }, [existingData, hostId, listingId]);

    useEffect(() => {
        return () => {
            selectedFiles.forEach((f) => URL.revokeObjectURL(f.url));
        };
    }, [selectedFiles]);

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            const file = files[0];
            const newFile = {
                id: Date.now() + Math.random(),
                file,
                url: URL.createObjectURL(file)
            };
            setSelectedFiles([newFile]);
        }
    };

    const handleUpload = () => {
        setUploadedPhotos((prev) => {
            if (uploadTargetIndex !== null && selectedFiles[0]) {
                const updated = [...prev];
                if (uploadTargetIndex < updated.length) {
                    updated[uploadTargetIndex] = selectedFiles[0];
                } else {
                    updated.push(selectedFiles[0]);
                }
                return updated;
            }
            return [...prev, ...selectedFiles];
        });
        setSelectedFiles([]);
        setUploadTargetIndex(null);
        setShowModal(false);
    };

    const uploadImagesIfAny = async () => {
        const files = uploadedPhotos
            .map((p) => p?.file)
            .filter(Boolean);
        if (!user?.id || files.length === 0) return;
        const form = new FormData();
        files.forEach((file) => form.append('images', file));
        console.log(`[PhotosUpload] Preparing to upload ${files.length} files:`, files.map((f) => f.name));
        try {
            await api.post(
                `/api/data/upload-images?hostId=${user.id}${listingId ? `&listingId=${listingId}` : ''}`,
                form
            );
        } catch (error) {
            if (error?.response) {
                const status = error.response.status;
                const message = error.response?.data?.message;
                console.error('Upload failed - response data:', error.response?.data);
                if (status === 400 || status === 404) {
                    console.error('Upload error:', message || 'Bad request');
                } else if (status >= 500) {
                    console.error('Server error: check backend logs');
                } else {
                    console.error('Upload failed:', status, message || error.response.data);
                }
            } else {
                console.error('Network error or request not sent:', error?.message);
            }
            throw error;
        }
    };

    const saveListingProgress = async (payload = {}) => {
        if (!user?.id) return;
        await api.patch(
            `/api/data/listings/save-exit?hostId=${user.id}${listingId ? `&listingId=${listingId}` : ''}`,
            payload
        );
    };

    // Persist URLs of currently shown images locally for edit prefill
    const persistLocalImages = () => {
        try {
            const key = `listing:${hostId || 'anon'}:${listingId || 'new'}`;
            const prev = localStorage.getItem(key);
            const obj = prev ? JSON.parse(prev) : {};
            const urls = uploadedPhotos.map((p) => p.url).filter(Boolean);
            localStorage.setItem(key, JSON.stringify({ ...obj, images: urls }));
        } catch (_) {}
    };

    const handleSaveAndExit = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await uploadImagesIfAny();
            await saveListingProgress({ status: 'draft', current_step: 'photos' });
            navigate(hostId ? `/listings/${hostId}` : '/listings');
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleNext = async () => {
        if (!isNextEnabled || isSaving) return;
        setIsSaving(true);
        try {
            await uploadImagesIfAny();
            persistLocalImages();
            await saveListingProgress({ current_step: 'title' });
            const urlWithHostId = hostId ? `/aboutplace/title?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}` : '/aboutplace/title';
            navigate(urlWithHostId, { state: { progress } });
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const removePhoto = (id) => {
        setUploadedPhotos((prev) => prev.filter((photo) => photo.id !== id));
    };

    const isNextEnabled = uploadedPhotos.length >= 5;
    const gridBottomMargin = uploadedPhotos.length >= 12
        ? 'mb-24'
        : uploadedPhotos.length >= 8
        ? 'mb-16'
        : uploadedPhotos.length >= 4
        ? 'mb-8'
        : 'mb-0';

    return (
        <div className={`min-h-screen bg-white ${uploadedPhotos.length !== 0 ? 'mb-28' : ''}`}>
            <div className="flex items-center justify-between px-8 py-4">
                <div className="w-8 h-8">
                    <svg
                        onClick={() => navigate('/')}
                        className={`w-20 h-6 sm:w-24 sm:h-8 lg:w-28 lg:h-8 transition-all duration-500 ${'scale-100'}`}
                        viewBox="0 0 3490 1080"
                        style={{ display: 'block', color: '#ff385c', cursor: 'pointer' }}
                    >
                        <path d="M1494.71 456.953C1458.28 412.178 1408.46 389.892 1349.68 389.892C1233.51 389.892 1146.18 481.906 1146.18 605.892C1146.18 729.877 1233.51 821.892 1349.68 821.892C1408.46 821.892 1458.28 799.605 1494.71 754.83L1500.95 810.195H1589.84V401.588H1500.95L1494.71 456.953ZM1369.18 736.895C1295.33 736.895 1242.08 683.41 1242.08 605.892C1242.08 528.373 1295.33 474.888 1369.18 474.888C1443.02 474.888 1495.49 529.153 1495.49 605.892C1495.49 682.63 1443.8 736.895 1369.18 736.895ZM1656.11 810.195H1750.46V401.588H1656.11V810.195ZM948.912 666.715C875.618 506.859 795.308 344.664 713.438 184.809C698.623 155.177 670.554 98.2527 645.603 67.8412C609.736 24.1733 556.715 0.779785 502.915 0.779785C449.115 0.779785 396.094 24.1733 360.227 67.8412C335.277 98.2527 307.207 155.177 292.392 184.809C210.522 344.664 130.212 506.859 56.9187 666.715C47.5621 687.769 24.9504 737.675 16.3736 760.289C6.2373 787.581 0.779297 817.213 0.779297 846.845C0.779297 975.509 101.362 1079.22 235.473 1079.22C346.193 1079.22 434.3 1008.26 502.915 934.18C571.53 1008.26 659.638 1079.22 770.357 1079.22C904.468 1079.22 1005.83 975.509 1005.83 846.845C1005.83 817.213 999.593 787.581 989.457 760.289C980.88 737.675 958.268 687.769 948.912 666.715ZM502.915 810.195C447.555 738.455 396.094 649.56 396.094 577.819C396.094 506.079 446.776 470.209 502.915 470.209C559.055 470.209 610.516 508.419 610.516 577.819C610.516 647.22 558.275 738.455 502.915 810.195ZM770.357 998.902C688.362 998.902 618.032 941.557 555.741 872.656C619.966 792.541 690.826 679.121 690.826 577.819C690.826 458.513 598.04 389.892 502.915 389.892C407.79 389.892 315.784 458.513 315.784 577.819C315.784 679.098 386.145 792.478 450.144 872.593C387.845 941.526 317.491 998.902 235.473 998.902C146.586 998.902 81.0898 931.061 81.0898 846.845C81.0898 826.57 84.2087 807.856 91.2261 788.361C98.2436 770.426 120.855 720.52 130.212 701.025C203.505 541.17 282.256 380.534 364.126 220.679C378.941 191.047 403.891 141.921 422.605 119.307C442.877 94.3538 470.947 81.0975 502.915 81.0975C534.883 81.0975 562.953 94.3538 583.226 119.307C601.939 141.921 626.89 191.047 641.704 220.679C723.574 380.534 802.325 541.17 875.618 701.025C884.975 720.52 907.587 770.426 914.604 788.361C921.622 807.856 925.52 826.57 925.52 846.845C925.52 931.061 859.244 998.902 770.357 998.902ZM3285.71 389.892C3226.91 389.892 3175.97 413.098 3139.91 456.953V226.917H3045.56V810.195H3134.45L3140.69 754.83C3177.12 799.605 3226.94 821.892 3285.71 821.892C3401.89 821.892 3489.22 729.877 3489.22 605.892C3489.22 481.906 3401.89 389.892 3285.71 389.892ZM3266.22 736.895C3191.6 736.895 3139.91 682.63 3139.91 605.892C3139.91 529.153 3191.6 474.888 3266.22 474.888C3340.85 474.888 3393.32 528.373 3393.32 605.892C3393.32 683.41 3340.07 736.895 3266.22 736.895ZM2827.24 389.892C2766.15 389.892 2723.56 418.182 2699.37 456.953L2693.13 401.588H2604.24V810.195H2698.59V573.921C2698.59 516.217 2741.47 474.888 2800.73 474.888C2856.87 474.888 2888.84 513.097 2888.84 578.599V810.195H2983.19V566.903C2983.19 457.733 2923.15 389.892 2827.24 389.892ZM1911.86 460.072L1905.62 401.588H1816.73V810.195H1911.08V604.332C1911.08 532.592 1954.74 486.585 2027.26 486.585C2042.85 486.585 2058.44 488.144 2070.92 492.043V401.588C2059.22 396.91 2044.41 395.35 2028.04 395.35C1978.58 395.35 1936.66 421.177 1911.86 460.072ZM2353.96 389.892C2295.15 389.892 2244.21 413.098 2208.15 456.953V226.917H2113.8V810.195H2202.69L2208.93 754.83C2245.36 799.605 2295.18 821.892 2353.96 821.892C2470.13 821.892 2557.46 729.877 2557.46 605.892C2557.46 481.906 2470.13 389.892 2353.96 389.892ZM2334.46 736.895C2259.84 736.895 2208.15 682.63 2208.15 605.892C2208.15 529.153 2259.84 474.888 2334.46 474.888C2409.09 474.888 2461.56 528.373 2461.56 605.892C2461.56 683.41 2408.31 736.895 2334.46 736.895ZM1703.28 226.917C1669.48 226.917 1642.08 254.326 1642.08 288.13C1642.08 321.934 1669.48 349.343 1703.28 349.343C1737.09 349.343 1764.49 321.934 1764.49 288.13C1764.49 254.326 1737.09 226.917 1703.28 226.917Z" fill="currentColor"></path>
                    </svg>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full hover:bg-gray-100 font-semibold">Questions?</button>
                    <button
                        className={`px-4 py-2 text-sm text-gray-800 border border-gray-300 rounded-full font-semibold transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                        onClick={handleSaveAndExit}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save & exit'}
                    </button>
                </div>
            </div>

            <div className="max-w-[50rem] mx-auto px-6 -mt-6">
                <h1 className="text-[2rem] font-semibold text-gray-900 mt-6 text-center">Add some photos of your earth home</h1>
                <p className="text-gray-600 mt-2 text-center">You'll need 5 photos to get started. You can add more or make changes later.</p>

                <div className="mt-2">
  {uploadedPhotos.length === 0 ? (
    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center bg-[#F7F7F7]">
      <div
        className={`transition-all duration-700 ${
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="w-48 h-48 mx-auto mb-6">
          <img
            src="https://a0.muscache.com/im/pictures/mediaverse/mys-amenities-n8/original/c83b2a87-3be4-43c9-ad47-12dd2aee24c4.jpeg"
            alt="Camera"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="-mt-12 px-6 py-2 bg-white border border-gray-800 rounded-lg text-gray-800 font-medium hover:bg-gray-50 transition-colors"
        >
          Add photos
        </button>
      </div>
    </div>
  ) : (
    <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 ${gridBottomMargin}`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const photo = uploadedPhotos[i];
        return photo ? (
          <div key={photo.id} className="relative group rounded-2xl bg-[#F7F7F7] flex items-center justify-center w-full h-64 overflow-hidden">
            <img 
              src={photo.url} 
              alt={`Upload ${i + 1}`} 
              className="w-full h-full object-cover rounded-2xl" 
            />
            <button 
              onClick={() => removePhoto(photo.id)} 
              className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            key={`ph-${i}`}
            onClick={() => { setUploadTargetIndex(i); setShowModal(true); }}
            className="rounded-2xl bg-[#F7F7F7] flex  items-center justify-center text-gray-600 hover:opacity-90 transition-colors w-[22rem] h-64 "
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: 32, width: 32, fill: 'currentColor' }}>
              <path d="M27 3a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM8.89 19.04l-.1.08L3 24.92V25a2 2 0 0 0 1.85 2H18.1l-7.88-7.88a1 1 0 0 0-1.32-.08zm12.5-6-.1.08-7.13 7.13L20.92 27H27a2 2 0 0 0 2-1.85v-5.73l-6.3-6.3a1 1 0 0 0-1.31-.08zM27 5H5a2 2 0 0 0-2 2v15.08l4.38-4.37a3 3 0 0 1 4.1-.14l.14.14 1.13 1.13 7.13-7.13a3 3 0 0 1 4.1-.14l.14.14L29 16.59V7a2 2 0 0 0-1.85-2zM8 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"></path>
            </svg>
            <span className="text-md font-semibold mt-1 ml-4">Add photo</span>
          </button>
        );
      })}
    </div>
  )}
</div>

            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedFiles([]);
                                }}
                                className="w-10 h-10 text-2xl font-semibold flex items-center justify-center text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                            <h2 className="text-xl font-semibold">Upload photos</h2>
                            <div className="w-8 h-8"></div>
                        </div>

                        <p className="text-sm text-gray-500 mb-3 -mt-4 text-center">
                            {selectedFiles.length === 0 ? 'No image selected' : '1 image selected'}
                        </p>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4 min-h-[200px] flex flex-col justify-center">
                            {selectedFiles.length === 0 ? (
                                <>
                                    <div className="w-12 h-12 mx-auto mb-3 text-black ">
                                        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: 64, width: 64, fill: 'currentcolor' }}>
                                            <path d="M41.636 8.404l1.017 7.237 17.579 4.71a5 5 0 0 1 3.587 5.914l-.051.21-6.73 25.114A5.002 5.002 0 0 1 53 55.233V56a5 5 0 0 1-4.783 4.995L48 61H16a5 5 0 0 1-4.995-4.783L11 56V44.013l-1.69.239a5 5 0 0 1-5.612-4.042l-.034-.214L.045 14.25a5 5 0 0 1 4.041-5.612l.215-.035 31.688-4.454a5 5 0 0 1 5.647 4.256zm-20.49 39.373l-.14.131L13 55.914V56a3 3 0 0 0 2.824 2.995L16 59h21.42L25.149 47.812a3 3 0 0 0-4.004-.035zm16.501-9.903l-.139.136-9.417 9.778L40.387 59H48a3 3 0 0 0 2.995-2.824L51 56v-9.561l-9.3-8.556a3 3 0 0 0-4.053-.009zM53 34.614V53.19a3.003 3.003 0 0 0 2.054-1.944l.052-.174 2.475-9.235L53 34.614zM48 27H31.991c-.283.031-.571.032-.862 0H16a3 3 0 0 0-2.995 2.824L13 30v23.084l6.592-6.59a5 5 0 0 1 6.722-.318l.182.159.117.105 9.455-9.817a5 5 0 0 1 6.802-.374l.184.162L51 43.721V30a3 3 0 0 0-2.824-2.995L48 27zm-37 5.548l-5.363 7.118.007.052a3 3 0 0 0 3.388 2.553L11 41.994v-9.446zM25.18 15.954l-.05.169-2.38 8.876h5.336a4 4 0 1 1 6.955 0L48 25.001a5 5 0 0 1 4.995 4.783L53 30v.88l5.284 8.331 3.552-13.253a3 3 0 0 0-1.953-3.624l-.169-.05L28.804 14a3 3 0 0 0-3.623 1.953zM21 31a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM36.443 6.11l-.175.019-31.69 4.453a3 3 0 0 0-2.572 3.214l.02.175 3.217 22.894 5.833-7.74a5.002 5.002 0 0 1 4.707-4.12L16 25h4.68l2.519-9.395a5 5 0 0 1 5.913-3.587l.21.051 11.232 3.01-.898-6.397a3 3 0 0 0-3.213-2.573zm-6.811 16.395a2 2 0 0 0 1.64 2.496h.593a2 2 0 1 0-2.233-2.496zM10 13a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"></path>
                                        </svg>
                                    </div>
                                    <p className="text-lg font-medium mb-1">Drag and drop</p>
                                    <p className="text-sm text-gray-500 mb-3">or browse for photos</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="inline-block px-6 py-3 bg-black text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                                    >
                                        Browse
                                    </label>
                                </>
                            ) : (
                                <>
                                    <div className="relative w-full h-48 overflow-hidden rounded-lg bg-gray-100">
                                        <img 
                                            src={selectedFiles[0].url} 
                                            alt="Selected" 
                                            className="w-full h-full object-cover rounded-lg" 
                                        />
                                        <button
                                            onClick={() => setSelectedFiles([])}
                                            className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/70 transition"
                                            aria-label="Remove"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center justify-end">
                            <button
                                onClick={handleUpload}
                                disabled={selectedFiles.length === 0}
                                className={`px-6 py-2 rounded-lg transition-colors ${
                                    selectedFiles.length > 0
                                        ? 'bg-black text-white hover:bg-gray-800'
                                        : 'bg-black/30 text-white/70 cursor-not-allowed'
                                }`}
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed left-0 right-0 bottom-0 bg-white border-t">
                <div className="h-1 w-full bg-gray-300 relative overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-black transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>

                <div className="flex items-center justify-between px-8 py-4">
                    <button onClick={() => {
                        const urlWithHostId = hostId ? `/aboutplace/amenities?hostId=${hostId}${listingId ? `&listingId=${listingId}` : ''}` : '/aboutplace/amenities';
                        navigate(urlWithHostId, { state: { progress } });
                    }} className="text-gray-800 font-semibold underline">Back</button>
                    <button
                        onClick={handleNext}
                        disabled={!isNextEnabled || isSaving}
                        className={`px-8 py-3 rounded-lg transition-colors ${isNextEnabled && !isSaving ? 'bg-black text-white' : 'bg-black/30 text-white/70 cursor-not-allowed'}`}
                    >
                        {isSaving ? 'Saving...' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PhotosUpload;