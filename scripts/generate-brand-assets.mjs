import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputImagePath = 'C:/Users/demiurge/.gemini/antigravity-ide/brain/3add5623-44b7-499f-9cdc-7e320158e8dc/.user_uploaded/media_1791337727728.png';
const publicDir = path.resolve('public');
const appDir = path.resolve('src/app');
const androidResDir = path.resolve('android/app/src/main/res');

function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(count, 4); // image count

  const dirEntries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    dirEntries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(b => b.buffer)]);
}

async function run() {
  console.log('Loading input image...');
  const trimmedBuffer = await sharp(inputImagePath).trim().toBuffer();

  // 1. Generate 512x512 Master App Icon with 8% padding for clean rounded squircle framing
  console.log('Generating master icon (512x512)...');
  const icon512 = await sharp(trimmedBuffer)
    .resize(480, 480, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 16,
      bottom: 16,
      left: 16,
      right: 16,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  // Save to public/icon.png and public/apple-icon.png
  fs.writeFileSync(path.join(publicDir, 'icon.png'), icon512);
  fs.writeFileSync(path.join(publicDir, 'apple-icon.png'), icon512);
  fs.writeFileSync(path.join(publicDir, 'logo.png'), icon512);
  fs.writeFileSync(path.join(publicDir, 'logo-white.png'), icon512);

  // 2. Generate 192x192 Logo Icon
  console.log('Generating 192x192 logo icons...');
  const icon192 = await sharp(trimmedBuffer)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'logo-icon.png'), icon192);
  fs.writeFileSync(path.join(publicDir, 'logo-icon-white.png'), icon192);

  // 3. Generate Favicon (multi-res ICO: 16x16, 32x32, 48x48)
  console.log('Generating favicon.ico and favicon.png...');
  const [png16, png32, png48] = await Promise.all([
    sharp(trimmedBuffer).resize(16, 16).png().toBuffer(),
    sharp(trimmedBuffer).resize(32, 32).png().toBuffer(),
    sharp(trimmedBuffer).resize(48, 48).png().toBuffer(),
  ]);

  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
  ]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), png48);

  // Also write to src/app/favicon.ico
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);

  // 4. Generate OpenGraph (OG) 1200x630 Image
  console.log('Generating 1200x630 OpenGraph image...');
  const ogIconSize = 280;
  const ogIconBuffer = await sharp(trimmedBuffer)
    .resize(ogIconSize, ogIconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const ogSvgOverlay = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow" cx="20%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#0B4F6C" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#071118" stop-opacity="0"/>
        </radialGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="#071118"/>
      <rect width="1200" height="630" fill="url(#glow)"/>
      
      <!-- Subtle architectural borders -->
      <rect x="40" y="40" width="1120" height="550" rx="16" fill="none" stroke="#1E3A4D" stroke-width="2"/>
      
      <!-- Text Content -->
      <g transform="translate(480, 210)">
        <!-- Brand Title -->
        <text x="0" y="50" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="64" font-weight="800" fill="#FFFFFF" letter-spacing="-1.5">
          ProMove
        </text>
        
        <!-- Badge -->
        <g transform="translate(320, 10)">
          <rect width="180" height="36" rx="18" fill="rgba(58, 150, 181, 0.2)" stroke="#3A96B5" stroke-width="1.5"/>
          <text x="90" y="23" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="14" font-weight="700" fill="#3A96B5" text-anchor="middle">
            GHANA FLEET OPS
          </text>
        </g>
        
        <!-- Headline -->
        <text x="0" y="110" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="30" font-weight="600" fill="#F4F7F9" letter-spacing="-0.5">
          Fleet Operations &amp; Commercial Telematics
        </text>
        
        <!-- Description -->
        <text x="0" y="155" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="20" font-weight="400" fill="#9BB0BD">
          Trotro Unions, Taxis, Intercity Haulage, GPS Supervision &amp; Daily Ledgers
        </text>
        
        <!-- Feature Pills -->
        <g transform="translate(0, 195)">
          <rect x="0" y="0" width="170" height="32" rx="6" fill="#0C1A24" stroke="#1E3A4D" stroke-width="1"/>
          <text x="85" y="21" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="13" font-weight="600" fill="#4ADE80" text-anchor="middle">
            Traccar GT06 GPS
          </text>
          
          <rect x="185" y="0" width="190" height="32" rx="6" fill="#0C1A24" stroke="#1E3A4D" stroke-width="1"/>
          <text x="280" y="21" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="13" font-weight="600" fill="#3A96B5" text-anchor="middle">
            Pesewa Precision Ledger
          </text>
          
          <rect x="390" y="0" width="180" height="32" rx="6" fill="#0C1A24" stroke="#1E3A4D" stroke-width="1"/>
          <text x="480" y="21" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="13" font-weight="600" fill="#FBBF24" text-anchor="middle">
            Ghana Act 843 Ready
          </text>
        </g>
      </g>
    </svg>
  `;

  const ogBase = await sharp(Buffer.from(ogSvgOverlay))
    .composite([
      {
        input: ogIconBuffer,
        left: 120,
        top: 175,
      },
    ])
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogBase);

  // 5. Generate Android App Launcher Icons (WebP & PNG)
  console.log('Generating Android app launcher icons...');
  const androidMipmaps = [
    { dir: 'mipmap-mdpi', size: 48 },
    { dir: 'mipmap-hdpi', size: 72 },
    { dir: 'mipmap-xhdpi', size: 96 },
    { dir: 'mipmap-xxhdpi', size: 144 },
    { dir: 'mipmap-xxxhdpi', size: 192 },
  ];

  for (const item of androidMipmaps) {
    const targetDir = path.join(androidResDir, item.dir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Standard Icon (square / squircle)
    const iconWebp = await sharp(trimmedBuffer)
      .resize(item.size, item.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 95 })
      .toBuffer();
    fs.writeFileSync(path.join(targetDir, 'ic_launcher.webp'), iconWebp);

    // Round Icon (circular mask)
    const circleSvg = `<svg width="${item.size}" height="${item.size}"><circle cx="${item.size/2}" cy="${item.size/2}" r="${item.size/2}" fill="#fff"/></svg>`;
    const roundWebp = await sharp(trimmedBuffer)
      .resize(item.size, item.size, { fit: 'cover' })
      .composite([{
        input: Buffer.from(circleSvg),
        blend: 'dest-in'
      }])
      .webp({ quality: 95 })
      .toBuffer();
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.webp'), roundWebp);

    // Adaptive icon foreground (108dp size: mdpi=108, hdpi=162, xhdpi=216, xxhdpi=324, xxxhdpi=432)
    // Safe area is 72dp inside 108dp (~66% of dimension)
    const adaptiveSize = Math.round(item.size * 2.25);
    const contentSize = Math.round(adaptiveSize * 0.72);
    const pad = Math.round((adaptiveSize - contentSize) / 2);

    const fgWebp = await sharp(trimmedBuffer)
      .resize(contentSize, contentSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: pad,
        bottom: pad,
        left: pad,
        right: pad,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .resize(adaptiveSize, adaptiveSize)
      .webp({ quality: 95 })
      .toBuffer();
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_foreground.webp'), fgWebp);
  }

  // Update ic_launcher_background.xml
  const bgXml = `<?xml version="1.0" encoding="utf-8"?>
<color xmlns:android="http://schemas.android.com/apk/res/android">#071118</color>
`;
  fs.writeFileSync(path.join(androidResDir, 'drawable', 'ic_launcher_background.xml'), bgXml);

  // Update mipmap-anydpi-v26/ic_launcher.xml and ic_launcher_round.xml
  const anydpiXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`;
  fs.writeFileSync(path.join(androidResDir, 'mipmap-anydpi-v26', 'ic_launcher.xml'), anydpiXml);
  fs.writeFileSync(path.join(androidResDir, 'mipmap-anydpi-v26', 'ic_launcher_round.xml'), anydpiXml);

  // 6. Generate Logo Lockup (Emblem + ProMove Text) for sidebar & headers
  console.log('Generating promove-logo-lockup.png...');
  const lockupEmblemSize = 160;
  const lockupEmblem = await sharp(trimmedBuffer)
    .resize(lockupEmblemSize, lockupEmblemSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const lockupSvg = `
    <svg width="680" height="200" viewBox="0 0 680 200" xmlns="http://www.w3.org/2000/svg">
      <text x="195" y="112" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="64" font-weight="800" fill="#FFFFFF" letter-spacing="-1.5">
        ProMove
      </text>
      <text x="198" y="148" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="20" font-weight="600" fill="#3A96B5" letter-spacing="1">
        FLEET OPERATIONS
      </text>
    </svg>
  `;

  const lockupBuffer = await sharp(Buffer.from(lockupSvg))
    .composite([
      {
        input: lockupEmblem,
        left: 15,
        top: 20,
      },
    ])
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'promove-logo-lockup.png'), lockupBuffer);

  console.log('All brand assets successfully generated!');
}

run().catch(console.error);
