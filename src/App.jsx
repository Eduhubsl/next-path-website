import React, { useState, useEffect, createContext, useContext } from 'react';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "firebase/auth";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    onSnapshot 
} from "firebase/firestore";


//==============================================================================
// FIREBASE CONFIGURATION
//==============================================================================
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRoboDbYUW5NLYVN0RhVUY1-yE2sS5fQA",
  authDomain: "next-path-1a26c.firebaseapp.com",
  projectId: "next-path-1a26c",
  storageBucket: "next-path-1a26c.firebasestorage.app",
  messagingSenderId: "988936031286",
  appId: "1:988936031286:web:f4501587014fbc29a49c97",
  measurementId: "G-68VF3R7690"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


//==============================================================================
// DUMMY DATA (Counselors & Services are still local)
//==============================================================================
const servicesData = [
    { 
        id: 1,
        icon: ({className}) => <Compass className={className}/>, 
        title: "After O/L Guidance", 
        shortDescription: "Strategic subject selection and career path mapping for post-O/L students.",
        longDescription: "Navigating the path after O/Levels is a critical first step in a student's career. Our 'After O/L Guidance' program is designed to provide clarity and direction. We work closely with students to identify their strengths, interests, and aptitudes, helping them make informed decisions about their A/L subject streams and future career possibilities.",
        features: [
            "In-depth psychometric assessments to understand student profiles.",
            "One-on-one sessions to discuss A/L subject combinations.",
            "Exploration of diverse career fields beyond traditional paths.",
            "A clear roadmap for the next two years of study."
        ],
        relatedSpecialization: "Arts & Humanities" // General starting point
    },
    { 
        id: 2,
        icon: ({className}) => <GraduationCap className={className}/>, 
        title: "After A/L Pathways", 
        shortDescription: "Comprehensive guidance on university applications, both local and international.",
        longDescription: "The post-A/L period is filled with opportunities. Our 'After A/L Pathways' service provides end-to-end support for university admissions. Whether you're targeting local universities, private institutions, or international colleges, we guide you through the entire application process, from shortlisting universities to crafting compelling personal statements.",
        features: [
            "University and course selection based on academic profile and goals.",
            "Personal statement and SOP writing workshops.",
            "Guidance on navigating the local university (UGC) admission process.",
            "Support for international applications (UCAS, Common App, etc.)."
        ],
        relatedSpecialization: "Business & Finance"
    },
    { 
        id: 3,
        icon: ({className}) => <BarChart3 className={className}/>, 
        title: "Vocational & Skill Guidance", 
        shortDescription: "For students exploring non-academic paths, we help identify hidden talents and guide them towards skilled professions.",
        longDescription: "A university degree is not the only path to a successful career. This program is for students who excel in practical skills and wish to pursue vocational training. We help identify their innate talents and match them with high-demand skilled professions like graphic design, culinary arts, software development, and more.",
        features: [
            "Talent and skill assessment sessions.",
            "Information on reputable vocational training institutes (NVQ, City & Guilds).",
            "Guidance on building a skills-based portfolio.",
            "Internship and apprenticeship linkage opportunities."
        ],
        relatedSpecialization: "Engineering & IT"
    },
    { 
        id: 4,
        icon: ({className}) => <Rocket className={className}/>, 
        title: "Career Launchpad", 
        shortDescription: "CV building, interview preparation, and career placement support for undergraduates and recent graduates.",
        longDescription: "Transitioning from academia to the corporate world can be challenging. Our 'Career Launchpad' is designed to equip undergraduates and graduates with the tools they need to succeed. We provide professional CV and cover letter writing services, conduct mock interviews with industry experts, and offer networking strategies to secure that first job.",
        features: [
            "Professional resume and LinkedIn profile optimization.",
            "One-on-one mock interview sessions with detailed feedback.",
            "Workshops on corporate etiquette and communication skills.",
            "Access to our network of partner companies for job placements."
        ],
        relatedSpecialization: "Business & Finance"
    },
    { 
        id: 5,
        icon: ({className}) => <Globe className={className}/>, 
        title: "Study Abroad", 
        shortDescription: "End-to-end support for studying abroad, including visa and scholarship help.",
        longDescription: "Dreaming of an international education? Our 'Study Abroad' service makes it a reality. We provide comprehensive support for the entire process, from selecting the right country and university to securing scholarships and navigating the complex student visa application. Our global expertise ensures a smooth journey to your chosen destination.",
        features: [
            "Country and university selection based on budget and career goals.",
            "Scholarship application guidance and review.",
            "Complete student visa application support (documentation, interviews).",
            "Pre-departure briefings and accommodation assistance."
        ],
        relatedSpecialization: "Science & Research"
    },
    { 
        id: 6,
        icon: ({className}) => <HeartPulse className={className}/>, 
        title: "Wellbeing Support", 
        shortDescription: "Confidential counseling and support services to ensure student mental health.",
        longDescription: "Academic pressure can take a toll on a student's mental health. Our 'Wellbeing Support' service provides a safe and confidential space for students to discuss their challenges. Our qualified counselors offer support for stress management, exam anxiety, and personal issues, ensuring students are mentally and emotionally equipped for success.",
        features: [
            "Confidential one-on-one counseling sessions.",
            "Stress and anxiety management techniques.",
            "Workshops on building resilience and a positive mindset.",
            "A safe space to discuss academic and personal challenges."
        ],
        relatedSpecialization: "Medicine & Health"
    },
];

const counselorsData = Array.from({ length: 50 }, (_, i) => {
    const specializations = ["Engineering & IT", "Medicine & Health", "Business & Finance", "Arts & Humanities", "Law & Policy", "Science & Research"];
    const firstNames = ["Ayesha", "Sahan", "Nimali", "Kasun", "Priya", "Ruwan", "Anusha", "Dilshan"];
    const lastNames = ["Perera", "Silva", "Fernando", "Bandara", "Jayasinghe", "Wickramasinghe"];
    const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
    const specialization = specializations[i % specializations.length];

    return {
        id: i + 1,
        name: name,
        photoUrl: `https://placehold.co/400x400/E2E8F0/475569?text=${name.split(' ').map(n=>n[0]).join('')}`,
        rating: (4.0 + (i % 11) / 10).toFixed(1),
        specialization: specialization,
        bio: `A dedicated and passionate counselor specializing in ${specialization}. With over ${5 + (i % 10)} years of experience, ${name.split(' ')[0]} has successfully guided hundreds of students towards achieving their academic and career goals.`,
        education: [ `Master of Science in ${specialization.split(' & ')[0]} Counseling, University of Colombo`, `Bachelor of Arts in Psychology, University of Peradeniya` ],
        email: `${name.toLowerCase().replace(' ', '.')}@nextpath.lk`,
        phone: `+94 77 123 ${1000 + i}`
    };
});

//==============================================================================
// AUTHENTICATION CONTEXT
//==============================================================================
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                // In a real app, you might fetch additional user details from Firestore here
                setCurrentUser({
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || user.email.split('@')[0],
                    isAdmin: user.email === 'admin@nextpath.lk' // Demo admin logic
                });
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setIsLoginModalOpen(false);
        } catch (error) {
            // If user not found, try to sign them up
            if (error.code === 'auth/user-not-found') {
                await signup(email, password);
            } else {
                console.error("Login Error:", error);
                alert("Failed to log in. Please check your credentials.");
            }
        }
    };

    const signup = async (email, password) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setIsLoginModalOpen(false);
        } catch (error) {
            console.error("Signup Error:", error);
            alert("Failed to sign up. " + error.message);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    const value = {
        currentUser,
        isAdmin: currentUser?.isAdmin || false,
        login,
        logout,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false)
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);


//==============================================================================
// ICONS
//==============================================================================
const Sparkles = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 3.8-3.8 1.9 3.8 1.9L12 14.4l1.9-3.8 3.8-1.9-3.8-1.9L12 3zM5 11l1.9 3.8 3.8 1.9-3.8 1.9L5 22l-1.9-3.8-3.8-1.9 3.8-1.9L5 11zM19 11l1.9 3.8 3.8 1.9-3.8 1.9L19 22l-1.9-3.8-3.8-1.9 3.8-1.9L19 11z"/></svg> );
const ArrowRight = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg> );
const MessageSquare = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> );
const X = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );
const GraduationCap = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> );
const Compass = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></svg> );
const BarChart3 = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg> );
const Rocket = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.18-.65-.87-2.15-1.4-3.18-.05z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.89 12.89 0 0 1 12 3c.66 0 1.31.1 1.95.3a22 22 0 0 1 4.7 3.65c.89.89.96 2.21.16 3.15l-3 3-3.15.16c-.88.07-1.76-.2-2.44-.88z"/></svg> );
const Globe = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg> );
const HeartPulse = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.7-1.5L11.5 14l1.8-3 2.2 4H22"/></svg> );
const Star = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> );
const ChevronLeft = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>);
const ChevronRight = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>);
const CheckCircle = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>);
const ShieldCheck = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>);
const Target = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>);
const Users = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);

//==============================================================================
// UI Components
//==============================================================================
const Button = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseClasses = "px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:scale-100";
  const variants = { primary: "gradient-primary text-white shadow-float hover:scale-105", outline: "bg-transparent text-slate-700 border-2 border-slate-300 hover:bg-slate-100", };
  return ( <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}> {children} </button> );
};

const LoginModal = () => {
    const { isLoginModalOpen, closeLoginModal, login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (!isLoginModalOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        login(email, password);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md relative">
                <button onClick={closeLoginModal} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800"><X className="w-6 h-6"/></button>
                <h2 className="font-heading text-3xl font-bold text-center mb-6">Login or Sign Up</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" required />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" required />
                    <Button type="submit" className="w-full">Continue</Button>
                </form>
            </div>
        </div>
    );
};


//==============================================================================
// Page and Layout Components
//==============================================================================
const Navigation = ({ pageState, onPageChange }) => {
  const { currentUser, logout, openLoginModal } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinkClasses = (page) => `px-4 py-2 rounded-full text-lg font-medium transition-all duration-300 ${ pageState.page === page ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100' }`;
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200/80">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="#home" onClick={() => onPageChange({ page: 'home' })} className="flex items-center space-x-4 cursor-pointer">
            <div className="relative"><div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-glow"><div className="w-6 h-6 bg-white rounded-lg"></div></div><div className="absolute -top-1 -right-1 w-4 h-4 gradient-accent rounded-full border-2 border-white"></div></div>
            <div><span className="font-heading text-2xl text-slate-800 font-bold">Next Path</span></div>
          </a>
          <div className="hidden md:flex items-center space-x-2">
            <a href="#home" onClick={() => onPageChange({ page: 'home' })} className={navLinkClasses('home')}>Home</a>
            <a href="#services" onClick={() => onPageChange({ page: 'services' })} className={navLinkClasses('services')}>Services</a>
            <a href="#counselors" onClick={() => onPageChange({ page: 'counselors' })} className={navLinkClasses('counselors')}>Counselors</a>
            <a href="#parents" onClick={() => onPageChange({ page: 'parents' })} className={navLinkClasses('parents')}>For Parents</a>
            {currentUser ? (
                <>
                    <span className="px-4 font-semibold text-slate-700">Hi, {currentUser.name}</span>
                    <button onClick={logout} className="ml-2 px-6 py-3 text-lg font-medium text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200">Logout</button>
                </>
            ) : (
                <button onClick={openLoginModal} className="ml-4 px-6 py-3 text-lg font-medium text-white gradient-primary rounded-full shadow-float hover:scale-105 transition-transform">Login</button>
            )}
          </div>
          <div className="md:hidden flex items-center"><button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-700 p-2 rounded-md hover:bg-slate-100"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg></button></div>
        </div>
      </nav>
      {isMenuOpen && ( <div className="md:hidden bg-white/95 backdrop-blur-sm pb-4 px-4 space-y-2 border-t border-slate-200">
          <a href="#home" onClick={() => { onPageChange({ page: 'home' }); setIsMenuOpen(false); }} className={`${navLinkClasses('home')} w-full block text-left`}>Home</a>
          <a href="#services" onClick={() => { onPageChange({ page: 'services' }); setIsMenuOpen(false); }} className={`${navLinkClasses('services')} w-full block text-left`}>Services</a>
          <a href="#counselors" onClick={() => { onPageChange({ page: 'counselors' }); setIsMenuOpen(false); }} className={`${navLinkClasses('counselors')} w-full block text-left`}>Counselors</a>
          <a href="#parents" onClick={() => { onPageChange({ page: 'parents' }); setIsMenuOpen(false); }} className={`${navLinkClasses('parents')} w-full block text-left`}>For Parents</a>
          {currentUser ? (
              <button onClick={() => {logout(); setIsMenuOpen(false);}} className="w-full px-5 py-3 text-lg font-medium text-blue-600 bg-blue-100 rounded-full">Logout</button>
          ) : (
              <button onClick={() => {openLoginModal(); setIsMenuOpen(false);}} className="w-full px-5 py-3 text-lg font-medium text-white gradient-primary rounded-full shadow-float">Login</button>
          )}
        </div>)}
    </header>
  );
};

const Homepage = ({ onPageChange }) => (
    <>
        {/* Hero Section */}
        <div className="relative pt-20 bg-slate-50">
            <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
            <main className="relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
                    <div className="text-center">
                        <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900">
                            Your Ambition, Our Mission.
                            <span className="block mt-2 sm:mt-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                                Let's Build Your Path to Success.
                            </span>
                        </h1>
                        <p className="mt-8 max-w-3xl mx-auto text-xl text-slate-600 leading-relaxed">
                            At Next Path, we provide personalized guidance to help Sri Lankan students unlock their potential and achieve their global educational aspirations through expert counseling and unwavering support.
                        </p>
                        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6">
                            <Button onClick={() => onPageChange({ page: 'services' })}>Explore Services <ArrowRight className="ml-3 w-5 h-5" /></Button>
                            <Button variant="outline">Book a Free Consultation</Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-white py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="font-heading text-5xl font-extrabold text-slate-900">Why Choose Next Path?</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600">We are more than just counselors; we are your dedicated partners in building a successful future.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="text-center p-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6"><Target className="w-10 h-10 text-blue-600"/></div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">Personalized Guidance</h3>
                        <p className="text-lg text-slate-600">We tailor our advice to your unique strengths, interests, and goals. No two paths are the same.</p>
                    </div>
                    <div className="text-center p-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6"><Users className="w-10 h-10 text-blue-600"/></div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">Expert Counselors</h3>
                        <p className="text-lg text-slate-600">Our team consists of experienced professionals with deep knowledge of local and global education systems.</p>
                    </div>
                    <div className="text-center p-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6"><Sparkles className="w-10 h-10 text-blue-600"/></div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">Proven Success</h3>
                        <p className="text-lg text-slate-600">We have a track record of helping students gain admission to top universities and secure fulfilling careers.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Services Section */}
        <div className="bg-slate-50 py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-20">
                    <h2 className="font-heading text-5xl font-extrabold text-slate-900">Our Core Services</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600">A comprehensive suite of services to support you at every step.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {servicesData.map((service) => {
                        const Icon = service.icon;
                        return (
                            <div key={service.id} className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col text-center transform hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-2xl mb-6 mx-auto">
                                    <Icon className="w-10 h-10 text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-3">{service.title}</h3>
                                <p className="text-slate-600 text-lg leading-relaxed flex-grow">{service.shortDescription}</p>
                                <button onClick={() => onPageChange({ page: 'serviceDetail', id: service.id })} className="mt-6 font-bold text-blue-600 hover:text-blue-800 text-lg">
                                    Learn More &rarr;
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
        
        {/* How It Works Section */}
        <div className="bg-white py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="font-heading text-5xl font-extrabold text-slate-900">Your Journey Starts Here</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600">Getting started is simple. Here’s our three-step process to clarity and success.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6">
                        <div className="text-6xl font-bold text-slate-200 mb-4">01</div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Book a Free Session</h3>
                        <p className="text-lg text-slate-600">Schedule a no-obligation consultation with one of our expert counselors to discuss your goals.</p>
                    </div>
                    <div className="p-6">
                        <div className="text-6xl font-bold text-slate-200 mb-4">02</div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Get a Custom Plan</h3>
                        <p className="text-lg text-slate-600">We'll create a personalized roadmap with clear, actionable steps tailored to your unique ambitions.</p>
                    </div>
                    <div className="p-6">
                        <div className="text-6xl font-bold text-slate-200 mb-4">03</div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Achieve Your Dream</h3>
                        <p className="text-lg text-slate-600">With our ongoing support, you'll have the confidence and guidance to reach your academic and career goals.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Testimonials Section */}
        <div className="bg-slate-50 py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="font-heading text-5xl font-extrabold text-slate-900">Success Stories</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600">Hear from students we've had the privilege to guide.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200">
                        <p className="text-lg text-slate-700 mb-6">"Next Path helped me see career options I never knew existed. Their guidance for my A/L subjects was a game-changer."</p>
                        <div className="flex items-center">
                            <img src="https://placehold.co/100x100/E2E8F0/475569?text=RS" alt="Student" className="w-12 h-12 rounded-full mr-4"/>
                            <div>
                                <p className="font-bold text-slate-800">R. Silva</p>
                                <p className="text-slate-500">A/L Student, Colombo</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200">
                        <p className="text-lg text-slate-700 mb-6">"The process of applying to foreign universities was overwhelming. The team at Next Path made it simple and stress-free. I got into my dream university in Australia!"</p>
                        <div className="flex items-center">
                            <img src="https://placehold.co/100x100/E2E8F0/475569?text=FA" alt="Student" className="w-12 h-12 rounded-full mr-4"/>
                            <div>
                                <p className="font-bold text-slate-800">Fathima A.</p>
                                <p className="text-slate-500">Undergraduate, Monash University</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200">
                        <p className="text-lg text-slate-700 mb-6">"The interview preparation sessions were invaluable. I felt so confident walking into my first job interview and landed the position."</p>
                        <div className="flex items-center">
                            <img src="https://placehold.co/100x100/E2E8F0/475569?text=KP" alt="Student" className="w-12 h-12 rounded-full mr-4"/>
                            <div>
                                <p className="font-bold text-slate-800">K. Perera</p>
                                <p className="text-slate-500">Software Engineer</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
);


const ServicesPage = ({ onPageChange }) => {
    return (
        <div className="bg-white pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
                <div className="text-center mb-20">
                    <h2 className="font-heading text-5xl font-extrabold text-slate-900">Empowering Your Journey</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600">We offer a tailored suite of services designed to guide you at every critical stage of your academic and professional life.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {servicesData.map((service) => {
                        const Icon = service.icon;
                        return (
                            <div key={service.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col text-center transform hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-md mb-6 mx-auto">
                                    <Icon className="w-10 h-10 text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-3">{service.title}</h3>
                                <p className="text-slate-600 text-lg leading-relaxed flex-grow">{service.shortDescription}</p>
                                <button onClick={() => onPageChange({ page: 'serviceDetail', id: service.id })} className="mt-6 font-bold text-blue-600 hover:text-blue-800 text-lg">
                                    Learn More &rarr;
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const ServiceDetailPage = ({ serviceId, onPageChange }) => {
    const service = servicesData.find(s => s.id === serviceId);
    if (!service) return <div className="pt-20 text-center py-40">Service not found.</div>;

    const recommendedCounselors = counselorsData
        .filter(c => c.specialization === service.relatedSpecialization)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
    
    const topCounselorId = recommendedCounselors.length > 0 ? recommendedCounselors[0].id : null;

    return (
        <div className="bg-slate-50 pt-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                 <button onClick={() => onPageChange({ page: 'services' })} className="flex items-center text-slate-600 hover:text-blue-600 font-semibold mb-8">
                    <ArrowRight className="w-5 h-5 mr-2 transform rotate-180" /> Back to All Services
                </button>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 bg-white p-8 sm:p-12 rounded-3xl shadow-lg border border-slate-200">
                        <h1 className="font-heading text-5xl font-extrabold text-slate-900 mb-6">{service.title}</h1>
                        <p className="text-xl text-slate-600 leading-relaxed mb-8">{service.longDescription}</p>
                        <h3 className="font-heading text-3xl font-bold text-slate-800 border-t pt-8 mt-8 mb-6">What to Expect</h3>
                        <ul className="space-y-4">
                            {service.features.map((feature, i) => (
                                <li key={i} className="flex items-start text-lg">
                                    <CheckCircle className="w-7 h-7 text-green-500 mr-4 flex-shrink-0 mt-1" />
                                    <span className="text-slate-700">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 sticky top-28">
                             <h3 className="font-heading text-2xl font-bold text-slate-800 mb-6 text-center">Recommended Counselors</h3>
                             <div className="space-y-4 mb-6">
                                {recommendedCounselors.map(c => (
                                    <div key={c.id} onClick={() => onPageChange({ page: 'counselorProfile', id: c.id })} className="flex items-center p-3 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer">
                                        <img src={c.photoUrl} alt={c.name} className="w-12 h-12 rounded-full mr-4"/>
                                        <div>
                                            <p className="font-bold text-slate-800">{c.name}</p>
                                            <p className="text-sm text-slate-500">{c.specialization}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                             <Button className="w-full" onClick={() => topCounselorId && onPageChange({ page: 'booking', id: topCounselorId })}>
                                Book a Free Consultation
                             </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const CounselorsPage = ({ onPageChange }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const categories = ['All', ...new Set(counselorsData.map(c => c.specialization))];

    const filteredCounselors = selectedCategory === 'All' 
        ? counselorsData 
        : counselorsData.filter(c => c.specialization === selectedCategory);

    return (
        <div className="bg-white pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
                <div className="text-center mb-12">
                    <h2 className="font-heading text-5xl font-extrabold text-slate-900">Meet Our Expert Counselors</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600">Our team of 50+ dedicated professionals is here to guide you on your path to success.</p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {categories.map(category => (
                        <button 
                            key={category} 
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-3 font-semibold rounded-full transition-colors duration-300 text-lg ${
                                selectedCategory === category 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {filteredCounselors.map(counselor => (
                        <div key={counselor.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center group cursor-pointer" onClick={() => onPageChange({ page: 'counselorProfile', id: counselor.id })}>
                            <img src={counselor.photoUrl} alt={counselor.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300" />
                            <h3 className="text-xl font-bold text-slate-800">{counselor.name}</h3>
                            <p className="text-blue-600 font-semibold mb-2">{counselor.specialization}</p>
                            <div className="flex items-center justify-center space-x-1 text-amber-400">
                                <Star className="w-5 h-5" />
                                <span className="text-slate-600 font-bold">{counselor.rating}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const CounselorProfilePage = ({ counselorId, onPageChange }) => {
    const counselor = counselorsData.find(c => c.id === counselorId);
    if (!counselor) return <div className="pt-20 text-center py-40">Counselor not found.</div>;

    return (
        <div className="bg-slate-50 pt-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <button onClick={() => onPageChange({ page: 'counselors' })} className="flex items-center text-slate-600 hover:text-blue-600 font-semibold mb-8">
                    <ArrowRight className="w-5 h-5 mr-2 transform rotate-180" /> Back to All Counselors
                </button>
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden md:flex">
                    <div className="md:w-1/3 p-8 bg-gradient-to-b from-blue-50 to-white text-center">
                        <img src={counselor.photoUrl} alt={counselor.name} className="w-48 h-48 rounded-full mx-auto mb-4 border-8 border-white shadow-lg" />
                        <h2 className="font-heading text-3xl font-bold text-slate-800">{counselor.name}</h2>
                        <p className="text-blue-600 text-xl font-semibold mt-1">{counselor.specialization}</p>
                        <div className="flex items-center justify-center space-x-1 text-amber-400 mt-2">
                            <Star className="w-6 h-6" />
                            <span className="text-slate-700 font-bold text-xl">{counselor.rating} / 5.0</span>
                        </div>
                        <Button className="mt-6 w-full" onClick={() => onPageChange({ page: 'booking', id: counselor.id })}>
                            Get a Consultation
                        </Button>
                    </div>
                    <div className="md:w-2/3 p-8 md:p-12">
                        <h3 className="font-heading text-2xl font-bold text-slate-800 border-b pb-3 mb-4">About {counselor.name.split(' ')[0]}</h3>
                        <p className="text-slate-600 text-lg leading-relaxed mb-8">{counselor.bio}</p>
                        
                        <h3 className="font-heading text-2xl font-bold text-slate-800 border-b pb-3 mb-4">Education History</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 text-lg mb-8">
                            {counselor.education.map((edu, i) => <li key={i}>{edu}</li>)}
                        </ul>

                        <h3 className="font-heading text-2xl font-bold text-slate-800 border-b pb-3 mb-4">Contact Information</h3>
                        <div className="space-y-4 text-lg">
                            <p className="flex items-center"><span className="text-2xl mr-3">📧</span><span className="text-slate-600">{counselor.email}</span></p>
                            <p className="flex items-center"><span className="text-2xl mr-3">📞</span><span className="text-slate-600">{counselor.phone}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BookingPage = ({ counselorId, onPageChange }) => {
    const { currentUser, openLoginModal } = useAuth();
    const counselor = counselorsData.find(c => c.id === counselorId);
    const today = new Date('2025-08-27T12:00:00'); 
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [notes, setNotes] = useState("");
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            openLoginModal();
        }
    }, [currentUser, openLoginModal]);
    
    const handleConfirmBooking = async () => {
        setIsBooking(true);
        try {
            await addDoc(collection(db, "bookings"), {
                studentUid: currentUser.uid,
                studentName: currentUser.name,
                studentEmail: currentUser.email,
                counselorId: counselor.id,
                counselorName: counselor.name,
                service: counselor.specialization, // Or derive from context
                date: selectedDate.toISOString().split('T')[0],
                time: selectedTime,
                notes: notes,
                status: 'Pending',
                createdAt: new Date()
            });
            alert("Booking successful! We will be in touch shortly.");
            onPageChange({ page: 'home' });
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("There was an error with your booking. Please try again.");
        } finally {
            setIsBooking(false);
        }
    };


    const firstAvailableDate = new Date(today);
    firstAvailableDate.setDate(today.getDate() + 2);

    const handleMonthChange = (offset) => {
        const newDate = new Date(currentYear, currentMonth + offset);
        setCurrentMonth(newDate.getMonth());
        setCurrentYear(newDate.getFullYear());
    };

    const generateCalendarDays = () => {
        const date = new Date(currentYear, currentMonth, 1);
        const days = [];
        const firstDayIndex = date.getDay();
        const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let i = 0; i < firstDayIndex; i++) { days.push(<div key={`empty-${i}`}></div>); }

        for (let i = 1; i <= lastDate; i++) {
            const dayDate = new Date(currentYear, currentMonth, i);
            const isBeforeAvailable = dayDate < firstAvailableDate.setHours(0,0,0,0);
            const isSelected = selectedDate && dayDate.getTime() === selectedDate.getTime();
            
            days.push(
                <button key={i} disabled={isBeforeAvailable} onClick={() => { setSelectedDate(dayDate); setSelectedTime(null); }}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                        isBeforeAvailable ? 'text-slate-300 cursor-not-allowed' : 
                        isSelected ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-blue-100'
                    }`}>
                    {i}
                </button>
            );
        }
        return days;
    };

    const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];

    if (!currentUser) {
        return (
            <div className="bg-slate-50 pt-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <h2 className="font-heading text-3xl font-bold text-slate-800">Please Login to Continue</h2>
                    <p className="text-xl text-slate-600 mt-4">You need to be logged in to book a consultation.</p>
                    <Button onClick={openLoginModal} className="mt-8">Login / Sign Up</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 pt-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-12">
                    <h2 className="font-heading text-4xl font-extrabold text-slate-900">Book a Consultation</h2>
                    <p className="mt-2 text-xl text-slate-600">with <span className="font-bold text-blue-600">{counselor.name}</span></p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Calendar */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={() => handleMonthChange(-1)} className="p-2 rounded-full hover:bg-slate-100"><ChevronLeft className="w-6 h-6 text-slate-600" /></button>
                                <h3 className="font-bold text-xl text-slate-800">{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                                <button onClick={() => handleMonthChange(1)} className="p-2 rounded-full hover:bg-slate-100"><ChevronRight className="w-6 h-6 text-slate-600" /></button>
                            </div>
                            <div className="grid grid-cols-7 gap-2 text-center font-semibold text-slate-500 mb-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {generateCalendarDays()}
                            </div>
                        </div>

                        {/* Time Slots */}
                        <div>
                            <h3 className="font-bold text-xl text-slate-800 mb-4">Select a Time Slot</h3>
                            {selectedDate ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {timeSlots.map(time => (
                                        <button key={time} onClick={() => setSelectedTime(time)}
                                            className={`p-3 rounded-lg border-2 transition-colors ${
                                                selectedTime === time ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 hover:border-blue-400'
                                            }`}>
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500">Please select a date to see available times.</p>
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-2 border-t pt-8 mt-8">
                        <h3 className="font-bold text-xl text-slate-800 mb-4">Your Details</h3>
                        <div className="space-y-4">
                            <input type="text" value={currentUser.name} readOnly className="w-full p-4 text-lg bg-slate-100 border border-slate-300 rounded-xl"/>
                            <input type="email" value={currentUser.email} readOnly className="w-full p-4 text-lg bg-slate-100 border border-slate-300 rounded-xl"/>
                            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any specific questions you have for the counselor?" rows="3" className="w-full p-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 text-center">
                    <Button onClick={handleConfirmBooking} disabled={!selectedDate || !selectedTime || isBooking}>
                        {isBooking ? 'Booking...' : `Confirm Booking for ${selectedDate && selectedTime ? `${selectedDate.toLocaleDateString()} at ${selectedTime}` : ''}`}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const ParentsPage = () => {
    const parentServices = [
        { title: "Demystifying Educational Paths", description: "We provide clear, unbiased information on all available pathways—local and international universities, vocational training, and more—so you can understand the complete picture." },
        { title: "Financial Planning & Scholarships", description: "Education is an investment. We guide you through understanding costs, exploring funding options, and identifying potential scholarships to make your child's dream financially achievable." },
        { title: "Aligning Aspirations", description: "Through family counseling sessions, we help bridge the gap between parental aspirations and a child's passions, ensuring decisions are made collaboratively and supportively." },
        { title: "Future-Proof Career Guidance", description: "We provide insights into modern, in-demand career fields, helping you and your child choose a path that is not only fulfilling but also has long-term stability and growth." },
    ];

    return (
        <div className="bg-white pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
                <div className="text-center mb-12">
                    <h1 className="font-heading text-5xl sm:text-6xl font-extrabold text-slate-900">
                        Partnering in Your Child's Success
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-slate-600 leading-relaxed">
                        As a parent, your child's future is your highest priority. We understand the complex decisions and anxieties you face. At Next Path, we partner with you to provide the clarity and confidence needed to support your child's journey.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
                    {parentServices.map(service => (
                        <div key={service.title} className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
                            <ShieldCheck className="w-10 h-10 text-blue-500 mb-4" />
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">{service.title}</h3>
                            <p className="text-lg text-slate-600">{service.description}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 sm:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="font-heading text-4xl font-bold text-slate-800 mb-4">Have Questions? Let's Talk.</h2>
                            <p className="text-xl text-slate-700">We invite you for a complimentary family consultation to discuss your child's future. Fill out the form, and one of our senior counselors will get in touch with you.</p>
                        </div>
                        <form className="space-y-4">
                            <input type="text" placeholder="Your Name" className="w-full p-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"/>
                            <input type="email" placeholder="Your Email" className="w-full p-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"/>
                            <textarea placeholder="Your questions or concerns..." rows="4" className="w-full p-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"></textarea>
                            <Button className="w-full">Request a Call Back</Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminDashboardPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "bookings"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const bookingsData = [];
            querySnapshot.forEach((doc) => {
                bookingsData.push({ id: doc.id, ...doc.data() });
            });
            setBookings(bookingsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="bg-slate-100 pt-20 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="font-heading text-4xl font-extrabold text-slate-900 mb-8">Admin Dashboard</h1>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold text-slate-800">Consultation Inquiries</h2>
                    </div>
                    <div className="overflow-x-auto">
                        {loading ? <p className="p-6 text-center">Loading bookings...</p> : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-4 font-semibold text-slate-600">Student Name</th>
                                    <th className="p-4 font-semibold text-slate-600">Counselor</th>
                                    <th className="p-4 font-semibold text-slate-600">Date & Time</th>
                                    <th className="p-4 font-semibold text-slate-600">Service</th>
                                    <th className="p-4 font-semibold text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking.id} className="border-b last:border-b-0">
                                        <td className="p-4">{booking.studentName}</td>
                                        <td className="p-4">{booking.counselorName}</td>
                                        <td className="p-4">{new Date(booking.date).toLocaleDateString()} at {booking.time}</td>
                                        <td className="p-4">{booking.service}</td>
                                        <td className="p-4"><button className="text-blue-600 hover:underline">View Details</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}


const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    return ( <> <div className="fixed bottom-6 right-6 z-50"><button onClick={() => setIsOpen(!isOpen)} className="gradient-primary text-white w-16 h-16 rounded-full flex items-center justify-center shadow-float hover:scale-110 transition-transform" aria-label="Toggle AI Chatbot">{isOpen ? <X className="w-8 h-8"/> : <MessageSquare className="w-8 h-8"/>}</button></div> {isOpen && ( <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[60vh]"><div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl"><h3 className="text-lg font-bold text-slate-800">AI Assistant</h3><button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800"><X className="w-6 h-6"/></button></div><div className="flex-1 p-4 overflow-y-auto"><div className="text-center text-slate-500 mt-10">Ask me anything about our services!</div></div><div className="p-4 border-t bg-white rounded-b-2xl"><input type="text" placeholder="Type your message..." className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"/></div></div> )} </> );
};

//==============================================================================
// Main App Component
//==============================================================================
function App() {
  const [pageState, setPageState] = useState({ page: 'home' });

  const handlePageChange = (newState) => {
    setPageState(newState);
    let hash = `#${newState.page}`;
    if (newState.id) { hash += `/${newState.id}`; }
    window.location.hash = hash;
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      const [page, id] = hash.split('/');
      
      const validPages = ['home', 'services', 'counselors', 'counselorProfile', 'booking', 'serviceDetail', 'parents', 'admin'];
      if (validPages.includes(page)) {
        setPageState({ page, id: id ? parseInt(id) : undefined });
      } else {
        setPageState({ page: 'home' });
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  const { isAdmin, login } = useAuth();
  
  useEffect(() => {
      if(isAdmin) {
          handlePageChange({ page: 'admin' });
      }
  }, [isAdmin]);

  const renderPage = () => {
    if (isAdmin && pageState.page !== 'admin') {
        return <AdminDashboardPage />;
    }
      
    switch (pageState.page) {
      case 'services': return <ServicesPage onPageChange={handlePageChange} />;
      case 'serviceDetail': return <ServiceDetailPage serviceId={pageState.id} onPageChange={handlePageChange} />;
      case 'counselors': return <CounselorsPage onPageChange={handlePageChange} />;
      case 'counselorProfile': return <CounselorProfilePage counselorId={pageState.id} onPageChange={handlePageChange} />;
      case 'booking': return <BookingPage counselorId={pageState.id} onPageChange={handlePageChange} />;
      case 'parents': return <ParentsPage />;
      case 'admin': return isAdmin ? <AdminDashboardPage /> : <Homepage onPageChange={handlePageChange} />;
      case 'home':
      default:
        return <Homepage onPageChange={handlePageChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&family=Manrope:wght@800&display=swap'); body { font-family: 'Inter', sans-serif; } .font-heading { font-family: 'Manrope', sans-serif; } .gradient-primary { background-image: linear-gradient(to right, #2563eb, #0ea5e9); } .gradient-accent { background-image: linear-gradient(to right, #f59e0b, #ef4444); } .shadow-glow { box-shadow: 0 0 20px rgba(37, 99, 235, 0.3); } .shadow-float { box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.2), 0 8px 10px -6px rgba(37, 99, 235, 0.2); } .bg-grid-slate-200 { background-image: linear-gradient(white 2px, transparent 2px), linear-gradient(to right, white 2px, #f1f5f9 2px); background-size: 4rem 4rem; }`}</style>
      {!isAdmin && <Navigation pageState={pageState} onPageChange={handlePageChange} />}
      <main>{renderPage()}</main>
      {!isAdmin && <AIChatbot />}
      {!isAdmin && <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"><div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div></div>
        <div className="relative border-b border-slate-700/50"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"><div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"><div><div className="flex items-center space-x-3 mb-6"><Sparkles className="w-7 h-7 text-amber-400" /><h3 className="font-heading text-4xl">Stay Ahead of the Curve</h3></div><p className="text-slate-300 text-xl leading-relaxed font-light">Get exclusive insights on educational opportunities, scholarship alerts, and career guidance tips delivered to your inbox.</p></div><div className="flex flex-col sm:flex-row gap-6"><input type="email" placeholder="Enter your email address" className="flex-1 px-8 py-5 bg-slate-800/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm text-lg" /><Button className="px-10 py-5 rounded-2xl text-lg">Subscribe <ArrowRight className="ml-3 w-5 h-5" /></Button></div></div></div></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16"><div className="lg:col-span-1 space-y-8"><div className="flex items-center space-x-4"><div className="relative"><div className="w-14 h-14 gradient-primary rounded-3xl flex items-center justify-center shadow-glow"><div className="w-7 h-7 bg-white rounded-xl"></div></div><div className="absolute -top-1 -right-1 w-5 h-5 gradient-accent rounded-full border-2 border-slate-900"></div></div><div><span className="font-heading text-3xl text-white font-bold">Next Path</span><div className="text-sm text-slate-400 -mt-1 font-medium">Excellence in Guidance</div></div></div><p className="text-slate-400 leading-relaxed text-lg">Aspirational Guidance, Made Accessible. Empowering Sri Lanka's next generation to achieve their dreams through expert counseling and personalized support.</p><div className="flex space-x-8"><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors font-medium text-lg">Facebook</a><a href="#" className="text-slate-400 hover:text-purple-400 transition-colors font-medium text-lg">Instagram</a><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors font-medium text-lg">LinkedIn</a></div></div><div><h3 className="font-heading text-2xl mb-8 text-white">Our Services</h3><ul className="space-y-5 text-slate-400"><li><a href="#services" onClick={() => handlePageChange({page: 'services'})} className="hover:text-white transition-colors font-medium text-lg">O/L Horizon Plan</a></li><li><a href="#services" onClick={() => handlePageChange({page: 'services'})} className="hover:text-white transition-colors font-medium text-lg">After A/L Plans</a></li><li><a href="#services" onClick={() => handlePageChange({page: 'services'})} className="hover:text-white transition-colors font-medium text-lg">Skill Development</a></li><li><a href="#services" onClick={() => handlePageChange({page: 'services'})} className="hover:text-white transition-colors font-medium text-lg">Graduate Launchpad</a></li><li><a href="#services" onClick={() => handlePageChange({page: 'services'})} className="hover:text-white transition-colors font-medium text-lg">Global Study Gateway</a></li></ul></div><div><h3 className="font-heading text-2xl mb-8 text-white">Company</h3><ul className="space-y-5 text-slate-400"><li><a href="#about" className="hover:text-white transition-colors font-medium text-lg">About Next Path</a></li><li><a href="#counselors" className="hover:text-white transition-colors font-medium text-lg">Our Counselors</a></li><li><a href="#contact" className="hover:text-white transition-colors font-medium text-lg">Contact Us</a></li><li><a href="#careers" className="hover:text-white transition-colors font-medium text-lg">Join Our Team</a></li><li><a href="#blog" className="hover:text-white transition-colors font-medium text-lg">Success Stories</a></li></ul></div><div><h3 className="font-heading text-2xl mb-8 text-white">Get in Touch</h3><ul className="space-y-5 text-slate-400"><li className="flex items-start space-x-4"><span className="text-2xl mt-1">📞</span><span className="font-medium text-lg">+94 11 123 4567</span></li><li className="flex items-start space-x-4"><span className="text-2xl mt-1">📧</span><span className="font-medium text-lg">info@nextpath.lk</span></li><li className="flex items-start space-x-4"><span className="text-2xl mt-1">📍</span><span className="font-medium text-lg">123 Galle Road, Colombo 03, Sri Lanka</span></li></ul><div className="mt-8 p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl backdrop-blur-sm"><p className="text-red-300 mb-3 font-medium">Emergency Support</p><p className="text-red-400 font-semibold text-lg">24/7 Crisis Helpline</p><p className="text-red-300">+94 70 123 4567</p></div></div></div></div>
        <div className="relative border-t border-slate-700/50"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"><div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0"><div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-10 text-slate-400"><p className="font-medium text-lg">&copy; 2024 Next Path. All rights reserved.</p><div className="flex items-center space-x-8"><a href="#privacy" className="hover:text-white transition-colors font-medium">Privacy Policy</a><a href="#terms" className="hover:text-white transition-colors font-medium">Terms of Service</a></div></div><div className="flex items-center space-x-3 text-slate-400"><span className="font-medium text-lg">Made with</span><span className="text-red-400 text-2xl">❤️</span><span className="font-medium text-lg">in Sri Lanka</span><button onClick={() => login('admin@nextpath.lk', 'admin')} className="ml-4 text-xs opacity-50">Admin Login</button></div></div></div></div>
      </footer>}
      <LoginModal />
    </div>
  );
}

// This is the main component that wraps our App with the AuthProvider
const AppWrapper = () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);

export default AppWrapper;
