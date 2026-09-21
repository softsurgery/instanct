export type IdentifiableUser = {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  email?: string | null;
  pictureId?: number | null;
};

export function identifyUser(user?: IdentifiableUser | null) {
  if (!user) return "Unknown";
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username || user.email || "Unknown";
}

export function identifyUserAvatar(user?: IdentifiableUser | null) {
  if (!user) return "U";
  const first = user.firstName?.charAt(0);
  const last = user.lastName?.charAt(0);
  if (first || last) return `${first ?? ""}${last ?? ""}`.toUpperCase();
  return (user.username || user.email || "U").charAt(0).toUpperCase();
}
