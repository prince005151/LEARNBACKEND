import { userRegister,userLogin, userLogout,refreshAccessToken, changePassword, getCurrentUser} from "../controllers/user.controller";
import Router from "express-Router"
import { verifyJWT } from "../middlewares/auth.middlewares";
const router = Router();
router.route("/register").post(userRegister)
router.route("/login").post(verifyJWT,userLogin)

router.route('/logout').post(userLogout)
router.route("/refreshToken").post(refreshAccessToken)
router.route("/change_password").post(changePassword)
router.route("/currentUser").post(getCurrentUser)
router.route("/acountDetails").post("updateAccountDetails")

export default {router}