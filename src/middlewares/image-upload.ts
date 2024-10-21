import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback, MulterError } from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';

// Configure S3Client from AWS SDK v3
const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

// Set up Multer to upload files to S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME!,
        metadata: (req: Request, file: Express.Multer.File, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req: Request, file: Express.Multer.File, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
            cb(null, `profile-pictures/${filename}`);
        },
    }),
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const allowedTypes = /jpeg|jpg|png/;
        const isValidMime = allowedTypes.test(file.mimetype);
        const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (isValidMime && isValidExt) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

const optionalUpload = (fieldName: string) => {
    // console.log("optionalUpload: ", fieldName);
    return (req: Request, res: Response, next: NextFunction) => {
        // console.log("optionalUpload 2: ", fieldName);
        // console.log(req);

        upload.single(fieldName)(req, res, (err: any) => {
            if (err instanceof MulterError) {
                return res.status(400).json({ message: `Multer error: ${err.message}` });
            } else if (err) {
                return res.status(500).json({ message: `Server error: ${err.message}` });
            }

            if (req.file) {
                console.log("Uploaded file: ", req.file); // This should now show the uploaded file details
            } else {
                console.log("No file uploaded."); // This will run if no file was provided
            }

            next(); // Proceed even if no file is uploaded
        });
    };
}

// API to upload profile picture
// app.post('/upload/profile-picture', upload.single('profilePicture'), (req: Request, res: Response) => {
//     if (!req.file) {
//         return res.status(400).json({ message: 'Please upload a valid image file.' });
//     }

//     const fileUrl = (req.file as Express.MulterS3.File).location; // Get the S3 file URL
//     res.status(200).json({
//         message: 'Profile picture uploaded successfully!',
//         fileUrl: fileUrl,
//     });
// });

// // Error handling middleware
// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//     if (err instanceof MulterError) {
//         return res.status(400).json({ message: `Multer error: ${err.message}` });
//     } else if (err) {
//         return res.status(500).json({ message: `Server error: ${err.message}` });
//     }
//     next();
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });

export default { upload, optionalUpload };