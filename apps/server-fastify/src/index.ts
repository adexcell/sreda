import { buildApp } from "./app";

const app = buildApp();
const PORT = 3001;
const HOST = "0.0.0.0";

const start = async () => {
	try {
		await app.listen({ port: PORT, host: HOST })
		app.log.info(`Server listening on http://localhost:${PORT}`)
	} catch (err) {
		app.log.error(err);
		process.exit(1)
	}
};

// Graceful Shutdown
const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
for (const signal of signals) {
	process.on(signal, async () => {
		app.log.info(`Received ${signal}, closing server...`);
		await app.close();
		process.exit(0);
	});
}

start();
