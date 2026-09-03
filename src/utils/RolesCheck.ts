import { UserProfile, UserRole } from "../types/user";

export const hasAnyRole = (
    profile: UserProfile | null,
    roles: UserRole[],
) => {

    return roles.some((role) => profile?.roles?.includes(role));
};
export const getDashboardTitle = (profile: UserProfile | null) => {
    if (hasAnyRole(profile, ["superAdmin"])) return "Super Administrateur";
    if (hasAnyRole(profile, ["admin"])) return "Administrateur";
    if (hasAnyRole(profile, ["budgetManager"])) return "Manager du Budget";

    return "Tableau de bord";
};