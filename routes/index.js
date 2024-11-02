var express = require('express');
const { runCodeGeneration } = require('prisma-to-code');
const multer = require('multer');
const path = require('path');
const archiver = require('archiver');
const fs = require('fs');
const Queue = require('bull');

const router = express.Router();
const UPLOAD_DIR = 'tmp/uploads';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const OUTPUT_DIR = 'tmp/schemas';
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Set up a job queue
const codeGenerationQueue = new Queue('code generation', {
  // redis: {
  //   host: process.env.REDIS_HOST,
  //   port: process.env.REDIS_PORT,
  //   password: process.env.REDIS_PASSWORD,
  //   tls: {} // Required by Upstash
  // }
});

// Job processor
codeGenerationQueue.process(async (job) => {
  try {
    console.log(`Processing job:`);
    const { filePath, outputFileName } = job.data;
    console.log(`Processing job: ${job.id}, filePath: ${filePath}, outputFileName: ${outputFileName}`);

    // Run code generation
    await runCodeGeneration(filePath, outputFileName);

    // Create a ZIP file
    const zipFilePath = path.join(OUTPUT_DIR, `${path.basename(outputFileName)}.zip`);
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    archive.file(filePath, { name: path.basename(filePath) });
    archive.directory(path.dirname(outputFileName), false);
    await archive.finalize();
    await new Promise((resolve, reject) => setTimeout(resolve, 10000));

    console.log(`Job completed: ${job.id}`);
    return zipFilePath;
  } catch (error) {
    console.error(error);
    throw error;
  }// Return the path of the created zip
});



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Create a unique filename
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only .prisma files
    if (path.extname(file.originalname) !== '.prisma') {
      return cb(new Error('Only .prisma files are allowed!'), false);
    }
    cb(null, true);
  }
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/generate-code', upload.single('schema'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    console.log(req.file);

    // Add a job to the queue
    const job = await codeGenerationQueue.add({
      filePath: req.file.path,
      outputFileName: path.join(OUTPUT_DIR, req.file.filename)
    });

    // Respond immediately with job details or an identifier
    // res.status(202).json({ message: 'Job is being processed', jobId: job.id });
    res.render('index', { title: 'Express', jobId: job.id });
  } catch (error) {
    console.log(error);
    res.render('index', { title: 'Express', error: error.message });
  }
});

// Route to download the zip file by job ID
router.get('/download/:jobId', async (req, res, next) => {
  const job = await codeGenerationQueue.getJob(req.params.jobId);
  if (!job) {
    return res.status(404).send('Job not found');
  }

  job.finished().then((zipFilePath) => {
    res.download(zipFilePath, `${path.basename(zipFilePath)}`, (err) => {
      if (err) {
        console.error('Error sending the file:', err);
      }
      fs.unlinkSync(zipFilePath); // Optionally delete the zip file after download
    });
  }).catch(err => {
    res.status(500).send('Error processing job');
  });
});



module.exports = router;
