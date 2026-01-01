import { useEffect, useRef } from "react";

import { Link, Outlet, useLocation } from "react-router-dom";
import { logoutAdmin } from "../../utils/auth";
import ibaLogo from "../../assets/iba-logo.png";
import ceeLogo from "../../assets/cee-logo.png";
import "./AdminLayout.css";

export default function AdminLayout() {
  const location = useLocation();
  const lastScrollY = useRef(0);

  useEffect(() => {
    const header = document.querySelector(".admin-header-floating");
    if (!header) return;

    let ticking = false;

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Hide on scroll down
          if (delta > 15 && currentY > 80) {
            header.classList.add("is-hidden");
            header.classList.remove("is-visible");
          }

          // Show on slight scroll up
          if (delta < -10) {
            header.classList.remove("is-hidden");
            header.classList.add("is-visible");
          }

          lastScrollY.current = currentY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);



  const navLinks = [
    { path: "/admin/dashboard", label: "Primary" },
    { path: "/admin/programs", label: "Programs" },
    { path: "/admin/organization-info", label: "Organization" },
    { path: "/admin/user-info", label: "Participant" },
    { path: "/admin/general-info", label: "General" },
  ];

  return (
    <div className="admin-wrapper">
      <header className="admin-header-floating">
        <div className="nav-container-wall-to-wall">
          
          {/* LEFT: BRANDING */}
          <div className="header-section left">
            <div className="logo-card-mini animate-float">
              <img src={ibaLogo} alt="IBA" className="nav-img" />
              <div className="nav-v-divider"></div>
              <img src={ceeLogo} alt="CEE" className="nav-img" />
            </div>
            <div className="brand-text-stack">
              <span className="txt-primary">CEE DIPLOMA</span>
              <span className="txt-secondary">ADMIN PORTAL</span>
            </div>
          </div>

          {/* CENTER: NAVIGATION */}
          <nav className="header-section center">
            <div className="tabs-wrapper">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-tab-item ${location.pathname === link.path ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* RIGHT: ACTIONS */}
          <div className="header-section right">
            <div className="admin-badge-slim">
              <span className="dot-online"></span>
              Admin
            </div>
            <button
              className="logout-btn-compact"
              onClick={() => {
                logoutAdmin();
                window.location.href = "/admin/login";
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main-view">
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}