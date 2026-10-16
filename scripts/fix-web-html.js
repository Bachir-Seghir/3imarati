const fs = require("fs");
const path = require("path");

const distDir = path.join(process.cwd(), "dist");

function updateHtml(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			updateHtml(fullPath);
			continue;
		}

		if (!entry.name.endsWith(".html")) continue;

		let html = fs.readFileSync(fullPath, "utf8");

		const viewport =
			'<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />';

		if (/<meta\s+name=["']viewport["']/i.test(html)) {
			html = html.replace(/<meta\s+name=["']viewport["'][^>]*>/i, viewport);
		} else {
			html = html.replace(/<head([^>]*)>/i, (match) => `${match}\n${viewport}`);
		}

		fs.writeFileSync(fullPath, html);
		console.log(`Updated viewport: ${path.relative(distDir, fullPath)}`);
	}
}

if (!fs.existsSync(distDir)) {
	throw new Error("dist folder not found. Run the Expo web export first.");
}

updateHtml(distDir);
