import express from 'express';
import * as taskService from '../service/taskservice.js';

const router = express.Router();
router.post("/createtask", async (req, res) => {
    res.json(await taskService.createTask(req.body, req.headers["token"]));
});

export default router;

router.get("/getalltasks/:PAGE/:SIZE",async (req, res) => {
    const{PAGE,SIZE} = req.params;
    const response = await taskService.getAllTasks(PAGE,SIZE, req.headers.token);
    res.json(response);
});

router.delete("/deletetask/:ID", async (req, res)=>{
    const {ID} = req.params;
    const response = await taskService.deleteTask(ID, req.headers.token);
    res.json(response);
});