const { execFileSync } = require("node:child_process");

const isWindows = process.platform === "win32";

const npm = isWindows ? "npm.cmd" : "npm";
const npx = isWindows ? "npx.cmd" : "npx";

function run(command, args) {
	try {
		execFileSync(command, args, {
			stdio: "inherit",
			shell: false,
		});

		return true;
	} catch {
		return false;
	}
}

// Pega os arquivos staged
let files;

try {
	const output = execFileSync(
		"git",
		["diff", "--cached", "--name-only", "--diff-filter=ACMR"],
		{
			encoding: "utf8",
			shell: false,
		}
	);

	files = output
		.split(/\r?\n/)
		.filter(Boolean)
		.filter((file) => /^backend\/.*\.(ts|tsx)$/.test(file));
} catch {
	console.error("❌ Não foi possível verificar os arquivos staged.");
	process.exit(1);
}

// Não existem arquivos TS/TSX do backend no commit
if (files.length === 0) {
	process.exit(0);
}

// Prettier
console.log("");
console.log("🔍 Verificando formatação...");
console.log("");

if (!run(npx, ["--prefix", "backend", "prettier", "--check", ...files])) {
	console.error("");
	console.error("❌ Arquivos não formatados encontrados.");
	console.error("Antes do commit execute: npm run format");
	console.error("");

	process.exit(1);
}

// Testes
console.log("");
console.log("🧪 Executando testes...");
console.log("");

if (!run(npm, ["run", "test"])) {
	console.error("");
	console.error("❌ Testes falharam. Commit cancelado.");
	console.error("");

	process.exit(1);
}

console.log("");
console.log("✅ Testes passaram. Prosseguindo com o commit.");
console.log("");

process.exit(0);
