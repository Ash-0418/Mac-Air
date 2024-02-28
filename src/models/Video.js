//makeing Video model with mongoose
import mongoose from "mongoose";



const videoSchema = new mongoose.Schema({
    title:{type: String,required:true, maxlength: 80},
    description: {type: String,required:true, maxlength: 100},
    createdAt: {type: Date, default: Date.now,required: true},
    hashtags: [{type: String,trim: true}],
    meta: {
        views:{type:Number, default: 0, required: true},
        reting: {type:Number, default: 0, required: true},
    },
});

videoSchema.static("formatHashtags", function(hashtags){
    return hashtags.split(",")
    .map((word) => (word.startsWith("#") ? word:`#${word}`));
});

const Video = mongoose.model("Video", videoSchema);
export default Video;

//import Video from "../src/models/Videos.js";
