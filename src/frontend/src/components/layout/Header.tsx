import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { LogOut, Menu, Moon, Search, Settings, Sun, User } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

const QUICK_LINKS = [
  { label: "Go to Home", value: "home", hint: "Dashboard" },
  { label: "Start AI Chat", value: "chat", hint: "Conversation" },
  { label: "Open Documents", value: "documents", hint: "Library" },
  { label: "Browse Tools", value: "tools", hint: "Utilities" },
];

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, login, clear } = useInternetIdentity();
  const [searchOpen, setSearchOpen] = useState(false);

  const isAuthed = isAuthenticated;
  const initials = "AI";

  return (
    <header
      className="glass-strong sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 px-4"
      data-ocid="header.panel"
    >
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenMobileSidebar}
        aria-label="Open navigation menu"
        data-ocid="header.open_sidebar_button"
      >
        <Menu className="size-5" />
      </Button>

      <Popover open={searchOpen} onOpenChange={setSearchOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "group flex h-10 w-full max-w-md items-center gap-2.5 rounded-xl border border-border/70 bg-card/60 px-3.5 text-sm text-muted-foreground transition-smooth",
              "hover:border-border hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-label="Search the workspace"
            data-ocid="header.search_input"
          >
            <Search className="size-4 shrink-0 opacity-60" />
            <span className="flex-1 text-left">Search or jump to…</span>
            <kbd className="hidden rounded border border-border/70 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
              ⌘K
            </kbd>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(32rem,90vw)] p-0"
          align="start"
          data-ocid="header.search_popover"
        >
          <Command>
            <CommandInput placeholder="Type a command or search…" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Quick navigation">
                {QUICK_LINKS.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.label}
                    onSelect={() => setSearchOpen(false)}
                    data-ocid={`header.search.${item.value}.item`}
                  >
                    <Search className="size-4 opacity-50" />
                    <span className="flex-1">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.hint}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle color theme"
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          data-ocid="header.theme_toggle"
        >
          <motion.span
            key={theme}
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex"
          >
            {theme === "dark" ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )}
          </motion.span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full p-0.5 outline-none transition-smooth focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open user menu"
              data-ocid="header.user_menu"
            >
              <Avatar className="size-9 border border-border/60">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">Guest User</span>
              <span className="text-xs font-normal text-muted-foreground">
                {isAuthed ? "Authenticated" : "Not signed in"}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAuthed ? (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => clear()}
                data-ocid="header.logout_button"
              >
                <LogOut className="size-4" />
                Log out
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => login()}
                data-ocid="header.login_button"
              >
                <User className="size-4" />
                Sign in with Internet Identity
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem data-ocid="header.settings_link">
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
