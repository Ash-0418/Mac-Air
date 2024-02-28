import session from "express-session";
import User from "../models/User"
import bcrypt from "bcrypt"
import { URLSearchParams } from "url";


export const startGithubLogin = (req,res) => {
    const baseUrl ="https://github.com/login/oauth/authorize";
    const config= {
        client_id : process.env.CLIENT_ID,
        allow_sighup : false,
        scope : "read:user user:email"
    };
    const params = new URLSearchParams(config).toString();
    const finaUrl = `${baseUrl}?${params}`
    return res.redirect(finaUrl);
    
    
};

export const finishGithubLogin = async(req, res) =>{
    const baseUrl ="https://github.com/login/oauth/access_token";
    const config = {
        client_id:process.env.CLIENT_ID,
        clinet_secret:process.env.CLIENT_SECRET,
        code:req.qurey.code,
    };
    const params = new URLSearchParams(config).toString();
    const finaUrl = `${baseUrl}?${params}`;
    
    const tokenRequest = await (fetch(finaUrl, {
        method:"POST",
        header:{Accept:"application/json"}
        })
        ).json();
    if("access_token" in tokenRequest){
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userRequest = await(
            await fetch(`${apiUrl}/user`,{
            header:{Authorization:`token${access_token}`}
                })
            ).json();

        //email data
        const emailData = await(
            await fetch(`${apiUrl}/user/emails`,{
            header:{Authorization:`token ${access_token}`}
                })
            ).json();
            const emailObj = emailData.find(
                (email)=> email.primary === true && email.verified ===  true
            );
            if(!emailObj){
                return res.redirect("/login");
            }
            let user = await User.findOne({email:emailObj.email});
            if(!user){
                const user = await User.create({
                    avatarUrl: userData.avatar_url,
                    name: userData.name,
                    username: userData.login,
                    email: emailObj.email,
                    password:"",
                    socialOnly:true,
                    location: userDate.location,
                });
                req.session.loggedIn = true;
                req.session.user = user;
                return res.redirect("/");
                
            }else{
                return res.redirect("login");
                }

    }else{
        return res.redirect("/login");
    }
};






export const getJoin = (req, res) => res.render("join", {pageTitle:"Join"});
export const postJoin = async(req, res) => {
    const {name, email, username, password, password2, location} = req.body;
    const pageTitle = "Join"
    if(password !== password2){
        return res.status(400).render("Join",{
            pageTitle,
            errorMessage: "Password confirmation does not match",
        })
    };
    const exists = await User.exists({$or: [{username}, {email}]});
    if(exists){
        return res.status(400).render("Join", {
            pageTitle,
            errorMessage: "This username or email is already taken",
        })
    };
    try {
        await User.create({name, 
        email, 
        username, 
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
    const user = await User.findOne({username, socialOnly: false});

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

export const edit = (req, res) => res.send("Editor");

export const logout = (req, res) => {
    req.session.destroy(); 
    return res.redirect("/");
};
export const see = (req, res) => res.send("See User");