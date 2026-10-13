-- AlterTable
ALTER TABLE `carts` ADD COLUMN `promo_code_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_promo_code_id_fkey` FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
