#!/usr/bin/env node
/**
 * MongoDB Backup Script
 * Usage: node scripts/backup.mjs
 *        npm run backup
 *
 * Always writes to backup.zip in the project root, replacing any existing one.
 * Reads MONGODB_URI from .env.local (or .env as fallback).
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync, rmSync, readFileSync, statSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import { EJSON } from "bson";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_FILE = join(ROOT, "backup.zip");
const TMP_DIR = join(ROOT, ".backup_tmp");

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

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
	console.error("\nError: MONGODB_URI not set in .env.local\n");
	process.exit(1);
}

async function main() {
	// Clean up any previous temp dir and existing zip
	rmSync(TMP_DIR, { recursive: true, force: true });
	if (existsSync(OUT_FILE)) {
		rmSync(OUT_FILE);
		console.log("Removed existing backup.zip");
	}

	const client = new MongoClient(MONGODB_URI);
	try {
		console.log("Connecting to MongoDB...");
		await client.connect();
		const db = client.db();
		console.log(`Connected: "${db.databaseName}"\n`);

		const names = (await db.listCollections().toArray())
			.map((c) => c.name)
			.filter((n) => !n.startsWith("system."));

		console.log(`Collections (${names.length}): ${names.join(", ")}\n`);
		mkdirSync(TMP_DIR, { recursive: true });

		const manifest = {
			createdAt: new Date().toISOString(),
			database: db.databaseName,
			collections: [],
		};

		let totalDocs = 0;
		for (const name of names) {
			process.stdout.write(`  ${name} ... `);
			const docs = await db.collection(name).find({}).toArray();
			writeFileSync(join(TMP_DIR, `${name}.json`), EJSON.stringify(docs, undefined, 2));
			manifest.collections.push({ name, count: docs.length });
			totalDocs += docs.length;
			console.log(`${docs.length} docs`);
		}

		writeFileSync(join(TMP_DIR, "_manifest.json"), JSON.stringify(manifest, null, 2));

		console.log("\nCreating backup.zip...");
		execSync(`cd "${ROOT}" && zip -r backup.zip .backup_tmp`, { stdio: "pipe" });

		const sizeMB = (statSync(OUT_FILE).size / 1024 / 1024).toFixed(2);
		console.log(`\nDone! backup.zip (${sizeMB} MB) — ${names.length} collections, ${totalDocs} documents\n`);
	} finally {
		rmSync(TMP_DIR, { recursive: true, force: true });
		await client.close();
	}
}

main().catch((err) => {
	rmSync(TMP_DIR, { recursive: true, force: true });
	console.error("\nBackup failed:", err.message, "\n");
	process.exit(1);
});
