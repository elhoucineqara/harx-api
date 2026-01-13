import express, { Request, Response } from 'express';
import { protect } from '../middleware/auth';
import Lead from '../models/Lead';
import mongoose from 'mongoose';
import dbConnect from '../lib/dbConnect';
import {
  getLeads,
  getLead,
  createLead,
  createBulkLeads,
  updateLead,
  deleteLead,
  analyzeLead,
  generateScript
} from '../controllers/LeadsController';
// @ts-ignore - csv-parser may not have types
import csvParser from "csv-parser";
// @ts-ignore - multer types may not be installed
import multer from "multer";
import { Readable } from "stream";

const router = express.Router();

const storage = multer.memoryStorage(); // Stockage en mémoire
const upload = multer({ storage: storage });

router.post("/upload-csv", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Aucun fichier reçu." });
    }

    const results: any[] = [];
    const buffer = req.file.buffer.toString("utf-8").replace(/^\uFEFF/, "").trim();

    // Détection automatique du séparakteur
    const separator = buffer.includes(";") ? ";" : ",";
    console.log(`Utilisation du séparateur : '${separator}'`);

    const bufferStream = Readable.from(buffer);

    bufferStream
      .pipe(csvParser({ separator }))
      .on("data", (row: any) => {
        console.log("Ligne brute lue :", row);

        // Mapping des colonnes du CSV vers les champs attendus
        const cleanedRow = {
          name: row["Deal_Name"] ? row["Deal_Name"].trim() : "",
          email: row["Email_1"] ? row["Email_1"].trim() : "",
          phone: row["Phone"] ? row["Phone"].trim() : "",
          company: row["Pipeline"] ? row["Pipeline"].trim() : "",
          stage: row["Stage"] ? row["Stage"].trim() : "",
        };

        console.log("Ligne après mapping :", cleanedRow);

        // Vérification des champs obligatoires
        if (
          !cleanedRow.name ||
          !cleanedRow.email ||
          !cleanedRow.phone ||
          !cleanedRow.company
        ) {
          console.warn(`Champs manquants pour la ligne :`, cleanedRow);
          return; // Ignore cette ligne
        }

        // Ajout du lead si toutes les validations passent
        results.push(cleanedRow);
      })
      .on("end", async () => {
        if (results.length > 0) {
          try {
            await Lead.insertMany(results);
            return res.status(200).json({
              success: true,
              message: `${results.length} leads ont été enregistrés avec succès.`,
              data: results,
            });
          } catch (dbError) {
            console.error(
              "Erreur lors de l'enregistrement dans la base de données:",
              dbError
            );
            return res.status(500).json({
              success: false,
              message: "Erreur lors de l'enregistrement des leads.",
            });
          }
        } else {
          return res.status(400).json({
            success: false,
            message: "Aucun lead valide trouvé dans le fichier.",
          });
        }
      });
  } catch (error) {
    console.error("Erreur lors du traitement du fichier:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});


router.route("/").get(getLeads).post(createLead);
// Bulk create leads endpoint (must be before parameterized routes)
router.post("/bulk", createBulkLeads);

// IMPORTANT: Specific routes must be defined BEFORE parameterized routes
// Get leads by gig ID with pagination
router.get("/gig/:gigId", async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { gigId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (!mongoose.Types.ObjectId.isValid(gigId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Gig ID format'
      });
    }

    const skip = (page - 1) * limit;

    // Get leads for this gig with pagination
    const leads = await Lead.find({ gigId: new mongoose.Types.ObjectId(gigId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Lead.countDocuments({ gigId: new mongoose.Types.ObjectId(gigId) });
    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      data: leads,
      total,
      currentPage: page,
      totalPages,
      limit
    });
  } catch (error: any) {
    console.error('Error fetching leads by gig ID:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch leads'
    });
  }
});

// Search leads by gig ID
router.get("/gig/:gigId/search", async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { gigId } = req.params;
    const searchQuery = req.query.search as string;
    
    if (!mongoose.Types.ObjectId.isValid(gigId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Gig ID format'
      });
    }

    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    // Build search filter
    const searchFilter = {
      gigId: new mongoose.Types.ObjectId(gigId),
      $or: [
        { Deal_Name: { $regex: searchQuery, $options: 'i' } },
        { Email_1: { $regex: searchQuery, $options: 'i' } },
        { Phone: { $regex: searchQuery, $options: 'i' } },
        { Pipeline: { $regex: searchQuery, $options: 'i' } }
      ]
    };

    const leads = await Lead.find(searchFilter)
      .sort({ createdAt: -1 })
      .limit(100) // Limit search results to 100
      .lean();

    return res.json({
      success: true,
      data: leads,
      total: leads.length,
      currentPage: 1,
      totalPages: 1
    });
  } catch (error: any) {
    console.error('Error searching leads by gig ID:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to search leads'
    });
  }
});

// Check if company has leads
router.get("/company/:companyId/has-leads", async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { companyId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Company ID format'
      });
    }

    const leadCount = await Lead.countDocuments({ companyId });
    const hasLeads = leadCount > 0;
    
    return res.json({ 
      success: true, 
      hasLeads,
      count: leadCount
    });
  } catch (error: any) {
    console.error('Error checking company leads:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Parameterized routes (must be defined AFTER specific routes)
router.route("/:id").get(getLead).put(updateLead).delete(deleteLead);
router.route("/:id/analyze").post(analyzeLead);
router.route("/:id/generate-script").post(generateScript);

// TODO: Implement these functions in LeadsController
// router.route("/user/:userId").get(getLeadsByUserId);
// router.route("/filter").get(getLeadsByPipelineAndStage);

export default router;
