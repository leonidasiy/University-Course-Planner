const major = Number(process.versions.node.split('.')[0]);

if (major !== 22) {
  console.error(
    `\nThis project requires Node.js 22.x (current: ${process.version}).\n` +
      'Native modules like better-sqlite3 must match your Node version.\n\n' +
      'Fix:\n' +
      '  nvm use\n' +
      '  npm install\n' +
      '  npm start\n',
  );
  process.exit(1);
}
