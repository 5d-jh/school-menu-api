import { Handler } from 'express'
import requestGetMenuQueries from '../model/requestGetMenuQuerySchema'

const schemaValidator: Handler = (req, res, next) => {
  req.query = requestGetMenuQueries.validate(req.query).value
  next()
}

export default schemaValidator
