#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const registryPath = path.join(os.homedir(), ".ports-registry.json");
const projectName = "goalrecall";
const host = "127.0.0.1";
const autoClean = process.argv.includes("--auto-clean");
const services = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));

function fail(message) {
  console.error(`[FAIL] ${message}`);
}

function loadRegistry() {
  if (!fs.existsSync(registryPath)) {
    fail(`No existe ${registryPath}`);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(registryPath, "utf8"));
  } catch (error) {
    fail(`No se pudo leer ${registryPath}: ${error.message}`);
    process.exit(1);
  }
}

function isPortInUse(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host });
    let settled = false;
    const done = (inUse) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(inUse);
    };
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
    socket.setTimeout(750, () => done(false));
  });
}

function getListenerPids(port) {
  try {
    const output = execFileSync("lsof", ["-nP", "-w", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"], {
      encoding: "utf8",
    });
    return [...new Set(output.split("\n").map((line) => line.trim()).filter(Boolean))];
  } catch {
    return [];
  }
}

function getCommand(pid) {
  try {
    return execFileSync("ps", ["-o", "command=", "-p", pid], { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function getProjectName(command) {
  return command.match(/\/dev-personal\/([^/]+)(?:\/|$)/)?.[1] ?? null;
}

function isStaleForPort(command, port, registry) {
  const owner = getProjectName(command);
  if (!owner) return false;
  const ownerPorts = Object.values(registry.projects?.[owner]?.firebase ?? {});
  return ownerPorts.length > 0 && !ownerPorts.includes(port);
}

function collectDescendants(pid) {
  const descendants = [];
  let children = [];
  try {
    children = execFileSync("pgrep", ["-P", String(pid)], { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {
    return descendants;
  }
  for (const child of children) {
    descendants.push(child, ...collectDescendants(child));
  }
  return descendants;
}

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function terminateTree(pid) {
  const pids = [pid, ...collectDescendants(pid)].map(Number);
  for (const p of pids) {
    try {
      process.kill(p, "SIGTERM");
    } catch {}
  }
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    if (!pids.some(isAlive)) return true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  for (const p of pids) {
    try {
      process.kill(p, "SIGKILL");
    } catch {}
  }
  return true;
}

function describeListeners(pids) {
  return pids.map((pid) => {
    const command = getCommand(pid);
    return { pid, command, project: getProjectName(command) };
  });
}

const registry = loadRegistry();
const project = registry.projects?.[projectName];
if (!project?.firebase) {
  fail(`${projectName} no está definido en ~/.ports-registry.json`);
  process.exit(1);
}

const targets = services.length > 0 ? services : ["auth", "firestore", "functions", "ui", "hub", "logging"];

console.log(`Preflight de puertos para ${projectName} (${registryPath})`);
console.log(autoClean ? "Modo: --auto-clean (termina procesos stale)" : "Modo: solo diagnóstico");
console.log("");

const conflicts = [];

for (const service of targets) {
  const port = project.firebase[service];
  if (!port) {
    fail(`El registro no define firebase.${service} para ${projectName}`);
    conflicts.push(service);
    continue;
  }

  if (!(await isPortInUse(port))) {
    console.log(`[OK] ${service}: ${host}:${port} libre`);
    continue;
  }

  let listeners = describeListeners(getListenerPids(port));
  if (listeners.length === 0) {
    listeners = [{ pid: null, command: "", project: null }];
  }

  if (autoClean) {
    for (const listener of listeners) {
      if (listener.pid && isStaleForPort(listener.command, port, registry)) {
        console.log(
          `[AUTO-CLEAN] ${service}: ${host}:${port} -> terminando PID ${listener.pid} (${listener.project ?? "proyecto desconocido"})`,
        );
        await terminateTree(listener.pid);
      }
    }
    if (!(await isPortInUse(port))) {
      console.log(`[OK] ${service}: ${host}:${port} liberado`);
      continue;
    }
    listeners = describeListeners(getListenerPids(port));
    if (listeners.length === 0) {
      listeners = [{ pid: null, command: "", project: null }];
    }
  }

  for (const listener of listeners) {
    const owner = listener.pid ? `PID ${listener.pid}` : "proceso desconocido";
    const command = listener.command ? ` (${listener.command})` : "";
    console.log(`[CONFLICT] ${service}: ${host}:${port} en uso por ${owner}${command}`);
  }
  conflicts.push(service);
}

console.log("");
if (conflicts.length > 0) {
  fail(`${conflicts.length} puerto(s) ocupado(s): ${conflicts.join(", ")}`);
  console.log("Libera los puertos o ejecuta el script con --auto-clean para terminar procesos stale.");
  process.exit(1);
}

console.log(`[OK] Puertos libres para: ${targets.join(", ")}`);