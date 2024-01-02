import { PrismaClient } from '@prisma/client';
import { cloneDeep } from 'lodash';
export const roles: Array<{ id?: number; name: string; isSystem?: boolean }> = [
  {
    id: 1,
    name: 'Admin',
    isSystem: true,
  },
  {
    id: 2,
    name: 'Manager',
  },
  {
    id: 3,
    name: 'User',
  },
];

export const permissions: Array<{
  id?: number;
  roleId: number;
  action: string;
  subject: string;
}> = [
  {
    id: 1,
    roleId: 1,
    action: 'manage',
    subject: 'all',
  },
  {
    id: 2,
    roleId: 1,
    action: 'create',
    subject: 'role',
  },
  {
    id: 3,
    roleId: 1,
    action: 'read',
    subject: 'role',
  },
  {
    id: 4,
    roleId: 1,
    action: 'update',
    subject: 'role',
  },
  {
    id: 5,
    roleId: 1,
    action: 'create',
    subject: 'role',
  },
  {
    id: 6,
    roleId: 1,
    action: 'read',
    subject: 'role',
  },
  {
    id: 7,
    roleId: 1,
    action: 'update',
    subject: 'role',
  },
  {
    id: 8,
    roleId: 2,
    action: 'manage',
    subject: 'permission',
  },
  {
    id: 9,
    roleId: 3,
    action: 'read',
    subject: 'user',
  },
  {
    id: 10,
    roleId: 3,
    action: 'update',
    subject: 'user',
  },
];

export const users: Array<{
  id?: number;
  firstName: string;
  lastName: string;
  roleId: number;
  authAddress: string;
}> = [
  {
    id: 1,
    firstName: 'Mr',
    lastName: 'Admin',
    roleId: 1,
    authAddress: 'admin@mailinator.com',
  },
  {
    id: 2,
    firstName: 'Mr',
    lastName: 'Manager',
    roleId: 2,
    authAddress: 'manager@mailinator.com',
  },
  {
    id: 3,
    firstName: 'Mr',
    lastName: 'User',
    roleId: 3,
    authAddress: 'user@mailinator.com',
  },
];

const prisma = new PrismaClient();

async function main() {
  // const category1 = await prisma.category.createMany({
  //   data: [
  //     {
  //       name: 'Charitable Organization',
  //       id: 1,
  //     },
  //     {
  //       name: 'Chepang Community',
  //       id: 2,
  //     },
  //     {
  //       name: 'Daily Wage Earners',
  //       id: 3,
  //     },
  //     {
  //       name: 'Physically Challenged',
  //       id: 4,
  //     },
  //     {
  //       name: 'Senior Citizens',
  //       id: 5,
  //     },
  //     {
  //       name: 'Squattered Families',
  //       id: 6,
  //     },
  //     {
  //       name: 'Underprivileged Community',
  //       id: 7,
  //     },
  //   ],
  // });
  // ===========Create Roles=============
  for await (const role of roles) {
    const roleAttrs = cloneDeep(role);
    delete roleAttrs.id;
    await prisma.role.upsert({
      where: {
        id: role.id,
      },
      create: roleAttrs,
      update: roleAttrs,
    });
  }

  // ===========Create Permissions==========
  for await (const permission of permissions) {
    const permissionAttrs = cloneDeep(permission);
    delete permissionAttrs.id;
    await prisma.permission.upsert({
      where: {
        id: permission.id,
      },
      create: permissionAttrs,
      update: permissionAttrs,
    });
  }

  // ==============Create Users===============
  for await (const user of users) {
    const userAttrs = cloneDeep(user);
    delete userAttrs.id;
    await prisma.user.upsert({
      where: {
        id: user.id,
      },
      create: userAttrs,
      update: userAttrs,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
  });
