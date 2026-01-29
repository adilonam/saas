"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "components/lib/utils";
import ThemeSwitch from "./ThemeSwitch";
import UserMenu from "./UserMenu";
import DepositDialog from "./DepositDialog";

export default function Header() {
  const { data: session } = useSession();
  const [depositDialogOpen, setDepositDialogOpen] = React.useState(false);

  const navigationItems = [
    { title: "Sign PDF", href: "/sign-pdf" },
    { title: "Merge PDF", href: "/merge-pdf" },
    { title: "PDF to Word", href: "/pdf-to-word" },
    { title: "Summarize PDF", href: "/summarize-pdf" },
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
              Managepdf.site
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
            {session?.user ? (
              <div className="ml-1 sm:ml-2 flex items-center gap-2">
                <UserMenu user={session.user} />
                <div className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tokens: {session.user.tokens ?? 0}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDepositDialogOpen(true)}
                  className="text-xs sm:text-sm"
                >
                  Deposit
                </Button>
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
                <DropdownMenuSeparator />
                {session?.user ? (
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user.name || "User"}
                        </p>
                        {session.user.email && (
                          <p className="text-xs leading-none text-muted-foreground">
                            {session.user.email}
                          </p>
                        )}
                        <p className="text-xs leading-none text-muted-foreground mt-1">
                          Tokens: {session.user.tokens ?? 0}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDepositDialogOpen(true)}
                      className="cursor-pointer"
                    >
                      Deposit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        const { signOut } = await import("next-auth/react");
                        await signOut({ callbackUrl: "/signin" });
                      }}
                      className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                ) : (
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/signin" className="w-full">
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/signup" className="w-full">
                        Sign Up
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <DepositDialog
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
        onSuccess={() => {
          // Session will be updated via the update() call in DepositDialog
        }}
      />
    </header>
  );
}
