import express from "express";
import GigController from '../controllers/GigController';

const router = express.Router();

router.post("/", GigController.create.bind(GigController));
router.get("/", GigController.getAll.bind(GigController));
router.get("/user/:userId", GigController.getGigsByUserId.bind(GigController));
router.get("/company/:companyId", GigController.getGigsByCompanyId.bind(GigController));
router.get("/company/:companyId/has-gigs", GigController.hasCompanyGigs.bind(GigController));
router.get("/company/:companyId/has-leads", GigController.hasCompanyLeads.bind(GigController));
router.get("/:id", GigController.getById.bind(GigController));
router.put("/:id", GigController.update.bind(GigController));
router.delete("/:id", GigController.delete.bind(GigController));

export default router;
