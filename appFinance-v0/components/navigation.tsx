"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth"
import { LogOut, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contas-fixas", label: "Contas Fixas" },
  { href: "/relatorios", label: "Relatórios" },
]

export function Navigation() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/login"
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="nav-container flex h-14 items-center justify-between">
        <div className="flex items-center gap-1 md:gap-2 min-w-max">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} style={{ scrollSnapAlign: 'center' }}>
              <Button
                variant={pathname === item.href ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "whitespace-nowrap text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Alternar tema"
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
