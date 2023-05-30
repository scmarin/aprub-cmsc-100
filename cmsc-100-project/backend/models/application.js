import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
    status: { type: String, required: true },
    step: {type: Number, required: true},
    remarks: [],
    // remarks: [{
    //     remark: {type: String, required: true},
    //     date: {type: Date, default: Date.now},
    //     commenter: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required : true},
    // }],
    // studentSubmission: [],
    studentSubmission: [{
        githubLink: {type: String},
        createdAt: { type: Date, default: Date.now },
        remarks: [{
            remark: {type: String, required: true},
            date: {type: Date, default: Date.now},
            stepGiven: {type: Number}
        }]
    }],
    studentID: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required : true},
    adviserID: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    createdAt: { type: Date, default: Date.now }
});

mongoose.model("Application", ApplicationSchema);