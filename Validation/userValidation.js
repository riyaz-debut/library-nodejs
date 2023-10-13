const { body,check, validationResult } = require('express-validator')

const userValidationRules = () => {
  return [
    body("firstName").not().isEmpty().withMessage("First name is required"),  
    body("lastName").not().isEmpty().withMessage("Last name is required"),              
    body('email').not().isEmpty().withMessage("email is required"),//.isEmail().withMessage({message:'Enter valid  email'}),
    body('password').not().isEmpty().withMessage("password is required").isLength({min:8}).withMessage("password must be at least 8 number")
    .matches(/\d/)
    .withMessage('must contain a number'),
  ]
}



const verify = () => {
  return [
                
    body('id').not().isEmpty().withMessage("id is required"),
    body('otp').not().isEmpty().withMessage("otp is required")
 
  ]
}

const validate = (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
    
  }
next();
}

const userLogin = () => {
  return [
                
    body('email').not().isEmpty().withMessage("email is required").isEmail().withMessage({message:'Enter valid  email'}),
    body('password').not().isEmpty().withMessage("password is required"),
 
  ]
}

const change = () => {
  return [
                
    body('email').not().isEmpty().withMessage("email is required").isEmail().withMessage({message:'Enter valid  email'}),
    body('password').not().isEmpty().withMessage("password is required").isLength({min:8}).withMessage("password must be at least 8 number")
    .matches(/\d/)
    .withMessage('must contain a number'),
 
  ]
}

const get = () => {
  return [
    check("page").notEmpty().withMessage('Please enter page number')         
  ]
}

const follow = () => {
  return [
    body('id').notEmpty().withMessage('Please enter id'),
    body('follow').notEmpty().withMessage('Please enter follow flag yes'),

  ]
}  

const unfollow = () => {
  return [
    body('id').notEmpty().withMessage('Please enter id'),
    body('unfollow').notEmpty().withMessage('Please enter unfollow flag yes'),

  ]
}

const reset = () => {
  return [
    body('password').notEmpty().withMessage('Please enter password'),
    check('token').notEmpty().withMessage('Please enter token'),

  ]
}

module.exports = {
  userValidationRules,
  verify,
  userLogin,
  change,
  get,
  follow,
  unfollow,
  reset,
  validate,
  
}