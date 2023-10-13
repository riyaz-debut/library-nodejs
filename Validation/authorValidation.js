const { body,check, validationResult } = require('express-validator')

const userValidation = () => {
  return [
    body("name").not().isEmpty().withMessage("name is required").isLength({min:3}).withMessage('please enter min 3 char'),  
    body("phoneno").not().isEmpty().withMessage("phone number is required"),              
    
  ]
}

const validate = (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
      
    }
  next();
  }

  module.exports ={
    userValidation,
    validate,
  }