import morgan from "morgan";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "../src/router/rootRouter.js";
import userRouter from "../src/router/userRouter.js";
import videoRouter from "../src/router/videoRouter.js";
import { localsMiddelware } from "./middlewares.js";




//console.log(process.cwd()); //where is server open path

const app = express();
const logger = morgan("dev");

app.set("view engine","pug");
app.set("views", process.cwd() + "/src/views");
app.use(express.urlencoded({extended: true}));//server understad code post/get
app.use(logger);

//sessions need to start before routers do
app.use(
    session({
        secret: process.env.SECRCT_CODE,
        resave: false,
        saveUninitialized : false,
        store: MongoStore.create({mongoUrl:process.env.DB_URL}),
    })
);
app.use((req, res, next)=>{
    req.sessionStore.all((error, sessions)=>{
        console.log(sessions);
        next();
    })
});

app.get("/add-one",(req, res, next)=>{
    req.session.potato += 1;
    return res.send(`${req.session.id}\n${req.session.potato}`);
});



app.use(localsMiddelware);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);



export default app;