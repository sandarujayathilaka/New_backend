const Record = require('../models/beneficiaryModel');

const deleteOldRecords = async () => {
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() - 6);
  

  try {
    await Record.deleteMany({
      $or: [
        { status: "Done", createdAt: { $lt: expirationDate } },
        { status: "Rejected", createdAt: { $lt: expirationDate } },
      ],
    });

  } catch (error) {
   
  }
};

module.exports = deleteOldRecords;
