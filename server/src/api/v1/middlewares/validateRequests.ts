import { AnySchema } from "yup";
import { Request, Response, NextFunction } from "express";
import {log} from "../../../config";

const validate = (schema: AnySchema) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
      header: req.headers,
    });

    return next();
  } catch (e) {
    log.error(e);
    return res.status(400).send(e.errors);
  }
};

export default validate;
