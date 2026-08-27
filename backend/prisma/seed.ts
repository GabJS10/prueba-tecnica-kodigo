/**
 * Seed inicial: productos y categorías de ejemplo para poder crear promociones.
 * Idempotente: no duplica si ya existen registros.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        { name: 'Café molido 500g' },
        { name: 'Camiseta algodón' },
        { name: 'Auriculares inalámbricos' },
      ],
    });
  }

  const categoryCount = await prisma.category.count();
  if (categoryCount === 0) {
    await prisma.category.createMany({
      data: [
        { name: 'Bebidas' },
        { name: 'Ropa' },
        { name: 'Electrónica' },
      ],
    });
  }

  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
