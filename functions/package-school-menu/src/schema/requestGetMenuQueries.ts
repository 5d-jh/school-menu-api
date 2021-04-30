import Joi from 'joi';

const requestGetMenuQueries = Joi.object({
  year: Joi.number().optional(),
  month: Joi.number().optional(),
  date: Joi.number().optional(),
  allergy: Joi.string().valid('hidden', 'formed').optional(),
});

export default requestGetMenuQueries;
