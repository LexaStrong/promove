#!/usr/bin/env node

/**
 * ─────────────────────────────────────────────────────────────
 * ProMove Fleet OS - Native Traccar Runner & Manager
 * ─────────────────────────────────────────────────────────────
 * Cross-platform runner that enables Traccar to run natively alongside
 * ProMove on any system with Java installed.
 *
 * Usage:
 *   node scripts/traccar.mjs setup    # Downloads and extracts Traccar
 *   node scripts/traccar.mjs start    # Starts the Traccar GPS daemon
 *   node scripts/traccar.mjs test     # Sends a test GPS ping to ProMove webhook
 * ─────────────────────────────────────────────────────────────
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execSync } from 'node:child_process';
import https from 'node:https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const TRACCAR_DIR = path.join(ROOT_DIR, 'traccar');
const CONFIG_SOURCE = path.join(ROOT_DIR, 'docker', 'traccar', 'traccar.xml');
const TARGET_CONFIG = path.join(TRACCAR_DIR, 'conf', 'traccar.xml');

// Verified fallback release asset URL (platform-independent ZIP)
const TRACCAR_VERSION = '6.6';
const TRACCAR_ZIP_URL = `https://github.com/traccar/traccar/releases/download/v${TRACCAR_VERSION}/traccar-other-${TRACCAR_VERSION}.zip`;

async function checkJava() {
  try {
    const versionOutput = execSync('java -version', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return true;
  } catch (err) {
    if (err.stderr && err.stderr.includes('version')) {
      return true; // java -version outputs to stderr on many JVMs
    }
    return false;
  }
}

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`[Traccar] Fetching ${url} ...`);
    
    function makeRequest(currentUrl) {
      https.get(currentUrl, { headers: { 'User-Agent': 'ProMove-Telematics-Installer' } }, (res) => {
        // Handle HTTP redirects (GitHub releases redirect to AWS S3)
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return makeRequest(res.headers.location);
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`Download failed with HTTP status ${res.statusCode}`));
        }

        const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
        let downloadedBytes = 0;
        const fileStream = fs.createWriteStream(destPath);

        res.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          if (totalBytes > 0) {
            const percent = ((downloadedBytes / totalBytes) * 100).toFixed(1);
            process.stdout.write(`\r[Traccar] Downloading: ${percent}% (${(downloadedBytes / 1024 / 1024).toFixed(1)}MB / ${(totalBytes / 1024 / 1024).toFixed(1)}MB)`);
          }
        });

        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          console.log('\n[Traccar] Download completed successfully.');
          resolve();
        });

        fileStream.on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
      }).on('error', reject);
    }

    makeRequest(url);
  });
}

async function extractZip(zipPath, targetDir) {
  console.log(`[Traccar] Extracting archive to ${targetDir} ...`);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Cross-platform extraction using tar (standard in modern Windows, macOS, Linux) or PowerShell
  if (process.platform === 'win32') {
    try {
      execSync(`tar -xf "${zipPath}" -C "${targetDir}"`, { stdio: 'inherit' });
      return;
    } catch {
      execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${targetDir}' -Force"`, { stdio: 'inherit' });
    }
  } else {
    execSync(`unzip -o "${zipPath}" -d "${targetDir}"`, { stdio: 'inherit' });
  }
}

async function setup() {
  console.log('─────────────────────────────────────────────────────────────');
  console.log('ProMove Telematics: Setting Up Native Traccar Ingestion Server');
  console.log('─────────────────────────────────────────────────────────────');

  const javaOk = await checkJava();
  if (!javaOk) {
    console.error('\n❌ Java runtime not found! Please install Java 17+ or OpenJDK.');
    process.exit(1);
  }
  console.log('✔ Java runtime detected.');

  const jarPath = path.join(TRACCAR_DIR, 'tracker-server.jar');
  if (fs.existsSync(jarPath)) {
    console.log(`✔ Traccar is already installed at: ${TRACCAR_DIR}`);
  } else {
    const zipPath = path.join(ROOT_DIR, 'traccar-package.zip');
    try {
      await downloadFile(TRACCAR_ZIP_URL, zipPath);
      await extractZip(zipPath, TRACCAR_DIR);
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
      }
    } catch (err) {
      console.error('\n❌ Failed to download/extract Traccar:', err.message);
      console.log('You can also download traccar-other-*.zip manually from https://github.com/traccar/traccar/releases and extract into the ./traccar directory.');
      process.exit(1);
    }
  }

  // Ensure directories exist
  for (const sub of ['conf', 'data', 'logs']) {
    const p = path.join(TRACCAR_DIR, sub);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  }

  // Sync ProMove traccar.xml
  if (fs.existsSync(CONFIG_SOURCE)) {
    fs.copyFileSync(CONFIG_SOURCE, TARGET_CONFIG);
    console.log(`✔ Copied ProMove optimized configuration into: ${TARGET_CONFIG}`);
  }

  console.log('\n✅ Traccar setup complete!');
  console.log('Run "npm run traccar:start" to start the GPS hardware server.');
}

async function start() {
  const jarPath = path.join(TRACCAR_DIR, 'tracker-server.jar');
  if (!fs.existsSync(jarPath)) {
    console.log('[Traccar] Binary not found. Running setup first...');
    await setup();
  }

  // Ensure config is up to date
  if (fs.existsSync(CONFIG_SOURCE)) {
    fs.copyFileSync(CONFIG_SOURCE, TARGET_CONFIG);
  }

  console.log('\n🚀 Starting Traccar GPS Telemetry Server...');
  console.log(`Working Directory: ${TRACCAR_DIR}`);
  console.log(`Web Interface:     http://localhost:8082`);
  console.log(`Webhook Forward:   http://localhost:3000/api/gps/traccar-webhook`);
  console.log(`Active Ports:      5013 (Concox), 5027 (Teltonika), 5001 (Coban), 5055 (OsmAnd)`);
  console.log('─────────────────────────────────────────────────────────────\n');

  const child = spawn('java', ['-jar', 'tracker-server.jar', 'conf/traccar.xml'], {
    cwd: TRACCAR_DIR,
    stdio: 'inherit',
  });

  child.on('error', (err) => {
    console.error('Failed to spawn Traccar process:', err);
  });

  child.on('exit', (code, signal) => {
    console.log(`Traccar server exited with code ${code} (${signal})`);
  });
}

async function testPing() {
  console.log('[Traccar Test] Simulating live hardware GPS packet delivery...');
  const payload = {
    position: {
      deviceId: 'TEST-GH-8899-24',
      protocol: 'teltonika',
      latitude: 5.6037, // Accra, Ghana
      longitude: -0.1870,
      speed: 28.5, // ~52 km/h
      course: 90,
      altitude: 45,
      fixTime: new Date().toISOString(),
      attributes: {
        ignition: true,
        batteryLevel: 98,
        motion: true,
      },
    },
    device: {
      name: 'GT-4921-20',
      uniqueId: '864201049281726',
    },
  };

  const data = JSON.stringify(payload);
  const req = https.request('http://localhost:3000/api/gps/traccar-webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log(`[Traccar Test] Response Status: ${res.statusCode}`);
      console.log(`[Traccar Test] Response Body:   ${body}`);
    });
  });

  req.on('error', (err) => {
    console.error('[Traccar Test] Failed to contact ProMove webhook:', err.message);
  });

  req.write(data);
  req.end();
}

const command = process.argv[2] || 'start';
if (command === 'setup') {
  setup().catch(console.error);
} else if (command === 'test') {
  testPing().catch(console.error);
} else {
  start().catch(console.error);
}
