import { Express, Request, Response } from "express";
import { validateRequest } from "../middlewares";

import swapProviderController from "../controllers/swapProvider.controller";
import requestValidations from "../validations/requestValidations";

export default function (app: Express) {
  app.get("/healthcheck", (req: Request, res: Response) => res.sendStatus(200));

  // swap provider register
  app.post("/become-swap-provider", validateRequest(requestValidations.becomeSwapProviderRequest), swapProviderController.becomeSwapProvider);
  app.post("/update-tx-hash", validateRequest(requestValidations.updateTransactionHashRequest), swapProviderController.updateTransactionHash);
  app.post("/update", validateRequest(requestValidations.updateRequest), swapProviderController.update);
  app.get("/get-contract-address", validateRequest(requestValidations.getContractAddressRequest), swapProviderController.getContractAddress);
  app.post("/get-contract-status", validateRequest(requestValidations.getContractAddressStatus), swapProviderController.getContractAddressStatus);
  app.post("/active-contracts", validateRequest(requestValidations.getActiveContractsRequest), swapProviderController.getActiveContracts);
  app.post("/test-suite", swapProviderController.testSuite);


  //app.post("/become-swap-provider", becomeSwapProvider);


}