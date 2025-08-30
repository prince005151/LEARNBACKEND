import { asyncHandler } from "../utils/asyncHandler";
import {uploadOnCloudinary} from "../utils/cloudinary";
import {body,validationResult} from "express-validator";  
import {ApiError} from "../utils/ApiError" 
import {ApiResponse} from "../utils/ApiResponse"
import {path} from "path";

const userRegister = asyncHandler(async ( )=> {

    //write comment for user registration
    //take data from body or user
    //check either any filed is empty or not
    //check email format
    //check either user is registered or not if yes redirect login page
    // 
    const {username,fullName,email,password} = req.body
    if (!(username || email || password || fullName)){
        return new ApiResponse(403,{message:"all fields are required"})
    }  
    body('email').isEmail().withMessage(`Invalid email formate :`,"123@email.com")
    body('password').isLength({min:8}).withMessage('password must be atleast 8 character')
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        return new ApiError(501,"avatar is required")
    }else{
        await uploadOnCloudinary(avatarLocalPath)
    }


    const search = username || email
    const query = {
        $or : [
            {username:{$regex:search,$options:'i'}},
            {email:{$regex:search,$options:'i'}}
        ]
    }
    const userExist = await User.findOne(query)
    if(userExist){
        return new ApiError(409,"user exist with this username or email")
    }
    if(!userExist){
        const newUser = new User({username,
            email,
            fullName,
            refreshToken,
            coverImage:coverImageLocalPath?.path || "",
            avatar,
            password:hashedPassword})
        await newUser.save()
        const res = newUser.findById(_id).select(-password -refreshToken)
        res.status(200).json({message:"user is registered successfully"})
    }else{
        return new ApiError(501,{message:"server Error"})
    }   
}) 
const userLogin = asyncHandler(() => {
    res.status(201).json({message:"user successfully login"})
})










export {
    userRegister,
    userLogin,
}