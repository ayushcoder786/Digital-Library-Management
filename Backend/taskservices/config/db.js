import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
let db;
export async function connectDB() {
    if(!db) {
        db = await mongoose.connect(process.env.DBURL);
    }
return db;
};