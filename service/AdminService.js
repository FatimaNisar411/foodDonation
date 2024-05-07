// services/adminService.js
const {
    validateAndStructureAdminData,
    validateAndStructureStudentData,
  } = require("../validators/validators");
  const Admin = require("../models/Admin");

  
  const createAdmin = async (adminData) => {
    try {
      const validatedData = validateAndStructureAdminData(adminData);
      const newAdmin = new Admin(validatedData);
      const savedAdmin = await newAdmin.save();
      return savedAdmin;
    } catch (error) {
      throw error;
    }
  };
  
  const getAdminByID = async (id) => {
    try {
      const admin = await Admin.findById(id);
      return admin;
    } catch (error) {
      throw error;
    }
  };
  
  const getAllAdmins = async () => {
    try {
      const admins = await Admin.find().populate;
      return admins;
    } catch (error) {
      throw error;
    }
  };
  
  const deleteAdminById = async (adminId) => {
    try {
      const deletedAdmin = await Admin.findByIdAndDelete(adminId);
      return deletedAdmin;
    } catch (error) {
      throw error;
    }
  };
  
  const updateAdminById = async (adminId, updatedData) => {
    try {
      const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updatedData, {
        new: true,
      });
      return updatedAdmin;
    } catch (error) {
      throw error;
    }
  };
  
  /// Admin -> student routes
  
  const createStudent = async (studentData) => {
    try {
      const validatedData = validateAndStructureStudentData(studentData);
      console.log(validatedData);
      const newStudent = new Student(validatedData);
      const savedStudent = await newStudent.save();
      console.log("Student Created");
      return savedStudent;
    } catch (error) {
      throw error;
    }
  };
  
  const getAllStudents = async () => {
    try {
      const allStudents = await Student.find();
      return allStudents;
    } catch (error) {
      throw error;
    }
  };
  
  const getStudentsByHostel = async (hostelName) => {
    try {
      const studentsInHostel = await Student.find({ hostel: hostelName });
      return studentsInHostel;
    } catch (error) {
      throw error;
    }
  };
  
  const getStudentById = async (studentId) => {
    try {
      const student = await Student.findById(studentId);
      return student;
    } catch (error) {
      throw error;
    }
  };
  
  const deleteStudentById = async (studentId) => {
    try {
      const deletedStudent = await Student.findByIdAndDelete(studentId);
      return deletedStudent;
    } catch (error) {
      throw error;
    }
  };
  
  const updateStudentById = async (studentId, updatedData) => {
    try {
      const updatedStudent = await Student.findByIdAndUpdate(studentId, updatedData, { new: true });
      return updatedStudent;
    } catch (error) {
      throw error;
    }
  };
  
  const getMessOffStdsByDate = async (date)=>{
    try{
      const students = await getAllStudents();
      const breakfast = [];
      const lunch = [];
      const dinner = [];
      for(let i=0; i<students.length; i++){
        for(let j=0; j<students[i].calendar.days.length; j++){
          if(students[i].calendar.days[j].day == date){
            if(students[i].calendar.days[j].breakfast == 'A'){
              breakfast.push(students[i]);
            }if(students[i].calendar.days[j].lunch == 'A'){
              lunch.push(students[i]);
            }if(students[i].calendar.days[j].dinner == 'A'){
              dinner.push(students[i]);
            }
          }
        }
      }
      console.log('---------------------------------------------');
      console.log("Breakfast Defaulter")
      console.log(breakfast)
      console.log("Lunch Defaulter")
      console.log(lunch)
      console.log("Dinner Defaulter")
      console.log(dinner)
      
      const messOffStudents = [
        {breakfast: breakfast},
        {lunch: lunch},
        {dinner: dinner}
      ]
      return messOffStudents;
    } catch (error) {
      throw error;
    }
  }
  
  
  // Service functions for mess menu
  
  // Function to create a mess menu
  const createMessMenu = async (menuData) => {
    try {
      const messMenu = new MessMenu(menuData);
      const createdMenu = await messMenu.save();
      console.log("---------------------------------");
      console.log(menuData);
      return 'ok';
    } catch (error) {
      throw error;
    }
  };
  
  const updateMessMenu = async (id, updatedMenu, newDay) => {
    try {
      const messMenu = await MessMenu.findById(id)
      messMenu.menu.breakfast = updatedMenu.breakfast;
      messMenu.menu.lunch = updatedMenu.lunch;
      messMenu.menu.dinner = updatedMenu.dinner;
      messMenu.save();
      return messMenu;
    } catch (error) {
      throw error;
    }
  };
  
  
  const getMessMenu = async () => {
    try {
      const menu = await MessMenu.find();
      return menu;
    } catch (error) {
      throw error;
    }
  };
  
  module.exports = {
    createAdmin,
    getAllAdmins,
    deleteAdminById,
    updateAdminById,
    getAllStudents,
    getStudentsByHostel,
    getStudentById,
    createStudent,
    deleteStudentById,
    updateStudentById,
    createMessMenu,  
    updateMessMenu,
    getMessMenu,
    getAdminByID,
    getMessOffStdsByDate
  };