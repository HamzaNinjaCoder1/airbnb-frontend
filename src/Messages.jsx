import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import ListingHader from './ListingHader'
import { useAuth } from './AuthContext'
import messagingService from './services/messagingService'
import socketService from './services/socketService'
// Removed legacy pushService usage
import UserIcon from './UserIcon'

// Professional Airbnb-style messages page with real-time messaging
// Integrates with backend API and Socket.io for real-time communication

// Message Status Component - disabled (no ticks/status shown)
const MessageStatus = () => {
				return null;
};

// Typing Indicator Component
const TypingIndicator = ({ isTyping }) => {
	if (!isTyping) return null;
	
	return (
		<div className="relative mr-16 max-w-[70%]">
			{/* Typing bubble */}
			<div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm relative">
				<div className="flex space-x-1">
					<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
					<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
					<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
				</div>
				<span className="text-xs text-gray-500">typing...</span>
			</div>
			{/* Speech bubble tail */}
			<div className="absolute left-[-6px] top-4">
				<div className="w-0 h-0 border-r-[6px] border-r-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
			</div>
			{/* Border tail */}
			<div className="absolute left-[-7px] top-4">
				<div className="w-0 h-0 border-r-[7px] border-r-gray-200 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent"></div>
			</div>
		</div>
	);
};

// Booking Notification Component
const BookingNotification = ({ notification, onDismiss }) => {
	if (!notification || notification.type !== 'booking_confirmed') return null;
	
	const { listing, booking } = notification;
	
	// Debug: Log the notification data
	console.log('BookingNotification rendering with:', { notification, listing, booking });
	
	return (
		<div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl shadow-sm">
			<div className="flex items-start gap-4">
				{listing?.image && (
					<img 
						src={listing.image} 
						alt={listing.title || 'Listing'}
						className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
						onError={(e) => {
							console.log('Image failed to load:', listing.image);
							e.target.style.display = 'none';
						}}
					/>
				)}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-2">
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
						<h3 className="text-sm font-semibold text-green-800">Booking Confirmed!</h3>
					</div>
					<p className="text-sm text-gray-700 mb-2">
						A new booking has been made for your listing <span className="font-semibold">"{listing?.title || 'Unknown Listing'}"</span>.
					</p>
					{booking && (
						<div className="text-xs text-gray-600 space-y-1">
							<p>Check-in: {booking.check_in_date}</p>
							<p>Check-out: {booking.check_out_date}</p>
							<p>Guests: {booking.guests}</p>
							<p>Total: ${booking.total_price}</p>
						</div>
					)}
				</div>
				<button 
					onClick={onDismiss}
					className="p-1 hover:bg-gray-200 rounded-full transition-colors"
				>
					<svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	);
};

// Parse and render booking confirmation sent as plain text message
const isBookingTextMessage = (text) => {
    if (!text || typeof text !== 'string') return false;
    return text.startsWith('Booking Confirmed!') && text.includes('A new booking has been made for your listing');
};

const parseBookingTextMessage = (text) => {
    try {
        const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
        // Expected format based on requirements
        // 0: Booking Confirmed!
        // 1: A new booking has been made for your listing "Title".
        // 2: Check-in: YYYY-MM-DD
        // 3: Check-out: YYYY-MM-DD
        // 4: Guests: N
        // 5: Total: $XXX
        const titleMatch = lines[1]?.match(/"(.+?)"/);
        const title = titleMatch ? titleMatch[1] : undefined;
        const checkIn = lines.find(l => l.startsWith('Check-in:'))?.split(':')[1]?.trim();
        const checkOut = lines.find(l => l.startsWith('Check-out:'))?.split(':')[1]?.trim();
        const guestsStr = lines.find(l => l.startsWith('Guests:'))?.split(':')[1]?.trim();
        const guests = guestsStr ? parseInt(guestsStr, 10) : undefined;
        const totalStr = lines.find(l => l.startsWith('Total:'))?.split(':')[1]?.trim();
        const total = totalStr || undefined;
        return { title, checkIn, checkOut, guests, total };
    } catch (_) {
        return null;
    }
};

const BookingInlineCard = ({ data }) => {
    if (!data) return null;
    const { title, checkIn, checkOut, guests, total } = data;
    return (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-green-800">Booking Confirmed!</span>
            </div>
            <p className="text-sm text-gray-800">
                A new booking has been made for your listing <span className="font-semibold">"{title || 'Apartment'}"</span>.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700">
                <div>Check-in: {checkIn}</div>
                <div>Check-out: {checkOut}</div>
                <div>Guests: {typeof guests === 'number' ? guests : ''}</div>
                <div>Total: {total}</div>
            </div>
        </div>
    );
};

function Messages() {
	const navigate = useNavigate()
	const location = useLocation()
	const [searchParams, setSearchParams] = useSearchParams()
	const conversationIdFromUrl = searchParams.get('conversationId')
	const { user, isAuthenticated } = useAuth()

	// State management
	const [conversations, setConversations] = useState([])
	const [messages, setMessages] = useState([])
	const [activeConversationId, setActiveConversationId] = useState(conversationIdFromUrl || null)
	const [messageInput, setMessageInput] = useState('')
	const [showConversation, setShowConversation] = useState(false) // Mobile state
	const [isTyping, setIsTyping] = useState(false)
	const [isSending, setIsSending] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [notificationPermission, setNotificationPermission] = useState(null)
	const [bookingNotification, setBookingNotification] = useState(null)
	const messagesEndRef = useRef(null)
	const typingTimeoutRef = useRef(null)
	const currentRoomRef = useRef(null)

	// Initialize socket connection and load conversations
	useEffect(() => {
		if (isAuthenticated && user) {
			initializeMessaging()
		}
		return () => {
			socketService.disconnect()
		}
	}, [isAuthenticated, user])

	// Handle booking notification from location state
	useEffect(() => {
		if (location.state?.bookingNotification) {
			console.log('Received booking notification:', location.state.bookingNotification);
			
			// Ensure the notification has the correct structure
			const notification = location.state.bookingNotification;
			if (notification.type === 'booking_confirmed') {
				// Ensure listing data is properly structured
				const processedNotification = {
					...notification,
					listing: {
						id: notification.listing?.id || 'unknown',
						title: notification.listing?.title || 'Unknown Listing',
						image: notification.listing?.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
						host_id: notification.listing?.host_id || 'unknown'
					}
				};
				
				console.log('Processed booking notification:', processedNotification);
				setBookingNotification(processedNotification);
			}
			
			// Clear the state to prevent showing again on refresh
			window.history.replaceState({}, document.title)
		}
	}, [location.state])

	// Handle URL changes
	useEffect(() => {
		if (conversationIdFromUrl && conversationIdFromUrl !== activeConversationId) {
			setActiveConversationId(conversationIdFromUrl)
			loadMessages(conversationIdFromUrl)
		}
	}, [conversationIdFromUrl])

	// Update URL when conversation changes
	useEffect(() => {
		if (!activeConversationId) return
		const params = new URLSearchParams(location.search)
		params.set('conversationId', activeConversationId)
		navigate({ pathname: '/messages', search: params.toString() }, { replace: true })
	}, [activeConversationId])

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [activeConversationId, messages])

	// Get active conversation data
	const activeConversation = useMemo(() => 
		conversations.find(c => c.id === parseInt(activeConversationId)), 
		[conversations, activeConversationId]
	)

	// Initialize messaging system
const initializeMessaging = async () => {
		try {
			setLoading(true)
			
			// Connect to socket
			socketService.connect()
			
			// Load conversations
			await loadConversations()
			
			// Set up socket listeners (typing only; message listener handled per-room in effect)
			setupSocketListeners()
			
		} catch (error) {
			console.error('Error initializing messaging:', error)
			setError('Failed to initialize messaging system')
		} finally {
			setLoading(false)
		}
	}

	// Push notifications are bootstrapped globally; no per-page setup here

	// Load conversations from API
	const loadConversations = async () => {
		try {
			const response = await messagingService.getConversations(user.id)
			if (response.success) {
				setConversations(response.conversations)
				if (!activeConversationId && response.conversations.length > 0) {
					setActiveConversationId(response.conversations[0].id)
					loadMessages(response.conversations[0].id)
				}
			}
		} catch (error) {
			console.error('Error loading conversations:', error)
			setError('Failed to load conversations')
		}
	}
	const loadMessages = async (conversationId) => {
		try {
			const response = await messagingService.getMessages(conversationId)
			if (response.success) {
				setMessages(response.messages || [])
				currentRoomRef.current = conversationId
			}
		} catch (error) {
			console.error('Error loading messages:', error)
			setError('Failed to load messages')
		}
	}

	const setupSocketListeners = () => {
		socketService.onTyping((data) => {
			if (data.conversationId === parseInt(currentRoomRef.current)) {
				setIsTyping(true)
			}
		})

		socketService.onStopTyping((data) => {
			if (data.conversationId === parseInt(currentRoomRef.current)) {
				setIsTyping(false)
			}
		})
	}

	// Join room and listen for incoming messages per active conversation
	useEffect(() => {
		if (!activeConversationId) return

		// Ensure connection and join the room
		socketService.connect()
		socketService.joinRoom(activeConversationId)
		currentRoomRef.current = activeConversationId

		// Listen for real-time incoming messages
		const handleIncoming = (newMessage) => {
			if (!newMessage || typeof newMessage !== 'object') return

			// Update conversation list: latest preview and unread count
			setConversations(prevConvs => {
				return prevConvs.map(conv => {
					if (conv.id === newMessage.conversation_id) {
						const isActiveRoom = parseInt(currentRoomRef.current) === newMessage.conversation_id
						const isIncoming = newMessage.sender_id !== user.id
						return {
							...conv,
							latestMessage: newMessage,
							unreadCount: isActiveRoom ? 0 : Math.max(0, (conv.unreadCount || 0) + (isIncoming ? 1 : 0))
						}
					}
					return conv
				})
			})

			// Append to open thread if it's the active room
			if (parseInt(currentRoomRef.current) === newMessage.conversation_id) {
				setMessages(prev => {
					// 1) If same server id already exists, ignore
					if (newMessage.id && prev.some(existing => existing.id === newMessage.id)) {
						return prev
					}
					// 2) If this is a server echo of our optimistic message, merge/replace
					if (newMessage.client_temp_id) {
						const idx = prev.findIndex(m => m.client_temp_id === newMessage.client_temp_id)
						if (idx !== -1) {
							const updated = [...prev]
							updated[idx] = { ...updated[idx], ...newMessage, status: newMessage.status || 'sent' }
							return updated
						}
					}
					// 3) If incoming message has same text, sender and close timestamp as the last optimistic one, drop it
					const last = prev[prev.length - 1]
					if (
						last && last.status === 'sending' &&
						last.sender_id === newMessage.sender_id &&
						last.message_text === newMessage.message_text
					) {
						return prev
					}
					const enriched = (newMessage.sender_id !== user.id) ? { ...newMessage, status: newMessage.status || 'seen' } : newMessage
					return [...prev, enriched]
				})
			}
		}

		socketService.onMessage(handleIncoming)

		return () => {
			// Leave room and remove message listener
			socketService.leaveRoom(activeConversationId)
			socketService.removeListener('message')
			// Also remove alternate event names listeners
			socketService.removeListener('new-message')
			socketService.removeListener('chat-message')
		}
	}, [activeConversationId])

	// Periodic auto-refresh as a safety net in case socket events are missed
	useEffect(() => {
		if (!activeConversationId) return
		const intervalId = setInterval(() => {
			loadMessages(activeConversationId)
		}, 8000) // every 8s
		return () => clearInterval(intervalId)
	}, [activeConversationId])

	const handleSelectConversation = (conversationId) => {
		setActiveConversationId(conversationId)
		loadMessages(conversationId)
		// Clear unread count for this conversation immediately
		setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c))
		// On mobile, show conversation and hide conversation list
		if (window.innerWidth < 768) {
			setShowConversation(true)
		}
	}

	const handleBackToList = () => {
		setShowConversation(false)
	}

	const handleSend = async () => {
		const text = messageInput.trim()
		if (!text || !activeConversationId || !activeConversation || isSending) return

		setIsSending(true)
		try {
			// Optimistic message with temporary client id
			const clientTempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`
			const optimisticMessage = {
				id: clientTempId,
				client_temp_id: clientTempId,
				message_text: text,
				conversation_id: parseInt(activeConversationId),
				sender_id: user.id,
				receiver_id: activeConversation.otherUser.id,
				created_at: new Date().toISOString(),
				status: 'sending'
			}
			setMessages(prev => {
				// Prevent double-append of same optimistic message
				if (prev.some(m => m.client_temp_id === clientTempId)) return prev
				return [...prev, optimisticMessage]
			})

			const messageData = {
				message: text,
				conversation_id: parseInt(activeConversationId),
				receiver_id: activeConversation.otherUser.id,
				client_temp_id: clientTempId
			}

			const resp = await messagingService.sendMessage(messageData)
			// If API returns the saved message, reconcile status immediately
			if (resp && resp.success && resp.message) {
				setMessages(prev => {
					const idx = prev.findIndex(m => m.client_temp_id === clientTempId)
					if (idx === -1) return prev
					const updated = [...prev]
					updated[idx] = { ...updated[idx], ...resp.message, status: resp.message.status || 'sent' }
					return updated
				})
			}
			setMessageInput('')

			// Stop typing indicator
			socketService.emitStopTyping(activeConversationId)
			
		} catch (error) {
			console.error('Error sending message:', error)
			// Mark optimistic message as failed
			setMessages(prev => prev.map(m => m.status === 'sending' ? { ...m, status: 'failed' } : m))
			setError('Failed to send message')
		} finally {
			setIsSending(false)
		}
	}

	// When viewing a conversation, mark incoming messages as seen locally
	useEffect(() => {
		if (!activeConversationId) return
		// Mark messages from other user as seen
		setMessages(prev => prev.map(m => {
			if (m.conversation_id === parseInt(activeConversationId) && m.sender_id !== user.id) {
				return { ...m, status: 'seen' }
			}
			return m
		}))
		// Clear unread count for the opened conversation
		setConversations(prev => prev.map(c => c.id === parseInt(activeConversationId) ? { ...c, unreadCount: 0 } : c))
	}, [activeConversationId])

	const handleTyping = () => {
		if (!activeConversationId) return
		
		// Emit typing indicator
		socketService.emitTyping(activeConversationId)
		
		// Clear existing timeout
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current)
		}
		
		// Set new timeout to stop typing
		typingTimeoutRef.current = setTimeout(() => {
			socketService.emitStopTyping(activeConversationId)
		}, 1000)
	}

	// Filter conversations based on search query
	const filteredConversations = useMemo(() => {
		if (!searchQuery.trim()) return conversations
		return conversations.filter(conv => 
			conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(conv.latestMessage && conv.latestMessage.message_text.toLowerCase().includes(searchQuery.toLowerCase()))
		)
	}, [conversations, searchQuery])

	// Format time for display
	const formatTime = (timestamp) => {
		const date = new Date(timestamp)
		const now = new Date()
		const diffInHours = (now - date) / (1000 * 60 * 60)
		
		if (diffInHours < 24) {
			return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		} else if (diffInHours < 168) { // 7 days
			return date.toLocaleDateString([], { weekday: 'short' })
		} else {
			return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
		}
	}

	// Check if message is from current user
	const isMessageFromMe = (message) => {
		return message.sender_id === user.id
	}

	// Dismiss booking notification
	const dismissBookingNotification = () => {
		setBookingNotification(null)
	}


	// Show loading or error states
	if (loading && conversations.length === 0) {
		return (
			<div className="min-h-screen bg-white">
				<ListingHader />
				<div className="h-20" />
				<div className="flex items-center justify-center h-64">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
						<p className="text-gray-600">Loading conversations...</p>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="min-h-screen bg-white">
				<ListingHader />
				<div className="h-20" />
				<div className="flex items-center justify-center h-64">
					<div className="text-center">
						<p className="text-red-600 mb-4">{error}</p>
						<button 
							onClick={() => window.location.reload()} 
							className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
						>
							Retry
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-white">
			<ListingHader />
			<div className="h-20" />

			{/* Desktop Layout */}
			<div className="hidden md:flex h-[calc(100vh-5rem)] bg-gray-50">
					{/* Conversations list */}
					<aside className="w-1/3 border-r border-gray-200 flex flex-col bg-white shadow-lg">
						<div className="px-6 py-4 border-b border-gray-200 bg-white">
							<div className="flex items-center justify-between mb-3">
								<h1 className="text-xl font-bold text-gray-900">Messages</h1>
							</div>
							<div className="relative">
								<input
									type="text"
									placeholder="Search conversations..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full px-4 py-2 pl-10 rounded-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
								/>
								<svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
							{/* Notification Status */}
							{notificationPermission && (
								<div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
									{notificationPermission.supported ? (
										notificationPermission.granted ? (
											<>
												<svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
												</svg>
												<span>Notifications enabled</span>
											</>
										) : (
											<>
												<svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
												</svg>
												<span>Notifications blocked</span>
											</>
										)
									) : (
										<>
											<svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
											</svg>
											<span>Notifications not supported</span>
										</>
									)}
								</div>
							)}
						</div>
						<div className="flex-1 overflow-y-auto">
							{filteredConversations.length === 0 ? (
								<div className="flex items-center justify-center h-32">
									<p className="text-gray-500 text-center">
										{searchQuery ? 'No conversations found' : 'No conversations yet'}
									</p>
								</div>
							) : (
								filteredConversations.map(conv => (
								<button
										key={conv.id}
										onClick={() => handleSelectConversation(conv.id)}
										className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-all duration-200 group ${activeConversationId === conv.id ? 'bg-gray-50 border-r-4 border-blue-500' : ''}`}
								>
									<div className="relative">
											{conv.otherUser.profile_picture ? (
												<img 
													src={conv.otherUser.profile_picture} 
													alt={conv.otherUser.name} 
													className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-md" 
												/>
											) : (
												<UserIcon 
													size="w-14 h-14" 
													ringColor="ring-white" 
													shadow={true}
													name={conv.otherUser.name}
													showInitials={true}
												/>
											)}
											{/* Online status could be added here if available */}
									</div>
									<div className="flex-1 min-w-0 text-left">
										<div className="flex items-center justify-between gap-2">
												<p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
													{conv.otherUser.name}
												</p>
												<span className="text-xs text-gray-500 font-medium">
													{conv.latestMessage ? formatTime(conv.latestMessage.created_at) : ''}
												</span>
											</div>
											<p className="text-sm text-gray-600 truncate mt-1 group-hover:text-gray-700 transition-colors">
												{conv.latestMessage ? conv.latestMessage.message_text : 'No messages yet'}
											</p>
										</div>
										{/* Unread count could be added here if available */}
									</button>
								))
							)}
						</div>
					</aside>

					{/* Chat thread */}
					<section className="flex-1 flex flex-col bg-white">
						{/* Chat header */}
						<div className="px-6 py-6 border-b border-gray-200 flex items-center gap-4 bg-white shadow-sm">
							{activeConversation && (
								<>
									<div className="relative">
										{activeConversation.otherUser.profile_picture ? (
											<img 
												src={activeConversation.otherUser.profile_picture} 
												alt={activeConversation.otherUser.name} 
												className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 shadow-md" 
											/>
										) : (
											<UserIcon 
												size="w-12 h-12" 
												ringColor="ring-blue-100" 
												shadow={true}
												name={activeConversation.otherUser.name}
												showInitials={true}
											/>
										)}
										{/* Online status could be added here if available */}
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-lg font-semibold text-gray-900">{activeConversation.otherUser.name}</p>
										<p className="text-sm text-gray-500">
											{/* Online status could be shown here */}
											{activeConversation.latestMessage ? 'Last seen recently' : 'Active'}
										</p>
									</div>
									<div className="flex items-center gap-2">
										<button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
											<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
											</svg>
										</button>
										<button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
											<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
											</svg>
										</button>
									</div>
								</>
							)}
						</div>

						{/* Messages */}
						<div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-6">
							<div className="max-w-3xl mx-auto space-y-6">
								{/* Booking Notification */}
								<BookingNotification 
									notification={bookingNotification} 
									onDismiss={dismissBookingNotification} 
								/>
								
								{messages.length === 0 ? (
									<div className="flex items-center justify-center h-32">
										<p className="text-gray-500">No messages yet. Start the conversation!</p>
									</div>
								) : (
									messages.map((m, i) => {
										const fromMe = isMessageFromMe(m)
										return (
											<div key={`${m.id}-${m.created_at}-${i}`} className={`flex ${fromMe ? 'justify-end' : 'justify-start'} group`}>
												<div className={`relative max-w-[75%] ${fromMe ? 'ml-16' : 'mr-16'}`}>
												{/* Message bubble */}
													<div className={`${fromMe ? 'bg-black text-white' : 'bg-white text-gray-900 border border-gray-200'} px-4 py-3 rounded-2xl shadow-sm relative`}> 
														{isBookingTextMessage(m.message_text) ? (
															<div className={`${fromMe ? 'text-white' : 'text-gray-900'}`}>
																<BookingInlineCard data={parseBookingTextMessage(m.message_text)} />
															</div>
														) : (
															<p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.message_text}</p>
														)}
														<div className={`flex items-center justify-end gap-2 mt-2 ${fromMe ? 'text-gray-300' : 'text-gray-400'}`}>
															<span className="text-xs font-medium">{formatTime(m.created_at)}</span>
															<MessageStatus status={m.status} fromMe={fromMe} />
												</div>
											</div>
											{/* Speech bubble tail */}
													<div className={`absolute ${fromMe ? 'right-[-6px] top-4' : 'left-[-6px] top-4'}`}>
														<div className={`w-0 h-0 ${fromMe ? 'border-l-[6px] border-l-black border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent' : 'border-r-[6px] border-r-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent'}`}></div>
											</div>
											{/* Border tail for received messages */}
													{!fromMe && (
												<div className="absolute left-[-7px] top-4">
													<div className="w-0 h-0 border-r-[7px] border-r-gray-200 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent"></div>
												</div>
											)}
										</div>
									</div>
										)
									})
								)}
								{isTyping && (
									<div className="flex justify-start">
										<TypingIndicator isTyping={isTyping} />
									</div>
								)}
								<div ref={messagesEndRef} />
							</div>
						</div>

						{/* Composer */}
						<div className="border-t border-gray-200 p-6 bg-white shadow-lg">
							<div className="max-w-3xl mx-auto">
								<div className="flex items-center gap-4 bg-gray-50 rounded-full px-6 py-4 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
									<button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
										<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
										</svg>
									</button>
								<input
									type="text"
									value={messageInput}
									onChange={(e) => {
										setMessageInput(e.target.value)
										handleTyping()
									}}
										placeholder="Type a message..."
										className="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-500"
									onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSend()}
								/>
									<button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
										<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
									</button>
									<button 
										onClick={handleSend} 
										disabled={!messageInput.trim() || isSending}
										className="inline-flex items-center justify-center rounded-full w-10 h-10 bg-black/90 backdrop-blur-sm hover:bg-black disabled:bg-gray-300 text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<path d="M22 2L11 13"></path>
										<path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
									</svg>
								</button>
								</div>
							</div>
						</div>
					</section>
				</div>

			{/* Mobile Layout */}
			<div className="md:hidden h-[calc(100dvh-5rem)] bg-gray-50 min-h-0">
					{!showConversation ? (
						/* Mobile: Client List */
						<div className="h-full flex flex-col bg-white min-h-0">
							<div className="px-4 py-4 border-b border-gray-200 bg-white">
								<div className="flex items-center justify-between mb-3">
									<h1 className="text-xl font-bold text-gray-900">Messages</h1>
								</div>
								<div className="relative">
									<input
										type="text"
										placeholder="Search conversations..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-full px-4 py-2 pl-10 rounded-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
									/>
									<svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>
								</div>
								{/* Notification Status - Mobile */}
								{notificationPermission && (
									<div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
										{notificationPermission.supported ? (
											notificationPermission.granted ? (
												<>
													<svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
													</svg>
													<span>Notifications enabled</span>
												</>
											) : (
												<>
													<svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
													</svg>
													<span>Notifications blocked</span>
												</>
											)
										) : (
											<>
												<svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
												</svg>
												<span>Notifications not supported</span>
											</>
										)}
									</div>
								)}
							</div>
							<div className="flex-1 overflow-y-auto min-h-0">
								{filteredConversations.length === 0 ? (
									<div className="flex items-center justify-center h-32">
										<p className="text-gray-500 text-center">
											{searchQuery ? 'No conversations found' : 'No conversations yet'}
										</p>
									</div>
								) : (
									filteredConversations.map(conv => (
									<button
											key={conv.id}
											onClick={() => handleSelectConversation(conv.id)}
										className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 group"
									>
										<div className="relative">
												{conv.otherUser.profile_picture ? (
													<img 
														src={conv.otherUser.profile_picture} 
														alt={conv.otherUser.name} 
														className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-md" 
													/>
												) : (
													<UserIcon 
														size="w-14 h-14" 
														ringColor="ring-white" 
														shadow={true}
														name={conv.otherUser.name}
														showInitials={true}
													/>
												)}
												{/* Online status could be added here if available */}
										</div>
										<div className="flex-1 min-w-0 text-left">
											<div className="flex items-center justify-between gap-2">
													<p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
														{conv.otherUser.name}
													</p>
													<span className="text-xs text-gray-500 font-medium">
														{conv.latestMessage ? formatTime(conv.latestMessage.created_at) : ''}
													</span>
												</div>
												<p className="text-sm text-gray-600 truncate mt-1 group-hover:text-gray-700 transition-colors">
													{conv.latestMessage ? conv.latestMessage.message_text : 'No messages yet'}
												</p>
											</div>
											{/* Unread count could be added here if available */}
										</button>
									))
								)}
							</div>
						</div>
					) : (
						/* Mobile: Conversation View */
						<div className="h-full flex flex-col bg-white min-h-0">
							{/* Mobile Chat Header with Back Button */}
							<div className="px-4 py-6 border-b border-gray-200 flex items-center gap-4 bg-white shadow-sm">
								<button 
									onClick={handleBackToList}
									className="p-3 hover:bg-gray-100 rounded-full transition-colors"
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<path d="M19 12H5M12 19l-7-7 7-7"/>
									</svg>
								</button>
								{activeConversation && (
									<>
										<div className="relative">
											{activeConversation.otherUser.profile_picture ? (
												<img 
													src={activeConversation.otherUser.profile_picture} 
													alt={activeConversation.otherUser.name} 
													className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 shadow-md" 
												/>
											) : (
												<UserIcon 
													size="w-12 h-12" 
													ringColor="ring-blue-100" 
													shadow={true}
													name={activeConversation.otherUser.name}
													showInitials={true}
												/>
											)}
											{/* Online status could be added here if available */}
										</div>
										<div className="min-w-0 flex-1">
											<p className="text-lg font-semibold text-gray-900">{activeConversation.otherUser.name}</p>
											<p className="text-sm text-gray-500">
												{activeConversation.latestMessage ? 'Last seen recently' : 'Active'}
											</p>
										</div>
									</>
								)}
							</div>

							{/* Mobile Messages */}
							<div className="flex-1 overflow-y-auto min-h-0 bg-gray-50 px-4 py-6">
								<div className="space-y-6">
									{/* Booking Notification - Mobile */}
									<BookingNotification 
										notification={bookingNotification} 
										onDismiss={dismissBookingNotification} 
									/>
									
									{messages.length === 0 ? (
										<div className="flex items-center justify-center h-32">
											<p className="text-gray-500">No messages yet. Start the conversation!</p>
										</div>
									) : (
										messages.map((m, i) => {
											const fromMe = isMessageFromMe(m)
											return (
												<div key={`${m.id}-${m.created_at}-${i}`} className={`flex ${fromMe ? 'justify-end' : 'justify-start'} group`}>
													<div className={`relative max-w-[85%] ${fromMe ? 'ml-12' : 'mr-12'}`}>
												{/* Message bubble */}
													<div className={`${fromMe ? 'bg-black text-white' : 'bg-white text-gray-900 border border-gray-200'} px-4 py-3 rounded-2xl shadow-sm relative`}> 
														{isBookingTextMessage(m.message_text) ? (
															<div className={`${fromMe ? 'text-white' : 'text-gray-900'}`}>
																<BookingInlineCard data={parseBookingTextMessage(m.message_text)} />
															</div>
														) : (
															<p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.message_text}</p>
														)}
															<div className={`flex items-center justify-end gap-2 mt-2 ${fromMe ? 'text-gray-300' : 'text-gray-400'}`}>
																<span className="text-xs font-medium">{formatTime(m.created_at)}</span>
																<MessageStatus status={m.status} fromMe={fromMe} />
													</div>
												</div>
												{/* Speech bubble tail */}
														<div className={`absolute ${fromMe ? 'right-[-6px] top-4' : 'left-[-6px] top-4'}`}>
															<div className={`w-0 h-0 ${fromMe ? 'border-l-[6px] border-l-black border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent' : 'border-r-[6px] border-r-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent'}`}></div>
												</div>
												{/* Border tail for received messages */}
														{!fromMe && (
													<div className="absolute left-[-7px] top-4">
														<div className="w-0 h-0 border-r-[7px] border-r-gray-200 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent"></div>
													</div>
												)}
											</div>
										</div>
											)
										})
									)}
									{isTyping && (
										<div className="flex justify-start">
											<TypingIndicator isTyping={isTyping} />
										</div>
									)}
									<div ref={messagesEndRef} />
								</div>
							</div>

							{/* Mobile Composer */}
							<div className="border-t border-gray-200 p-4 bg-white shadow-lg">
								<div className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-3 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
									<button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
										<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
										</svg>
									</button>
									<input
										type="text"
										value={messageInput}
										onChange={(e) => {
											setMessageInput(e.target.value)
											handleTyping()
										}}
										placeholder="Type a message..."
										className="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-500"
										onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSend()}
									/>
									<button 
										onClick={handleSend} 
										disabled={!messageInput.trim() || isSending}
										className="inline-flex items-center justify-center rounded-full w-10 h-10 bg-black/90 backdrop-blur-sm hover:bg-black disabled:bg-gray-300 text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<path d="M22 2L11 13"></path>
											<path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
										</svg>
									</button>
								</div>
							</div>
						</div>
					)}
			</div>
		</div>
	)
}

export default Messages