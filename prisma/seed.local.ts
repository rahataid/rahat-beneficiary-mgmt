import { PrismaClient, Service } from '@prisma/client';

// NOTE: Update #1, #2, #3 with your data

const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  USER: 'User',
};

const FEED_USERS = {
  BINOD: {
    name: 'Binod Chaudhary',
    email: 'thebinod7@gmail.com',
    role: ROLES.ADMIN,
  },
  KARUN: {
    name: 'Karun Gyawali',
    email: 'karun@rumsan.net',
    role: ROLES.MANAGER,
  },
  JOHN: {
    name: 'John Doe',
    email: 'john@mailinator.com',
    role: ROLES.USER,
  },
};

function cloneDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (Array.isArray(obj)) {
    const arrCopy: any[] = [];
    obj.forEach((val, i) => {
      arrCopy[i] = cloneDeep(val);
    });
    return arrCopy as T;
  }

  if (obj instanceof Object) {
    const objCopy: { [key: string]: any } = {};
    Object.keys(obj).forEach((key) => {
      objCopy[key] = cloneDeep((obj as { [key: string]: any })[key]);
    });
    return objCopy as T;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
}

export const roles: Array<{ name: string; isSystem?: boolean }> = [
  { name: ROLES.ADMIN, isSystem: true },
  { name: ROLES.MANAGER },
  { name: ROLES.USER },
];

export const permissions: Array<{
  roleName: string;
  action: string;
  subject: string;
}> = [
  { roleName: ROLES.ADMIN, action: 'manage', subject: 'all' },
  { roleName: ROLES.MANAGER, action: 'manage', subject: 'user' },
  { roleName: ROLES.USER, action: 'read', subject: 'user' },
];

// 1. Map User details
export const users: Array<{ name?: string; email?: string; wallet?: string }> =
  [
    { name: FEED_USERS.BINOD.name, email: FEED_USERS.BINOD.email },
    {
      name: FEED_USERS.KARUN.name,
      email: FEED_USERS.KARUN.email,
    },
    { name: FEED_USERS.JOHN.name, email: FEED_USERS.JOHN.email },
  ];

// 2. Map UserRole with user name
export const userRoles: Array<{ name: string; roleName: string }> = [
  { name: FEED_USERS.BINOD.name, roleName: FEED_USERS.BINOD.role },
  { name: FEED_USERS.KARUN.name, roleName: FEED_USERS.KARUN.role },
  { name: FEED_USERS.JOHN.name, roleName: FEED_USERS.JOHN.role },
];

// 3. Map auth with user name
export const auths: Array<{
  name: string;
  service: Service;
  serviceId: string;
}> = [
  {
    name: FEED_USERS.BINOD.name,
    service: Service.EMAIL,
    serviceId: FEED_USERS.BINOD.email,
  },
  {
    name: FEED_USERS.KARUN.name,
    service: Service.EMAIL,
    serviceId: FEED_USERS.KARUN.email,
  },
  {
    name: FEED_USERS.JOHN.name,
    service: Service.EMAIL,
    serviceId: FEED_USERS.JOHN.email,
  },
];

const prisma = new PrismaClient();

async function addAuths(txn: PrismaClient, user: any) {
  const _current = auths.find((auth) => auth.name === user.name);
  await txn.auth.create({
    data: {
      userId: user.id,
      service: _current.service,
      serviceId: _current.serviceId,
    },
  });
}

async function upsertUserRoles(txn: PrismaClient, user: any) {
  const userId = user.id;
  const _role = userRoles.find((role) => role.name === user.name);
  const existingRole = await txn.role.findUnique({
    where: { name: _role.roleName },
  });
  await txn.userRole.upsert({
    where: {
      userRoleIdentifier: {
        userId,
        roleId: existingRole.id,
      },
    },
    update: {
      userId,
      roleId: existingRole.id,
    },
    create: {
      userId,
      roleId: existingRole.id,
    },
  });
}

async function main() {
  return prisma.$transaction(async (txn: PrismaClient) => {
    // Cleanup
    await txn.userRole.deleteMany();
    await txn.permission.deleteMany();
    await txn.role.deleteMany();
    await txn.auth.deleteMany();
    await txn.user.deleteMany();
    // ===========Create Roles=============
    for (const role of roles) {
      await txn.role.create({
        data: cloneDeep(role),
      });
    }

    // ===========Create Permissions==========
    for (const permission of permissions) {
      const role = await txn.role.findUnique({
        where: { name: permission.roleName },
      });

      if (role) {
        await txn.permission.create({
          data: {
            roleId: role.id,
            action: permission.action,
            subject: permission.subject,
          },
        });
      }
    }

    // ==============Create Users===============
    for (let i = 0; i < users.length; i++) {
      const newUser = await txn.user.create({
        data: cloneDeep(users[i]),
      });
      // Create Auth
      addAuths(txn, newUser);

      // Create User role
      await upsertUserRoles(txn, newUser);
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
  });
