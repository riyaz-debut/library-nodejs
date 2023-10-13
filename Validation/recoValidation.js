const { body,check, validationResult } = require('express-validator')


const post = () => {
  return [
    check("type").notEmpty().withMessage('Please enter type 1 or 2'),
    body("rating").notEmpty().withMessage('Please enter rating 1 to 10 '),
    body("reference_id").notEmpty().withMessage('Please enter reference id '),

  ]
}
const put = () => {
  return [
    body("rating").notEmpty().withMessage('Please enter rating 1 to 10 '),
  ]
}

const get = () => {
  return [
    check("page").notEmpty().withMessage('Please enter page number '),
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
    put,
    get,
    validate,

  }