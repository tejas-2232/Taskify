import express, { Response } from 'express';
import multer from 'multer';
import Joi from 'joi';
import { prisma } from '../index';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { uploadFile, deleteFile, getSignedUrl } from '../utils/storage';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
});

// Validation schemas
const fileParamsSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

const uploadQuerySchema = {
  query: Joi.object({
    taskId: Joi.string().uuid().optional(),
  }),
};

// Upload file
router.post('/upload', 
  upload.single('file'), 
  validateRequest(uploadQuerySchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const { taskId } = req.query as { taskId?: string };
      const userId = req.user!.id;

      // Verify task ownership if taskId is provided
      if (taskId) {
        const task = await prisma.task.findFirst({
          where: {
            id: taskId,
            userId,
          },
        });

        if (!task) {
          res.status(404).json({ error: 'Task not found' });
          return;
        }
      }

      // Upload file to Google Cloud Storage
      const uploadResult = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        userId
      );

      // Save file metadata to database
      const fileRecord = await prisma.file.create({
        data: {
          filename: uploadResult.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          gcsPath: uploadResult.gcsPath,
          userId,
          taskId: taskId || null,
        },
      });

      res.status(201).json({
        message: 'File uploaded successfully',
        file: {
          id: fileRecord.id,
          filename: fileRecord.filename,
          originalName: fileRecord.originalName,
          mimeType: fileRecord.mimeType,
          size: fileRecord.size,
          createdAt: fileRecord.createdAt,
          taskId: fileRecord.taskId,
        },
      });
    } catch (error) {
      console.error('Upload file error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }
);

// Get all files for user
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { taskId } = req.query as { taskId?: string };

    const where: any = { userId };
    if (taskId) where.taskId = taskId;

    const files = await prisma.file.findMany({
      where,
      select: {
        id: true,
        filename: true,
        originalName: true,
        mimeType: true,
        size: true,
        createdAt: true,
        taskId: true,
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single file metadata
router.get('/:id', validateRequest(fileParamsSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const file = await prisma.file.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    res.json({ file });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download file
router.get('/:id/download', validateRequest(fileParamsSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const file = await prisma.file.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Generate signed URL for download
    const signedUrl = await getSignedUrl(file.gcsPath, 'read');

    res.json({
      downloadUrl: signedUrl,
      filename: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
    });
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

// Serve local files in development
router.get('/download/:filename', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    const userId = req.user!.id;

    // Check if file exists and belongs to user
    const file = await prisma.file.findFirst({
      where: {
        filename,
        userId,
      },
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Check if we're in local development
    const isLocalDev = !process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
    if (!isLocalDev) {
      res.status(404).json({ error: 'Direct file access not available in production' });
      return;
    }

    // Serve file from local filesystem
    const filePath = file.gcsPath; // This is the local path in dev mode
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File not found on filesystem' });
      return;
    }

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Serve file error:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

// Delete file
router.delete('/:id', validateRequest(fileParamsSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const file = await prisma.file.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Delete from Google Cloud Storage
    await deleteFile(file.gcsPath);

    // Delete from database
    await prisma.file.delete({
      where: { id },
    });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Attach file to task
router.put('/:id/attach/:taskId', validateRequest({
  params: Joi.object({
    id: Joi.string().uuid().required(),
    taskId: Joi.string().uuid().required(),
  }),
}), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, taskId } = req.params;
    const userId = req.user!.id;

    // Verify file ownership
    const file = await prisma.file.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Verify task ownership
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Update file to attach to task
    const updatedFile = await prisma.file.update({
      where: { id },
      data: { taskId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json({
      message: 'File attached to task successfully',
      file: updatedFile,
    });
  } catch (error) {
    console.error('Attach file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Detach file from task
router.put('/:id/detach', validateRequest(fileParamsSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const file = await prisma.file.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Update file to detach from task
    const updatedFile = await prisma.file.update({
      where: { id },
      data: { taskId: null },
    });

    res.json({
      message: 'File detached from task successfully',
      file: updatedFile,
    });
  } catch (error) {
    console.error('Detach file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
