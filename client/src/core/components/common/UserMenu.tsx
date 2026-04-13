/**
 * @file UserMenu.tsx — User avatar dropdown with sign-out
 * @module client/core/components/common
 *
 * Displays the current user's avatar/initials in the header. Clicking
 * opens a dropdown with the user's email and a sign-out button.
 * Sign-out calls cleanupOnSignOut() which resets all stores and redirects.
 *
 * @dependencies shadcn/ui, client/src/core/stores, client/src/core/lib
 * @related client/src/core/components/common/Header.tsx — renders this
 */

import { LogOut } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@core/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@core/components/ui/dropdown-menu'
import { cleanupOnSignOut } from '@core/lib'
import { useAuthStore } from '@core/stores'

export function UserMenu(): JSX.Element {
  const currentUser = useAuthStore((s) => s.currentUser)

  const initials = currentUser?.full_name
    ? currentUser.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : currentUser?.email?.charAt(0).toUpperCase() ?? '?'

  const handleSignOut = async (): Promise<void> => {
    await cleanupOnSignOut()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={currentUser?.avatar_url ?? undefined} alt={currentUser?.full_name ?? 'User'} />
            <AvatarFallback className="bg-primary text-xs text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 border-border bg-surface">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {currentUser?.full_name && (
              <p className="text-sm font-medium text-text">{currentUser.full_name}</p>
            )}
            <p className="text-xs text-text-muted">{currentUser?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          className="cursor-pointer text-text-muted hover:text-text focus:bg-surface-alt focus:text-text"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
