const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';

const children = new Map();
let shuttingDown = false;

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const parsed = {};
  const content = fs.readFileSync(filePath, 'utf8');

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const equalsIndex = line.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

const rootEnv = parseEnvFile(path.resolve(process.cwd(), '.env'));
const childEnv = {
  ...rootEnv,
  ...process.env,
};

const commands = [
  ['backend', ['run', 'dev:backend'], { PORT: childEnv.PORT || '3001' }],
  ['frontend', ['run', 'dev:frontend'], { PORT: '3000' }],
  ['bot', ['run', 'dev:bot:local']],
];

function prefixOutput(name, stream, chunk) {
  const lines = chunk.toString().split(/\r?\n/);

  for (const line of lines) {
    if (line.length > 0) {
      stream.write(`[${name}] ${line}\n`);
    }
  }
}

function stopAll(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children.values()) {
    if (!child.killed) {
      if (isWindows) {
        spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
          stdio: 'ignore',
          shell: false,
        });
      } else {
        child.kill('SIGTERM');
      }
    }
  }

  setTimeout(() => process.exit(exitCode), 300);
}

for (const [name, args, envOverrides = {}] of commands) {
  const command = isWindows ? `${npmCommand} ${args.join(' ')}` : npmCommand;
  const commandArgs = isWindows ? [] : args;
  const child = spawn(command, commandArgs, {
    cwd: process.cwd(),
    env: {
      ...childEnv,
      ...envOverrides,
    },
    shell: isWindows,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  children.set(name, child);

  child.stdout.on('data', (chunk) => prefixOutput(name, process.stdout, chunk));
  child.stderr.on('data', (chunk) => prefixOutput(name, process.stderr, chunk));

  child.on('exit', (code, signal) => {
    children.delete(name);

    if (shuttingDown) return;

    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.error(`[room:local] ${name} exited with ${reason}`);
    stopAll(code || 1);
  });
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
