import React from "react";
import ReactDOM from "react-dom";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import messagingService from './services/messagingService';

function MenuButton({ menuItems, onBecomeHostClick }) {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Fetch unread count when menu opens (and user is authenticated)
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (!isAuthenticated || !user) return;
        const response = await messagingService.getConversations(user.id || user.userId);
        if (response && response.success && Array.isArray(response.conversations)) {
          const total = response.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          setUnreadCount(total);
        }
      } catch (_) {}
    };
    if (open) {
      fetchUnread();
    }
  }, [open, isAuthenticated, user]);

  const handleMenuItemClick = async (title) => {
    if (title === "Become a host" && onBecomeHostClick) {
      await onBecomeHostClick();
      setOpen(false);
    }
    if (title === "Login") {
      window.location.href = '/auth';
      setOpen(false);
    }
    if (title === "Messages") {
      navigate('/messages');
      setOpen(false);
      // Optimistically clear badge; Messages view will sync real state
      setUnreadCount(0);
    }
    if (title === "Wishlist") {
      navigate('/wishlist');
      setOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200 flex-shrink-0"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>

      {open && ReactDOM.createPortal(
        <div className="fixed right-3 top-14 sm:right-4 sm:top-16 w-64 bg-white rounded-xl shadow-lg ring-1 ring-black/5 z-[1000] overflow-hidden">
          {isAuthenticated && user && (
            <>
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </>
          )}
          
          {menuItems && menuItems.map((item, index) => (
            <div key={index}>
              {index > 0 && <div className="border-t border-gray-200" />}
              <div 
                className="pl-4 pr-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between gap-4"
                onClick={() => handleMenuItemClick(item.title)}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-[15px] flex items-center gap-2">
                    {item.title}
                    {item.title === 'Messages' && unreadCount > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center text-[10px] leading-none font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 leading-snug">{item.description}</p>
                </div>
                {item.title === "Become a host" && (
                  <video
                    className="w-16 h-16 flex-none rounded-lg"
                    playsInline
                    poster="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-search-bar-icons/original/4aae4ed7-5939-4e76-b100-e69440ebeae4.png?im_w=240"
                    preload="auto"
                    autoPlay={false}
                    muted
                    controls={false}
                    disablePictureInPicture={true}
                    controlsList="nodownload nofullscreen noremoteplayback"
                    style={{ pointerEvents: 'none' }}
                  >
                    <source src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-search-bar-icons/hevc/house-twirl-selected.mov" type='video/mp4; codecs="hvc1"' />
                    <source src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-search-bar-icons/webm/house-twirl-selected.webm" type="video/webm" />
                  </video>
                )}
              </div>
            </div>
          ))}
          {/* Add Wishlist menu item when authenticated */}
          {isAuthenticated && (
            <>
              <div className="border-t border-gray-200" />
              <div 
                className="pl-4 pr-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between gap-4"
                onClick={() => handleMenuItemClick('Wishlist')}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-[15px]">Wishlist</p>
                  <p className="text-xs text-gray-500 leading-snug">View saved places</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5">
                  <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z" fill="#FF385C" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </>
          )}
          {/* Mobile-only Login item */}
          <div className="border-t border-gray-200 md:hidden" />
          <div 
            className="pl-4 pr-3 py-2 hover:bg-gray-50 cursor-pointer md:hidden"
            onClick={() => handleMenuItemClick('Login')}
          >
            <p className="font-semibold text-gray-900 text-[15px]">Login</p>
            <p className="text-xs text-gray-500 leading-snug">Sign in to your account</p>
          </div>
          
          {isAuthenticated && (
            <>
              <div className="border-t border-gray-200" />
              <div 
                className="pl-4 pr-3 py-2 hover:bg-gray-50 cursor-pointer text-[13px] text-gray-700"
                onClick={handleLogout}
              >
                Log out
              </div>
            </>
          )}
        </div>, document.body)
      }
    </div>
  );
}

export default MenuButton;