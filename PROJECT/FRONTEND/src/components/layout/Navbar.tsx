import { NavLink } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/eq", label: "EQ" },
  { to: "/realtime", label: "Realtime EQ" },
  { to: "/analyze", label: "Analyzer" },
];

export default function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full bg-[#050A16]/95 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-screen-2xl items-center px-6 text-white">
        <NavLink to="/" className="flex items-center">
          <img
            src="/assets/logo_green.png"
            alt="ADPIS"
            className="h-12 w-auto"
          />
          <span className="text-lg ml-3 font-primary font-bold tracking-wide text-lime-400">
            ADPIS
          </span>
        </NavLink>

        <div className="absolute left-1/2 -translate-x-1/2">
          <NavigationMenu>
            <NavigationMenuList className="gap-10">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "relative inline-flex h-9 items-center px-4 text-sm font-medium transition-all duration-200",
                        isActive
                          ? `
        text-lime-400
        drop-shadow-[0_0_6px_rgba(182,255,82,0.45)]
      `
                          : "text-white/70 hover:text-lime-400/70 ",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
}
