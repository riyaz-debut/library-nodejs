const { body,check, validationResult } = require('express-validator')


const post = () => {
  return [
    check("type").notEmpty().withMessage('Please enter type 1 or 2'),
    body("like").notEmpty().withMessage('Please enter flag 1 for like'),
    body("reference_id").notEmpty().withMessage('Please enter reference id '),

  ]
}

const get = () => {
  return [
    check("page").notEmpty().withMessage('Please enter page number'),
    check("reference_id").notEmpty().withMessage('Please enter reference id '),

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