const { body,check, validationResult } = require('express-validator')

const create = ()=> {
    return [
        body("name").not().isEmpty().withMessage("please enter book name"),
        body("price").not().isEmpty().withMessage("please enter price "),
        body("author").not().isEmpty().withMessage("please enter author id "),
        body("genre").not().isEmpty().withMessage("please enter genre id "),
        
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
    create,
    validate,
}