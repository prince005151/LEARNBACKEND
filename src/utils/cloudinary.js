 import { v2 as cloudinary } from 'cloudinary';
 import fs from "fs"


 cloudinary.config({
    CLOUD_NAME : process.env.CLOUD_NAME,
    API_KEY : process.env.API_KEY,
    API_SECRET : process.env.API_SECRET
 })
 const uploadOnCloudinary = async (localFilePath) => {
   try {
      if(!localFilePath) return null
      const response = await cloudinary.uploader.upload(localFilePath,{public_id : file,resource_type:auto})
      console.log("file uploaded successfully on cloudinary",response.url)
      return response
   } catch (error) {
      fs.unlinkSync(localFilePath) //sync mean ye hona hi chaiye
      console.log(`Error to upload file: ${error}`)
      return null
   }
 }
 export {uploadOnCloudinary}