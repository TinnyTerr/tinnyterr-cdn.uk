import colours from "yoctocolors-cjs";

//@ts-ignore
export const colorizer = (tokens, req, res) => {
	const statusString = tokens.status(req, res);
	if (!statusString) return;
	const status = Number.parseInt(statusString, 10); // Convert status to number
	const method = tokens.method(req, res);
	const url = tokens.url(req, res);
	const responseTime = tokens["response-time"](req, res);
	const ip = req.ip;

	const date = new Date().toISOString().replace("T", " ").replace("Z", "");

	// Get terminal width dynamically
	const terminalWidth = process.stdout.columns || 80; // Default to 80 if not available

	// Define the minimum column widths
	const minDateWidth = 30;
	const minMethodWidth = 10;
	const minUrlWidth = 20;
	const minStatusWidth = 6;
	const minResponseTimeWidth = 10;

	// Calculate the total minimum width
	const totalMinWidth =
		minDateWidth +
		minMethodWidth +
		minUrlWidth +
		minStatusWidth +
		minResponseTimeWidth;

	// Calculate available extra space to spread across columns
	const availableWidth = terminalWidth - totalMinWidth;

	// Distribute the available width proportionally
	const urlExtraWidth = Math.max(Math.floor(availableWidth * 0.5), 0); // Give extra space to URL
	const dateWidth = minDateWidth;
	const methodWidth = minMethodWidth;
	const urlWidth = minUrlWidth + urlExtraWidth;
	const statusWidth = minStatusWidth;
	const responseTimeWidth = minResponseTimeWidth;

	// Color the logs based on the status code
	let color = colours.gray;
	if (status >= 400 && status < 500) color = colours.yellow;
	if (status >= 500) color = colours.red;
	if (status < 400) color = colours.green;

	// Return the formatted log with dynamically calculated widths
	return color(
		`${date.padEnd(dateWidth)} ` + // Add the date at the start
			`${ip.padEnd(methodWidth)} ` + // Pad IP for equal width
			`${method.padEnd(methodWidth)} ` + // Pad method for equal width
			`${url.padEnd(urlWidth)} ` + // Pad URL dynamically
			`${status.toString().padStart(statusWidth)} ` + // Pad status
			`${responseTime.padStart(responseTimeWidth)}ms`, // Pad response time
	);
};
