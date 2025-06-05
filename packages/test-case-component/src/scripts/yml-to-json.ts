#!/usr/bin/env ts-node

// scripts/yml-to-json.ts
// Usage: pnpm ts-node scripts/yml-to-json.ts <input-folder> <output-folder> [--destructive]

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { loadAndProcessFixtures } from "../processFixtures/loadAndProcessFixtures";

console.log("[yml-to-json] Begin");

if (process.argv.length < 4) {
    console.error(
        "Usage: pnpm ts-node scripts/yml-to-json.ts <input-folder> <output-folder> [--destructive]",
    );
    process.exit(1);
}

const inputDir = path.resolve(process.argv[2]);
const outputDir = path.resolve(process.argv[3]);
const outputSubdir = process.argv[4];
let outputLanguagesDir: string | undefined = undefined;
if (outputSubdir) {
    outputLanguagesDir = path.join(outputDir, outputSubdir);
    if (!fs.existsSync(outputLanguagesDir)) {
        fs.mkdirSync(outputLanguagesDir, { recursive: true });
    }
}

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
const isDestructive = process.argv.includes("--destructive");

if (fs.existsSync(outputDir) && isDestructive) {
    fs.readdirSync(outputDir).forEach((file) => {
        const filePath = path.join(outputDir, file);
        if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
        }
    });
}

/**
 * Groups processed fixtures by language
 */
function groupFixturesByLanguage(processedFixtures: Array<{ language: string; processed: any }>): Record<string, any[]> {
    const languageMap: Record<string, any[]> = {};
    for (const item of processedFixtures) {
        if (!item) { continue; }
        if (!languageMap[item.language]) { languageMap[item.language] = []; }
        languageMap[item.language].push(item.processed);
    }
    return languageMap;
}

/**
 * Writes grouped fixtures to JSON files
 */
function writeLanguageJsonFiles(languageMap: Record<string, any[]>, outputDir: string, debug: boolean): Record<string, number> {
    const results: Record<string, number> = {};
    Object.entries(languageMap).forEach(([language, fixtures]) => {
        const targetDir = outputLanguagesDir || outputDir;
        const outputPath = path.join(targetDir, `${language}.ts`);
        if (debug) { console.log(`[yml-to-json] Writing ${fixtures.length} fixtures to ${outputPath}`); }
        fs.writeFileSync(outputPath, `export default ${JSON.stringify(fixtures, null, 2)};\n`);
        results[language] = fixtures.length;
        if (debug) { console.log(`Wrote ${fixtures.length} fixtures to ${outputPath}`); }
    });
    return results;
}

const deps = { fs, path, yaml };

async function main() {
    console.log("🦋 [main] being:");
    const debug = false;
    const fixtures = await loadAndProcessFixtures({
        fixturesDir: inputDir,
        allowList: undefined,
        deps
    });
    if (debug) { console.log("🦋 processedFixtures:", JSON.stringify(fixtures, null, 2)); }
    const languageMap = groupFixturesByLanguage(
        fixtures.map((fixture: any) => ({
            language: fixture.language || "plaintext",
            processed: fixture,
        }))
    );
    writeLanguageJsonFiles(languageMap, outputDir, debug);
    console.log("🦋 languageMap:");
    Object.entries(languageMap).forEach(([key, arr]) => {
        console.log(`${key}: ${arr.length}`);
    });
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
