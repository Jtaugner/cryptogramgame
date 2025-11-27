import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IN_DIR = path.join(__dirname, "icons");
const OUT_DIR = path.join(__dirname, "icons1");

const SIZE = 512;
const PADDING = 0;
const KEEP_STROKE = 0;

function ensureNs(svg) {
    if (/xmlns=/.test(svg)) return svg;
    return svg.replace(/<svg/i, `<svg xmlns="http://www.w3.org/2000/svg"`);
}

function parseViewBox(svg) {
    const m = svg.match(/viewBox\s*=\s*["']([^"']+)["']/i);
    if (!m) return null;
    const nums = m[1].trim().split(/[\s,]+/).map(Number);
    if (nums.length !== 4 || nums.some(Number.isNaN)) return null;
    return { x: nums[0], y: nums[1], w: nums[2], h: nums[3] };
}

function stripOuterSvg(svg) {
    return svg
        .replace(/^[\s\S]*?<svg[^>]*>/i, "")
        .replace(/<\/svg>\s*$/i, "")
        .trim();
}

await fs.mkdir(OUT_DIR, { recursive: true });

let files = await fs.readdir(IN_DIR);
files = files.filter(f => f.toLowerCase().endsWith(".svg"));

console.log(`Found ${files.length} SVG files in ${IN_DIR}`);

for (const f of files) {
    const fullIn = path.join(IN_DIR, f);
    let svgOrig = await fs.readFile(fullIn, "utf8");

    let svg = ensureNs(svgOrig);
    const vb = parseViewBox(svg);

    if (!vb) {
        const updated = svg
            .replace(/width="[^"]*"/i, "")
            .replace(/height="[^"]*"/i, "")
            .replace(/viewBox="[^"]*"/i, "")
            .replace(
                /<svg/i,
                `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" preserveAspectRatio="xMidYMid meet"`
            );
        await fs.writeFile(path.join(OUT_DIR, f), updated, "utf8");
        continue;
    }

    const inner = stripOuterSvg(svg);

    const target = SIZE - 2 * PADDING;
    const scale = Math.min(target / vb.w, target / vb.h);

    const newW = vb.w * scale;
    const newH = vb.h * scale;

    const tx = PADDING + (target - newW) / 2 - vb.x * scale;
    const ty = PADDING + (target - newH) / 2 - vb.y * scale;

    const strokeFlag = KEEP_STROKE ? ` vector-effect="non-scaling-stroke"` : "";

    const result =
`<svg xmlns="http://www.w3.org/2000/svg"
     width="${SIZE}" height="${SIZE}"
     viewBox="0 0 ${SIZE} ${SIZE}">
  <g transform="translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${scale.toFixed(6)})"${strokeFlag}>
${inner}
  </g>
</svg>`;

    await fs.writeFile(path.join(OUT_DIR, f), result, "utf8");
}

console.log(`Done! Saved to: ${OUT_DIR}`);
