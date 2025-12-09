/**
 * Deployment Checker Script
 * 
 * Script ini membantu memverifikasi bahwa file yang akan di-deploy sudah benar.
 * Jalankan dengan: node deploy-check.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking deployment files...\n');

// Check if dist folder exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Error: dist/ folder tidak ditemukan!');
  console.log('   Jalankan dulu: npm run build\n');
  process.exit(1);
}

// Check payments.js route order
const paymentsJsPath = path.join(distPath, 'routes', 'payments.js');
if (!fs.existsSync(paymentsJsPath)) {
  console.error('❌ Error: dist/routes/payments.js tidak ditemukan!\n');
  process.exit(1);
}

const paymentsContent = fs.readFileSync(paymentsJsPath, 'utf-8');

// Check route order
const routeChecks = [
  { pattern: 'router.get("/methods"', name: 'GET /methods' },
  { pattern: 'router.get("/stats"', name: 'GET /stats' },
  { pattern: 'router.post("/:bookingId/checkout"', name: 'POST /:bookingId/checkout' },
  { pattern: 'router.get("/:id"', name: 'GET /:id' },
];

let allRoutesFound = true;
let routePositions = [];

routeChecks.forEach(check => {
  const index = paymentsContent.indexOf(check.pattern);
  if (index === -1) {
    console.error(`❌ Route ${check.name} tidak ditemukan!`);
    allRoutesFound = false;
  } else {
    routePositions.push({ name: check.name, index, pattern: check.pattern });
  }
});

if (!allRoutesFound) {
  process.exit(1);
}

// Sort by position to verify order
routePositions.sort((a, b) => a.index - b.index);

console.log('✅ Route order verification:');
routePositions.forEach((route, i) => {
  console.log(`   ${i + 1}. ${route.name}`);
});

// Verify specific routes come before /:id
const statsIndex = routePositions.find(r => r.name === 'GET /stats')?.index || 0;
const checkoutIndex = routePositions.find(r => r.name === 'POST /:bookingId/checkout')?.index || 0;
const idRouteIndex = routePositions.find(r => r.name === 'GET /:id')?.index || 0;

if (statsIndex > idRouteIndex) {
  console.error('\n❌ ERROR: GET /stats harus SEBELUM GET /:id!');
  process.exit(1);
}

if (checkoutIndex > idRouteIndex) {
  console.error('\n❌ ERROR: POST /:bookingId/checkout harus SEBELUM GET /:id!');
  process.exit(1);
}

console.log('\n✅ Route order BENAR! Specific routes sebelum /:id parameter routes.');

// Get file sizes for reference
const distSize = getDirectorySize(distPath);
console.log(`\n📦 Dist folder size: ${(distSize / 1024 / 1024).toFixed(2)} MB`);

// List critical files to upload
console.log('\n📋 Files yang HARUS di-upload ke production:');
const criticalFiles = [
  'dist/routes/payments.js',
  'dist/routes/payments.js.map',
  'dist/controllers/paymentController.js',
  'dist/services/paymentService.js',
  'dist/app.js',
  'dist/server.js',
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2);
    console.log(`   ✓ ${file} (${size} KB)`);
  } else {
    console.log(`   ✗ ${file} (NOT FOUND)`);
  }
});

console.log('\n📝 DEPLOYMENT INSTRUCTIONS:');
console.log('═══════════════════════════════════════════════════════════');
console.log('1. Upload seluruh folder "dist/" ke server production');
console.log('   Path server: /home/username/public_html/barber/');
console.log('');
console.log('2. Via cPanel File Manager:');
console.log('   - Zip folder dist/ menjadi dist.zip');
console.log('   - Upload dist.zip ke server');
console.log('   - Extract di server');
console.log('   - Hapus folder dist/ lama, rename dist baru');
console.log('');
console.log('3. Via FTP (FileZilla/Cyberduck):');
console.log('   - Connect ke FTP server');
console.log('   - Upload folder dist/ (overwrite existing)');
console.log('');
console.log('4. Restart Node.js App:');
console.log('   - Di cPanel > Setup Node.js App > Restart');
console.log('   - Atau via terminal: pm2 restart rusdi-barber-be');
console.log('');
console.log('5. Test endpoint:');
console.log('   POST http://asessment24.site/barber/api/v1/payments/{bookingId}/checkout');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('✨ Deployment check SELESAI! File siap di-upload.\n');

// Helper function
function getDirectorySize(dirPath) {
  let size = 0;
  
  function calculateSize(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        calculateSize(filePath);
      } else {
        size += stats.size;
      }
    });
  }
  
  calculateSize(dirPath);
  return size;
}
