import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom'; // Keep Link for routing
import { motion } from 'framer-motion'; // For animations
import { Menu, User, LogIn } from 'lucide-react'; // Changed icons to fit Login/Signup context

// Helper function to conditionally join Tailwind CSS classes
function cn(...inputs) {
  const classNames = inputs.filter(Boolean).join(' ');
  return classNames;
}

// Reusable Button component with default Tailwind styles
const Button = ({ children, className, ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Desktop navigation tabs (adapted from original Navbar)
const desktopTabs = [
  { id: "Features", label: "Features", link: "#features-section" },
  { id: "Coding", label: "Coding", link: "#coding-section" },
  { id: "Tasks", label: "Tasks", link: "#task-section" },
  { id: "Games", label: "Games", link: "#games-section" },
  { id: "Contact", label: "Contact", link: "#footer-section" },
];

// Mobile navigation tabs (adapted from original Navbar)
const mobileTabs = [
  { id: "Features", label: "Features", link: "#features-section" },
  { id: "Coding", label: "Coding", link: "#coding-section" },
  { id: "Tasks", label: "Tasks", link: "#task-section" },
  { id: "Games", label: "Games", link: "#games-section" },
  { id: "Contact", label: "Contact", link: "#footer-section" },
];

export default function Navbar() { // Export as default as in the original file
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const mobileMenuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [letterHovered, setLetterHovered] = useState(-1);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("");

  const aventisText = "Aventis"; // Changed from portfolioText to aventisText

  // Effect to handle window resizing for responsive layout
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    setWindowWidth(window.innerWidth); // Set initial width
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Effect to close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !menuButtonRef.current?.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Effect to calculate scroll progress for dynamic navbar styling
  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress relative to 10% of viewport height
      const progress = Math.min(1, window.scrollY / (window.innerHeight * 0.1));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once on mount to set initial state
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Effect to hide/show navbar on scroll for mobile devices
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (windowWidth < 768) { // Only apply for mobile widths
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          // Scrolling down and past 100px, hide navbar
          setIsNavbarVisible(false);
        } else if (window.scrollY < lastScrollY || window.scrollY < 50) {
          // Scrolling up or near the top, show navbar
          setIsNavbarVisible(true);
        }
      } else {
        // Always visible on desktop
        setIsNavbarVisible(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [windowWidth]); // Re-run if windowWidth changes

  // Effect to update active tab based on URL hash
  useEffect(() => {
    const updateActiveTab = () => {
      const currentHash = window.location.hash;
      // Find the tab matching the current hash for both desktop and mobile tabs
      const foundTab =
        desktopTabs.find((tab) => tab.link === currentHash) ||
        mobileTabs.find((tab) => tab.link === currentHash);

      if (foundTab) {
        setActiveTab(foundTab.id);
      } else if (!currentHash && desktopTabs.length > 0) {
        // Default to the first tab (e.g., Features) if no hash is present
        setActiveTab(desktopTabs[0].id);
      } else {
        setActiveTab(""); // No active tab if no match
      }
    };

    updateActiveTab(); // Set initial active tab
    window.addEventListener("hashchange", updateActiveTab); // Listen for hash changes
    return () => window.removeEventListener("hashchange", updateActiveTab);
  }, []);

  // Handler for navigation link clicks
  const handleNavLinkClick = (tabId) => {
    setActiveTab(tabId);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false); // Close mobile menu on link click
    }
  };

  return (
    <div
      className={cn(
        // Fixed positioning and width/padding logic for the outer container
        "fixed left-0 top-0 w-full z-50 flex justify-center pt-2 md:pt-0 transition-all duration-300",
        // Mobile-specific visibility and transform animations
        windowWidth < 768 && !isNavbarVisible && "opacity-0 translate-y-[-100%]",
        windowWidth < 768 && isNavbarVisible && "opacity-100 translate-y-0"
      )}
    >
      <div
        className="w-full px-4 flex justify-center"
        style={{
          // Dynamic padding based on scroll progress for desktop
          paddingTop:
            windowWidth >= 768 ? `${8 + scrollProgress * 8}px` : "8px",
          paddingLeft:
            windowWidth >= 768 ? `${scrollProgress * 16}px` : "16px",
          paddingRight:
            windowWidth >= 768 ? `${scrollProgress * 16}px` : "16px",
        }}
      >
        <nav
          className={cn(
            "relative w-full rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10",
            "md:transition-all md:duration-300 transition-opacity duration-300 ease-in-out transform"
          )}
          style={
            windowWidth >= 768
              ? {
                  // Dynamic width, background, backdrop filter, and border color based on scroll progress for desktop
                  width: scrollProgress === 0 ? "100%" : `${100 - scrollProgress * 25}%`,
                  backgroundColor: `rgba(0, 0, 0, ${0.4 + scrollProgress * 0.4})`,
                  backdropFilter: `blur(${4 + scrollProgress * 8}px)`,
                  borderColor: `rgba(255, 255, 255, ${0.1 + scrollProgress * 0.1})`,
                }
              : {} // No additional styles for mobile
          }
        >
          <div className="h-16 flex items-center justify-between px-6">
            {/* Logo/Name: Aventis (animated) */}
            <a
              href="#features-section" // Link to the first section
              className="text-white hover:text-white/80 transition-colors flex items-center gap-2 shrink-0 relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => {
                setIsHovered(false);
                setLetterHovered(-1); // Reset individual letter hover state
              }}
            >
              <div className="relative">
                <div className="flex items-center">
                  {aventisText.split("").map((letter, index) => (
                    <span
                      key={index}
                      className={cn(
                        "text-lg font-semibold transition-all duration-300 hover:scale-125 cursor-default",
                        // Check if the first tab is active for brand color
                        activeTab === desktopTabs[0]?.id ? "text-accent-primary" : "text-white",
                        letterHovered === index ? "text-accent-primary animate-bounce" : "", // Individual letter hover animation
                        isHovered ? "hover:text-accent-primary" : "", // General hover for all letters
                        isHovered && letterHovered === -1 ? "animate-pulse" : "" // Pulse animation when hovered but no specific letter
                      )}
                      style={{
                        // Dynamic opacity based on scroll progress
                        opacity: Math.max(0, 1 - scrollProgress * 2),
                        // Text shadow for hovered letter (using a shade of accent-primary)
                        textShadow:
                          letterHovered === index
                            ? "0 0 20px rgba(135, 206, 235, 0.5)" // Light blue glow
                            : "none",
                        // TranslateY for hovered letter
                        transform: `translateY(${letterHovered === index ? "-2px" : "0"})`,
                      }}
                      onMouseEnter={() => setLetterHovered(index)}
                      onMouseLeave={() => setLetterHovered(-1)}
                    >
                      {letter}
                    </span>
                  ))}
                </div>
                {isHovered && (
                  <motion.div
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-accent-primary to-transparent animate-pulse"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      opacity: Math.max(0, 1 - scrollProgress * 2), // Dynamic opacity
                    }}
                  />
                )}
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <div className="flex-1 flex items-center justify-center">
              <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                {desktopTabs.map((tab) => (
                  <motion.div
                    key={tab.id}
                    className="relative rounded-full"
                    whileHover={{ scale: 1.05 }} // Scale animation on hover
                    whileTap={{ scale: 0.95 }} // Scale animation on tap
                  >
                    <a
                      href={tab.link}
                      className={cn(
                        "relative font-medium rounded-full px-3 py-1.5 text-sm transition-colors duration-300",
                        activeTab === tab.id
                          ? "text-accent-primary" // Active tab text color
                          : "text-dark-text-medium hover:text-dark-text-light" // Inactive tab text color and hover
                      )}
                      onClick={() => handleNavLinkClick(tab.id)}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.span
                          layoutId="bubble" // Framer Motion layout animation for the active indicator
                          className="absolute inset-0 z-10 bg-accent-primary/20 rounded-full pointer-events-none" // Using a transparent accent color
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Login/Signup Buttons (Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="px-6 py-2 rounded-lg text-dark-text-light border border-dark-border hover:bg-dark-border transition-all duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 rounded-lg bg-gradient-accent text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-accent-gradient-start hover:bg-accent-gradient-end"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              ref={menuButtonRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors",
                mobileMenuOpen && "bg-white/5"
              )}
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          {mobileMenuOpen && (
            <div
              ref={mobileMenuRef}
              className="absolute left-0 right-0 top-14 z-50 md:hidden border-t border-white/10 bg-black/90 backdrop-blur-xl rounded-b-2xl shadow-lg animate-mobile-menu-open"
            >
              <div className="px-6 py-4 space-y-4">
                {mobileTabs.map((tab) => (
                  <a
                    key={tab.id}
                    href={tab.link}
                    className={cn(
                      "block text-sm transition-colors",
                      activeTab === tab.id
                        ? "text-accent-primary font-medium"
                        : "text-dark-text-medium hover:text-dark-text-light"
                    )}
                    onClick={() => handleNavLinkClick(tab.id)}
                  >
                    {tab.label}
                  </a>
                ))}

                <div className="pt-4 border-t border-white/10 flex flex-col gap-3"> {/* Use flex-col for stacked buttons */}
                  {/* Login Button Mobile */}
                  <Link
                    to="/login"
                    className="w-full text-center px-6 py-2 rounded-lg text-dark-text-light border border-dark-border hover:bg-dark-border transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)} // Close menu on click
                  >
                    Login
                  </Link>
                  {/* Sign Up Button Mobile */}
                  <Link
                    to="/signup"
                    className="w-full text-center px-6 py-2 rounded-lg bg-gradient-accent text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-accent-gradient-start hover:bg-accent-gradient-end"
                    onClick={() => setMobileMenuOpen(false)} // Close menu on click
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
