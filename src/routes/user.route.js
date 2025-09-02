import { userRegister,userLogin, userLogout,refreshAccessToken} from "../controllers/user.controller";
import Router from "express-Router"
import { verifyJWT } from "../middlewares/auth.middlewares";
const router = Router();
router.route("/register").post(userRegister)
router.route("/login").post(verifyJWT,userLogin)

router.route('/logout').post(userLogout)
router.route("/refreshToken").post(refreshAccessToken)

export default {router}