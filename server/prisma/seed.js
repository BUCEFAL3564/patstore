require('dotenv').config({ quiet: true });

const prisma = require('../src/lib/prisma');
const { hashPassword } = require('../src/lib/password');
const products = require('./data/products.json');

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Не задана переменная окружения ${name} (см. .env.example)`);
  return value;
}

async function seedUser(rawEmail, password, role) {
  const email = rawEmail.trim().toLowerCase();
  const password_hash = await hashPassword(password);
  return prisma.user.upsert({
    where: { email },
    update: { password_hash, role },
    create: { email, password_hash, role },
  });
}

// У products нет уникального поля, поэтому сопоставляем по title:
// повторный запуск сида обновляет товары, а не создаёт дубли
async function seedProducts() {
  let created = 0;
  let updated = 0;

  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { title: product.title } });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: { ...product, deleted_at: null } });
      updated++;
    } else {
      await prisma.product.create({ data: product });
      created++;
    }
  }

  return { created, updated };
}

async function main() {
  const admin = await seedUser(requireEnv('SEED_ADMIN_EMAIL'), requireEnv('SEED_ADMIN_PASSWORD'), 'admin');
  const customer = await seedUser(
    requireEnv('SEED_CUSTOMER_EMAIL'),
    requireEnv('SEED_CUSTOMER_PASSWORD'),
    'customer'
  );
  console.log(`Users: ${admin.email} (admin), ${customer.email} (customer)`);

  const promo = await prisma.promoCode.upsert({
    where: { code: 'SAVE10' },
    update: { discount_percentage: 10, is_active: true },
    create: { code: 'SAVE10', discount_percentage: 10, is_active: true },
  });
  console.log(`Promo: ${promo.code} −${promo.discount_percentage}%`);

  const { created, updated } = await seedProducts();
  console.log(`Products: ${created} created, ${updated} updated`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
