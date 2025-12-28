"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useIsMobile } from "components/hooks/use-mobile";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "components/components/ui/navigation-menu";
import ThemeSwitch from "./ThemeSwitch";
import UserMenu from "./UserMenu";

export default function Header() {
  const { data: session } = useSession();
  const isMobile = useIsMobile();

  return (
    <header className="bg-white dark:bg-black shadow-sm dark:border-b dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl dark:text-gray-100 font-semibold">
            Managepdf.site
          </Link>
          <NavigationMenu viewport={isMobile}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/sign-pdf">Sign PDF</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <nav className="flex items-center gap-4">
          <ThemeSwitch />
          {session?.user && (
            <div className="ml-2">
              <UserMenu user={session.user} />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
