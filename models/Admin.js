const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  imageUrl:{type:String},
  email:{type:String,required:true},
  hostel: { type: String, required: true },
  phone: { type: String },
  otp: { type: String }, 
  username:{type:String, required:true},
});

const Admin = mongoose.model('Admin', adminSchema);


module.exports = Admin;