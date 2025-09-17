import React from 'react';
import UserIcon from './UserIcon';

const UserIconDemo = () => {
  const demoUsers = [
    'Hamza Nadeem',
    'John Doe',
    'Jane Smith',
    'Alice Johnson',
    'Bob Wilson',
    'Sarah Davis',
    'Mike Brown',
    'Lisa Garcia',
    'David Lee',
    'Emma Taylor',
    'Chris Anderson',
    'Maria Rodriguez'
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">UserIcon Demo</h1>
      
      <div className="space-y-8">
        {/* Different Sizes */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Different Sizes</h2>
          <div className="flex items-center gap-4">
            <UserIcon size="w-8 h-8" name="Hamza Nadeem" />
            <UserIcon size="w-10 h-10" name="Hamza Nadeem" />
            <UserIcon size="w-12 h-12" name="Hamza Nadeem" />
            <UserIcon size="w-14 h-14" name="Hamza Nadeem" />
            <UserIcon size="w-16 h-16" name="Hamza Nadeem" />
          </div>
        </div>

        {/* Different Names */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Different Names (Consistent Colors)</h2>
          <div className="grid grid-cols-6 gap-4">
            {demoUsers.map((name, index) => (
              <div key={index} className="text-center">
                <UserIcon size="w-16 h-16" name={name} />
                <p className="text-sm text-gray-600 mt-2">{name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* With and Without Rings */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">With and Without Rings</h2>
          <div className="flex items-center gap-4">
            <UserIcon size="w-16 h-16" name="Hamza Nadeem" showRing={true} ringColor="ring-white" />
            <UserIcon size="w-16 h-16" name="Hamza Nadeem" showRing={true} ringColor="ring-blue-100" />
            <UserIcon size="w-16 h-16" name="Hamza Nadeem" showRing={false} />
          </div>
        </div>

        {/* Single Names */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Single Names</h2>
          <div className="flex items-center gap-4">
            <UserIcon size="w-16 h-16" name="Hamza" />
            <UserIcon size="w-16 h-16" name="John" />
            <UserIcon size="w-16 h-16" name="Alice" />
            <UserIcon size="w-16 h-16" name="Bob" />
          </div>
        </div>

        {/* Fallback */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Fallback (No Name)</h2>
          <div className="flex items-center gap-4">
            <UserIcon size="w-16 h-16" name="" />
            <UserIcon size="w-16 h-16" name={null} />
            <UserIcon size="w-16 h-16" showInitials={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserIconDemo;

