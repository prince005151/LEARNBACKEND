import { userRegister,userLogin} from "../controllers/user.controller";
import Router from "express-Router"
const router = Router();
router.route("/register").post(userRegister)
router.route("/login").post(userLogin)

export default {router}