"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: "Como funciona", href: "/#como-funciona" },
    { label: "Recursos", href: "/#recursos" },
    { label: "Privacidade", href: "/#privacidade" },
    { label: "FAQ", href: "/#faq" },
  ]  

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-xl font-bold tracking-tight text-foreground">
              GrokReport
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
          <Link href="/cases" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-4">
            Meus casos
          </Link>
            <Button size="default" className="font-medium" asChild>
              <Link href="/cases/new">Criar denúncia</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4">
              <Link href="/cases" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
                Meus casos
              </Link>
              <Button className="w-full font-medium" asChild>
                <Link href="/cases/new">Criar denúncia</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
