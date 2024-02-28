import mongoose from "mongoose";


mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;

const hadleOepn =() => console.log("💟 conneted to DB");
const hadleError =(error) => console.log("❌ DB Error", error);

db.on("error", hadleError);
db.once("open", hadleOepn);
