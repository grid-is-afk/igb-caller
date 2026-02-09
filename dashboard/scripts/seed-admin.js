// @ts-check
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const username = "AdminIGB";
    const password = "IGBadmin";
    const saltRounds = 10;

    console.log(`Seeding admin user: ${username}...`);

    // Hash password
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Upsert user
    await prisma.admin.upsert({
        where: { username },
        update: { passwordHash },
        create: {
            username,
            passwordHash,
        },
    });

    console.log(`Admin user created/updated.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
