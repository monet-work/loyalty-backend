/* eslint-disable prettier/prettier */
import { Role } from '@prisma/client';

const allRoles = {
  [Role.BrandAdmin]: ["getDashboard"],
  [Role.BrandPOC]: ["getDashboard"],
  [Role.BasicConsumer]: ["getDashboard"],
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
