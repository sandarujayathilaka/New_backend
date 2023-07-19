const Record = require('../models/beneficiaryModel');

const deleteOldRecords = async () => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() - 30);

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
