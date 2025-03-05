import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const port = process.env.PORT as string;

app.all("/", (_req, res) => {
	res.sendStatus(204);
});

app.listen(port, () => {
	console.log(`File hoster listening at http://localhost:${port}`);
});