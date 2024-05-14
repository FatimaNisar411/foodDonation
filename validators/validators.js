const Recipient = require("../models/Recipient");

const validateAndReturnNumber = (value) => {
    const parsedValue = parseInt(value, 10);
    return !isNaN(parsedValue) ? parsedValue : 0;
  };
  
  const validateAndReturnString = (value) => {
    return typeof value === 'string' ? value.trim() : '';
  };

  const validateAndReturnEmail = (value) => {
    // Regular expression for a basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    // Check if the value matches the email pattern
    const isValidEmail = emailRegex.test(value);
  
    // If valid, return the trimmed email; otherwise, return an empty string
    return isValidEmail ? value.trim() : '';
  };

  const validateAndStructureStudentData = (studentData) => {
    return {
      cms: validateAndReturnNumber(studentData.cms),
      name: validateAndReturnString(studentData.name),
      mealsnottaken: validateAndReturnNumber(studentData.mealsnottaken),
      imageUrl: validateAndReturnString(studentData.imageUrl),
      hostel: validateAndReturnString(studentData.hostel),
      email:validateAndReturnEmail(studentData.email),
      room:validateAndReturnString(studentData.room),
      batch:validateAndReturnString(studentData.batch),
      phone: validateAndReturnString(studentData.phone),
      username: validateAndReturnString(studentData.username),
      password: validateAndReturnString(studentData.password),
      department: validateAndReturnString(studentData.department),
    };
  };
  const validateAndStructureAdminData = (adminData) => {
    return {
      name: validateAndReturnString(adminData.name),
      password: validateAndReturnString(adminData.password),
      imageUrl: validateAndReturnString(adminData.imageUrl),
      email:validateAndReturnEmail(adminData.email),
      hostel: validateAndReturnString(adminData.hostel),
      phone: validateAndReturnString(adminData.phone),
      username: validateAndReturnString(adminData.username),
      otp: validateAndReturnString(adminData.otp)
    };
  };
  //-------------------------Recipient.js-------------------------

  const validateAndStructureRecipientData = (recipientData) => {
    return {
      name: validateAndReturnString(recipientData.name),
      type: validateAndReturnString(recipientData.type),
      contact: validateAndReturnString(recipientData.contact),
      address: validateAndReturnString(recipientData.address),
      email: validateAndReturnEmail(recipientData.email),
      password: validateAndReturnString(recipientData.password),
      location: validateAndRecipientLocation(recipientData.location),
      // received_donations: validateAndRecipientDonations(recipientData.received_donations),
      // Add validation for other properties as needed
    };
  };
  
  
  // const validateAndRecipientType = (type) => {
  //   if (type === 'food_bank' || type === 'ngo') {
  //     return type;
  //   } else {
  //     throw new Error('Invalid recipient type');
  //   }
  // };
  
  const validateAndRecipientLocation = (location) => {
    if (
      location &&
      location.type === 'Point' &&
      Array.isArray(location.coordinates) &&
      location.coordinates.length === 2 &&
      typeof location.coordinates[0] === 'number' &&
      typeof location.coordinates[1] === 'number'
    ) {
      return location;
    } else {
      throw new Error('Invalid recipient location');
    }
  };

    //-------------------------Donor.js-------------------------
  const validateAndStructureDonorData = (donorData) => {
    return {
      name: validateAndReturnString(donorData.name),
      type: validateAndDonorType(donorData.type),
      contact: validateAndReturnString(donorData.contact),
      address: validateAndReturnString(donorData.address),
      city: validateAndReturnString(donorData.city),
      email: validateAndReturnEmail(donorData.email),
      password: validateAndReturnString(donorData.password),
      location: validateAndDonorLocation(donorData.location),
      // donations: validateAndDonorDonations(donorData.donations),
      // Add validation for other properties as needed
    };
  };

      //-------------------------rider.js-------------------------
  const validateAndStructureRiderData = (riderData) => {
    return {
      name: validateAndReturnString(riderData.name),
      contact: validateAndReturnString(riderData.contact),
      email: validateAndReturnEmail(riderData.email),
      password: validateAndReturnString(riderData.password),
      location: validateAndRiderLocation(riderData.location),
      recipient: validateAndReturnObjectId(riderData.recipient),
      delivered_donations: validateAndRiderDeliveredDonations(riderData.delivered_donations),
      number_plate: validateAndReturnString(riderData.number_plate),
      // Add validation for other properties as needed
    };
  };
   //-------------------------donations.js-------------------------
  const validateAndStructureDonationsData = (donationsData) => {
    return {
      donor: validateAndReturnObjectId(donationsData.donor),
      donation_id: validateAndReturnObjectId(donationsData.donation_id),
      food_type: validateAndReturnString(donationsData.food_type),
      quantity: validateAndReturnNumber(donationsData.quantity),
      expiry_date: validateAndReturnDate(donationsData.expiry_date),
      status: validateAndDonationStatus(donationsData.status),
      pickup_time: validateAndReturnDate(donationsData.pickup_time),
      delivery_time: validateAndReturnDate(donationsData.delivery_time),
      // Add validation for other properties as needed
    };
  };
  module.exports = { validateAndReturnNumber, validateAndReturnString , validateAndStructureStudentData, validateAndStructureAdminData,
    validateAndStructureAdminData,validateAndRecipientLocation,validateAndStructureDonorData,validateAndStructureRecipientData,validateAndStructureRiderData };