import { Github, Instagram, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#050A16]/95">
      <div className="mx-auto max-w-7xl">
        <div className="flex w-full flex-col items-center justify-center space-y-5 px-4 py-5 text-center">
          <div className="flex items-center">
            <img
              src="/assets/logo_green_with_text.png"
              alt="ADPIS"
              className="h-24 w-auto"
            />
          </div>

          <nav className="flex flex-col flex-wrap items-center space-y-4 text-xs font-medium text-blue-100/70 sm:flex-row sm:space-x-4 sm:space-y-0">
            <a
              href="/not-found"
              className="transition-colors hover:text-lime-400"
            >
              Status
            </a>
            <a
              href="/not-found"
              className="transition-colors hover:text-lime-400"
            >
              Contact
            </a>
            <a
              href="/not-found"
              className="transition-colors hover:text-lime-400"
            >
              Docs
            </a>
            <a
              href="/not-found"
              className="transition-colors hover:text-lime-400"
            >
              API
            </a>
            <a
              href="/not-found"
              className="transition-colors hover:text-lime-400"
            >
              Privacy
            </a>
            <a
              href="/not-found"
              className="transition-colors hover:text-lime-400"
            >
              Terms
            </a>
          </nav>

          <nav className="flex items-center gap-4 text-blue-100/60">
            <a
              href="/not-found"
              aria-label="Facebook"
              className="hover:text-lime-400 transition-colors"
            >
              <Facebook className="size-5" />
            </a>
            <a
              href="/not-found"
              aria-label="YouTube"
              className="hover:text-lime-400 transition-colors"
            >
              <Youtube className="size-5" />
            </a>
            <a
              href="/not-found"
              aria-label="Instagram"
              className="hover:text-lime-400 transition-colors"
            >
              <Instagram className="size-5" />
            </a>
            <a
              href="/not-found"
              aria-label="GitHub"
              className="hover:text-lime-400 transition-colors"
            >
              <Github className="size-5" />
            </a>
          </nav>

          <p className="text-xs text-blue-100/50">
            © 2026 <span className="font-medium text-lime-400">ADPIS</span>. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
