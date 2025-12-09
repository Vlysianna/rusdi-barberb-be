/**
 * Create Deployment Package Script
 * 
 * Script ini membuat file zip yang siap di-upload ke production server.
 * Jalankan dengan: node create-deployment-package.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Creating deployment package...\n');

// Check if dist exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Error: dist/ folder tidak ditemukan!');
  console.log('   Jalankan dulu: npm run build\n');
  process.exit(1);
}

// Create deployment folder
const deploymentPath = path.join(__dirname, 'deployment');
if (fs.existsSync(deploymentPath)) {
  console.log('🗑️  Cleaning old deployment folder...');
  fs.rmSync(deploymentPath, { recursive: true, force: true });
}
fs.mkdirSync(deploymentPath);

console.log('📁 Creating deployment structure...');

// Copy essential files
const filesToCopy = [
  'package.json',
  'package-lock.json',
  '.env.production',
];

filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(deploymentPath, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`   ✓ Copied ${file}`);
  } else if (file === '.env.production') {
    // Create sample .env.production if doesn't exist
    const envContent = `# Production Environment Variables
NODE_ENV=production
PORT=3000
BASE_PATH=/barber

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=rusdi_barber

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://asessment24.site,https://admin.asessment24.site

# Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
`;
    fs.writeFileSync(destPath, envContent);
    console.log(`   ⚠️  Created sample ${file} - EDIT BEFORE UPLOAD!`);
  }
});

// Copy dist folder
console.log('📂 Copying dist/ folder...');
copyFolderRecursive(distPath, path.join(deploymentPath, 'dist'));
console.log('   ✓ Copied dist/');

// Create deployment guide
const guideContent = `# DEPLOYMENT GUIDE - Rusdi Barber Backend

## 📦 Package Contents:
- dist/ - Compiled JavaScript files
- package.json - Dependencies
- package-lock.json - Locked dependencies
- .env.production - Environment variables (EDIT FIRST!)

## 🚀 Deployment Steps:

### Via cPanel:

1. **Upload Files:**
   - Compress folder "deployment" menjadi zip
   - Login ke cPanel
   - Go to File Manager
   - Navigate ke /home/username/public_html/barber/
   - Upload deployment.zip
   - Extract deployment.zip
   - Move semua isi dari deployment/ ke parent folder

2. **Edit Environment Variables:**
   - Edit file .env.production
   - Update database credentials
   - Update JWT secrets
   - Save changes

3. **Install Dependencies (First time only):**
   - Di cPanel > Terminal
   - cd /home/username/public_html/barber
   - npm install --production

4. **Setup/Restart Node.js App:**
   - Di cPanel > Setup Node.js App
   - Klik "Restart" pada application Anda
   - Atau via terminal: pm2 restart rusdi-barber-be

5. **Verify Deployment:**
   - Test endpoint: GET http://asessment24.site/barber/api/v1/health
   - Test checkout: POST http://asessment24.site/barber/api/v1/payments/{bookingId}/checkout

### Via FTP:

1. **Connect using FileZilla/Cyberduck:**
   - Host: asessment24.site
   - Username: your_ftp_username
   - Password: your_ftp_password
   - Port: 21

2. **Upload Files:**
   - Navigate to /public_html/barber/
   - Upload all files from deployment/ folder
   - Overwrite existing files when prompted

3. **Follow steps 2-5 from cPanel method above**

## ⚠️ IMPORTANT NOTES:

1. **BACKUP FIRST!** 
   - Backup folder dist/ lama sebelum overwrite
   - Backup database sebelum migration

2. **Environment Variables:**
   - JANGAN commit .env ke git!
   - Edit .env.production dengan credentials production
   - Pastikan JWT_SECRET berbeda dari development

3. **Node.js Version:**
   - Ensure server uses Node.js v18 or higher
   - Check di cPanel > Setup Node.js App

4. **File Permissions:**
   - Set folder uploads/ permissions ke 755
   - Set folder dist/ permissions ke 755

## 🔍 Troubleshooting:

**Issue: 404 Not Found**
- Clear Node.js app cache di cPanel
- Restart application
- Check BASE_PATH in .env matches URL structure

**Issue: Database Connection Error**
- Verify database credentials in .env.production
- Check database host (might be localhost or remote)
- Ensure database user has proper permissions

**Issue: Module Not Found**
- Run: npm install --production
- Check package.json exists
- Restart Node.js app

## 📞 Support:
If issues persist after following these steps, check:
- Server error logs in cPanel
- Application logs: pm2 logs rusdi-barber-be
- Node.js app logs in cPanel

---
Generated: ${new Date().toLocaleString()}
Build from commit: ${getCurrentGitCommit()}
`;

fs.writeFileSync(path.join(deploymentPath, 'DEPLOYMENT_GUIDE.txt'), guideContent);
console.log('   ✓ Created DEPLOYMENT_GUIDE.txt');

// Create README
const readmeContent = `# BACA DULU! / READ FIRST!

## ⚠️ PENTING SEBELUM UPLOAD:

1. Edit file .env.production:
   - Ganti DB_USER, DB_PASSWORD, DB_NAME dengan database production
   - Ganti JWT_SECRET dan JWT_REFRESH_SECRET dengan nilai baru (random string)
   - Sesuaikan CORS_ORIGIN dengan domain production

2. Backup dulu folder production yang lama!

3. Baca file DEPLOYMENT_GUIDE.txt untuk instruksi lengkap

## Quick Deploy:

1. Upload semua file ke /public_html/barber/
2. Edit .env.production
3. Restart Node.js app di cPanel
4. Test: http://asessment24.site/barber/api/v1/health

---

File ini dibuat: ${new Date().toLocaleString()}
`;

fs.writeFileSync(path.join(deploymentPath, 'README_FIRST.txt'), readmeContent);
console.log('   ✓ Created README_FIRST.txt');

console.log('\n✅ Deployment package created successfully!\n');
console.log('📍 Location: ' + deploymentPath);
console.log('\n📋 Next steps:');
console.log('   1. Edit deployment/.env.production dengan credentials production');
console.log('   2. Compress folder "deployment" menjadi zip');
console.log('   3. Upload ke server production');
console.log('   4. Extract dan restart Node.js app');
console.log('\n📖 Baca DEPLOYMENT_GUIDE.txt untuk instruksi lengkap\n');

// Helper functions
function copyFolderRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);

  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stats = fs.statSync(srcPath);

    if (stats.isDirectory()) {
      copyFolderRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

function getCurrentGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch (e) {
    return 'unknown';
  }
}
