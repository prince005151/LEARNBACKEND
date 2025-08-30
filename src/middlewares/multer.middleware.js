import multer from "multer"
import path from "path"
const storage = multer.diskStorage({
    destination : ( req,file,cb) => { 
        cb(null,'./uploads')
    },
    filename : (req,file,cb) => {
        const newFileName = Date.now + path.extname(file.originalname)
        cb(null,newFileName)
    }
}) 
const limits = {fileSize : 1024*1024*5}
export const upload = multer({
    storage:storage,
    limits:limits
})