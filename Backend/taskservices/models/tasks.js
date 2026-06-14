import mongoose from "mongoose";
const taskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    createdby: {type: Number, required: true},
    assignedto: {type: Number, required: true},
    priority: {type: Number, required: true},
    deadline: {type: String, required: true},
    status: {type: Number, required: true}
},
{
    timestamps: {createdAt: 'createdat', updatedAt: 'updatedat'}
}
)
const Tasks = mongoose.model("Tasks", taskSchema);

export default Tasks;