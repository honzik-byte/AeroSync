import type { CurrentUser, CurrentUserRole } from "@/lib/currentUser"

export type NavigationItem = {
  href: string
  label: string
}

const pilotNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Přehled" },
  { href: "/calendar", label: "Kalendář" },
]

const clubAdminNavigation: NavigationItem[] = [
  ...pilotNavigation,
  { href: "/airplanes", label: "Letadla" },
  { href: "/pilots", label: "Piloti" },
]

const superAdminNavigation: NavigationItem[] = [
  ...clubAdminNavigation,
  { href: "/admin", label: "Správa" },
]

export function isSuperAdminRole(role: CurrentUserRole | null | undefined): role is "super_admin" {
  return role === "super_admin"
}

export function isClubAdminRole(role: CurrentUserRole | null | undefined): role is "club_admin" {
  return role === "club_admin"
}

export function canManageAeroclub(role: CurrentUserRole | null | undefined) {
  return isSuperAdminRole(role) || isClubAdminRole(role)
}

export function getNavigationItemsForRole(role: CurrentUserRole): NavigationItem[] {
  if (role === "super_admin") {
    return [...superAdminNavigation]
  }

  if (role === "club_admin") {
    return [...clubAdminNavigation]
  }

  if (role === "pilot") {
    return [...pilotNavigation]
  }

  return []
}

export function requireAuthenticatedUser(currentUser: CurrentUser | null | undefined): CurrentUser {
  if (!currentUser?.authUser) {
    throw new Error("Uživatel není přihlášený.")
  }

  return currentUser
}

export function requireSuperAdmin(currentUser: CurrentUser | null | undefined): CurrentUser {
  const authenticatedUser = requireAuthenticatedUser(currentUser)

  if (!isSuperAdminRole(authenticatedUser.role)) {
    throw new Error("Je potřeba role super admina.")
  }

  return authenticatedUser
}

export function requireClubAdmin(currentUser: CurrentUser | null | undefined): CurrentUser {
  const authenticatedUser = requireAuthenticatedUser(currentUser)

  if (!isClubAdminRole(authenticatedUser.role)) {
    throw new Error("Je potřeba role klubového admina.")
  }

  return authenticatedUser
}
