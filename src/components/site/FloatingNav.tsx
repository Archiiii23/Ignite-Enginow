import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

const links = [
  { label: "Events", to: "/events" as const },
  { label: "Resources", to: "/resources" as const },
  { label: "Careers", to: "/careers" as const },
  { label: "About", to: "/about" as const },
  { label: "Contact", to: "/contact" as const },
];

export function FloatingNav({ overDark = false }: { overDark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-5xl px-1 ${
        overDark ? "theme-dark !bg-transparent" : ""
      }`}
    >

      <div
        className={`rounded-2xl border border-foreground/10 px-3 py-2 flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? "bg-background/70 backdrop-blur-xl shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)]"
            : "bg-background/40 backdrop-blur-md"
        }`}
      >
        <Link to="/" className="flex items-center gap-2 pl-1">
          <img src={logo} alt="Enginow Ignite" width={28} height={28} className="size-7" />
          <span className="font-display text-[0.9375rem] font-semibold tracking-[-0.015em]">
            Enginow <span className="text-muted-foreground">Ignite</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-foreground/5"
              activeProps={{ className: "text-foreground bg-foreground/5" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/auth"
            className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg transition-colors"
          >
            Login
          </Link>
          <Link
            to="/dashboard"
            className="text-sm font-medium bg-foreground text-background px-4 py-2 rounded-lg hover:bg-foreground/90 transition-transform active:scale-95"
          >
            Host Event
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-foreground/5"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-2 rounded-2xl border border-foreground/10 bg-background/90 backdrop-blur-xl p-3 flex flex-col gap-1"
        >
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-foreground/5"
            >
              {l.label}
            </Link>
          ))}
          <div className="h-px bg-border my-1" />
          <Link to="/auth" onClick={() => setOpen(false)} className="text-sm text-left px-3 py-2 rounded-lg hover:bg-foreground/5">
            Login
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="text-sm font-medium bg-foreground text-background px-3 py-2 rounded-lg text-center"
          >
            Host Event
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
