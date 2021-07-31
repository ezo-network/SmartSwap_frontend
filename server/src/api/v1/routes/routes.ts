import { Express, Request, Response } from "express";
import { validateRequest } from "../middlewares";

import swapProviderController from "../controllers/swapProvider.controller";
import requestValidations from "../validations/requestValidations";

export default function (app: Express) {
  app.get("/healthcheck", (req: Request, res: Response) => res.sendStatus(200));

  // swap provider register
  app.post("/become-swap-provider", validateRequest(requestValidations.becomeSwapProviderRequest), swapProviderController.becomeSwapProvider);
  //app.post("/become-swap-provider", becomeSwapProvider);


}