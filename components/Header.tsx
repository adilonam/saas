"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
import { cn } from "components/lib/utils";
import ThemeSwitch from "./ThemeSwitch";
import UserMenu from "./UserMenu";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white dark:bg-black shadow-sm dark:border-b dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <Link
            href="/"
            className="text-base sm:text-xl dark:text-gray-100 font-semibold truncate"
          >
            Managepdf.site
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 h-7 sm:h-9"
                  )}
                >
                  <Link href="/sign-pdf">Sign PDF</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <nav className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {session?.user ? (
            <div className="ml-1 sm:ml-2">
              <UserMenu user={session.user} />
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 ml-1 sm:ml-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
          <ThemeSwitch />
        </nav>
      </div>
    </header>
  );
}
