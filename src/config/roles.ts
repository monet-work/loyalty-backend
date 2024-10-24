/* eslint-disable prettier/prettier */
import { Role } from '@prisma/client';

const allRoles = {
  [Role.BrandAdmin]: ["Brand:getDashboard", "Brand:updateProfile", "Brand:addPOCRequest", "Brand:verifyPOCRequest", "Brand:sendEmailRequest", "Brand:verifyEmailRequest", "Brand:updateBusinessInfo"],
  [Role.BrandPOC]: ["Brand:getDashboard"],
  [Role.BasicConsumer]: ["Consumer:getDashboard", "Consumer:updateProfile", "Consumer:linkBrandProfile", "Consumer:verifyBrandProfileRequest"],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
export const allRightsForUser = (roles: Role[]): string[] => {
  const rights = [];

  for (const role of roles) {
    rights.push(...roleRights.get(role)!);
  }

  return rights;
};
