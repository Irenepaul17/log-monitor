/**
 * Seed Script: Create all users from CSV files + image hierarchy
 *
 * Usage:
 *   1. Make sure your Next.js server is running: npm run dev
 *   2. Run: node scripts/seed-users.js
 *
 * What it does:
 *   - Creates Sr.DSTE / DSTE / ADSTE users from the hierarchy image
 *   - Reads every department CSV and creates SSE / JE / Technician users
 *   - Assigns each user to the correct ADSTE (their superior)
 *   - Phone number = login ID, password = phone number (change after first login)
 *   - Skips users with missing Name or Phone (CUG Number)
 *   - Skips duplicates (user already exists)
 */

const fs = require("fs");
const path = require("path");

// ────────────────────────────────────────────────────────────
// CONFIG
// ────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:3000";
const DIVISION = "MAS Division";
const CSV_DIR = path.join(__dirname, "../user-details");

// ────────────────────────────────────────────────────────────
// HIERARCHY FROM IMAGE
// ────────────────────────────────────────────────────────────
const SR_DSTE_PHONE = "9003161800";   // Sr DSTE/I/MAS  (top)
const DSTE2_PHONE = "9003161801";   // Sr DSTE/II/MAS (reports to Sr.DSTE)
const DSTE3_PHONE = "9003161802";   // DSTE/II/MAS    (reports to Sr.DSTE)

const SENIOR_USERS = [
    {
        name: "Sr. DSTE/I/MAS",
        phone: SR_DSTE_PHONE,
        role: "sr-dste",
        sub: "Sr. DSTE/I/MAS",
        superiorPhone: null,
    },
    {
        name: "Sr. DSTE/II/MAS",
        phone: DSTE2_PHONE,
        role: "dste",
        sub: "Sr. DSTE/II/MAS",
        superiorPhone: SR_DSTE_PHONE,
    },
    {
        name: "DSTE/II/MAS",
        phone: DSTE3_PHONE,
        role: "dste",
        sub: "DSTE/II/MAS",
        superiorPhone: SR_DSTE_PHONE,
    },
    // ADSTEs reporting to Sr. DSTE/II/MAS (DSTE2)
    { name: "ADSTE/AJJ", phone: "9003161808", role: "adste", sub: "ADSTE/AJJ", superiorPhone: DSTE2_PHONE },
    { name: "ADSTE/MAS", phone: "9003161805", role: "adste", sub: "ADSTE/MAS", superiorPhone: DSTE2_PHONE },
    { name: "ADSTE/KPD", phone: "9003161809", role: "adste", sub: "ADSTE/KPD", superiorPhone: DSTE2_PHONE },
    { name: "ADSTE/SPE", phone: "9003161807", role: "adste", sub: "ADSTE/SPE", superiorPhone: DSTE2_PHONE },
    // ADSTEs reporting to DSTE/II/MAS (DSTE3)
    { name: "ADSTE/MS", phone: "9003161804", role: "adste", sub: "ADSTE/MS", superiorPhone: DSTE3_PHONE },
    { name: "ADSTE/TBM", phone: "9003161806", role: "adste", sub: "ADSTE/TBM", superiorPhone: DSTE3_PHONE },
];

// ────────────────────────────────────────────────────────────
// CSV → ADSTE PHONE MAPPING
// Each CSV file maps to the ADSTE whose section it belongs to
// ────────────────────────────────────────────────────────────
const CSV_TO_ADSTE = {
    // ADSTE/AJJ  → 9003161808
    "AJJE.csv": "9003161808",
    "AJJW.csv": "9003161808",
    "AB.csv": "9003161808",

    // ADSTE/MAS  → 9003161805
    "MAS.csv": "9003161805",
    "MSB.csv": "9003161805",
    "BBQ.csv": "9003161805",
    "CGL.csv": "9003161805",
    "SSEHQ.csv": "9003161805",
    "SSESRM.csv": "9003161805",

    // ADSTE/KPD  → 9003161809
    "KPDE.csv": "9003161809",
    "KPDW.csv": "9003161809",
    "GPD.csv": "9003161809",
    "JTJ.csv": "9003161809",
    "TRT.csv": "9003161809",

    // ADSTE/SPE  → 9003161807
    "SPE.csv": "9003161807",
    "NYP.csv": "9003161807",
    "TMV.csv": "9003161807",
    "TVT.csv": "9003161807",

    // ADSTE/MS   → 9003161804
    "MS.csv": "9003161804",
    "TRL.csv": "9003161804",
    "SCTRL.csv": "9003161804",

    // ADSTE/TBM  → 9003161806
    "TBM.csv": "9003161806",
};

// ────────────────────────────────────────────────────────────
// DESIGNATION → ROLE MAPPING
// ────────────────────────────────────────────────────────────
function designationToRole(desig) {
    if (!desig) return "technician";
    const d = desig.trim().toUpperCase();
    if (d.includes("SSE")) return "sse";
    if (d.includes("JE") || d.includes("J.E")) return "je";
    return "technician"; // Sr.TECH, TECH/I-III, ASSISTANT, OS, CLERK etc.
}

// ────────────────────────────────────────────────────────────
// Minimal CSV parser — handles the "Completed" header split
// The CSV files have the header split across multiple lines,
// so we normalise and take only the first content-full line.
// ────────────────────────────────────────────────────────────
function parseCSV(filePath) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const lines = raw.split("\n").map(l => l.trimEnd());

    // Skip lines that are just commas (empty rows)
    const nonEmpty = lines.filter(l => l.replace(/,/g, "").trim().length > 0);

    // The header may span 2 lines (header line gets split at col 14).
    // We identify the header by looking for "Sl No" or "S. No"
    let headerIdx = -1;
    for (let i = 0; i < nonEmpty.length; i++) {
        if (/^(Sl\s*No|S\.\s*No)/i.test(nonEmpty[i])) {
            headerIdx = i;
            break;
        }
    }
    if (headerIdx === -1) return [];

    // Merge continuation line into header if next line doesn't start with a number
    let headerLine = nonEmpty[headerIdx];
    if (headerIdx + 1 < nonEmpty.length && !/^\d/.test(nonEmpty[headerIdx + 1])) {
        headerLine += "," + nonEmpty[headerIdx + 1];
        headerIdx += 1;
    }

    const headers = splitCSVLine(headerLine);

    // Normalise header names for lookup
    const colIndex = (name) => {
        const lc = name.toLowerCase().replace(/\s+/g, " ").trim();
        return headers.findIndex(h => h.toLowerCase().replace(/\s+/g, " ").trim().includes(lc));
    };

    const idxName = colIndex("name");
    const idxDesig = colIndex("designation");
    const idxPF = colIndex("pf no");
    const idxPhone = colIndex("cug number");
    const idxEmail = colIndex("email");
    const idxSection = colIndex("sse section");
    const idxHQ = colIndex("hq");

    const rows = [];
    for (let i = headerIdx + 1; i < nonEmpty.length; i++) {
        const line = nonEmpty[i];
        if (!line || line.replace(/,/g, "").trim() === "") continue;
        // Skip if first field is not numeric (possible continuation / garbage)
        const first = line.split(",")[0].trim();
        if (!/^\d/.test(first)) continue;

        const cols = splitCSVLine(line);
        const name = get(cols, idxName);
        const phone = cleanPhone(get(cols, idxPhone));
        const email = get(cols, idxEmail);
        const desig = get(cols, idxDesig);
        const pf = get(cols, idxPF);
        const section = get(cols, idxSection);
        const hq = get(cols, idxHQ);

        if (!name || name.toUpperCase() === "NAME") continue; // skip header-looking rows

        rows.push({ name, phone, email, desig, pf, section, hq });
    }
    return rows;
}

function get(arr, idx) {
    if (idx < 0 || idx >= arr.length) return "";
    return (arr[idx] || "").trim();
}

function cleanPhone(raw) {
    if (!raw) return "";
    // Remove spaces, dashes
    const cleaned = raw.replace(/[\s\-]/g, "");
    // Reject obviously invalid phones
    if (cleaned.toLowerCase() === "required" || cleaned.toLowerCase() === "xxxxxx") return "";
    if (cleaned === "-" || cleaned === "") return "";
    return cleaned;
}

function splitCSVLine(line) {
    // Simple CSV split — handles quoted fields
    const result = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') { inQ = !inQ; continue; }
        if (c === "," && !inQ) { result.push(cur); cur = ""; continue; }
        cur += c;
    }
    result.push(cur);
    return result;
}

// ────────────────────────────────────────────────────────────
// API call: register a user
// ────────────────────────────────────────────────────────────
async function registerUser(payload) {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
}

// ────────────────────────────────────────────────────────────
// API call: look up all users and return phone → id map
// ────────────────────────────────────────────────────────────
async function fetchPhoneToIdMap() {
    const res = await fetch(`${BASE_URL}/api/user/all`);
    if (!res.ok) throw new Error("Failed to fetch users");
    const users = await res.json();
    const map = {};
    for (const u of users) {
        if (u.phone) map[u.phone] = u.id;
    }
    return map;
}

// ────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────
async function main() {
    console.log("🚀  Starting user seed...\n");

    // ── 1. Create senior users (Sr.DSTE, DSTE, ADSTE) ──────
    console.log("=== STEP 1: Creating Sr.DSTE / DSTE / ADSTE users ===");
    for (const u of SENIOR_USERS) {
        // Lookup superior ID if needed
        let superiorId;
        if (u.superiorPhone) {
            const map = await fetchPhoneToIdMap();
            superiorId = map[u.superiorPhone];
            if (!superiorId) {
                console.warn(`  ⚠  Superior with phone ${u.superiorPhone} not found yet. Skipping ${u.name}`);
                continue;
            }
        }

        const payload = {
            name: u.name,
            phone: u.phone,
            pass: u.phone, // default password = phone number
            role: u.role,
            sub: u.sub,
            email: `${u.phone}@railnet.gov.in`,
            pfNumber: u.phone,
            division: DIVISION,
            superiorId: superiorId || undefined,
        };

        const { ok, status, data } = await registerUser(payload);
        if (ok) {
            console.log(`  ✓  Created: ${u.name} (${u.phone})`);
        } else if (status === 400 && data.error?.includes("already exists")) {
            console.log(`  –  Exists:  ${u.name} (${u.phone})`);
        } else {
            console.error(`  ✕  Failed:  ${u.name} — ${JSON.stringify(data)}`);
        }
    }

    // ── 2. Fetch updated phone→id map ───────────────────────
    console.log("\n=== STEP 2: Fetching ADSTE user IDs ===");
    const phoneToId = await fetchPhoneToIdMap();
    console.log(`  Found ${Object.keys(phoneToId).length} existing users\n`);

    // ── 3. Process each CSV ─────────────────────────────────
    console.log("=== STEP 3: Creating SSE / JE / Technician users from CSVs ===\n");

    let totalCreated = 0;
    let totalSkipped = 0;
    let totalExists = 0;
    let totalFailed = 0;

    for (const [csvFile, adstePhone] of Object.entries(CSV_TO_ADSTE)) {
        const csvPath = path.join(CSV_DIR, csvFile);
        if (!fs.existsSync(csvPath)) {
            console.warn(`  ⚠  File not found: ${csvFile}`);
            continue;
        }

        const adsteId = phoneToId[adstePhone];
        if (!adsteId) {
            console.warn(`  ⚠  ADSTE (${adstePhone}) not in DB yet! Skipping ${csvFile}`);
            continue;
        }

        const rows = parseCSV(csvPath);
        console.log(`📄  ${csvFile} — ${rows.length} rows, ADSTE: ${adstePhone}`);

        for (const row of rows) {
            if (!row.name) { totalSkipped++; continue; }
            if (!row.phone) {
                console.log(`     ⤳ SKIP (no phone): ${row.name}`);
                totalSkipped++;
                continue;
            }

            const role = designationToRole(row.desig);
            const sub = row.desig || role.toUpperCase();
            const email = row.email && row.email.trim() && !row.email.includes("@") === false
                ? row.email.trim()
                : `${row.phone}@railnet.gov.in`;

            const payload = {
                name: row.name,
                phone: row.phone,
                pass: row.phone, // default password = CUG/phone number
                role,
                sub,
                email,
                pfNumber: row.pf || row.phone,
                division: DIVISION,
                superiorId: adsteId, // SSE/JE/Tech all report to ADSTE
            };

            const { ok, status, data } = await registerUser(payload);
            if (ok) {
                console.log(`     ✓  ${row.name} (${row.phone}) — ${role}`);
                totalCreated++;
                // Update phone map so same-session lookups work
                if (data.id) phoneToId[row.phone] = data.id;
            } else if (status === 400 && data.error?.includes("already exists")) {
                console.log(`     –  Exists: ${row.name}`);
                totalExists++;
            } else {
                console.error(`     ✕  Failed: ${row.name} — ${JSON.stringify(data)}`);
                totalFailed++;
            }
        }
        console.log("");
    }

    // ── Summary ─────────────────────────────────────────────
    console.log("════════════════════════════════════════");
    console.log(`✅  Created:  ${totalCreated}`);
    console.log(`–   Existed:  ${totalExists}`);
    console.log(`⏭  Skipped:  ${totalSkipped}`);
    console.log(`❌  Failed:   ${totalFailed}`);
    console.log("════════════════════════════════════════");
    console.log("\nDone! Default password for every user = their CUG phone number.");
    console.log("Remind users to change their password after first login.\n");
}

main().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
