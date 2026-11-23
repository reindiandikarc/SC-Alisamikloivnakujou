/**
 * vanXone — WhatsApp Bot
 * 
 * Library      : @whiskeysockets/baileys
 * Type         : Plugins | ESM Modules
 * Engine       : kyzz-canvas + Sci-Fi Cyberpunk Telemetry SVG HUD
 * Creator      : Mommy Kyu
 * Recode       : Hamm
 * 
 * Official Channels:
 * • https://whatsapp.com/channel/0029VbDO8tI2phHLTSN2ed0U
 * • https://whatsapp.com/channel/0029VbCKm3I5EjxsUbvmVf33
 * 
 * Thanks To:
 * • Allah SWT. — The Creator of Everything
 * • Mother & Father — My Greatest Support
 * • Kyu — Developer of Hirara AI
 * • Nana — my girl friend
 * • vanXone </> — Developer of Ryo Yamada MD
 * • Kano — femboy jing
 * • Rennz — pemboy nya akuu
 * • Raynold — penyopng Ourin jir 😹
 * • Fahri — Developer of Jssslyn MD
 * • Amane Offc — orng belok
 * • All Buyers
 * • All Users & Contributors
 * 
 * Documentation:
 * [ID]  Baca README.md untuk melihat panduan.
 * [EN]  Read README.md untuk melihat panduan.
 * 
 * Distribution Notice:
 * Dilarang menyebarkan source code ini secara gratis
 * tanpa izin dari creator.
 * 
 * Pelanggaran terhadap ketentuan ini dapat menyebabkan
 * penghentian update dan dukungan terhadap source code.
 * 
 * Copyright © Mommy Kyu 2026
 * All Rights Reserved.
 */

import os from 'os';
import fs from 'node:fs';
import { execSync } from 'child_process';
import { performance } from 'node:perf_hooks';
import { fonts, renderSvgToBuffer } from 'kyzz-canvas';

let fontsLoaded = false;
async function initFonts() {
  if (fontsLoaded) return;
  try {
    await fonts.google('Inter', { weight: [400, 600, 700, 800, 900] });
    fontsLoaded = true;
  } catch (_) {
    // kyzz-canvas bundles DejaVu Sans as built-in fallback
  }
}

function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

function formatTime(seconds) {
  seconds = Number(seconds);
  if (isNaN(seconds) || seconds <= 0) return '0s';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function getDisk() {
  try {
    const df = execSync('df -k --output=size,used,avail / 2>/dev/null').toString();
    const lines = df.trim().split('\n');
    if (lines.length > 1) {
      const [total, used, avail] = lines[1].trim().split(/\s+/).map(Number);
      return {
        total: total * 1024,
        used: used * 1024,
        free: avail * 1024,
        percent: parseFloat(((used / total) * 100).toFixed(1))
      };
    }
  } catch {}
  return { total: 0, used: 0, free: 0, percent: 0 };
}

function getNetwork() {
  let totalRx = 0, totalTx = 0;
  try {
    const net = execSync('cat /proc/net/dev 2>/dev/null').toString();
    for (const line of net.split('\n')) {
      if (line.includes(':') && !line.includes('lo:')) {
        const parts = line.trim().split(/\s+/);
        totalRx += parseInt(parts[1]) || 0;
        totalTx += parseInt(parts[9]) || 0;
      }
    }
  } catch {}
  return { totalRx, totalTx };
}

function getCpuDetails() {
  let model = '';
  let speedGHz = 0;
  try {
    const cpuinfo = fs.readFileSync('/proc/cpuinfo', 'utf8');
    const mModel = cpuinfo.match(/model name\s*:\s*(.+)/);
    if (mModel) model = mModel[1].trim();
    const mSpeed = cpuinfo.match(/cpu MHz\s*:\s*([\d.]+)/);
    if (mSpeed) speedGHz = parseFloat(mSpeed[1]) / 1000;
  } catch {}

  const cpus = os.cpus();
  if (!model || model === 'unknown') {
    model = cpus[0]?.model && cpus[0].model !== 'unknown' ? cpus[0].model : 'Multi-Core Processor';
  }
  if (!speedGHz || speedGHz <= 0) {
    speedGHz = (cpus[0]?.speed || 0) / 1000;
  }

  return {
    model,
    speedGHz,
    cores: cpus.length || 1
  };
}

function getCpuUsage() {
  try {
    const s1 = execSync('cat /proc/stat 2>/dev/null').toString().split('\n')[0].trim().split(/\s+/).map(Number);
    execSync('sleep 0.12');
    const s2 = execSync('cat /proc/stat 2>/dev/null').toString().split('\n')[0].trim().split(/\s+/).map(Number);
    const idle1 = s1[4], total1 = s1.slice(1).reduce((a, b) => a + b, 0);
    const idle2 = s2[4], total2 = s2.slice(1).reduce((a, b) => a + b, 0);
    return Math.min(100, Math.max(0, (1 - (idle2 - idle1) / (total2 - total1)) * 100));
  } catch {
    const load = os.loadavg()[0];
    return Math.min(100, (load * 100) / (os.cpus().length || 1));
  }
}

function getOsPrettyName() {
  try {
    const id = execSync('grep ^PRETTY_NAME /etc/os-release 2>/dev/null').toString().split('=')[1]?.replace(/"/g, '').trim();
    if (id) return id;
  } catch {}
  return `${os.type()} ${os.release()}`;
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Builds high-end sci-fi cyberpunk telemetry HUD SVG vector card
 */
function buildCyberTelemetrySvg(d) {
  const W = 1040;
  const H = 610;

  // Circular gauge calculations (240 degree sweep)
  const r = 46;
  const circumference = 2 * Math.PI * r;
  const arcFraction = 240 / 360;
  const totalArc = circumference * arcFraction;
  const gap = circumference - totalArc;
  const baseRotate = 150; // Sweeps from bottom-left to bottom-right

  const cpuPct = Math.min(100, Math.max(0, d.cpuPercent));
  const cpuArc = (cpuPct / 100) * totalArc;

  const ramPct = Math.min(100, Math.max(0, d.ramPercent));
  const ramArc = (ramPct / 100) * totalArc;

  const diskPct = Math.min(100, Math.max(0, d.diskPercent));
  const diskArc = (diskPct / 100) * totalArc;

  // Latency-based dynamic status and styling
  let latColor = '#10b981';
  let latStatus = 'EXCELLENT // ULTRA-LOW';
  let latBorder = 'rgba(16, 185, 129, 0.45)';
  if (d.latency >= 100 && d.latency < 280) {
    latColor = '#f59e0b';
    latStatus = 'GOOD // STABLE RESPONSE';
    latBorder = 'rgba(245, 158, 11, 0.45)';
  } else if (d.latency >= 280) {
    latColor = '#f43f5e';
    latStatus = 'ELEVATED // HIGH LOAD';
    latBorder = 'rgba(244, 63, 94, 0.45)';
  }

  // Network bar scale proportions
  const maxNet = Math.max(d.totalRx, d.totalTx, 1);
  const rxPct = Math.min(100, Math.max(12, (d.totalRx / maxNet) * 100));
  const txPct = Math.min(100, Math.max(12, (d.totalTx / maxNet) * 100));

  const safeHostname = escapeXml(d.hostname);
  const safeOsName = escapeXml(d.osName);
  const safeCpuModel = escapeXml(d.cpuModel.length > 28 ? d.cpuModel.slice(0, 26) + '…' : d.cpuModel);

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="mainBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#060913"/>
      <stop offset="45%" stop-color="#090f23"/>
      <stop offset="100%" stop-color="#04060d"/>
    </linearGradient>

    <!-- Card Background Gradient -->
    <linearGradient id="cardBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(16, 24, 48, 0.75)"/>
      <stop offset="100%" stop-color="rgba(8, 13, 28, 0.85)"/>
    </linearGradient>

    <!-- Border Gradients -->
    <linearGradient id="cyanBorderGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="60%" stop-color="rgba(56, 189, 248, 0.2)"/>
      <stop offset="100%" stop-color="rgba(99, 102, 241, 0.1)"/>
    </linearGradient>

    <linearGradient id="purpleBorderGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="60%" stop-color="rgba(168, 85, 247, 0.2)"/>
      <stop offset="100%" stop-color="rgba(56, 189, 248, 0.1)"/>
    </linearGradient>

    <linearGradient id="emeraldBorderGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="60%" stop-color="rgba(168, 85, 247, 0.1)"/>
      <stop offset="100%" stop-color="rgba(16, 185, 129, 0.2)"/>
    </linearGradient>

    <!-- Gauge Gradients -->
    <linearGradient id="cpuGaugeGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>

    <linearGradient id="ramGaugeGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>

    <linearGradient id="diskGaugeGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>

    <!-- Bar Gradients -->
    <linearGradient id="rxGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>

    <linearGradient id="txGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>

    <!-- Ambient Blur Filter -->
    <filter id="ambientBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="70"/>
    </filter>

    <!-- Soft Glow Filter -->
    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Cyber Grid Pattern -->
    <pattern id="cyberGrid" width="36" height="36" patternUnits="userSpaceOnUse">
      <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="1"/>
      <circle cx="36" cy="0" r="1" fill="rgba(56,189,248,0.12)"/>
    </pattern>
  </defs>

  <!-- Deep Canvas Background -->
  <rect width="100%" height="100%" fill="url(#mainBg)"/>

  <!-- Ambient Glowing Orbs -->
  <circle cx="160" cy="70" r="160" fill="#06b6d4" opacity="0.12" filter="url(#ambientBlur)"/>
  <circle cx="520" cy="300" r="210" fill="#6366f1" opacity="0.10" filter="url(#ambientBlur)"/>
  <circle cx="920" cy="90" r="150" fill="#10b981" opacity="0.09" filter="url(#ambientBlur)"/>

  <!-- Tech Grid Overlay -->
  <rect width="100%" height="100%" fill="url(#cyberGrid)"/>

  <!-- Outer Frame & HUD Corner Accents -->
  <rect x="25" y="22" width="990" height="566" rx="20" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.2"/>
  
  <!-- Viewfinder Corner Accents -->
  <path d="M 25 50 L 25 22 L 53 22" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M 1015 50 L 1015 22 L 987 22" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M 25 560 L 25 588 L 53 588" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M 1015 560 L 1015 588 L 987 588" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>

  <!-- ==================== HEADER SECTION ==================== -->
  <g transform="translate(48, 44)">
    <!-- Brand Logo Hexagon -->
    <polygon points="20,4 36,13 36,31 20,40 4,31 4,13" fill="#0f172a" stroke="#38bdf8" stroke-width="2" filter="url(#neonGlow)"/>
    <!-- Lightning Bolt Icon inside hex -->
    <path d="M 22 12 L 14 23 L 20 23 L 18 32 L 26 21 L 20 21 Z" fill="#38bdf8"/>

    <!-- Brand Titles -->
    <text x="50" y="16" font-family="Inter, DejaVu Sans, sans-serif" font-size="10" font-weight="700" letter-spacing="2.5" fill="#38bdf8">vanXone AI // TELEMETRY CORE v7.0</text>
    <text x="50" y="38" font-family="Inter, DejaVu Sans, sans-serif" font-size="20" font-weight="900" letter-spacing="0.5" fill="#ffffff">SYSTEM TELEMETRY &amp; PERFORMANCE</text>

    <!-- Node & Host Pill Badge -->
    <g transform="translate(50, 48)">
      <rect width="420" height="22" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <circle cx="10" cy="11" r="3.5" fill="#10b981"/>
      <text x="20" y="15" font-family="Inter, DejaVu Sans, sans-serif" font-size="10" font-weight="600" fill="#94a3b8">
        HOST: <tspan fill="#e2e8f0" font-weight="700">${safeHostname}</tspan> • <tspan fill="#38bdf8">${safeOsName}</tspan> (${d.arch})
      </text>
    </g>
  </g>

  <!-- Latency Hologram Pod (Top-Right) -->
  <g transform="translate(735, 42)">
    <rect width="255" height="74" rx="14" fill="rgba(11, 18, 36, 0.85)" stroke="${latBorder}" stroke-width="1.5" filter="url(#neonGlow)"/>
    
    <!-- Status Dot & Label -->
    <circle cx="20" cy="20" r="4.5" fill="${latColor}"/>
    <text x="32" y="24" font-family="Inter, DejaVu Sans, sans-serif" font-size="9.5" font-weight="800" letter-spacing="1" fill="${latColor}">${latStatus}</text>

    <!-- Latency Numbers -->
    <text x="20" y="58" font-family="Inter, DejaVu Sans, sans-serif" font-size="28" font-weight="900" fill="#ffffff">${d.latency.toFixed(1)} <tspan font-size="14" font-weight="700" fill="#94a3b8">ms</tspan></text>

    <!-- Mini Signal Waves / Spark Bars -->
    <g transform="translate(195, 30)">
      <rect x="0" y="18" width="5" height="10" rx="2" fill="${latColor}"/>
      <rect x="9" y="12" width="5" height="16" rx="2" fill="${latColor}"/>
      <rect x="18" y="6" width="5" height="22" rx="2" fill="${latColor}"/>
      <rect x="27" y="0" width="5" height="28" rx="2" fill="${latColor}"/>
      <rect x="36" y="8" width="5" height="20" rx="2" fill="${latColor}" opacity="0.75"/>
    </g>
  </g>

  <!-- ==================== MIDDLE SECTION: 3 CIRCULAR HUD GAUGES ==================== -->

  <!-- CARD 1: CPU LOAD -->
  <g transform="translate(48, 136)">
    <!-- Container Box -->
    <rect width="308" height="212" rx="16" fill="url(#cardBg)" stroke="url(#cyanBorderGrad)" stroke-width="1.2"/>
    <path d="M 0 16 C 0 7 7 0 16 0 L 292 0 C 301 0 308 7 308 16 L 308 36 L 0 36 Z" fill="rgba(56, 189, 248, 0.05)"/>
    
    <!-- Header with Chip Icon -->
    <g transform="translate(16, 12)">
      <!-- Microchip SVG Icon -->
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
      </svg>
      <text x="26" y="14" font-family="Inter, DejaVu Sans, sans-serif" font-size="11" font-weight="800" letter-spacing="1" fill="#f8fafc">CPU UTILIZATION</text>
    </g>

    <!-- Circular Arc Gauge -->
    <g transform="translate(154, 102)">
      <!-- Track -->
      <circle cx="0" cy="0" r="${r}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="8.5"
        stroke-linecap="round" stroke-dasharray="${totalArc.toFixed(2)} ${gap.toFixed(2)}"
        transform="rotate(${baseRotate} 0 0)"/>
      <!-- Filled Progress Arc -->
      <circle cx="0" cy="0" r="${r}" fill="none" stroke="url(#cpuGaugeGrad)" stroke-width="8.5"
        stroke-linecap="round" stroke-dasharray="${cpuArc.toFixed(2)} ${circumference.toFixed(2)}"
        transform="rotate(${baseRotate} 0 0)" filter="url(#neonGlow)"/>
      <!-- Percentage Text -->
      <text x="0" y="-2" font-family="Inter, DejaVu Sans, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${cpuPct.toFixed(1)}%</text>
      <text x="0" y="16" font-family="Inter, DejaVu Sans, sans-serif" font-size="8.5" font-weight="700" letter-spacing="1" fill="#f59e0b" text-anchor="middle">LOAD RATE</text>
    </g>

    <!-- CPU Details Footer -->
    <g transform="translate(16, 158)">
      <rect width="276" height="42" rx="10" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <text x="12" y="17" font-family="Inter, DejaVu Sans, sans-serif" font-size="10" font-weight="700" fill="#e2e8f0">${d.cpuCores} Cores @ ${d.cpuSpeed.toFixed(2)} GHz</text>
      <text x="12" y="32" font-family="Inter, DejaVu Sans, sans-serif" font-size="8.5" font-weight="500" fill="#94a3b8">${safeCpuModel}</text>
      <!-- Small Status Pill -->
      <rect x="210" y="8" width="56" height="18" rx="5" fill="rgba(245, 158, 11, 0.15)"/>
      <text x="238" y="20" font-family="Inter, DejaVu Sans, sans-serif" font-size="8.5" font-weight="800" fill="#f59e0b" text-anchor="middle">ACTIVE</text>
    </g>
  </g>

  <!-- CARD 2: RAM MEMORY -->
  <g transform="translate(366, 136)">
    <!-- Container Box -->
    <rect width="308" height="212" rx="16" fill="url(#cardBg)" stroke="url(#purpleBorderGrad)" stroke-width="1.2"/>
    <path d="M 0 16 C 0 7 7 0 16 0 L 292 0 C 301 0 308 7 308 16 L 308 36 L 0 36 Z" fill="rgba(168, 85, 247, 0.05)"/>
    
    <!-- Header with RAM Icon -->
    <g transform="translate(16, 12)">
      <!-- Layers / Memory SVG Icon -->
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
      </svg>
      <text x="26" y="14" font-family="Inter, DejaVu Sans, sans-serif" font-size="11" font-weight="800" letter-spacing="1" fill="#f8fafc">RAM ALLOCATION</text>
    </g>

    <!-- Circular Arc Gauge -->
    <g transform="translate(154, 102)">
      <!-- Track -->
      <circle cx="0" cy="0" r="${r}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="8.5"
        stroke-linecap="round" stroke-dasharray="${totalArc.toFixed(2)} ${gap.toFixed(2)}"
        transform="rotate(${baseRotate} 0 0)"/>
      <!-- Filled Progress Arc -->
      <circle cx="0" cy="0" r="${r}" fill="none" stroke="url(#ramGaugeGrad)" stroke-width="8.5"
        stroke-linecap="round" stroke-dasharray="${ramArc.toFixed(2)} ${circumference.toFixed(2)}"
        transform="rotate(${baseRotate} 0 0)" filter="url(#neonGlow)"/>
      <!-- Percentage Text -->
      <text x="0" y="-2" font-family="Inter, DejaVu Sans, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${ramPct.toFixed(1)}%</text>
      <text x="0" y="16" font-family="Inter, DejaVu Sans, sans-serif" font-size="8.5" font-weight="700" letter-spacing="1" fill="#38bdf8" text-anchor="middle">CONSUMED</text>
    </g>

    <!-- RAM Details Footer -->
    <g transform="translate(16, 158)">
      <rect width="276" height="42" rx="10" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <text x="12" y="17" font-family="Inter, DejaVu Sans, sans-serif" font-size="10.5" font-weight="700" fill="#e2e8f0">${formatSize(d.ramUsed)} / ${formatSize(d.totalMem)}</text>
      <text x="12" y="32" font-family="Inter, DejaVu Sans, sans-serif" font-size="9" font-weight="500" fill="#94a3b8">Node Heap: ${formatSize(d.heapUsed)} (${formatSize(d.freeMem)} Free)</text>
      <!-- Small Status Pill -->
      <rect x="210" y="8" width="56" height="18" rx="5" fill="rgba(6, 182, 212, 0.15)"/>
      <text x="238" y="20" font-family="Inter, DejaVu Sans, sans-serif" font-size="8.5" font-weight="800" fill="#06b6d4" text-anchor="middle">STABLE</text>
    </g>
  </g>

  <!-- CARD 3: DISK STORAGE -->
  <g transform="translate(684, 136)">
    <!-- Container Box -->
    <rect width="308" height="212" rx="16" fill="url(#cardBg)" stroke="url(#emeraldBorderGrad)" stroke-width="1.2"/>
    <path d="M 0 16 C 0 7 7 0 16 0 L 292 0 C 301 0 308 7 308 16 L 308 36 L 0 36 Z" fill="rgba(16, 185, 129, 0.05)"/>
    
    <!-- Header with Disk Icon -->
    <g transform="translate(16, 12)">
      <!-- Hard Drive SVG Icon -->
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/>
      </svg>
      <text x="26" y="14" font-family="Inter, DejaVu Sans, sans-serif" font-size="11" font-weight="800" letter-spacing="1" fill="#f8fafc">STORAGE DISK (NVMe)</text>
    </g>

    <!-- Circular Arc Gauge -->
    <g transform="translate(154, 102)">
      <!-- Track -->
      <circle cx="0" cy="0" r="${r}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="8.5"
        stroke-linecap="round" stroke-dasharray="${totalArc.toFixed(2)} ${gap.toFixed(2)}"
        transform="rotate(${baseRotate} 0 0)"/>
      <!-- Filled Progress Arc -->
      <circle cx="0" cy="0" r="${r}" fill="none" stroke="url(#diskGaugeGrad)" stroke-width="8.5"
        stroke-linecap="round" stroke-dasharray="${diskArc.toFixed(2)} ${circumference.toFixed(2)}"
        transform="rotate(${baseRotate} 0 0)" filter="url(#neonGlow)"/>
      <!-- Percentage Text -->
      <text x="0" y="-2" font-family="Inter, DejaVu Sans, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${diskPct.toFixed(1)}%</text>
      <text x="0" y="16" font-family="Inter, DejaVu Sans, sans-serif" font-size="8.5" font-weight="700" letter-spacing="1" fill="#10b981" text-anchor="middle">OCCUPIED</text>
    </g>

    <!-- Disk Details Footer -->
    <g transform="translate(16, 158)">
      <rect width="276" height="42" rx="10" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <text x="12" y="17" font-family="Inter, DejaVu Sans, sans-serif" font-size="10.5" font-weight="700" fill="#e2e8f0">${formatSize(d.diskUsed)} / ${formatSize(d.diskTotal)}</text>
      <text x="12" y="32" font-family="Inter, DejaVu Sans, sans-serif" font-size="9" font-weight="500" fill="#94a3b8">Volume / • ${formatSize(d.diskFree)} Free Space</text>
      <!-- Small Status Pill -->
      <rect x="210" y="8" width="56" height="18" rx="5" fill="rgba(16, 185, 129, 0.15)"/>
      <text x="238" y="20" font-family="Inter, DejaVu Sans, sans-serif" font-size="8.5" font-weight="800" fill="#10b981" text-anchor="middle">HEALTHY</text>
    </g>
  </g>

  <!-- ==================== LOWER SECTION: DUAL TELEMETRY PANELS ==================== -->

  <!-- PANEL LEFT: NETWORK BANDWIDTH I/O -->
  <g transform="translate(48, 362)">
    <rect width="460" height="162" rx="16" fill="url(#cardBg)" stroke="rgba(255,255,255,0.08)" stroke-width="1.2"/>
    
    <!-- Title Bar -->
    <g transform="translate(18, 14)">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
      </svg>
      <text x="26" y="14" font-family="Inter, DejaVu Sans, sans-serif" font-size="11" font-weight="800" letter-spacing="1" fill="#f8fafc">NETWORK TRAFFIC I/O (eth0)</text>
      <!-- Tag -->
      <rect x="330" y="0" width="85" height="18" rx="5" fill="rgba(56, 189, 248, 0.12)"/>
      <text x="372" y="12" font-family="Inter, DejaVu Sans, sans-serif" font-size="8.5" font-weight="800" fill="#38bdf8" text-anchor="middle">DUPLEX GIGABIT</text>
    </g>

    <!-- Download RX Block -->
    <g transform="translate(18, 48)">
      <rect width="424" height="46" rx="10" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <!-- Download Arrow Icon -->
      <circle cx="24" cy="23" r="14" fill="rgba(6,182,212,0.15)"/>
      <svg x="16" y="15" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
      </svg>
      <text x="48" y="19" font-family="Inter, DejaVu Sans, sans-serif" font-size="9" font-weight="700" letter-spacing="0.5" fill="#94a3b8">TOTAL RECEIVED (RX)</text>
      <text x="48" y="36" font-family="Inter, DejaVu Sans, sans-serif" font-size="14" font-weight="900" fill="#ffffff">${formatSize(d.totalRx)}</text>
      
      <!-- Mini bar -->
      <rect x="250" y="20" width="160" height="7" rx="3.5" fill="rgba(255,255,255,0.07)"/>
      <rect x="250" y="20" width="${((rxPct / 100) * 160).toFixed(1)}" height="7" rx="3.5" fill="url(#rxGrad)"/>
    </g>

    <!-- Upload TX Block -->
    <g transform="translate(18, 102)">
      <rect width="424" height="46" rx="10" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <!-- Upload Arrow Icon -->
      <circle cx="24" cy="23" r="14" fill="rgba(168,85,247,0.15)"/>
      <svg x="16" y="15" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 5 19 12"/>
      </svg>
      <text x="48" y="19" font-family="Inter, DejaVu Sans, sans-serif" font-size="9" font-weight="700" letter-spacing="0.5" fill="#94a3b8">TOTAL TRANSMITTED (TX)</text>
      <text x="48" y="36" font-family="Inter, DejaVu Sans, sans-serif" font-size="14" font-weight="900" fill="#ffffff">${formatSize(d.totalTx)}</text>
      
      <!-- Mini bar -->
      <rect x="250" y="20" width="160" height="7" rx="3.5" fill="rgba(255,255,255,0.07)"/>
      <rect x="250" y="20" width="${((txPct / 100) * 160).toFixed(1)}" height="7" rx="3.5" fill="url(#txGrad)"/>
    </g>
  </g>

  <!-- PANEL RIGHT: RUNTIME & SYSTEM SPECS -->
  <g transform="translate(524, 362)">
    <rect width="468" height="162" rx="16" fill="url(#cardBg)" stroke="rgba(255,255,255,0.08)" stroke-width="1.2"/>
    
    <!-- Title Bar -->
    <g transform="translate(18, 14)">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <text x="26" y="14" font-family="Inter, DejaVu Sans, sans-serif" font-size="11" font-weight="800" letter-spacing="1" fill="#f8fafc">SYSTEM &amp; BOT RUNTIME HEALTH</text>
      <!-- Tag -->
      <rect x="345" y="0" width="90" height="18" rx="5" fill="rgba(16, 185, 129, 0.12)"/>
      <text x="390" y="12" font-family="Inter, DejaVu Sans, sans-serif" font-size="8.5" font-weight="800" fill="#10b981" text-anchor="middle">ONLINE 100%</text>
    </g>

    <!-- 2x2 Grid of Spec Pods -->
    <!-- Pod A: Bot Uptime -->
    <g transform="translate(18, 44)">
      <rect width="206" height="50" rx="10" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <circle cx="20" cy="25" r="11" fill="rgba(56, 189, 248, 0.15)"/>
      <svg x="14" y="19" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <text x="38" y="20" font-family="Inter, DejaVu Sans, sans-serif" font-size="8.5" font-weight="700" fill="#94a3b8">BOT UPTIME</text>
      <text x="38" y="37" font-family="Inter, DejaVu Sans, sans-serif" font-size="13" font-weight="900" fill="#38bdf8">${formatTime(d.botUptime)}</text>
    </g>

    <!-- Pod B: Server Uptime -->
    <g transform="translate(244, 44)">
      <rect width="206" height="50" rx="10" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <circle cx="20" cy="25" r="11" fill="rgba(16, 185, 129, 0.15)"/>
      <svg x="14" y="19" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
      </svg>
      <text x="38" y="20" font-family="Inter, DejaVu Sans, sans-serif" font-size="8.5" font-weight="700" fill="#94a3b8">HOST UPTIME</text>
      <text x="38" y="37" font-family="Inter, DejaVu Sans, sans-serif" font-size="13" font-weight="900" fill="#10b981">${formatTime(d.vpsUptime)}</text>
    </g>

    <!-- Pod C: Node Version & Engine -->
    <g transform="translate(18, 100)">
      <rect width="206" height="50" rx="10" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <circle cx="20" cy="25" r="11" fill="rgba(34, 197, 94, 0.15)"/>
      <svg x="14" y="19" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
      </svg>
      <text x="38" y="20" font-family="Inter, DejaVu Sans, sans-serif" font-size="8.5" font-weight="700" fill="#94a3b8">NODE RUNTIME</text>
      <text x="38" y="37" font-family="Inter, DejaVu Sans, sans-serif" font-size="13" font-weight="900" fill="#ffffff">${d.nodeVersion}</text>
    </g>

    <!-- Pod D: Process PID & Platform -->
    <g transform="translate(244, 100)">
      <rect width="206" height="50" rx="10" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <circle cx="20" cy="25" r="11" fill="rgba(168, 85, 247, 0.15)"/>
      <svg x="14" y="19" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
      </svg>
      <text x="38" y="20" font-family="Inter, DejaVu Sans, sans-serif" font-size="8.5" font-weight="700" fill="#94a3b8">KERNEL / PID</text>
      <text x="38" y="37" font-family="Inter, DejaVu Sans, sans-serif" font-size="12" font-weight="800" fill="#ffffff">PID ${d.pid} • Linux</text>
    </g>
  </g>

  <!-- ==================== BOTTOM STATUS FOOTER ==================== -->
  <g transform="translate(48, 545)">
    <!-- Decorative Line -->
    <line x1="0" y1="0" x2="944" y2="0" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    
    <!-- Footer Details -->
    <text x="0" y="22" font-family="Inter, DejaVu Sans, sans-serif" font-size="9.5" font-weight="700" fill="#64748b" letter-spacing="1">
      CORE ENGINE: <tspan fill="#38bdf8">vanXone AI v7.0</tspan> • NEXT GENERATION WHATSAPP ASSISTANT • ALL SYSTEMS NOMINAL
    </text>

    <!-- Decorative Cyber Ticks Barcode -->
    <g transform="translate(790, 10)">
      <rect x="0" y="0" width="2" height="14" fill="#38bdf8"/>
      <rect x="5" y="0" width="4" height="14" fill="#38bdf8"/>
      <rect x="12" y="0" width="1" height="14" fill="#64748b"/>
      <rect x="16" y="0" width="3" height="14" fill="#38bdf8"/>
      <rect x="22" y="0" width="5" height="14" fill="#06b6d4"/>
      <rect x="30" y="0" width="2" height="14" fill="#64748b"/>
      <rect x="35" y="0" width="6" height="14" fill="#38bdf8"/>
      <rect x="44" y="0" width="2" height="14" fill="#64748b"/>
      <rect x="49" y="0" width="4" height="14" fill="#06b6d4"/>
      <rect x="56" y="0" width="1" height="14" fill="#38bdf8"/>
      <rect x="60" y="0" width="4" height="14" fill="#38bdf8"/>
      <rect x="67" y="0" width="3" height="14" fill="#64748b"/>
      <text x="78" y="11" font-family="Inter, DejaVu Sans, sans-serif" font-size="8.5" font-weight="700" fill="#94a3b8">© vanXone 2026</text>
    </g>
  </g>
</svg>`;
}

const handler = async (m, { conn }) => {
  try {
    await initFonts().catch(() => {});

    const start = performance.now();
    await conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key } });
    const latency = performance.now() - start;

    const cpuInfo = getCpuDetails();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const ramUsed = totalMem - freeMem;
    const disk = getDisk();
    const net = getNetwork();
    const memUsage = process.memoryUsage();

    const data = {
      latency,
      cpuPercent: parseFloat(getCpuUsage().toFixed(1)),
      ramPercent: parseFloat(((ramUsed / totalMem) * 100).toFixed(1)),
      diskPercent: disk.percent,
      totalRx: net.totalRx,
      totalTx: net.totalTx,
      totalMem,
      ramUsed,
      freeMem,
      heapUsed: memUsage.heapUsed,
      diskTotal: disk.total,
      diskUsed: disk.used,
      diskFree: disk.free,
      cpuModel: cpuInfo.model,
      cpuCores: cpuInfo.cores,
      cpuSpeed: cpuInfo.speedGHz,
      loadAvg: os.loadavg(),
      hostname: os.hostname(),
      osName: getOsPrettyName(),
      kernel: os.release(),
      arch: os.arch(),
      nodeVersion: process.version,
      pid: process.pid,
      botUptime: process.uptime(),
      vpsUptime: os.uptime(),
    };

    const svg = buildCyberTelemetrySvg(data);
    const imgBuffer = await renderSvgToBuffer(svg, { format: 'png' });

    await conn.sendMessage(m.chat, {
      image: imgBuffer,
      mimetype: 'image/png'
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (e) {
    console.error('[ping-kyzz-canvas]', e);
    m.reply(`❌ Error: ${e.message}`);
  }
};

handler.help = ['ping', 'os', 'system'];
handler.tags = ['info'];
handler.command = ['ping', 'os', 'system'];

export default handler;