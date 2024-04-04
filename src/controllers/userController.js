import User from "../models/User";
import Video from "../models/Video";
import bcrypt from "bcrypt";
import fetch from "node-fetch";


export const getJoin = (req, res) => res.render("join", {pageTitle:"Join"});
export const postJoin = async(req, res) => {
    const {name, username, email, password, password2, location} = req.body;
    const pageTitle = "Join"
    if(password !== password2){
        return res.status(400).render("join",{
            pageTitle,
            errorMessage: "Password confirmation does not match",
        })
    };

    
    const exists = await User.exists({$or: [{username}, {email}]});
    if(exists){
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "This username or email is already taken",
        });
    };
    try {
        await User.create({
            name, 
            username,
            email, 
            password, 
            location
    });
    return res.redirect("/login");
       } catch (error) {
            return res.status(400).render("join", {
                pageTitle : "Join Error",
                errorMessage: error._message,
        });
    }
};


export const getLogin = (req, res) => res.render("login", {pageTitle: "Login"});

export const postLogin = async(req, res) => {
    const {username, password} = req.body;
    const pageTitle ="Login";
    const user = await User.findOne({ username});
//socialOnly :false
    if(!user){ 
        return res.status(400).render("login",{
            pageTitle,
            errorMessage:"An account with this username does not exists.",
        });
    };
    //check if the password correct
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){ 
        return res.status(400).render("login",{
            pageTitle,
            errorMessage:"Wrong password",
        });
    };

    //add data to session object 
    req.session.loggedIn = true;
    req.session.user = user;

    return res.redirect("/");
};

export const startGithubLogin = (req,res) => {
    const baseUrl ="https://github.com/login/oauth/authorize";
    const config= {
        client_id : process.env.GH_CLIENT,
        allow_sighup : false,
        scope : "read:user user:email"
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`
    return res.redirect(finalUrl);
    
    
};



export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
      client_id: process.env.GH_CLIENT,
      client_secret: process.env.GH_SECRET,
      code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    
    const tokenRequest = await (
      await fetch(finalUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      })
    ).json();
    if ("access_token" in tokenRequest) {
      const { access_token } = tokenRequest;
      const apiUrl = "https://api.github.com";
      const userData = await (
        await fetch(`${apiUrl}/user`, {
          headers: {
            Authorization: `token ${access_token}`,
          },
        })
      ).json();
      const emailData = await (
        await fetch(`${apiUrl}/user/emails`, {
          headers: {
            Authorization: `token ${access_token}`
          },
        })
      ).json();
      const emailObj = emailData.find(
        (email) => email.primary === true && email.verified === true
      );
      if (!emailObj) {
        return res.redirect("/login");
      }

      let user = await User.findOne({ email: emailObj.email });
      if (!user) {
        user = await User.create({
          avatarUrl: userData.avatar_url,
          name: userData.name,
          username: userData.login,
          email: emailObj.email,
          password: "",
          socialOnly: true,
          location: userData.location,
        });
      }
      req.session.loggedIn = true;
      req.session.user = user;
      return res.redirect("/");
    } else {
      return res.redirect("/login");
    }
  };


export const logout = (req, res) => {
    req.session.destroy(); 
    return res.redirect("/");
};


export const getEdit =(req, res) => {
    return res.render("edit-profile",{pageTitle:"Edit Profile"});
};

export const postEdit = async(req, res) => {
    const {
        session: {
          user: { _id, avatarUrl},
        },
        body: { name, email, username, location },
         file,
      } = req;
      console.log(file);
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
          avatarUrl :file ? file.path : avatarUrl, 
            name, email, username, location,
        },
        {new: true}
      );
    req.session.user = updatedUser;    
    return res.redirect("/users/edit");
};
//change password
export const getChangePassword = (req, res) =>{
  //if(req.session.user.socialOnly === ture){return res.redirect("/");}
  return res.render("users/change-password",{pageTitle:"change Password"})
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password},
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation",
    });
  }
  user.password = newPassword;
  console.log(password);
  await user.save();
  console.log(password);
  req.session.destroy();
  return res.redirect('/');
};


export const see = async(req, res) => {
  const {id} = req.params;//모두에게 공개될 페이지이기 때문에 curl로 아이디 가져오기
  const user = await User.findById(id).populate("videos");
  if(!user) {
    return res.status(404).render("404", {pageTitle: "User not found"});
  }
  return res.render("users/profile", {
    pageTitle: user.name,
    user,
    
  });
};

