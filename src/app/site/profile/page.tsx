"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase-client"; 
import { Loader2, User as UserIcon, Mail, Save, AlertTriangle, CheckCircle, Edit, Phone, MapPin } from "lucide-react";

// --- Configuration ---
const PRIMARY_COLOR = "#8ED26B"; 
const BORDER_COLOR = "#e6f6dc";

// --- Type Definitions ---
interface UserProfile {
    id: string;
    email: string;
    username: string | null; 
    avatar_url: string | null;
    // NEW FIELDS
    phone_number: string | null;
    address: string | null;
}

// =========================================================================
//                             Main Component (ProfilePage)
// =========================================================================

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State for the editable form data
    const [username, setUsername] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(''); // NEW STATE
    const [address, setAddress] = useState('');         // NEW STATE
    
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // --- Data Fetching Logic ---
    const fetchUserProfile = useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;

        if (!user) {
            setError("You must be logged in to view your profile.");
            setLoading(false);
            return;
        }

        // 2. Fetch the 'profiles' table data, including new fields
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username, avatar_url, phone_number, address') // SELECT NEW FIELDS
            .eq('id', user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            setError(`Failed to load profile data: ${profileError.message}. Check RLS on 'profiles'.`);
            setLoading(false);
            return;
        }

        // 3. Set the state
        const userProfile: UserProfile = {
            id: user.id,
            email: user.email || 'N/A',
            username: profileData?.username || user.user_metadata.full_name || 'Set your name',
            avatar_url: profileData?.avatar_url || null,
            // Initialize new state fields
            phone_number: profileData?.phone_number || null,
            address: profileData?.address || null,
        };

        setProfile(userProfile);
        setUsername(userProfile.username || '');
        setPhoneNumber(userProfile.phone_number || ''); // Initialize form state
        setAddress(userProfile.address || '');           // Initialize form state
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    // --- Profile Update Logic ---
    const handleUpdateProfile = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || isSaving) return;

        setIsSaving(true);
        setSaveSuccess(false);
        setError(null);

        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) {
            setError("You must be logged in to update your profile.");
            setIsSaving(false);
            return;
        }

        // Construct the updates object including the new fields
        const updates = {
            id: user.id,
            username,
            phone_number: phoneNumber.trim() || null, // Save as null if empty
            address: address.trim() || null,         // Save as null if empty
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('profiles')
            .upsert(updates, { onConflict: 'id' }); 

        if (error) {
            console.error("Profile update error:", error);
            setError(`Failed to save profile: ${error.message}`);
            setIsSaving(false);
        } else {
            // Update local state and show success message
            setProfile(prev => prev ? { ...prev, username, phone_number: phoneNumber, address } : null);
            setSaveSuccess(true);
            setIsSaving(false);
            
            setTimeout(() => setSaveSuccess(false), 3000); 
        }

    }, [profile, username, phoneNumber, address, isSaving]); // Include new states in dependency array


    // --- Render Loading/Error States ---
    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-20">
            <Loader2 className={`animate-spin h-12 w-12 mb-4`} style={{ color: PRIMARY_COLOR }} />
            <p className="text-xl font-medium text-gray-600">Loading your profile...</p>
        </div>
    );
    
    if (error && !profile) return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-20">
            <div className="p-8 bg-red-50 border border-red-300 text-red-700 rounded-xl flex flex-col items-center shadow-lg max-w-lg mx-auto">
                <AlertTriangle className="w-8 h-8 mb-3" />
                <span className="text-xl font-bold mb-3">Authentication Error</span>
                <span className="text-center font-medium">{error}</span>
            </div>
        </div>
    );

    // If loaded successfully, render the profile page
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-12 sm:py-20">
            <div className="max-w-4xl mx-auto">
                
                {/* Header */}
                <div className="flex items-center bg-white p-6 sm:p-8 rounded-2xl shadow-xl mb-10 border-t-4" style={{ borderColor: PRIMARY_COLOR }}>
                    <UserIcon className={`w-8 h-8 sm:w-10 sm:h-10 mr-4`} style={{ color: PRIMARY_COLOR }} />
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Account Settings
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Column 1: Profile Card (Static Info) */}
                    <div 
                        className="lg:col-span-1 p-6 sm:p-8 rounded-2xl shadow-xl border-l-4" 
                        style={{ backgroundColor: BORDER_COLOR, borderLeftColor: PRIMARY_COLOR }}
                    >
                        <div className="flex flex-col items-center text-center pb-4 mb-4 border-b border-gray-300">
                            {/* Simple Avatar Placeholder */}
                            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-white mb-4 shadow-inner" style={{ backgroundColor: PRIMARY_COLOR }}>
                                <UserIcon className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-xl font-extrabold text-gray-800">{profile?.username || 'Guest'}</h2>
                            <p className="text-sm text-gray-600">{profile?.email}</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-start text-gray-700">
                                <MapPin className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: PRIMARY_COLOR }} />
                                <div>
                                    <p className="text-sm font-semibold">Address</p>
                                    <p className="text-sm break-words">{profile?.address || 'Not set'}</p>
                                </div>
                            </div>
                            <div className="flex items-start text-gray-700">
                                <Phone className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: PRIMARY_COLOR }} />
                                <div>
                                    <p className="text-sm font-semibold">Phone Number</p>
                                    <p className="text-sm break-words">{profile?.phone_number || 'Not set'}</p>
                                </div>
                            </div>
                            <div className="flex items-start text-gray-700">
                                <Mail className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: PRIMARY_COLOR }} />
                                <div>
                                    <p className="text-sm font-semibold">Email</p>
                                    <p className="text-sm break-all">{profile?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2 & 3: Profile Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-xl">
                            <h2 className="text-2xl font-bold mb-6 border-b pb-3 text-gray-800 flex items-center">
                                <Edit className="w-5 h-5 mr-2" /> Update Profile Details
                            </h2>
                            
                            {/* Status Messages */}
                            {saveSuccess && (
                                <div className="p-4 mb-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center shadow-sm">
                                    <CheckCircle className="w-5 h-5 mr-3" />
                                    <span className="font-medium">Profile saved successfully!</span>
                                </div>
                            )}
                            {error && !saveSuccess && (
                                <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center shadow-sm">
                                    <AlertTriangle className="w-5 h-5 mr-3" />
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                
                                {/* Username Field */}
                                <div>
                                    <label htmlFor="username" className="block text-lg font-medium text-gray-700 mb-2">
                                        Name / Username
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="form-input block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150"
                                        style={{ borderColor: BORDER_COLOR, '--tw-ring-color': PRIMARY_COLOR }}
                                        required
                                        disabled={isSaving}
                                    />
                                </div>

                                {/* Phone Number Field (NEW) */}
                                <div>
                                    <label htmlFor="phone_number" className="block text-lg font-medium text-gray-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-2 text-gray-500" /> Phone Number
                                    </label>
                                    <input
                                        id="phone_number"
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="form-input block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150"
                                        style={{ borderColor: BORDER_COLOR, '--tw-ring-color': PRIMARY_COLOR }}
                                        disabled={isSaving}
                                        placeholder="e.g., 9876543210"
                                    />
                                </div>

                                {/* Address Field (NEW) */}
                                <div>
                                    <label htmlFor="address" className="block text-lg font-medium text-gray-700 mb-2">
                                        <MapPin className="w-4 h-4 inline mr-2 text-gray-500" /> Full Address
                                    </label>
                                    <textarea
                                        id="address"
                                        rows={3}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="form-textarea block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 resize-none"
                                        style={{ borderColor: BORDER_COLOR, '--tw-ring-color': PRIMARY_COLOR }}
                                        disabled={isSaving}
                                        placeholder="Street, City, State, Zip Code"
                                    />
                                </div>

                                {/* Email Field (Read-only) */}
                                <div>
                                    <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={profile?.email || ''}
                                        className="form-input block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 shadow-inner cursor-not-allowed text-gray-500"
                                        disabled
                                    />
                                </div>

                                {/* Save Button */}
                                <button
                                    type="submit"
                                    disabled={isSaving || !username.trim()} // Require username to be set
                                    className={`w-full py-3 text-white text-lg font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-[1.005] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                                    style={{ backgroundColor: PRIMARY_COLOR }}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5 mr-3" /> Save Changes
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                
                {/* --- IMPROVED SIGN OUT SECTION --- */}
                <div className="mt-10 p-6 sm:p-8 bg-white rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-center border border-red-200">
                    <div className="flex flex-col text-center sm:text-left mb-4 sm:mb-0">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">Session Management</h3>
                        <p className="text-sm text-gray-600">Securely sign out of your account on all devices.</p>
                    </div>

                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white font-bold rounded-xl shadow-md transition-all duration-200 hover:bg-red-600 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300 flex items-center justify-center"
                    >
                        {/* Custom SVG for LogOut/SignOut - Lucide's icon set doesn't have a direct import for LogOut from the provided list, so using a standard icon for clarity. */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h9" />
                        </svg>
                        Sign Out
                    </button>
                </div>
                {/* --- END IMPROVED SIGN OUT SECTION --- */}

            </div>
        </div>
    );
}