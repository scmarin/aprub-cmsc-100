import mongoose from "mongoose";

const Application = mongoose.model("Application");

const createApplication = async (req, res) => {
  const {studentID, adviserID} = req.body;
    try {
      let checkForOpen = await Application.find({studentID, status:"open"})

      if (checkForOpen.length >= 1) {
        res.send({hasOpen: true})
        return;
      }

      const newApplication = new Application({
          status: "open",
          step: 1,
          remarks: [],
          studentSubmission: [],
          studentID: studentID,
          adviserID: adviserID
      });
      const savedApplication = await newApplication.save();
      res.status(200).json(savedApplication);
        
    } catch (error) {
        res.status(500).json(error);
    }
}

const getApplicationsApprover = async (req, res) => {
  let { adviserID, search, filter, filterValue, sort, userType} = req.body;
  console.log(filterValue)
  let newFilter;
  if (filter == "createdAt")  {
    newFilter = {"date": new Date(filterValue).toUTCString}
  } else if (filter == "step") {
    newFilter = {"step": parseInt(filterValue)}
  } else if (filter == "status") {
    newFilter = {"status": `${filterValue}`}
  } else {
    newFilter = {"_id": {$ne: 0}}
  }

  let applications = await Application.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "studentID",
        foreignField: "_id",
        as: "studentData"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "adviserID",
        foreignField: "_id",
        as: "adviserData"
      }
    },
    {
      $match: {
        $and: [
          {step: {$ne: 1}},
          {adviserID: (userType == "officer" && filter == "adviser")
            ? new mongoose.Types.ObjectId(filterValue)
            : (userType == "officer" && filter == "")
              ? {$ne: 0}
              : new mongoose.Types.ObjectId(adviserID)
          },
          {
            $or: [
              {"studentData.0.fullName": {$regex: new RegExp(`${search}`, "gi")}},
              {"studentData.0.studentNumber": {$regex: new RegExp(`${search}`, "gi")}}
            ]
          },
          {...newFilter}
        ]
      }
    }
  ]).collation({locale: "en"}).sort(sort)
  
  res.send(applications)
}

const getApplications = async (req, res) => {
  const { studentID } = req.query;
  try {
    let applications = await Application.find({ studentID });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json(error);
  }
};
  
const closeApplication = async (req, res) => {
  const {appID} = req.body;
  try {
    const update = await Application.updateOne({_id: appID}, {$set: {status: "closed"}})
    if (update["acknowledged"] && update["modifiedCount"] != 0) res.status(200).json({close: true})
    else res.status(500).json({close: false})
  } catch (error) {
    res.status(500).json(error)
  }
}

const submitApplication = async (req, res) => {
  const { appID, githubLink, status } = req.body;
  try {
    const application = await Application.findById(appID);

    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    application.studentSubmission.push({
      githubLink,
      createdAt: new Date(),
      remarks: [],
    });

    application.status = status;

    const savedApplication = await application.save();
    res.status(200).json(savedApplication);
  } catch (error) {
    res.status(500).json(error);
  }
};

const approveApplication = async(req, res) => {
  const {appID, approverType} = req.body
  if (approverType == "adviser") {
    var update = await Application.updateOne({_id: appID}, {$set: {step: "3"}})
  } else {
    var update = await Application.updateOne({_id: appID}, {$set: {status: "cleared"}})
  }

  if (update["acknowledged"] && update["modifiedCount"] != 0) res.send({updated: true})
  else res.send({updated: false})
}

const returnApplication = async(req, res) => {
  const {appID, approverType} = req.body
  if (approverType == "adviser") {
    var update = await Application.updateOne({_id: appID}, {$set: {step: "1"}})
  } else {
    var update = await Application.updateOne({_id: appID}, {$set: {step: "2"}})
  }

  if (update["acknowledged"] && update["modifiedCount"] != 0) res.send({updated: true})
  else res.send({updated: false})
}


export { createApplication, getApplications, closeApplication, submitApplication, approveApplication, getApplicationsApprover, returnApplication }