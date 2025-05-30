import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {LogOut, Moon, Settings} from 'lucide-react';
import {
    onAuthStateChanged,
    signOut,
    User,
    signInWithPopup,
    GoogleAuthProvider,
} from 'firebase/auth';
import { auth, provider } from '../firebase';
import './Header.css';

interface UserProfile {
    name: string;
    email: string;
    picture: string;
}

const Header: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currUser) => {
            setUser(currUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('backendToken');
        if (token) {
            fetchUserProfile(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserProfile = async (token: string) => {
        try {
            const res = await fetch('https://auth-app-877042335787.us-central1.run.app/api/users/profile', {
                headers: { Authorization: token },
            });
            const data = await res.json();
            if (data.success && data.user) {
                setUserProfile({
                    name: data.user.name,
                    email: data.user.email,
                    picture: data.user.picture,
                });
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            const res = await fetch('https://auth-app-877042335787.us-central1.run.app/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken }),
            });

            const data = await res.json();
            console.log(data);
            if (data.success && data.token) {
                localStorage.setItem('backendToken', idToken);
                await fetchUserProfile(idToken);
                setUser(result.user);
                setDropdownOpen(true);
            } else {
                console.error("Backend authentication failed", data);
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };


    const handleLogout = async () => {
        await signOut(auth);
        localStorage.removeItem('backendToken');
        setUserProfile(null);
        setDropdownOpen(false);
        navigate('/');
    };


    return (
        <header className={`p-4 border-b ${'border-pink-700'} ${'bg-gray-900 text-pink-300'} flex justify-between items-center`}>
            <div className="text-3xl font-bold tracking-widest">CRYPTO PULSE</div>
            <div className="flex items-center gap-4">
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                    Dashboard
                </Link>
                <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
                    About
                </Link>
            <button className="p-2">
                <LogOut className={"text-pink-300"} />
            </button>
            </div>
        </header>

        // <header className="header">
        //     <h1 className="logo">CryptoPulse</h1>
        //     <nav className="nav">
        //         <div className="nav-links">
        //             <Link
        //                 to="/"
        //                 className={location.pathname === '/' ? 'active' : ''}
        //             >
        //                 Dashboard
        //             </Link>
        //             <Link
        //                 to="/about"
        //                 className={location.pathname === '/about' ? 'active' : ''}
        //             >
        //                 About
        //             </Link>
        //         </div>

        //         <div className="auth-section">
        //             {!loading && (
        //                 userProfile ? (
        //                     <div
        //                         className="profile-dropdown"
        //                         onClick={() => setDropdownOpen(prev => !prev)}
        //                         ref={dropdownRef}
        //                     >
        //                         <img
        //                             src={userProfile.picture}
        //                             alt="Profile"
        //                             className="profile-pic"
        //                         />
        //                         <span className="user-name">
        //             {userProfile.name}
        //                             <span className={`dropdown-icon ${dropdownOpen ? 'open' : ''}`}>▼</span>
        //         </span>
        //                         {dropdownOpen && (
        //                             <div className="dropdown-menu">
        //                                 <div className="dropdown-email">{userProfile.email}</div>
        //                                 <button className="logout-btn" onClick={handleLogout}>
        //                                     Logout
        //                                 </button>
        //                             </div>
        //                         )}
        //                     </div>
        //                 ) : (
        //                     <button className="login-link" onClick={handleLogin}>
        //                         Login
        //                     </button>
        //                 )
        //             )}
        //         </div>
        //     </nav>
        // </header>
    );
};

export default Header;
