import { Handler } from 'express';
import requestGetMenuQueries from '../schema/requestGetMenuQueries';

const schemaValidator: Handler = (req, res, next) => {
  req.query = requestGetMenuQueries.validate(req.query).value;
  console.log(req.query);
  next();
}

export default schemaValidator;
