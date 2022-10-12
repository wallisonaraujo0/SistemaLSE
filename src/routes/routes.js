import { Router } from "express";
import { planilhaController } from "../controllers/planilhaController.js";
import { upload } from "../middlewares/multer.js"
const router = Router()

router.post("/planilhas/upload", upload.single("planilha"), planilhaController.planilhaUpload)
router.get("/planilhas/products", planilhaController.getProductsByPlanilha)
router.post("/planilhas/addvenda", planilhaController.addVendasByPlanilha)
router.post("/planilhas/addcupon", planilhaController.addCuponByPlanilha)
router.get("/planilhas/download", planilhaController.download)

//Clients
router.get("/clients", planilhaController.getAllClientsByPlanilha)
router.post("/clients", planilhaController.addClient)
router.post("/login", planilhaController.login)
router.post("/verify", planilhaController.verifyToken)
router.get("/cuponumber", planilhaController.getCuponNUmber)


export default router