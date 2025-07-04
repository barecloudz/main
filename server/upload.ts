import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
const pdfDir = path.join(uploadDir, 'pdfs');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store PDFs in the pdfs subdirectory
    cb(null, pdfDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename to prevent collisions
    const uniqueFilename = `${uuidv4()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, uniqueFilename);
  }
});

// File filter to only allow PDFs
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

// Create the multer instance with configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

// Helper function to get public URL for uploaded files
export const getFileUrl = (filename: string): string => {
  return `/uploads/pdfs/${filename}`;
};

// Helper function to delete a file
export const deleteFile = (filename: string): Promise<void> => {
  const filePath = path.join(pdfDir, filename);
  
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};