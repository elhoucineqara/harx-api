import express, { Request, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
const router = express.Router();

// Configuration multer pour l'upload de fichiers
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

/**
 * Endpoint SSE pour traiter les fichiers de manière non-bloquante
 * POST /api/file-processing/process-sse
 * Le frontend doit utiliser EventSource pour recevoir les résultats progressivement
 */
router.post('/process-sse', upload.single('file'), async (req: Request, res: Response) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
  
  try {
    const file = req.file;

    if (!file) {
      res.write(`data: ${JSON.stringify({ error: 'No file uploaded' })}\n\n`);
      res.end();
      return;
    }

    // Send initial progress
    res.write(`data: ${JSON.stringify({ progress: 10, status: 'Reading file...' })}\n\n`);

    // Process file (same logic as before but send progress via SSE)
    let fileContent = '';
    let fileType = '';
    
    const fileExtension = file.originalname.toLowerCase().split('.').pop();
    
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      fileType = 'Excel';
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const headers = jsonData[0];
      const dataRows = jsonData.slice(1);
      const csvFormat = [
        (headers as any[]).join(','),
        ...(dataRows as any[]).map((row: any) => (row as any[]).map((cell: any) => `"${cell || ''}"`).join(','))
      ].join('\n');
      fileContent = csvFormat;
    } else if (fileExtension === 'csv') {
      fileType = 'CSV';
      fileContent = file.buffer.toString('utf8');
    } else if (fileExtension === 'json') {
      fileType = 'JSON';
      fileContent = file.buffer.toString('utf8');
    } else if (fileExtension === 'txt') {
      fileType = 'Text';
      fileContent = file.buffer.toString('utf8');
    } else {
      fileType = 'Unknown';
      fileContent = file.buffer.toString('utf8');
    }

    const lines = fileContent.split('\n');
    const totalRows = lines.length - 1;

    res.write(`data: ${JSON.stringify({ progress: 30, status: `Processing ${totalRows} rows...`, totalRows })}\n\n`);

    // Process in very small batches and send progress
    const batchSize = totalRows > 10000 ? 10 : 100;
    const totalBatches = Math.ceil(totalRows / batchSize);
    const allLeads: any[] = [];

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize + 1;
      const endIndex = Math.min(startIndex + batchSize, lines.length);
      
      // Process batch
      for (let i = startIndex; i < endIndex; i++) {
        // Simple parsing (you can use your existing parseLeadFromCSVRowDynamic)
        const columns = lines[i].split(',');
        if (columns.length > 0) {
          allLeads.push({
            Deal_Name: columns[0] || `Lead ${i}`,
            Email_1: columns.find((col: string) => col.includes('@')) || 'no-email@placeholder.com',
            Phone: columns.find((col: string) => /^\+?[\d\s-]+$/.test(col)) || '',
            Stage: 'New',
            Pipeline: 'Sales Pipeline'
          });
        }
      }

      // Send progress update
      const progress = Math.min(30 + Math.round((batchIndex + 1) / totalBatches * 60), 90);
      res.write(`data: ${JSON.stringify({ 
        progress, 
        status: `Processed ${Math.min((batchIndex + 1) * batchSize, totalRows)}/${totalRows} rows...`,
        processed: Math.min((batchIndex + 1) * batchSize, totalRows),
        total: totalRows
      })}\n\n`);

      // Yield to allow browser to process events
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Send final results
    res.write(`data: ${JSON.stringify({ 
      progress: 100, 
      status: 'Complete',
      success: true,
      data: {
        leads: allLeads,
        validation: {
          totalRows,
          validRows: allLeads.length,
          invalidRows: 0
        }
      }
    })}\n\n`);

    res.end();

  } catch (error: any) {
    res.write(`data: ${JSON.stringify({ 
      error: error.message || 'Error processing file',
      success: false 
    })}\n\n`);
    res.end();
  }
});

export default router;

