import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const vinextCli = resolve("node_modules/vinext/dist/cli.js");
const child = spawn(process.execPath, [vinextCli, "build", ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ["inherit", "pipe", "pipe"],
});

let transcript = "";

child.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  transcript += text;
  process.stdout.write(text);
});

child.stderr.on("data", (chunk) => {
  const text = chunk.toString();
  transcript += text;
  process.stderr.write(text);
});

const exitCode = await new Promise((resolveExit) => {
  child.on("error", () => resolveExit(1));
  child.on("exit", (code) => resolveExit(code ?? 1));
});

if (exitCode === 0) {
  process.exitCode = 0;
} else {
  const windowsExitAssertion =
    process.platform === "win32" &&
    transcript.includes("Build complete.") &&
    transcript.includes("UV_HANDLE_CLOSING") &&
    existsSync(resolve("dist/server/index.js")) &&
    existsSync(resolve("dist/.openai/hosting.json"));

  if (windowsExitAssertion) {
    process.stderr.write(
      "\n[build] Vinext emitted complete artifacts before its known Windows libuv shutdown assertion; treating the verified build as successful.\n",
    );
    process.exitCode = 0;
  } else {
    process.exitCode = exitCode;
  }
}
