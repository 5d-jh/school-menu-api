import Joi from 'joi'

const requestGetMenuQuerySchema = Joi.object({
  year: Joi.number().optional().default(new Date().getFullYear()),
  month: Joi.number().optional().default(new Date().getMonth() + 1),
  date: Joi.number().optional(),
  allergy: Joi.string().valid('hidden', 'formed').optional()
})

export default requestGetMenuQuerySchema
