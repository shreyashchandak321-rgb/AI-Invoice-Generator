import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth, useUser, UserButton } from "@clerk/clerk-react";
import { navbarStyles } from "../assets/dummyStyles";

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", onDocClick);
      document.addEventListener("touchstart", onDocClick);
    }
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
    };
  }, [profileOpen]);

  return (
    <header className={navbarStyles.header}>
      <div className={navbarStyles.container}>
        <nav className={navbarStyles.nav}>
          <div className={navbarStyles.logoSection}>
            <Link to="/" className={navbarStyles.logoLink}>
              <span className={navbarStyles.logoText}>InvoiceAI</span>
            </Link>
          </div>

          {isSignedIn && (
            <div className={navbarStyles.desktopNav}>
              <Link to="/app/dashboard" className={navbarStyles.navLink}>Dashboard</Link>
              <Link to="/app/invoices" className={navbarStyles.navLink}>Invoices</Link>
              <Link to="/app/create-invoice" className={navbarStyles.navLink}>Create</Link>
              <Link to="/app/business" className={navbarStyles.navLink}>Business</Link>
            </div>
          )}

          <div className={navbarStyles.authSection}>
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <>
                <Link to="/sign-in" className={navbarStyles.signInButton}>Sign In</Link>
                <Link to="/sign-up" className={navbarStyles.signUpButton}>
                  <span className={navbarStyles.signUpText}>Get Started</span>
                  <svg className={navbarStyles.signUpIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                </Link>
              </>
            )}
          </div>

          <button
            className={navbarStyles.mobileMenuButton}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <div className={navbarStyles.mobileMenuIcon}>
              <span className={`${navbarStyles.mobileMenuLine1} ${mobileOpen ? navbarStyles.mobileMenuLine1Open : navbarStyles.mobileMenuLine1Closed}`} />
              <span className={`${navbarStyles.mobileMenuLine2} ${mobileOpen ? navbarStyles.mobileMenuLine2Open : navbarStyles.mobileMenuLine2Closed}`} />
              <span className={`${navbarStyles.mobileMenuLine3} ${mobileOpen ? navbarStyles.mobileMenuLine3Open : navbarStyles.mobileMenuLine3Closed}`} />
            </div>
          </button>
        </nav>

        {mobileOpen && (
          <div className={navbarStyles.mobileMenu}>
            <div className={navbarStyles.mobileMenuContainer}>
              {isSignedIn && (
                <>
                  <Link to="/app/dashboard" className={navbarStyles.mobileNavLink} onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  <Link to="/app/invoices" className={navbarStyles.mobileNavLink} onClick={() => setMobileOpen(false)}>Invoices</Link>
                  <Link to="/app/create-invoice" className={navbarStyles.mobileNavLink} onClick={() => setMobileOpen(false)}>Create Invoice</Link>
                  <Link to="/app/business" className={navbarStyles.mobileNavLink} onClick={() => setMobileOpen(false)}>Business Profile</Link>
                </>
              )}
              <div className={navbarStyles.mobileAuthSection}>
                {isSignedIn ? (
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  <>
                    <Link to="/sign-in" className={navbarStyles.mobileSignIn} onClick={() => setMobileOpen(false)}>Sign In</Link>
                    <Link to="/sign-up" className={navbarStyles.mobileSignUp} onClick={() => setMobileOpen(false)}>Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
