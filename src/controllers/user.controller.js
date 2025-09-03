import { asyncHandler } from "../utils/asyncHandler";
import { jwt } from "jsonwebtoken";   
import {uploadOnCloudinary} from "../utils/cloudinary";
import {body,validationResult} from "express-validator";  
import {ApiError} from "../utils/ApiError" 
import {ApiResponse} from "../utils/ApiResponse"
import path from "path";


const generateAccessAndRefereshTokens = async (userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const userRegister = asyncHandler(async ( req,res)=> {

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

const userLogin = asyncHandler(async (req,res) => {
    //get data from body username email password
    //compare credentials
    //genrate accessToken and refreshToken 
    //at time save refreshToken in database to validate after expiary 
    //at last sent cokkie as a response
    const {username,email,password} = req.body
    if(!username || !email){
        throw new ApiError(504,"username or email is required")
    }
    const user = User.findOne({
        $or : [{username},{email}]
    })
    if(!user){
        return new ApiError(504,"user not exist")
    }
    const isPasswordValid = isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(501,"Invalid credentials")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )




    
       


    


    
    
})

const userLogout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req,res) => {
   try {
    const incomingRefreshToken = req.cookie.refreshToken || req.body
    if(incomingRefreshToken) {
        throw new ApiError(501,"Unauthorized access")
    }
    const decoded = await jwt.verify(incomingRefreshToken,process.env.REFRESH_SECRET_KEY)
    const user = User.findById(decoded._id)
    if(!user){
        throw new ApiError(502,"Invalid refreshToken")
    }
    const {accessToken,newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
    const options = {
        httpOnly : true,
        secure : true
    }

    res.status(201)
    .cookie("accessToken",accessToken,options)
    .cokkie("refreshToken",newRefreshToken,options)
    .json(
        new ApiResponse(200,
            {
                accessToken,refreshToken : newRefreshToken
            },
            "refreshedToken is Refreshed"
        )
    )
   } catch (error) {
    throw new ApiError(501,error?.message)
   } 
})

const changePassword = asyncHandler(async (req,res) => {
    const {oldPassword,newPassword} = req.body
    const isPasswordValid = isPasswordCorrect(oldPassword)
    if(!isPasswordValid) {
        throw new ApiError(402,"enter correct password")
    }
    req.user = user //need more understandings
    const user = await User.findById(user?._id).select(-password)
    user.password = newPassword
    password.save()
    return new ApiResponse(200,{user},"password change successfully")
})
 
const getCurrentUser = asyncHandler(async (req,res) => {
    req.user = user
    res.status(200).
    json(    
        new ApiResponse(200 ,`current user : ${req.user}`)
    )
})

const updateAccountDetails = asyncHandler(async (req,res) => {
    const {username,email} = req.body
    if(!username || !email){
        throw new ApiError(402,"fields value required to update")
    }
    req.user = user
    const updatedUser = await User.findByIdAndUpdate(user?._id,
        {
            $set : {
                username : username,
                email : email
            }

        },
        {validateBeforeSave : false },
        {new : true}
    ).select(-password)
    if(!updatedUser) {
        throw new ApiError(501,"server Error")
    }
    res.status(200).
    json(
        new ApiResponse(200,
            {updatedUser},
            "user updated successfully"
        )
    )

})

const updateUserAvatar = asyncHandler(async (req,res) => {
    const localFilePath = req.file?.path
    if(!localFilePath) {
        throw new ApiError(401,"file path is required")
    }
    const avatarFile =await uploadOnCloudinary(localFilePath)
    if(!avatarFile) {
        throw new ApiError(501,"error while uploading file on cloudinary")
    }
    const updatedDetails = await User.findByIdAndUpdate(req.user?._id,
        {
            $set : {
                avatar : avatarFile?.url
            }
        },
        {new : true}
    ).select(-password)
    return res
    .status(200).
    json(
        new ApiResponse(200,
            {updatedDetails},
            "Avatar is updated successfully."
        )
    )

})

const updateUserCoverImage = asyncHandler(async (req,res) => {
    const localCoverImagePath = req.file.path
    if(!localCoverImagePath) {
        throw new ApiError(402,"coverImage is required")
    }
    const coverImageFile = await uploadOnCloudinary(localCoverImagePath)
    if(coverImageFile) {
        throw new ApiError(501,"error occured while uploading coverImage")
    }
     const updatedCoverImage = await User.findByIdAndUpdate(req.user?._id,
        {
            $set : {
                coverImage : coverImageFile.url
            }
            
        },
        {new :true}
    ).select(-password)
    return res
    .status(200)
    .json(
        new ApiResponse(200,{updatedCoverImage},"coverImage is updated successfully")
    )

})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})





export {
    userRegister,
    userLogin,
    userLogout,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory

}