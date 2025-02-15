import { randomInt } from "crypto";
import { quotes } from "../utils/quotes";
import { Request, Response } from "express";

export const root = (_req: Request, res: Response) => {
    let quote: string | undefined = undefined;

    while (typeof quote === "undefined") {
        quote = quotes[randomInt(quotes.length)];
    }

    res.send(quote);
}

export const id = (req: Request, res: Response) => {
    const quote = quotes[Number.parseInt(req.params.id!)];

    if (quote === undefined) {
        res.status(404).send(`Quote ${req.params.id} does not exist`);
    }
}