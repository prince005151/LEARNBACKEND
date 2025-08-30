import express from "express"
import cookieParser from "cookie-parser"

import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
app.use(cors({
    oringin:process.env.CORS_ORIGIN,
    credentials:true
}))

// some configuration
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser)

//routes import 
import userRouter from './routes/user.route.js';


//routes Declaration
app.use('/api/v1/users',userRouter)

export {app}