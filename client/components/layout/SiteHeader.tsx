import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, SlidersHorizontal, Settings, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const tabs = [
  { to: "/", label: "Console" },
  { to: "/sections", label: "Sections" },
  { to: "/routes", label: "Routes" },
  { to: "/schedules", label: "Schedules" },
  { to: "/training", label: "Training" },
  { to: "/admin", label: "Admin" },
];

export function SiteHeader() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-2 px-4">
        <button className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-accent md:hidden">
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 pr-2 text-sm font-semibold">
          <div className="h-6 w-6 rounded bg-primary" />
          <span className="hidden sm:inline">Rail·Controller</span>
        </div>
        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {tabs.map((t) => (
            <Link key={t.to} to={t.to} className={cn(
              "rounded-md px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
              location.pathname === t.to ? "bg-accent text-foreground" : "text-muted-foreground",
            )}>
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            Operator <ChevronDown className="h-4 w-4 opacity-60" />
          </Button>
          <Button variant="outline" size="icon" className="hidden sm:inline-flex" aria-label="settings">
            <Settings className="h-4 w-4" />
          </Button>
          <Button size="sm" className="gap-1">
            <SlidersHorizontal className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
