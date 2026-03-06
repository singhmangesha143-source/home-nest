const { validationResult, body } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const roomValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('price').isNumeric().withMessage('Price must be a number').custom(v => v >= 0),
  handleValidationErrors,
];

const bookingValidation = [
  body('roomId').notEmpty().withMessage('Room ID is required'),
  body('visitDate').isISO8601().withMessage('Valid visit date is required'),
  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  roomValidation,
  bookingValidation,
  handleValidationErrors,
};
