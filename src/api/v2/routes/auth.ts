import express, { Router } from "express";
import { registerCallback, login, register, loginCallback } from "@v2/auth";

const routes = Router();

routes.post("/register", express.json(), register);
routes.post("/login", express.json(), login);
routes.get("/discord/register", express.urlencoded(), registerCallback);
routes.get("/discord/login", express.urlencoded(), loginCallback);

export default routes;
