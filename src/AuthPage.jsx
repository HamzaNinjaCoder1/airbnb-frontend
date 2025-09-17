import React, { useState } from 'react';
import api from './api';
import SecondHeader from './SecondHeader';
import Footer from './Footer';
import { useAuth } from './AuthContext';

function AuthPage({ onAuthSuccess, authMethod: initialAuthMethod = 'email' }) {
    const { login, register } = useAuth();
    const [isEmailExist, checkEmailExist] = useState(null);
    const [isPhoneExist, checkPhoneExist] = useState(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [dialCode, setDialCode] = useState("+223");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [authMethod, setAuthMethod] = useState(initialAuthMethod);
    const [showError, setShowError] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    const [showsignup, setShowsignup] = useState(true);
    const [isSignupFlow, setIsSignupFlow] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [marketingOptOut, setMarketingOptOut] = useState(false);
    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [birthDateError, setBirthDateError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setShowError(true);
        if (!phoneNumber.trim()) {
            setErrorMessage("Enter your phone number");
            return;
        }
        if (phoneNumber.length < 11 || phoneNumber.length > 12) {
            setErrorMessage("Enter a valid phone number");
            return;
        }
        setErrorMessage("");
        setShowError(false);
        setSuccessMessage(true);
        setTimeout(() => {
            if (onAuthSuccess) {
                onAuthSuccess();
            } else {
                // Redirect to home page or handle success differently
                window.location.href = '/';
            }
        }, 2000);
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setShowError(true);
        if (!email.trim()) {
            setErrorMessage("Enter your email");
            return;
        }
        if (!email.includes("@") || !email.includes(".")) {
            setErrorMessage("Enter a valid email");
            return;
        }
        try {
            const response = await api.post(`/api/users/checkemailexist`, { email });
            // If we get here, email is available (200 response) - show signup form
            checkEmailExist(false);
            setIsSignupFlow(true);
            setShowError(false);
            setErrorMessage("");
            setFirstName("");
            setLastName("");
            setBirthDate("");
            setPassword("");
            return;
        } catch (err) {
            console.error('Email check failed:', err);
            console.error('Error response:', err?.response?.data);
            const status = err?.response?.status;
            const serverMessage = err?.response?.data?.error || err?.response?.data?.message;
            
            // Check if it's a 400 error (email exists)
            if (status === 400) {
                // Email exists - user should login with password
                console.log('Email exists, showing password field');
                console.log('Current state before update - isEmailExist:', isEmailExist, 'isSignupFlow:', isSignupFlow);
                checkEmailExist(true);
                setIsSignupFlow(false); // Make sure we're not in signup flow
                setErrorMessage("");
                setShowError(false);
                setPassword(""); // Clear password field
                console.log('State updated - should show password field now');
                return;
            } else if (serverMessage) {
                setErrorMessage(serverMessage);
            } else if (!err?.response && err?.request) {
                setErrorMessage("Cannot reach server. Is the API running at https://dynamic-tranquility-production.up.railway.app?");
            } else if (status === 404) {
                setErrorMessage("Endpoint not found: /api/users/checkemailexist");
            } else if (status === 500) {
                setErrorMessage("Server error while verifying email. Please try again later.");
            } else {
                setErrorMessage("Unable to verify email right now. Please try again.");
            }
            return;
        }
    };

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setShowError(true);
        if (!password.trim()) {
            setErrorMessage("Enter your password");
            return;
        }
        try {
            const result = await login(email, password);
            if (!result.success) {
                setErrorMessage(result.error);
                return;
            }
        } catch (err) {
            setErrorMessage("Unable to log in right now. Please try again.");
            return;
        }
        setErrorMessage("");
        setShowError(false);
        setSuccessMessage(true);
        setTimeout(() => {
            if (onAuthSuccess) {
                onAuthSuccess();
            } else {
                // Redirect to home page or handle success differently
                window.location.href = '/';
            }
        }, 1200);
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setFirstNameError("");
        setLastNameError("");
        setBirthDateError("");
        setPasswordError("");
        let hasError = false;
        if (!firstName.trim()) { setFirstNameError("Enter your first name"); hasError = true; }
        if (!lastName.trim()) { setLastNameError("Enter your last name"); hasError = true; }
        if (!birthDate) { setBirthDateError("Enter your birthdate"); }
        if (!password.trim()) { setPasswordError("Enter your password"); hasError = true; }
        if (password && password.length < 8) { setPasswordError("Password must be at least 8 characters"); hasError = true; }
        if (password && password.length >= 8 && (!password.match(/[A-Z]/) || !password.match(/\d/) || !password.match(/[^a-zA-Z0-9]/))) { 
            setPasswordError("Password must contain at least one uppercase letter, one number, and one special character"); 
            hasError = true; 
        }
        if (hasError) return;
        try {
            const result = await register({
                first_name: firstName,
                last_name: lastName,
                email,
                password
            });
            if (!result.success) {
                setPasswordError(result.error);
                return;
            }
            
            setErrorMessage("");
            setShowError(false);
            setSuccessMessage(true);
            setTimeout(() => {
                if (onAuthSuccess) {
                    onAuthSuccess();
                } else {
                    // Redirect to home page or handle success differently
                    window.location.href = '/';
                }
            }, 1200);
        } catch (err) {
            const serverMessage = err?.response?.data?.error || err?.response?.data?.message;
            if (serverMessage?.toLowerCase().includes('email')) {
                setErrorMessage(serverMessage);
            } else if (serverMessage) {
                setPasswordError(serverMessage);
            } else {
                setPasswordError("Unable to sign up right now. Please try again.");
            }
        }
    };
    // Debug logging
    console.log('Render state - isSignupFlow:', isSignupFlow, 'isEmailExist:', isEmailExist);
    
    if (!isSignupFlow) {
        return (
            <>
                <SecondHeader />
                <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md sm:max-w-lg md:max-w-xl space-y-8 border border-gray-200 rounded-xl p-4 sm:p-6 md:p-8 mt-24 sm:mt-28 mb-8">
                        <div className="text-center">
                            <h1 className="text-xl font-medium text-gray-700 mb-2">
                                Log in or sign up
                            </h1>
                            <div className="border-b border-gray-400/40 w-full mt-6 "></div>
                            <p className="text-2xl text-black font-medium mt-6 text-left">Welcome to Airbnb</p>
                        </div>
                        
                        <form className="mt-1 space-y-4" onSubmit={isEmailExist ? handlePasswordLogin : handleEmailSubmit}>
                            <div>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setErrorMessage(""); setShowError(false); }}
                                    className="w-full h-12 sm:h-14 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
                                />
                                {showError && errorMessage && <div className='text-red-600 text-sm mt-2 ml-1 flex items-center gap-1'>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-label="Error" role="img" focusable="false" className="w-3 h-3 text-red-600" fill="currentColor">
                                        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm0 10.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm.8-6.6H7.2v5.2h1.6z" />
                                    </svg>
                                    {errorMessage}
                                </div>}
                            </div>
                            
                            {isEmailExist && (
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={isPasswordVisible ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setErrorMessage(""); setShowError(false); }}
                                        className="w-full h-12 sm:h-14 pl-4 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
                                    />
                                    <button
                                        type="button"
                                        aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                                        className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 hover:text-black text-sm font-medium'
                                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                    >
                                        {isPasswordVisible ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            )}
                            
                            <button 
                                type="submit" 
                                className="w-full h-12 sm:h-14 bg-gradient-to-r from-[#ff385c] to-[#d42d4a] text-white font-semibold py-3 px-4 rounded-lg text-base hover:from-[#e62e4f] hover:to-[#c42a45] transition-all duration-200"
                            >
                                {isEmailExist ? 'Log in' : 'Continue'}
                            </button>
                        </form>

                        {isEmailExist && (
                            <div className="space-y-3">
                                <div className="text-center">
                                    <button type='button' className='underline text-black font-medium'>Forgot password?</button>
                                </div>
                                <div className="text-center">
                                    <button type='button' className='underline text-black font-medium' onClick={() => { setAuthMethod('phone'); checkEmailExist(null); setIsSignupFlow(false); setPassword(""); setIsPasswordVisible(false); setErrorMessage(""); setShowError(false); setEmail(""); setFirstName(""); setLastName(""); setBirthDate(""); }}>
                                        More login options
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isEmailExist && (
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">or</span>
                                </div>
                            </div>
                        )}

                        {!isEmailExist && (
                            <div className="space-y-3">
                                <button type="button" className="w-full h-14 border border-gray-300 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="22" height="22">
                                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.046 6.053 28.761 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                                        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 14 24 14c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.046 6.053 28.761 4 24 4c-7.682 0-14.314 4.43-17.694 10.691z"/>
                                        <path fill="#4CAF50" d="M24 44c4.695 0 8.964-1.802 12.207-4.742l-5.639-4.727C28.813 35.59 26.52 36 24 36c-5.202 0-9.619-3.317-11.281-7.953l-6.541 5.036C9.496 39.556 16.227 44 24 44z"/>
                                        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.793 2.238-2.231 4.166-4.18 5.571 0  0 0 0 0 0l6.033 4.689C35.914 38.198 44 32 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                                    </svg>
                                    <span className="text-gray-900 font-medium">Continue with Google</span>
                                </button>
                                
                                <button type="button" className="w-full h-14 border border-gray-300 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" className="text-black">
                                        <path d="M16.365 1.43c.146 1.714-.496 3.178-1.29 4.18-.783.988-2.148 1.94-3.493 1.83-.166-1.64.51-3.24 1.29-4.227C13.667 2.117 15.19 1.21 16.365 1.43zM20.5 17.21c-.72 1.586-1.466 3.172-2.644 4.77-.935 1.297-2.025 2.914-3.506 2.94-1.53.03-1.93-.95-3.593-.95-1.665 0-2.106.91-3.612 .98-1.526 .07-2.688-1.4-3.627-2.69-1.979-2.7-3.486-7.62-1.457-10.94 1.02-1.67 2.854-2.73 4.854-2.76 1.515-.03 2.95 1.03 3.593 1.03.643 0 2.46-1.27 4.156-1.08.707 .03 2.69 .29 3.963 2.18-.1 .06-2.36 1.38-2.33 4.12 .03 3.28 2.88 4.38 2.91 4.39z"/>
                                    </svg>
                                    <span className="text-gray-900 font-medium">Continue with Apple</span>
                                </button>
                                
                                <button type="button" className="w-full h-14 border border-gray-300 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" className="text-gray-700">
                                        <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V21a1 1 0 01-1 1C10.4 22 2 13.6 2 3a1 1 0 011-1h3.49a1 1 0 011 1c0 1.24.2 2.45.57 3.57a1 1 0 01-.24 1.02l-2.2 2.2z"/>
                                    </svg>
                                    <span className="text-gray-900 font-medium">Continue with Phone</span>
                                </button>
                                
                                <button type="button" className="w-full h-14 border border-gray-300 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="#1877F2">
                                        <path d="M22 12.06C22 6.478 17.523 2 11.94 2 6.357 2 1.88 6.477 1.88 12.06c0 4.994 3.657 9.136 8.437 9.94v-7.03H7.898v-2.91h2.42V9.845c0-2.39 1.423-3.712 3.6-3.712 1.043 0 2.134.187 2.134.187v2.348h-1.202c-1.184 0-1.552.735-1.552 1.49v1.793h2.64l-.422 2.91h-2.218v7.03C18.343 21.196 22 17.053 22 12.06z"/>
                                    </svg>
                                    <span className="text-gray-900 font-medium">Continue with Facebook</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <Footer />
            </>
        );
    }
    return (
        <>
            <SecondHeader />
            <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="mt-28 mb-12 max-w-xl w-full space-y-8 border border-gray-500/80 rounded-xl p-6">
                    <div>
                        <h2 className="text-center text-3xl font-extrabold text-gray-900">
                            {isSignupFlow ? 'Finish signing up' : 'Log in or sign up '}
                        </h2>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={authMethod === 'phone' ? handleLoginSubmit : (isEmailExist ? handlePasswordLogin : (isSignupFlow ? handleSignupSubmit : handleEmailSubmit))}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            {authMethod === 'phone' ? (
                                <div className="w-full border border-gray-500/80 rounded-xl overflow-hidden">
                                    <label htmlFor="country" className="block text-sm text-gray-600 px-3 pt-[1px] mb-[2px] pb-0 translate-y-1">
                                        Country code
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="country"
                                            value={dialCode}
                                            onChange={(e) => setDialCode(e.target.value)}
                                            className="w-full h-7 pl-3 pr-10 text-gray-900 bg-white focus:outline-none appearance-none tracking-tight"
                                        >
                                            <option value="+223">Mali (+223)</option>
                                            <option value="+92">Pakistan (+92)</option>
                                            <option value="+91">India (+91)</option>
                                            <option value="+86">China (+86)</option>
                                            <option value="+1">United States (+1)</option>
                                            <option value="+44">United Kingdom (+44)</option>
                                            <option value="+1">Canada (+1)</option>
                                            <option value="+61">Australia (+61)</option>
                                            <option value="+49">Germany (+49)</option>
                                            <option value="+33">France (+33)</option>
                                            <option value="+966">Saudi Arabia (+966)</option>
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 select-none">{dialCode}</span>
                                        <input
                                            type="tel"
                                            placeholder="Phone number"
                                            value={phoneNumber}
                                            onChange={(e) => { setPhoneNumber(e.target.value); setErrorMessage(""); setShowError(false); }}
                                            className="w-full h-12 pl-16 pr-3 border-t border-gray-500/80 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {isEmailExist === null && !isSignupFlow && (
                                        <div className="w-full border rounded-xl overflow-hidden">
                                            <input
                                                id="email"
                                                type="email"
                                                placeholder="Email"
                                                value={email}
                                                onChange={(e) => { setEmail(e.target.value); setErrorMessage(""); setShowError(false); }}
                                                className="w-full h-12 px-3 border rounded-xl border-gray-500/80 focus:outline-none"
                                            />
                                            {showError && errorMessage && <div className='text-red-600 text-sm mt-2 ml-1 flex items-center gap-1'>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-label="Error" role="img" focusable="false" className="w-3 h-3 text-red-600" fill="currentColor">
                                                    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm0 10.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm.8-6.6H7.2v5.2h1.6z" />
                                                </svg>
                                                {errorMessage}
                                            </div>}
                                        </div>
                                    )}
                                    {isEmailExist === false && isSignupFlow && (
                                        <div className='w-full space-y-4'>
                                            <div>
                                                <label className='block text-sm text-gray-700 mb-1'>Legal name</label>
                                                <div className='w-full'>
                                                    <input type='text' placeholder='First name on ID' value={firstName} onChange={(e) => { setFirstName(e.target.value); setFirstNameError(""); }} className='w-full h-11 px-3 border border-gray-500/80 rounded-t-xl focus:outline-none' />
                                                    <input type='text' placeholder='Last name on ID' value={lastName} onChange={(e) => { setLastName(e.target.value); setLastNameError(""); }} className='w-full h-11 px-3 border border-t-0 border-gray-500/80 rounded-b-xl focus:outline-none' />
                                                </div>
                                                {firstNameError || lastNameError ? (
                                                    <div className='text-red-600 text-sm mt-2 ml-1'>{firstNameError || lastNameError}</div>
                                                ) : null}
                                                <p className='text-xs text-gray-600 mt-1'>Make sure this matches the name on your government ID.</p>
                                            </div>
                                            <div>
                                                <label className='block text-sm text-gray-700 mb-1'>Date of birth</label>
                                                <input type='date' value={birthDate} onChange={(e) => { setBirthDate(e.target.value); setBirthDateError(""); }} className='w-full h-11 px-3 border rounded-xl border-gray-500/80 focus:outline-none' />
                                                {birthDateError && <div className='text-red-600 text-sm mt-2 ml-1'>{birthDateError}</div>}
                                                <p className='text-xs text-gray-600 mt-1'>To sign up, you need to be at least 18.</p>
                                            </div>
                                            <div>
                                                <label className='block text-sm text-gray-700 mb-1'>Contact info</label>
                                                <input type='email' value={email} disabled className='w-full h-11 px-3 border rounded-xl border-gray-300 bg-gray-100 text-gray-700' />
                                                <p className='text-xs text-gray-600 mt-1'>We'll email you trip confirmations and receipts.</p>
                                            </div>
                                            <div>
                                                <label className='block text-sm text-gray-700 mb-1'>Password</label>
                                                <div className="w-full border rounded-xl overflow-hidden relative">
                                                    <input
                                                        id="signupPassword"
                                                        type={isPasswordVisible ? "text" : "password"}
                                                        placeholder="Password"
                                                        value={password}
                                                        onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                                                        className="w-full h-12 pl-3 pr-16 border rounded-xl border-gray-500/80 focus:outline-none"
                                                    />
                                                    <button type='button' className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-black text-sm font-medium' onClick={() => setIsPasswordVisible(!isPasswordVisible)}>{isPasswordVisible ? 'Hide' : 'Show'}</button>
                                                </div>
                                                {passwordError && <div className='text-red-600 text-sm mt-2 ml-1'>{passwordError}</div>}
                                                <p className='text-xs text-gray-600 mt-2'>By selecting Agree and continue, you agree to the Terms and Privacy Policy.</p>
                                            </div>
                                        </div>
                                    )}
                                    {isEmailExist && (
                                        <div className='w-full space-y-4'>
                                            <div className="w-full border rounded-xl overflow-hidden relative">
                                                <input
                                                    id="password"
                                                    type={isPasswordVisible ? "text" : "password"}
                                                    placeholder="Password"
                                                    value={password}
                                                    onChange={(e) => { setPassword(e.target.value); setErrorMessage(""); setShowError(false); }}
                                                    className="w-full h-12 pl-3 pr-16 border rounded-xl border-gray-500/80 focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-black text-sm font-medium'
                                                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                                >
                                                    {isPasswordVisible ? 'Hide' : 'Show'}
                                                </button>
                                            </div>
                                            {showError && errorMessage && <div className='text-red-600 text-sm mt-2 ml-2 flex items-center gap-1'>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-label="Error" role="img" focusable="false" className="w-3 h-3 text-red-600" fill="currentColor">
                                                    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm0 10.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm.8-6.6H7.2v5.2h1.6z" />
                                                </svg>
                                                {errorMessage}
                                            </div>}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {authMethod === 'phone' ? (
                            <p className='text-xs text-gray-600 mt-2'>We'll call or text you to confirm your number. Standard message and data rates apply. <a href='#' className='underline'>Privacy Policy</a></p>
                        ) : null}

                        {isEmailExist === null && !isSignupFlow && (
                            <button type='submit' className='w-full mt-3 bg-gradient-to-r from-[#ff385c] via-[#ff385c] via-[#ff385c] via-[#d42d4a] via-[#ff385c] to-[#ff385c] text-white font-semibold py-3 px-4 rounded-lg text-base hover:from-[#e62e4f] hover:via-[#e62e4f] hover:via-[#e62e4f] hover:via-[#c42a45] hover:via-[#e62e4f] hover:to-[#e62e4f] transition-all duration-200'>
                                Continue
                            </button>
                        )}

                        {isEmailExist === null && !isSignupFlow && (
                            <>
                                <div className='flex items-center gap-3 my-4'>
                                    <div className='flex-1 border-t border-gray-300'></div>
                                    <span className='text-sm text-gray-600'>or</span>
                                    <div className='flex-1 border-t border-gray-300'></div>
                                </div>
                                <div className='grid grid-cols-3 gap-4'>
                                    <button type="button" className='h-12 border border-black rounded-xl flex items-center justify-center hover:bg-gray-50'>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#1877F2"><path d="M22 12.06C22 6.478 17.523 2 11.94 2 6.357 2 1.88 6.477 1.88 12.06c0 4.994 3.657 9.136 8.437 9.94v-7.03H7.898v-2.91h2.42V9.845c0-2.39 1.423-3.712 3.6-3.712 1.043 0 2.134.187 2.134.187v2.348h-1.202c-1.184 0-1.552.735-1.552 1.49v1.793h 2.64l-.422 2.91h-2.218v7.03C18.343 21.196 22 17.053 22 12.06z" /></svg>
                                    </button>
                                    <button type="button" className='h-12 border border-black rounded-xl flex items-center justify-center hover:bg-gray-50'>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="22" height="22">
                                            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.046 6.053 28.761 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                                            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 14 24 14c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.046 6.053 28.761 4 24 4c-7.682 0-14.314 4.43-17.694 10.691z"/>
                                            <path fill="#4CAF50" d="M24 44c4.695 0 8.964-1.802 12.207-4.742l-5.639-4.727C28.813 35.59 26.52 36 24 36c-5.202 0-9.619-3.317-11.281-7.953l-6.541 5.036C9.496 39.556 16.227 44 24 44z"/>
                                            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.793 2.238-2.231 4.166-4.18 5.571 0 0 0 0 0 0l6.033 4.689C35.914 38.198 44 32 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                                        </svg>
                                    </button>
                                    <button type="button" className='h-12 border border-black rounded-xl flex items-center justify-center hover:bg-gray-50'>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className='text-black'><path d="M16.365 1.43c.146 1.714-.496 3.178-1.29 4.18-.783.988-2.148 1.94-3.493 1.83-.166-1.64.51-3.24 1.29-4.227C13.667 2.117 15.19 1.21 16.365 1.43zM20.5 17.21c-.72 1.586-1.466 3.172-2.644 4.77-.935 1.297-2.025 2.914-3.506 2.94-1.53.03-1.93-.95-3.593-.95-1.665 0-2.106.91-3.612 .98-1.526 .07-2.688-1.4-3.627-2.69-1.979-2.7-3.486-7.62-1.457-10.94 1.02-1.67 2.854-2.73 4.854-2.76 1.515-.03 2.95 1.03 3.593 1.03.643 0 2.46-1.27 4.156-1.08.707 .03 2.69 .29 3.963 2.18-.1 .06-2.36 1.38-2.33 4.12 .03 3.28 2.88 4.38 2.91 4.39z"/></svg>
                                    </button>
                                </div>
                                <button type="button" className='w-full h-12 border border-black rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50' onClick={() => { setAuthMethod(authMethod === 'phone' ? 'email' : 'phone'); setErrorMessage(''); setShowError(false); }}>
                                    {authMethod === 'phone' ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className='text-gray-700'><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z" /></svg>
                                            <span className='text-gray-900 font-medium'>Continue with email</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className='text-gray-700'><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V21a1 1 0 01-1 1C10.4 22 2 13.6 2 3a1 1 0 011-1h3.49a1 1 0 011 1c0 1.24.2 2.45.57 3.57a1 1 0 01-.24 1.02l-2.2 2.2z" /></svg>
                                            <span className='text-gray-900 font-medium'>Continue with phone</span>
                                        </>
                                    )}
                                </button>
                            </>
                        )}

                        {isEmailExist === false && isSignupFlow && (
                            <button type='submit' className='w-full mt-4 bg-gradient-to-r from-[#ff385c] via-[#ff385c] via-[#d42d4a] to-[#ff385c] text-white font-semibold py-3 px-4 rounded-lg text-base hover:from-[#e62e4f] hover:to-[#e62e4f] transition-all duration-200'>
                                Agree and continue
                            </button>
                        )}

                        {isEmailExist && (
                            <>
                                <button type='submit' className='w-full mt-4 bg-gradient-to-r from-[#ff385c] via-[#ff385c] via-[#d42d4a] to-[#ff385c] text-white font-semibold py-3 px-4 rounded-lg text-base hover:from-[#e62e4f] hover:to-[#e62e4f] transition-all duration-200'>
                                    Log in
                                </button>
                                <div className='mt-3 px-1'>
                                    <button type='button' className='underline text-black font-medium'>Forgot password?</button>
                                </div>
                                <div className='mt-4 px-1'>
                                    <button type='button' className='underline text-black font-medium' onClick={() => { setAuthMethod('phone'); checkEmailExist(null); setIsSignupFlow(false); setPassword(""); setIsPasswordVisible(false); setErrorMessage(""); setShowError(false); setEmail(""); }}>
                                        More login options
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </div>

            {successMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-white rounded-3xl w-[560px] max-w-[92%] p-8 shadow-2xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <span className="absolute inset-0 rounded-full bg-rose-400/30 animate-ping"></span>
                                <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="46" height="46" className="text-white" fill="currentColor">
                                        <path d="M9 16.17l-3.88-3.88-1.41 1.41L9 19 20.29 7.71l-1.41-1.41z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900">You're all set!</h3>
                            <p className="text-gray-600 mt-2 text-[0.98rem]">
                                We just confirmed your {authMethod === 'phone' ? 'phone number' : 'email'}.
                            </p>
                            <div className="mt-3 text-gray-900 font-medium">
                                {authMethod === 'phone' ? `${dialCode} ${phoneNumber}` : email}
                            </div>
                            <p className="text-gray-600 mt-3 text-sm">Redirecting you to the main page...</p>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
}

export default AuthPage;
