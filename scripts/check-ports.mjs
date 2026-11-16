#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const registryPath = path.join(os.homedir(), ".ports-registry.json");

const failures = [];
let checks = 0;

function check(label, actual, expected) {
  checks += 1;
  const a = actual === undefined || actual === null || actual === "" ? "-" : String(actual);
  const e = expected === undefined || expected === null || expected === "" ? "-" : String(expected);
  if (a === e) {
    console.log(`[OK] ${label} = ${a}`);
  } else {
    failures.push(`${label} = ${a} (esperado ${e})`);
    console.log(`[FAIL] ${label} = ${a} (esperado ${e})`);
  }
}

function info(message) {
  console.log(`[INFO] ${message}`);
}

if (!fs.existsSync(registryPath)) {
  console.error(`[FAIL] No existe ${registryPath}`);
  process.exit(1);
}

let registry;
try {
  registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
} catch (error) {
  console.error(`[FAIL] No se pudo leer ${registryPath}: ${error.message}`);
  process.exit(1);
}

const project = registry.projects?.goalrecall;
if (!project) {
  console.error("[FAIL] goalrecall no está definido en ~/.ports-registry.json");
  process.exit(1);
}

let firebase;
try {
  firebase = JSON.parse(fs.readFileSync(path.join(projectRoot, "firebase.json"), "utf8"));
} catch (error) {
  console.error(`[FAIL] No se pudo leer firebase.json: ${error.message}`);
  process.exit(1);
}

const emulators = firebase.emulators ?? {};
const emulatorKeys = ["auth", "firestore", "functions", "ui", "hub", "logging"];

console.log(`Validando goalrecall contra ${registryPath}`);
console.log("");

for (const key of emulatorKeys) {
  check(`firebase.json emulators.${key}.port`, emulators[key]?.port, project.firebase?.[key]);
}

if (emulators.storage?.port) {
  check("firebase.json emulators.storage.port", emulators.storage.port, project.firebase?.storage);
} else {
  info(`firebase.json emulators.storage.port no configurado (reservado ${project.firebase?.storage ?? "-"})`);
}

const serverPath = path.join(projectRoot, "server.ts");
if (fs.existsSync(serverPath)) {
  const server = fs.readFileSync(serverPath, "utf8");
  const match = server.match(/const\s+PORT\s*=.*?\|\|\s*(\d+)\s*;/)
    ?? server.match(/const\s+PORT\s*=\s*(\d+)/);
  check("server.ts PORT", match?.[1], project.app);
} else {
  check("server.ts PORT", "archivo ausente", project.app);
}

const envExamplePath = path.join(projectRoot, ".env.example");
if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, "utf8");
  const match = envExample.match(/VITE_FIREBASE_EMULATOR_AUTH_PORT\s*=\s*"?(\d+)"?/);
  check(".env.example VITE_FIREBASE_EMULATOR_AUTH_PORT", match?.[1], project.firebase?.auth);
} else {
  check(".env.example VITE_FIREBASE_EMULATOR_AUTH_PORT", "archivo ausente", project.firebase?.auth);
}

const envLocalPath = path.join(projectRoot, ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envLocal = fs.readFileSync(envLocalPath, "utf8");
  const match = envLocal.match(/VITE_FIREBASE_EMULATOR_AUTH_PORT\s*=\s*"?(\d+)"?/);
  check(".env.local VITE_FIREBASE_EMULATOR_AUTH_PORT", match?.[1], project.firebase?.auth);
} else {
  info(".env.local no existe (archivo local no versionado); se omite");
}

console.log("");
if (failures.length > 0) {
  console.error(`[FAIL] ${failures.length} desalineación(es) con ~/.ports-registry.json`);
  process.exit(1);
}

console.log(`[OK] Todos los puertos alineados con ~/.ports-registry.json (${checks} verificaciones)`);