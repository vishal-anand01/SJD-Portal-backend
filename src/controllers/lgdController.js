// backend/src/controllers/lgdController.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Correct path: from src/controllers → ../../data
const DATA_DIR = path.resolve(__dirname, "../../data");

/* -------------------- HELPERS -------------------- */

// find JSON file by district name (case-insensitive)
async function findDistrictFile(districtParam) {
  const files = await fs.readdir(DATA_DIR);
  const lower = districtParam.toLowerCase();
  const match = files.find(
    (f) => path.basename(f, path.extname(f)).toLowerCase() === lower
  );
  return match ? path.join(DATA_DIR, match) : null;
}

// find key that includes substring (case-insensitive)
function findKeyContains(obj, substring) {
  if (!obj) return null;
  const lowerSub = substring.toLowerCase();
  return Object.keys(obj).find((k) => k.toLowerCase().includes(lowerSub));
}

/* -------------------- CONTROLLERS -------------------- */

// 📍 List available district files
export const listDistricts = async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const districts = files
      .filter((f) => f.toLowerCase().endsWith(".json"))
      .map((f) => path.basename(f, path.extname(f)));
    return res.json({ success: true, districts });
  } catch (err) {
    console.error("LGD: listDistricts error", err);
    return res.status(500).json({ success: false, message: "Failed to list districts" });
  }
};

// 📍 Get Gram Panchayats by District
export const getGramPanchayats = async (req, res) => {
  try {
    const { district } = req.params;
    const filePath = await findDistrictFile(district);
    if (!filePath)
      return res.status(404).json({ message: `District data not found for ${district}` });

    const raw = await fs.readFile(filePath, "utf8");
    const arr = JSON.parse(raw);
    const sample = arr.find(Boolean) || {};

    // ✅ Always use “Gram Panchayat Name/TLB Name” type key (ignore code)
    const gpKey =
      Object.keys(sample).find(
        (k) =>
          k.toLowerCase().includes("gram panchayat") &&
          k.toLowerCase().includes("name")
      ) || findKeyContains(sample, "Gram Panchayat Name") || "Gram Panchayat Name/TLB Name";

    const set = new Set();
    for (const r of arr) {
      const val = r[gpKey];
      if (val && String(val).trim()) set.add(String(val).trim());
    }

    const panchayats = [...set].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    return res.json({ success: true, panchayats });
  } catch (err) {
    console.error("LGD: getGramPanchayats error", err);
    return res.status(500).json({ success: false, message: "Failed to load gram panchayats" });
  }
};

// 📍 Get Villages by Panchayat Name
export const getVillagesForPanchayat = async (req, res) => {
  try {
    const { district, gramPanchayat } = req.params;
    const filePath = await findDistrictFile(district);
    if (!filePath)
      return res.status(404).json({ message: `District data not found for ${district}` });

    const raw = await fs.readFile(filePath, "utf8");
    const arr = JSON.parse(raw);
    const sample = arr.find(Boolean) || {};

    const gpKey =
      Object.keys(sample).find(
        (k) =>
          k.toLowerCase().includes("gram panchayat") &&
          k.toLowerCase().includes("name")
      ) || findKeyContains(sample, "Gram Panchayat Name");

    const villageKey =
      Object.keys(sample).find(
        (k) =>
          k.toLowerCase().includes("village") &&
          k.toLowerCase().includes("name")
      ) || findKeyContains(sample, "Village Name");

    const target = decodeURIComponent(gramPanchayat).trim().toLowerCase();
    const set = new Set();

    for (const r of arr) {
      const gpVal = (r[gpKey] || "").toString().trim().toLowerCase();
      if (gpVal === target) {
        const val = r[villageKey];
        if (val && String(val).trim()) set.add(String(val).trim());
      }
    }

    const villages = [...set].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    return res.json({ success: true, villages });
  } catch (err) {
    console.error("LGD: getVillagesForPanchayat error", err);
    return res.status(500).json({ success: false, message: "Failed to load villages" });
  }
};
