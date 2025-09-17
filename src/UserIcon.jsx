import React from 'react';

const UserIcon = ({ 
  size = 'w-12 h-12', 
  className = '', 
  showRing = true,
  ringColor = 'ring-white',
  shadow = true,
  name = '',
  showInitials = true
}) => {
  // Generate initials from name
  const getInitials = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return 'U';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    const firstInitial = names[0].charAt(0).toUpperCase();
    const lastInitial = names[names.length - 1].charAt(0).toUpperCase();
    return firstInitial + lastInitial;
  };

  // Generate consistent random background color based on name
  const getBackgroundColor = (fullName) => {
    if (!fullName) return 'bg-gray-500';
    
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
      'bg-emerald-500',
      'bg-violet-500'
    ];
    
    // Create a simple hash from the name for consistent color assignment
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  const initials = getInitials(name);
  const backgroundColor = getBackgroundColor(name);
  const baseClasses = `${size} rounded-full flex items-center justify-center ${showInitials ? backgroundColor : 'bg-gray-200'} text-white font-semibold flex-shrink-0`;
  const ringClasses = showRing ? `ring-2 ${ringColor}` : '';
  const shadowClasses = shadow ? 'shadow-md' : '';
  
  // Calculate text size based on icon size
  const getTextSize = (size) => {
    if (size.includes('w-8') || size.includes('h-8')) return 'text-xs';
    if (size.includes('w-10') || size.includes('h-10')) return 'text-sm';
    if (size.includes('w-12') || size.includes('h-12')) return 'text-base';
    if (size.includes('w-14') || size.includes('h-14')) return 'text-lg';
    if (size.includes('w-16') || size.includes('h-16')) return 'text-xl';
    return 'text-base';
  };

  const textSize = getTextSize(size);
  
  return (
    <div className={`${baseClasses} ${ringClasses} ${shadowClasses} ${className}`}>
      {showInitials ? (
        <span className={`${textSize} font-bold select-none`}>
          {initials}
        </span>
      ) : (
        <svg 
          className="w-6 h-6" 
          fill="currentColor" 
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      )}
    </div>
  );
};

export default UserIcon;
