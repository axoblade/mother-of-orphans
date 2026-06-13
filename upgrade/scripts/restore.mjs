#!/usr/bin/env node
/**
 * MongoDB Restore Script
 * Usage: node scripts/restore.mjs
 *        node scripts/restore.mjs --to=mongodb+srv://user:pass@cluster/dbname
 *        npm run restore
 *        npm run restore -- --to=mongodb+srv://...
 *
 * Always reads from backup.zip in the project root.
 * Target URI defaults to MONGODB_URI in .env.local — override with --to=<uri>.
 * Drops each collection before restoring for a clean full replace.
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import { EJSON } from "bson";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ZIP_FILE = join(ROOT, "backup.zip");
const TMP_DIR = join(ROOT, ".restore_tmp");

function loadEnv() {
	for (const file of [".env.local", ".env"]) {
		const p = join(ROOT, file);
		if (!existsSync(p)) continue;
		for (const line of readFileSync(p, "utf8").split("\n")) {
			const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
			if (!m) continue;
			const key = m[1];
			const val = m[2].trim().replace(/^["']|["']$/g, "");
			if (!process.env[key]) process.env[key] = val;
		}
		break;
	}
}

loadEnv();

const toArg = process.argv.find((a) => a.startsWith("--to="));
const targetUri = toArg ? toArg.replace("--to=", "") : process.env.MONGODB_URI;

if (!existsSync(ZIP_FILE)) {
	console.error(`\nError: backup.zip not found at ${ZIP_FILE}\nRun "npm run backup" first.\n`);
	process.exit(1);
}

if (!targetUri) {
	console.error("\nError: No target URI. Set MONGODB_URI in .env.local or pass --to=<uri>\n");
	process.exit(1);
}

async function main() {
	console.log(`\nSource:  ${ZIP_FILE}`);
	console.log(`Target:  ${targetUri.replace(/\/\/([^:]+):([^@]+)@/, "//[user]:[password]@")}\n`);

	rmSync(TMP_DIR, { recursive: true, force: true });
	mkdirSync(TMP_DIR, { recursive: true });

	console.log("Extracting backup.zip...");
	execSync(`unzip -q "${ZIP_FILE}" -d "${TMP_DIR}"`, { stdio: "pipe" });

	// The zip contains a single .backup_tmp folder (ls -A shows hidden dirs too)
	const inner = execSync(`ls -A "${TMP_DIR}"`, { encoding: "utf8" }).trim().split("\n")[0];
	const dataDir = join(TMP_DIR, inner);

	const manifestPath = join(dataDir, "_manifest.json");
	if (!existsSync(manifestPath)) {
		console.error("\nError: backup.zip is missing _manifest.json — file may be corrupt.\n");
		process.exit(1);
	}

	const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
	console.log(`Backup from: ${manifest.createdAt}`);
	console.log(`Database:    ${manifest.database}`);
	console.log(`Collections: ${manifest.collections.map((c) => `${c.name} (${c.count})`).join(", ")}\n`);

	const client = new MongoClient(targetUri);
	try {
		console.log("Connecting to target MongoDB...");
		await client.connect();
		const db = client.db();
		console.log(`Connected: "${db.databaseName}"\n`);

		let totalInserted = 0;

		for (const { name, count } of manifest.collections) {
			const filePath = join(dataDir, `${name}.json`);
			if (!existsSync(filePath)) {
				console.log(`  ${name}: file missing, skipped`);
				continue;
			}

			const docs = EJSON.parse(readFileSync(filePath, "utf8"));

			// Drop then re-insert for a clean replace
			await db.collection(name).drop().catch(() => {});

			if (docs.length > 0) {
				await db.collection(name).insertMany(docs, { ordered: false });
			}

			console.log(`  ${name}: restored ${docs.length} documents`);
			totalInserted += docs.length;
		}

		console.log(`\nDone! Restored ${manifest.collections.length} collections, ${totalInserted} documents\n`);
	} finally {
		rmSync(TMP_DIR, { recursive: true, force: true });
		await client.close();
	}
}

main().catch((err) => {
	rmSync(TMP_DIR, { recursive: true, force: true });
	console.error("\nRestore failed:", err.message, "\n");
	process.exit(1);
});
