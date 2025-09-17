import React from 'react'
import { useState } from 'react'

function Footer() {
    const tabs = ["Unique stays", "Travel tips & inspiration", "Airbnb-friendly apartments"]
    const [activeTab, setActiveTab] = useState("Unique stays")
    const rentalCategories = [
        { title: "Cabins", location: "United States" },
        { title: "Treehouses", location: "United States" },
        { title: "Tiny Houses", location: "United States" },
        { title: "Beach Houses", location: "United States" },
        { title: "Lakehouses", location: "United States" },
        { title: "Yurt Rentals", location: "United States" },
        { title: "Yurt Rentals", location: "United Kingdom" },
        { title: "Castle Rentals", location: "United States" },
        { title: "Houseboats", location: "United States" },
        { title: "Holiday Caravans", location: "United Kingdom" },
        { title: "Private Island Rentals", location: "United States" },
        { title: "Farm Houses", location: "United States" },
        { title: "Farm Cottages", location: "United Kingdom" },
        { title: "Cabin Rentals", location: "Australia" },
        { title: "Luxury Cabins", location: "United Kingdom" },
        { title: "Luxury Cabins", location: "United States" },
        { title: "Holiday Chalets", location: "United Kingdom" },
        { title: "Show more", location: "" }
    ];

    const travelItems = [
        { title: "Family travel hub", items: "Tips and inspiration" },
        { title: "Family budget travel", items: "Get there for less" },
        { title: "Vacation ideas for any budget", items: "Make it special without making it spendy" },
        { title: "Travel Europe on a budget", items: "How to take the kids to Europe for less" },
        { title: "Outdoor adventure", items: "Explore nature with the family" },
        { title: "Bucket list national parks", items: "Must-see parks for family travel" },
        { title: "Kid-friendly state parks", items: "Check out these family-friendly hikes" }
    ];


    const locationItems = [
        { title: "Albuquerque", items: "New Mexico" },
        { title: "Atlanta Metro", items: "Georgia" },
        { title: "Augusta", items: "Georgia" },
        { title: "Austin Metro", items: "Texas" },
        { title: "Baton Rouge", items: "Louisiana" },
        { title: "Birmingham", items: "Alabama" },
        { title: "Boise", items: "Idaho" },
        { title: "Boston Metro", items: "Massachusetts" },
        { title: "Boulder", items: "Colorado" },
        { title: "Charlotte", items: "North Carolina" },
        { title: "Chicago Metro", items: "Illinois" },
        { title: "Cincinnati", items: "Ohio" },
        { title: "Columbus", items: "Ohio" },
        { title: "Crestview", items: "Florida" },
        { title: "Dallas", items: "Texas" },
        { title: "Denver", items: "Colorado" },
        { title: "Fayetteville", items: "North Carolina" }
    ];

    const selectedArray = [rentalCategories, travelItems, locationItems]
    return (
        <footer className="bg-[#f4f3f3]">
            <div className="max-w-7xl mx-auto px-4 pt-10 pb-24 sm:pt-12 sm:pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 mb-2">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold whitespace-nowrap">Inspiration for future getaways</h2>
                    </div>
                </div>
                <div className="flex gap-4 sm:gap-5 font-medium py-4 sm:py-5 text-sm sm:text-base overflow-x-auto whitespace-nowrap -mx-4 px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {tabs.map((tab, index) => (
                        <h4 key={index} onClick={() => setActiveTab(tab)} className={`cursor-pointer relative after:content-[''] after:absolute after:left-0 after:bottom-[-16px] after:w-full after:h-[2px] transition-all duration-300 ${activeTab === tab ? "after:bg-black text-black" : "after:bg-transparent text-gray-500"}`}>
                            {tab}
                        </h4>
                    ))}
                </div>
                <hr className='border-gray-300 -mt-[1px] sm:-mt-1 mb-8' />
                {activeTab === "Unique stays" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {rentalCategories.map((category, index) => (
                            <div key={index} className="flex flex-col gap-0">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base cursor-pointer">
                                    {category.title === "Show more" ? (
                                        <span className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                                            {category.title}
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    ) : (
                                        category.title
                                    )}
                                </h3>
                                {category.location && (
                                    <p className="text-sm sm:text-base text-gray-500 cursor-pointer hover:text-gray-800">{category.location}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === "Travel tips & inspiration" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {travelItems.map((item, index) => (
                            <div key={index} className="flex flex-col gap-0">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base cursor-pointer">{item.title}</h3>
                                {item.items && (
                                    <p className="text-sm sm:text-base text-gray-500 cursor-pointer hover:text-gray-800">{item.items}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === "Airbnb-friendly apartments" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {locationItems.map((item, index) => (
                            <div key={index} className="flex flex-col gap-0">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base cursor-pointer">{item.title}</h3>
                                {item.items && (
                                    <p className="text-sm sm:text-base text-gray-500 cursor-pointer hover:text-gray-800">{item.items}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <div className="border-t border-gray-300 pt-10 sm:pt-12 mt-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Support</h3>
                            <div className="space-y-2 sm:space-y-3">
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer text-sm sm:text-base">Help Center</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">AirCover</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Anti-discrimination</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Disability support</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Cancellation options</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Report neighborhood concern</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Hosting</h3>
                            <div className="space-y-2 sm:space-y-3">
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Airbnb your home</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Airbnb your experience</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Airbnb your service</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">AirCover for Hosts</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Hosting resources</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Community forum</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Hosting responsibly</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Airbnb-friendly apartments</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Join a free Hosting class</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Find a co-host</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Airbnb</h3>
                            <div className="space-y-2 sm:space-y-3">
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">2025 Summer Release</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Newsroom</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Careers</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Investors</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Gift cards</p>
                                <p className="text-gray-600 hover:text-gray-900 cursor-pointer">Airbnb.org emergency stays</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-300 pt-6 sm:pt-8 mt-10 sm:mt-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                        <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
                            <span className="text-gray-600 text-sm">© 2025 Airbnb, Inc.</span>
                            <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm">
                                <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Terms</span>
                                <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Sitemap</span>
                                <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Privacy</span>
                                <span className="text-gray-600 hover:text-gray-900 cursor-pointer flex items-center gap-2">
                                    Your Privacy Choices
                                    <svg width="26" height="12" fill="none"><rect x="0.5" y="0.5" width="25" height="11" rx="5.5" fill="#fff"></rect><path d="M14 1h7a5 5 0 010 10H11l3-10z" fill="#06F"></path><path d="M4.5 6.5l1.774 1.774a.25.25 0 00.39-.049L9.5 3.5" stroke="#06F" stroke-linecap="round"></path><path d="M16.5 3.5L19 6m0 0l2.5 2.5M19 6l2.5-2.5M19 6l-2.5 2.5" stroke="#fff" stroke-linecap="round"></path><rect x="0.5" y="0.5" width="25" height="11" rx="5.5" stroke="#06F"></rect></svg>
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 sm:space-x-6">
                            <div className="flex items-center space-x-2 cursor-pointer">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-black" viewBox="0 0 17 17">
                                    <path d="M8 .25a7.77 7.77 0 0 1 7.75 7.78 7.75 7.75 0 0 1-7.52 7.72h-.25A7.75 7.75 0 0 1 .25 8.24v-.25A7.75 7.75 0 0 1 8 .25zm1.95 8.5h-3.9c.15 2.9 1.17 5.34 1.88 5.5H8c.68 0 1.72-2.37 1.93-5.23zm4.26 0h-2.76c-.09 1.96-.53 3.78-1.18 5.08A6.26 6.26 0 0 0 14.17 9zm-9.67 0H1.8a6.26 6.26 0 0 0 3.94 5.08 12.59 12.59 0 0 1-1.16-4.7l-.03-.38zm1.2-6.58-.12.05a6.26 6.26 0 0 0-3.83 5.03h2.75c.09-1.83.48-3.54 1.06-4.81zm2.25-.42c-.7 0-1.78 2.51-1.94 5.5h3.9c-.15-2.9-1.18-5.34-1.89-5.5h-.07zm2.28.43.03.05a12.95 12.95 0 0 1 1.15 5.02h2.75a6.28 6.28 0 0 0-3.93-5.07z"></path>
                                </svg>
                                <span className="text-gray-800 text-sm">English (US)</span>
                            </div>
                            <div className="flex items-center space-x-2 cursor-pointer">
                                <span className="text-gray-800 text-sm">$ USD</span>
                            </div>
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <svg className="w-5 h-5 text-gray-600 hover:text-gray-900 cursor-pointer" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <svg className="w-5 h-5 text-gray-800 hover:text-gray-900 cursor-pointer" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                <svg className="w-5 h-5 text-gray-800 hover:text-gray-900 cursor-pointer" viewBox="0 0 24 24">
                                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;