const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  createEmployee,
  getAllEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getQRCode
} = require('../controllers/employeeController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes
router.post('/', upload.single('photo'), createEmployee);
router.get('/', getAllEmployees);
router.get('/:id', getEmployee);
router.put('/:id', upload.single('photo'), updateEmployee);
router.delete('/:id', deleteEmployee);
router.get('/:id/qrcode', getQRCode);

module.exports = router;
