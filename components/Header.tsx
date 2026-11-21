"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "components/lib/utils";
import ThemeSwitch from "./ThemeSwitch";

export default function Header() {
  const navigationItems = [
    { title: "Sign PDF", href: "/sign-pdf" },
    { title: "Merge PDF", href: "/merge-pdf" },
    { title: "PDF to Word", href: "/pdf-to-word" },
    { title: "Summarize PDF", href: "/summarize-pdf" },
    { title: "Image to Prompt", href: "/image-to-prompt" },
    { title: "Video to Prompt", href: "/video-to-prompt" },
  ];

  return (
    <header className="bg-white dark:bg-black shadow-sm dark:border-b dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <Link
              href="/"
              className="text-base sm:text-xl dark:text-gray-100 font-semibold truncate"
            >
              eprod.io
            </Link>
            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:block">
              <NavigationMenuList>
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink
                      asChild
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 h-7 sm:h-9"
                      )}
                    >
                      <Link href={item.href}>{item.title}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 sm:gap-4 shrink-0">
            <ThemeSwitch />
          </nav>
          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeSwitch />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuGroup>
                  {navigationItems.map((item, index) => (
                    <DropdownMenuItem key={index} asChild>
                      <Link href={item.href}>{item.title}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
