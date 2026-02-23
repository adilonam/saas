"use client";

import { signOut } from "next-auth/react";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    subscriptionExpiresAt?: Date | null;
    waitlistNumber?: number | null;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  const hasActiveSubscription =
    user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();

  const renderSubtitle = () => {
    if (hasActiveSubscription) {
      return user.waitlistNumber != null
        ? (
            <>
              Expires {new Date(user.subscriptionExpiresAt!).toLocaleDateString()} ·{" "}
              <span className="text-dashboard-primary font-semibold normal-case">Waitlist {user.waitlistNumber}</span>
            </>
          )
        : `Expires ${new Date(user.subscriptionExpiresAt!).toLocaleDateString()}`;
    }
    if (user.waitlistNumber != null) {
      return <span className="text-dashboard-primary font-semibold normal-case">Waitlist {user.waitlistNumber}</span>;
    }
    return "No subscription";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <User className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline text-left min-w-0">
            <span className="block truncate font-medium">
              {user.name || user.email || "User"}
            </span>
            <span className="block text-[10px] sm:text-xs uppercase tracking-tighter text-muted-foreground">
              {renderSubtitle()}
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || "User"}
            </p>
            {user.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
            <p className="text-xs leading-none text-muted-foreground mt-1">
              {hasActiveSubscription
                ? user.waitlistNumber != null
                  ? (
                      <>
                        Subscription expires {new Date(user.subscriptionExpiresAt!).toLocaleDateString()} ·{" "}
                        <span className="text-dashboard-primary font-medium">Waitlist {user.waitlistNumber}</span>
                      </>
                    )
                  : `Subscription expires ${new Date(user.subscriptionExpiresAt!).toLocaleDateString()}`
                : user.waitlistNumber != null
                  ? <span className="text-dashboard-primary font-medium">Waitlist {user.waitlistNumber}</span>
                  : "No active subscription"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
