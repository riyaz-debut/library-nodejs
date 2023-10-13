const { body,check, validationResult } = require('express-validator')


const post = () => {
  return [
    check("type").notEmpty().withMessage('Please enter type 1 or 2'),
    body("status").notEmpty().withMessage('Please enter status 1 for active'),
    body("reference_id").notEmpty().withMessage('Please enter reference id '),

  ]
}

const get = () => {
    return [
      check("page").notEmpty().withMessage('Please enter page number')         
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
    post,
    get,
    validate,

  }