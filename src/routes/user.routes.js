import { userRegister,userLogin, userLogout,refreshAccessToken, changePassword, getCurrentUser ,updateAccountDetails,updateUserAvatar,getWatchHistory,getUserChannelProfile,updateUserCoverImage} from "../controllers/user.controller";
import Router from "express-Router"
import { verifyJWT } from "../middlewares/auth.middlewares";
const router = Router();
router.route("/register").post(userRegister)
router.route("/login").post(verifyJWT,userLogin)

router.route('/logout').post(userLogout)
router.route("/refreshToken").post(refreshAccessToken)
router.route("/change_password").post(changePassword)
router.route("/currentUser").post(getCurrentUser)
router.route("/acountDetails").post(updateAccountDetails)
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(getUserChannelProfile)
router.route("/getwatchHistory").get(getWatchHistory)


export default {router}