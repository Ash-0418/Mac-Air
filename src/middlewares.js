import multer from "multer";

export const localsMiddelware =(req, res, next)=>{
    res.locals.loggedIn =Boolean(req.session.loggedIn);
    res.locals.siteName ="Wetube";
    res.locals.loggedInUser = req.session.user || {};
    console.log(res.locals);
    next();

};


export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
      return next();
    } else {
      return res.redirect("/login");
    }
  };
  
  export const publicOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) {
      return next();
    } else {
      return res.redirect("/");
    }
  };

export const avatarUpolad = multer({
  dest:"uploads/avartars/",
  limits:{
    fileSize:30000000,
  }
});
export const videoUpload = multer({
  dest:"uploads/videos/",
  limits:{
    fileSize: 10000000000,
  }
});
