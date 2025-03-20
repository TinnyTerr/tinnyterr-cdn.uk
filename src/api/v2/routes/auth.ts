import express, { Router } from "express";
import { discordCallback, login, register } from "@v2/auth";

const routes = Router();

routes.post("/register", express.json(), register);
routes.post("/login", express.json(), login);
routes.get("/discord", express.urlencoded(), discordCallback);

export default routes;
