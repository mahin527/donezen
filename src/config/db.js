import mongoose from "mongoose";
import { conf } from "./config.js";

export async function connect_db() {
    await mongoose.connect(conf.db_url);
    console.log("db conected");
}
