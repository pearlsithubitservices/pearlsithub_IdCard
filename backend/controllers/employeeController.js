const Employee = require('../models/Employee');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Create a new employee
exports.createEmployee = async (req, res) => {
  try {
    const employeeData = req.body;
    
    // Handle photo upload
    if (req.file) {
      employeeData.photo = `/uploads/${req.file.filename}`;
    }

    const employee = new Employee(employeeData);
    await employee.save();

    // Generate QR code
    const qrData = `${req.protocol}://${req.get('host')}/employee/${employee._id}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrData, { type: 'png', width: 300 });
    
    // Save QR code
    const qrFileName = `qr-${employee._id}.png`;
    const qrPath = path.join(__dirname, '../uploads', qrFileName);
    fs.writeFileSync(qrPath, qrCodeBuffer);
    
    // Update employee with QR code path
    employee.qrCode = `/uploads/${qrFileName}`;
    await employee.save();

    res.status(201).json({
      success: true,
      data: employee,
      message: 'Employee created and QR code generated'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single employee by ID
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const employeeData = req.body;
    
    // Handle photo upload
    if (req.file) {
      // Delete old photo if exists
      const oldEmployee = await Employee.findById(req.params.id);
      if (oldEmployee && oldEmployee.photo) {
        const oldPhotoPath = path.join(__dirname, '..', oldEmployee.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      employeeData.photo = `/uploads/${req.file.filename}`;
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      employeeData,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Regenerate QR code
    const qrData = `${req.protocol}://${req.get('host')}/employee/${employee._id}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrData, { type: 'png', width: 300 });
    
    const qrFileName = `qr-${employee._id}.png`;
    const qrPath = path.join(__dirname, '../uploads', qrFileName);
    fs.writeFileSync(qrPath, qrCodeBuffer);
    
    employee.qrCode = `/uploads/${qrFileName}`;
    await employee.save();

    res.status(200).json({
      success: true,
      data: employee,
      message: 'Employee updated and QR code regenerated'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Delete photo if exists
    if (employee.photo) {
      const photoPath = path.join(__dirname, '..', employee.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // Delete QR code if exists
    if (employee.qrCode) {
      const qrPath = path.join(__dirname, '..', employee.qrCode);
      if (fs.existsSync(qrPath)) {
        fs.unlinkSync(qrPath);
      }
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get QR code for employee
exports.getQRCode = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const qrData = `${req.protocol}://${req.get('host')}/employee/${employee._id}`;
    const qrCodeDataURL = await QRCode.toDataURL(qrData, { width: 300 });

    res.status(200).json({
      success: true,
      data: {
        employeeId: employee._id,
        name: employee.name,
        qrCode: qrCodeDataURL
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
