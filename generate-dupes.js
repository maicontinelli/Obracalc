/**
 * generate-dupes.js
 *
 * Reads the perfume list and calls Claude API to produce dupes.json.
 * Run manually:  node generate-dupes.js
 * Run in CI:     see .github/workflows/update-dupes.yml
 *
 * Requires: ANTHROPIC_API_KEY env var
 * Install:  npm install @anthropic-ai/sdk
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Perfume list ─────────────────────────────────────────────────────────────
// Keep in sync with the PERFUMES array inside perfume-bubbles.html.
// Only brand + name are needed here.
const PERFUMES = [
  { brand: 'Chanel',          name: 'Bleu de Chanel' },
  { brand: 'Creed',           name: 'Aventus' },
  { brand: 'Sospiro',         name: 'Vibrato' },
  { brand: 'Thierry Mugler',  name: 'Angel' },
  { brand: 'Dolce & Gabbana', name: 'Light Blue' },
  { brand: 'Jo Malone London',name: 'Peony & Blush Suede' },
  { brand: 'Le Labo',         name: 'Santal 33' },
  { brand: 'Jo Malone London',name: 'Scarlet Poppy' },
  { brand: 'Tom Ford',        name: 'Tobacco Vanille' },
  { brand: 'Tom Ford',        name: 'Wild Vetiver' },
];

const OUTPUT_FILE = 'dupes.json';
const BATCH_SIZE  = 5;   // parallel requests per batch
const BATCH_DELAY = 800; // ms between batches (rate-limit safety)

// ─── Prompt ───────────────────────────────────────────────────────────────────
function buildPrompt(brand, name) {
  return `You are a perfume expert. List the 5 most well-known dupes or inspired-by fragrances for "${brand} ${name}".

Return ONLY a valid JSON array, no explanation, no markdown:
[
  {"name": "...", "brand": "...", "price": "~$XX", "similarity": 90},
  ...
]

Rules:
- "similarity" is an integer 1-100 indicating how close the scent is
- "price" is approximate USD retail, formatted as "~$XX"
- Prefer widely available, affordable alternatives (drugstore to mid-range)
- Do not include the original perfume itself
- If no known dupes exist, return an empty array []`;
}

// ─── Fetch dupes for one perfume ──────────────────────────────────────────────
async function fetchDupes(brand, name) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: buildPrompt(brand, name) }],
  });

  const text = response.content[0].text.trim();
  // Strip markdown code fences if model adds them
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(clean);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // Load existing data so we can do incremental updates
  const existing = existsSync(OUTPUT_FILE)
    ? JSON.parse(readFileSync(OUTPUT_FILE, 'utf8'))
    : {};

  const results = { ...existing };
  const toProcess = PERFUMES.filter(p => {
    const key = `${p.brand}|${p.name}`;
    const alreadyDone = key in results;
    if (alreadyDone) console.log(`⏭  Skip (cached): ${key}`);
    return !alreadyDone;
  });

  if (toProcess.length === 0) {
    console.log('All perfumes already processed. Delete dupes.json to regenerate.');
    return;
  }

  console.log(`Processing ${toProcess.length} perfumes in batches of ${BATCH_SIZE}…\n`);

  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async ({ brand, name }) => {
      const key = `${brand}|${name}`;
      try {
        results[key] = await fetchDupes(brand, name);
        console.log(`✓  ${key} → ${results[key].length} dupes`);
      } catch (err) {
        console.error(`✗  ${key}: ${err.message}`);
        results[key] = [];
      }
    }));

    if (i + BATCH_SIZE < toProcess.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY));
    }
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n✅ dupes.json written (${Object.keys(results).length} perfumes).`);
}

main().catch(err => { console.error(err); process.exit(1); });
