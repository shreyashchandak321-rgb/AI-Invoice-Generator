import { Link, useLocation, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { FiHome, FiFileText, FiPlus, FiUser, FiChevronRight, FiChevronLeft, FiLogOut } from "react-icons/fi";
import { appShellStyles as s } from "../assets/dummyStyles";

const navItems = [
  { label: "Dashboard", path: "/", icon: FiHome },
  { label: "Invoices", path: "/invoices", icon: FiFileText },
  { label: "Create Invoice", path: "/create-invoice", icon: FiPlus },
  { label: "Business Profile", path: "/business-profile", icon: FiUser },
];

export default function AppShell() {
  const location = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const displayName =
    user?.fullName || user?.firstName || user?.username || "there";
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const initial = (displayName?.[0] || "U").toUpperCase();

  function handleLogout() {
    signOut({ redirectUrl: "/sign-in" });
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className={s.root}>
      <div className={s.layout}>
        {/* ── Desktop Sidebar ── */}
        <aside
          className={`${s.sidebar} ${
            collapsed ? s.sidebarCollapsed : s.sidebarExpanded
          }`}
          style={{ height: "100vh", position: "sticky", top: 0 }}
        >
          <div className={s.sidebarGradient} />
          <div className={s.sidebarContainer}>
            {/* Logo */}
            <div>
              <div
                className={`${s.logoContainer} ${
                  collapsed ? s.logoContainerCollapsed : ""
                }`}
              >
                <Link to="/" className={s.logoLink}>
                  <span className="text-3xl">📄</span>
                  {!collapsed && (
                    <span className={s.logoText}>InvoiceAI</span>
                  )}
                </Link>
              </div>

              {!collapsed && (
                <div className={s.logoUnderline} style={{ width: "100%" }} />
              )}

              {/* Nav */}
              <nav className={`${s.nav} mt-8`}>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`${s.sidebarLink} ${
                        collapsed ? s.sidebarLinkCollapsed : ""
                      } ${
                        isActive ? s.sidebarLinkActive : s.sidebarLinkInactive
                      }`}
                    >
                      <Icon
                        className={`${s.sidebarIcon} ${
                          isActive
                            ? s.sidebarIconActive
                            : s.sidebarIconInactive
                        }`}
                        size={20}
                      />
                      {!collapsed && (
                        <span className={s.sidebarText}>{item.label}</span>
                      )}
                      {isActive && !collapsed && (
                        <div className={s.sidebarActiveIndicator} />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User area */}
            <div className={s.userSection}>
              <div
                className={`${s.userDivider} ${
                  collapsed ? s.userDividerCollapsed : s.userDividerExpanded
                }`}
              />
              {!collapsed && (
                <div className="flex items-center gap-3 px-3 py-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {displayName}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {email}
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className={`${s.logoutButton} ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <FiLogOut className={s.logoutIcon} size={18} />
                {!collapsed && <span>Logout</span>}
              </button>
            </div>

            {/* Collapse toggle */}
            <div className={s.collapseSection}>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={`${s.collapseButtonInner} ${
                  collapsed ? "w-10 justify-center" : ""
                }`}
              >
                {collapsed ? (
                  <FiChevronRight size={16} />
                ) : (
                  <>
                    <FiChevronLeft size={16} />
                    <span>Collapse</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* ── Mobile Sidebar ── */}
        {mobileOpen && (
          <div className={s.mobileOverlay}>
            <div
              className={s.mobileBackdrop}
              onClick={() => setMobileOpen(false)}
            />
            <div className={s.mobileSidebar}>
              <div className={s.mobileHeader}>
                <Link
                  to="/"
                  className={s.mobileLogoLink}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="text-2xl">📄</span>
                  <span className={s.mobileLogoText}>InvoiceAI</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className={s.mobileCloseButton}
                >
                  ✕
                </button>
              </div>
              <nav className={s.mobileNav}>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`${s.mobileNavLink} ${
                        isActive
                          ? s.mobileNavLinkActive
                          : s.mobileNavLinkInactive
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className={s.mobileLogoutSection}>
                <button onClick={handleLogout} className={s.mobileLogoutButton}>
                  <FiLogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Area ── */}
        <div className="flex-1 min-h-screen flex flex-col">
          {/* Header */}
          <header
            className={`${s.header} ${
              scrolled ? s.headerScrolled : s.headerNotScrolled
            }`}
          >
            <div className={s.headerTopSection}>
              <div className={s.headerContent}>
                <button
                  onClick={() => setMobileOpen(true)}
                  className={s.mobileMenuButton}
                >
                  <span className={s.mobileMenuIcon}>☰</span>
                </button>
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className={s.desktopCollapseButton}
                >
                  {collapsed ? (
                    <FiChevronRight size={18} />
                  ) : (
                    <FiChevronLeft size={18} />
                  )}
                </button>
                <div className={s.welcomeContainer}>
                  <h1 className={s.welcomeTitle}>
                    Welcome back,{" "}
                    <span className={s.welcomeName}>{displayName}!</span>
                  </h1>
                  <p className={s.welcomeSubtitle}>
                    Ready to create amazing invoices?
                  </p>
                </div>
              </div>
              <div className={s.mobileUserAvatar}>
                <div className={s.mobileAvatar}>{initial}</div>
              </div>
            </div>

            <div className={s.headerActions}>
              <Link to="/create-invoice" className={s.ctaButton}>
                <FiPlus className={s.ctaIcon} size={18} />
                <span>Create</span>
                <div className={s.ctaArrow} />
              </Link>
              <div className={s.userSectionDesktop}>
                <div className={s.userInfo}>
                  <div className={s.userName}>{displayName}</div>
                  <div className={s.userEmail}>{email}</div>
                </div>
                <div className={s.userAvatarContainer}>
                  <div className={s.userAvatar}>
                    <div className={s.userAvatarBorder} />
                    {initial}
                  </div>
                  <div className={s.userStatus} />
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className={s.main}>
            <div className={s.mainContainer}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
