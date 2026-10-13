// Переносит картинки товаров из prisma/data/products.json в Cloudinary и заменяет ссылки в этом файле.
// Запуск: node scripts/upload-images-to-cloudinary.js   (нужна переменная CLOUDINARY_URL=cloudinary://key:secret@cloud)
// Повторный запуск безопасен: картинки, которые уже в Cloudinary, пропускаются
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'prisma', 'data', 'products.json');
const FOLDER = 'keyhub/products';

function parseCloudinaryUrl(value) {
  const match = /^cloudinary:\/\/(\d+):([^@]+)@([\w-]+)$/.exec((value || '').trim());
  if (!match) throw new Error('CLOUDINARY_URL должна выглядеть как cloudinary://API_KEY:API_SECRET@CLOUD_NAME');
  return { apiKey: match[1], apiSecret: match[2], cloudName: match[3] };
}

const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'game';

// Подписанная загрузка: Cloudinary сам скачивает картинку по ссылке (file = URL)
async function upload({ apiKey, apiSecret, cloudName }, fileUrl, publicId) {
  const params = { overwrite: 'true', public_id: publicId, timestamp: Math.floor(Date.now() / 1000) };
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
  const signature = crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');

  const form = new FormData();
  form.append('file', fileUrl);
  form.append('api_key', apiKey);
  form.append('signature', signature);
  for (const [k, v] of Object.entries(params)) form.append(k, String(v));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);
  return data.secure_url;
}

async function main() {
  const credentials = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
  const products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  let uploaded = 0;
  let skipped = 0;

  for (const product of products) {
    const slug = slugify(product.title);
    for (let i = 0; i < product.images.length; i++) {
      const url = product.images[i];
      if (url.includes('res.cloudinary.com')) {
        skipped++;
        continue;
      }
      // До 3 попыток: внешний сайт с картинками иногда отвечает с задержкой
      for (let attempt = 1; ; attempt++) {
        try {
          product.images[i] = await upload(credentials, url, `${FOLDER}/${slug}-${i + 1}`);
          uploaded++;
          console.log(`OK  ${product.title} #${i + 1}`);
          break;
        } catch (err) {
          if (attempt >= 3) throw new Error(`${product.title} #${i + 1}: ${err.message}`);
          console.warn(`retry ${product.title} #${i + 1}: ${err.message}`);
        }
      }
    }
    // Сохраняем после каждого товара: если что-то упадёт, уже загруженное не потеряется
    fs.writeFileSync(DATA_FILE, `${JSON.stringify(products, null, 2)}\n`);
  }

  console.log(`Готово: загружено ${uploaded}, уже были в Cloudinary ${skipped}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
