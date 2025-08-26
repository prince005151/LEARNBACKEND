
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

export default connectDB

/*

require(dotenv).config()
import {DB_NAME} from "./constants"
import express from "express";
const app = express();
import mongoose from "mongoose";
;( async()=>{
    try {
         await mongoose.connect( `${process.env.MONGODB_URI}/{DB_NAME}`)
        app.on('Databases connected',() => {
            app.listen('process.env.PORT || 3000', () => {
                console.log(`app listen on port no  ${port}`);
            })
        })

    } catch (error) {
        res.status(304).send("Error to connect Databases : " `${error}`)
    }

})()
    
*/