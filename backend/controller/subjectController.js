const Subject = require('../models/Subject');
const beneficiaryModel = require("../models/beneficiaryModel");
const Employee = require("../models/Employee");
const ROLES_LIST = require("../config/roles_list");

const getAllSubjects = async (req, res) => {
    const subjects = await Subject.find();
    if (!subjects) return res.status(204).json({ 'message': 'No subjects found.' });
    res.json(subjects);
}

const createNewSubject = async (req, res) => {
   
    if (!req?.body?.department || !req?.body?.subject) {
        return res.status(400).json({ 'message': 'Please fill in all fields' });
    }
   
    try {
        
        const result = await Subject.create({
          department: req.body.department,
            subject: req.body.subject,
            task: req.body.task,
            pending: req.body.pending,
            reject:req.body.reject,
           
        });

        res.status(201).json(result);
    } catch (err) {
        
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
}





const deleteSubject = async (req, res) => {
    
    if (!req.params.id) {
         return res.status(400).json({ 'message': 'subject ID required.' });
    }
    const subject = await Subject.findOne({ _id: req.params.id  }).exec();
    if (!subject) {
        return res.status(204).json({ "message": `No subject matches ID ${req.params.id}.` });
    }
    const result = await subject.deleteOne(); //{ _id: req.body.id }
    res.json(result);
}

const getSubject = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'subject ID required.' });

    const subject = await Subject.findOne({ _id: req.params.id }).exec();
    if (!subject) {
        return res.status(204).json({ "message": `No subject matches ID ${req.params.id}.` });
    }
    res.json(subject);
}


const addNew = async (req, res) => {
  try {
    const reportData = await Subject.findOne({ _id: req.params.id });
    if (!reportData) return res.status(404).json({ error: "Report not found" });

    // Update beneficiaries
    await beneficiaryModel.updateMany(
      { subject: reportData.subject },
      { subject: req.body.subject }
    );

    // Update Employee
    const employees = await Employee.find();
    for (const employee of employees) {
      for (let index = 0; index < employee.subject.length; index++) {
        const subjectObj = employee.subject[index];
        if (subjectObj.name === reportData.subject) {
          subjectObj.name = req.body.subject;
        }
      }

      await employee.save();
    }
    await Subject.updateOne(
      { _id: req.params.id },
      {
        $set: {
          subject: req.body.subject,
          department: req.body.department,
        },
        $push: {
          task: { $each: req.body.task },
          pending: { $each: req.body.pending },
          reject: { $each: req.body.reject },
        },
      }
    );

    // Return success response
    res.status(200).json({ message: "Report updated" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};


  const deleteTask = async (req, res) => {
    try {
      const { id, index } = req.params;
      const { word } = req.body;
      
      const subject = await Subject.findOne({ _id: id });
      if (!subject) {
        return res.status(404).json({ error: "subject not found" });
      }
  if(word=="task"){
      subject.task.splice(index, 1);
  }else if(word=="pending"){
    subject.pending.splice(index, 1);
  }else if(word=="reject"){
    subject.reject.splice(index, 1);
  }
     
      await subject.save();
  
      res.status(200).json({ message: "Task deleted" });
    } catch (error) {
      
      res.status(500).json({ error: "Internal server error" });
    }
  };

  
  const updateTask = async (req, res) => {
    const { id, index } = req.params;
    const { subject, task, pending, reject, status } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    const sub = await Subject.findOne({ _id: id });

    if (!sub) {
      return res.status(204).json({ message: `No subject matches ID ${id}.` });
    }

    if (req.body.subject) {
      sub.subject = req.body.subject;
    }

    if (status === "task") {
      if (req.body.task && req.body.task[index]) {
        await beneficiaryModel.updateMany(
          { task: sub.task[index].name },
          { task: req.body.task[index].name }
        );

        sub.task[index].name = req.body.task[index].name;
      }
    } else if (status === "pending") {
      if (req.body.pending && req.body.pending[index]) {
        const ben = await beneficiaryModel.find();

        for (const bene of ben) {
          for (let index = 0; index < bene.pending.length; index++) {
            const subjectObj = bene.pending[index];

            if (subjectObj.reason === sub.pending[index].name) {
              subjectObj.reason = req.body.pending[index].name;
            }
          }

          await bene.save();
        }

        sub.pending[index].name = req.body.pending[index].name;
      }
    } else if (status === "reject") {
      if (req.body.reject && req.body.reject[index]) {
        await beneficiaryModel.updateMany(
          { rejreason: sub.reject[index].name },
          { rejreason: req.body.reject[index].name }
        );
        sub.reject[index].name = req.body.reject[index].name;
      }
    }

    const result = await sub.save(); // Save the updated object

    res.json(result);
  };


 

module.exports = {
    getAllSubjects,
    createNewSubject,
    deleteSubject,
    getSubject,
    addNew,
    deleteTask,
    updateTask
}