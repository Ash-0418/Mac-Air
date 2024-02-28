import Video  from "../models/Video";

export const home = async(req, res) => {
    const videos=await Video.find({}).sort({createdAt:-1});
    return res.render("home",{pageTitle: "Home", videos});
    
};
export const watch= async(req, res) =>{
    const {id}=req.params;
    const video =await Video.findById(id);//Video's send to watch&video.pug
    if(!video){
        return res.status(400).render("404", {pageTitle:"Video not found"})
    }return res.render("watch",{pageTitle: video.title, video});

};
export const getEdit = async(req, res) => {
    const {id} = req.params;
    const video = await Video.findById(id);
    if(!video){
        return res.status(400).render("404", {pageTitle:"Video not found"})
    } 
    return res.render("edit", {pageTitle:`Edit:${video.title}`, video});
};
export const postEdit =async(req, res) => {
    const {id} = req.params;
    const {title, description, hashtags} = req.body;
    const video = await Video.exists({_id:id});
    if(!video){
        return res.render("404", {pageTitle:"Video not found"})
    }
    await Video.findByIdAndUpdate(id,{
        title:title,
        description: description,
        hashtags: Video.formatHashtags(hashtags),
    });
    return res.redirect(`/videos/${id}`);
};

export const getUpload= (req, res) =>{
    return res.render("upload", {pageTitle:"Upload Video"});
};
export const postUpload = async(req, res) => {
    //here we will add a video to the videos array.
    try {
        const {title, description, hashtags} = req.body;
        await Video.create({
            title: title,
            description:description,
            hashtags: Video.formatHashtags(hashtags),
        });
        return res. redirect("/");
    } catch (error) {
        return res.status(400).render("upload error", {
            pageTitle : "Upload Error",
            errorMessage: error._message,
        });
    
    }
};


export const deleteVideo = async(req,res) => {
    const {id} = req.params;
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
};

export const search = async(req, res) => {
    const {keyword} = req.query;
    let videos =[];
    if(keyword){
        videos = await Video.find({
            title: {$regex: new RegExp(`${keyword}$`, "i")},
        });
    }
    return res.render("search", {pageTitle:"Search", videos});
};
