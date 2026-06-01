const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('Created data/ directory.');
}

// --- Seed admin_users.json ---
const adminUsersPath = path.join(dataDir, 'admin_users.json');
if (!fs.existsSync(adminUsersPath)) {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('admin123', salt);

  const adminUsers = [
    {
      _id: '1',
      login: 'admin',
      password: hashedPassword,
      role: 'superadmin',
      etatObjet: 'code-1',
      createdAt: new Date().toISOString()
    }
  ];

  fs.writeFileSync(adminUsersPath, JSON.stringify(adminUsers, null, 2), 'utf8');
  console.log('✅  admin_users.json created. Login: admin / Password: admin123');
} else {
  console.log('ℹ️   admin_users.json already exists, skipping.');
}

// --- Seed conversations.json ---
const conversationsPath = path.join(dataDir, 'conversations.json');
if (!fs.existsSync(conversationsPath)) {
  fs.writeFileSync(conversationsPath, JSON.stringify([], null, 2), 'utf8');
  console.log('✅  conversations.json initialized as []');
} else {
  console.log('ℹ️   conversations.json already exists, skipping.');
}

// --- Copy data dump files if not present ---
const dumpDir = path.join(__dirname, '../data_dump');
const filesToCopy = ['produits.json', 'taxonomies.json', 'faqs.json'];

filesToCopy.forEach((file) => {
  const dest = path.join(dataDir, file);
  const src = path.join(dumpDir, file);
  if (!fs.existsSync(dest)) {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✅  Copied ${file} from data_dump.`);
    } else {
      console.warn(`⚠️   Source not found: ${src}. Create ${dest} manually.`);
    }
  } else {
    console.log(`ℹ️   ${file} already exists, skipping.`);
  }
});

console.log('\n🌿 Seed complete. You can now start the backend with: node app.js\n');
