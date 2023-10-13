const { body,check, validationResult } = require('express-validator')


const get = () => {
  return [
    check("type").notEmpty().withMessage('Please enter type 1 or 2')         
  ]
}
  

const validate = (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
      
    }
  next();
  }

  module.exports = {
    get,
    validate,

  }