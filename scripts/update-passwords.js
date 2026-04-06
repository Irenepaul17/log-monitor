/**
 * Update Passwords Script
 *
 * Usage:  node scripts/update-passwords.js
 * (dev server must be running: npm run dev)
 *
 * Rules:
 *   Sr.DSTE / DSTE / ADSTE  →  Password@123
 *   SSE / SSE/INCHARGE       →  Sse<section>@123   e.g. MAS → Ssesmas@123
 *   JE / Technician          →  unchanged (phone number, already set)
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:3000";
const CSV_DIR = path.join(__dirname, "../user-details");

// ── Section → SSE password (from the spreadsheet image) ───────────────────
// Pattern:  "Sse" + section.toLowerCase() + "@123"
// Override only the exceptions observed in the image:
const SECTION_PASS_OVERRIDE = {
    tvt: "Ssestvt@836",
    gpd: "Ssesig/gpd1",
};

function ssePassword(section) {
    const key = section.trim().toLowerCase().replace(/\s+/g, "");
    if (SECTION_PASS_OVERRIDE[key]) return SECTION_PASS_OVERRIDE[key];
    // Generic rule: Sse + section + @123
    // Some sections in the image use "Sses" prefix (MAS, SPE, NYP).
    // We follow the consistent rule: Sse + section + @123
    // (MAS → Ssesmas, SPE → Ssesspe, NYP → Ssesnyp already match because
    //  section starts with consonant giving "Sse" + "smas", etc.)
    return `Sse${key}@123`;
}

// ── CSV → SSE section mapping ──────────────────────────────────────────────
// (SSE section name comes from the CSV "SSE Section" column)
// We use the CSV filename to know which file to read, then extract per row.

const CSV_FILES = [
    "AJJE.csv", "AJJW.csv", "AB.csv",
    "MAS.csv", "MSB.csv", "BBQ.csv", "CGL.csv", "SSEHQ.csv", "SSESRM.csv",
    "KPDE.csv", "KPDW.csv", "GPD.csv", "JTJ.csv", "TRT.csv",
    "SPE.csv", "NYP.csv", "TMV.csv", "TVT.csv",
    "MS.csv", "TRL.csv", "SCTRL.csv",
    "TBM.csv",
];

// ── Minimal CSV helpers (same as seed script) ──────────────────────────────
function splitCSVLine(line) {
    const out = [];
    let cur = "", inQ = false;
    for (const c of line) {
        if (c === '"') { inQ = !inQ; continue; }
        if (c === "," && !inQ) { out.push(cur); cur = ""; continue; }
        cur += c;
    }
    out.push(cur);
    return out;
}

function parseSSEsFromCSV(filePath) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const lines = raw.split("\n").map(l => l.trimEnd()).filter(l => l.replace(/,/g, "").trim());

    let headerIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (/^(Sl\s*No|S\.\s*No)/i.test(lines[i])) { headerIdx = i; break; }
    }
    if (headerIdx === -1) return [];

    let headerLine = lines[headerIdx];
    if (headerIdx + 1 < lines.length && !/^\d/.test(lines[headerIdx + 1])) {
        headerLine += "," + lines[++headerIdx];
    }

    const headers = splitCSVLine(headerLine);
    const colOf = name => headers.findIndex(h =>
        h.toLowerCase().replace(/\s+/g, " ").trim().includes(name.toLowerCase()));

    const idxDesig = colOf("designation");
    const idxPhone = colOf("cug number");
    const idxSection = colOf("sse section");

    const results = [];
    for (let i = headerIdx + 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line || line.replace(/,/g, "").trim() === "") continue;
        if (!/^\d/.test(line.split(",")[0].trim())) continue;

        const cols = splitCSVLine(line);
        const desig = (cols[idxDesig] || "").trim().toUpperCase();
        const phone = (cols[idxPhone] || "").trim().replace(/\s/g, "");
        const sect = (cols[idxSection] || "").trim();

        if (!desig.includes("SSE")) continue;   // only SSE rows
        if (!phone || phone === "-" || phone.toLowerCase() === "required") continue;

        results.push({ phone, section: sect });
    }
    return results;
}

// ── API helpers ────────────────────────────────────────────────────────────
async function fetchAllUsers() {
    const res = await fetch(`${BASE_URL}/api/user/all`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();                      // array of user objects
}

async function updatePassword(userId, newPass) {
    const res = await fetch(`${BASE_URL}/api/user/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, updates: { pass: newPass } }),
    });
    return res.ok;
}

// ── MAIN ──────────────────────────────────────────────────────────────────
async function main() {
    console.log("🔑  Fetching all users…");
    const allUsers = await fetchAllUsers();
    const phoneToUser = {};
    for (const u of allUsers) phoneToUser[u.phone] = u;
    console.log(`    Found ${allUsers.length} users\n`);

    let updated = 0, skipped = 0, failed = 0;

    // ── 1. Senior officers → Password@123 ───────────────────────────────────
    console.log("=== Step 1: Sr.DSTE / DSTE / ADSTE → Password@123 ===");
    const SENIOR_ROLES = ["sr-dste", "dste", "adste", "admin"];
    for (const u of allUsers) {
        if (!SENIOR_ROLES.includes(u.role)) continue;
        const ok = await updatePassword(u.id, "Password@123");
        if (ok) { console.log(`  ✓  ${u.name} (${u.role})`); updated++; }
        else { console.error(`  ✕  ${u.name}`); failed++; }
    }

    // ── 2. SSE users → Sse<section>@123 ────────────────────────────────────
    console.log("\n=== Step 2: SSE/INCHARGE → Sse<section>@123 ===");
    for (const csvFile of CSV_FILES) {
        const csvPath = path.join(CSV_DIR, csvFile);
        if (!fs.existsSync(csvPath)) continue;

        const rows = parseSSEsFromCSV(csvPath);
        for (const { phone, section } of rows) {
            const user = phoneToUser[phone];
            if (!user) { console.log(`  ⤳  Not found in DB: ${phone} (${section})`); skipped++; continue; }
            const newPass = ssePassword(section);
            const ok = await updatePassword(user.id, newPass);
            if (ok) { console.log(`  ✓  ${user.name} → ${newPass}`); updated++; }
            else { console.error(`  ✕  Failed: ${user.name}`); failed++; }
        }
    }

    // ── Summary ─────────────────────────────────────────────────────────────
    console.log("\n════════════════════════════════════════");
    console.log(`✅  Updated: ${updated}`);
    console.log(`⏭  Skipped: ${skipped}`);
    console.log(`❌  Failed:  ${failed}`);
    console.log("════════════════════════════════════════\n");
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
