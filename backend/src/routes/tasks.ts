import express, { Response } from 'express';
import Joi from 'joi';
import { prisma } from '../index';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Validation schemas
const createTaskSchema = {
  body: Joi.object({
    title: Joi.string().required().max(255),
    description: Joi.string().optional().allow('').max(2000),
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED').default('PENDING'),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').default('MEDIUM'),
    dueDate: Joi.date().iso().optional().allow(null),
  }),
};

const updateTaskSchema = {
  body: Joi.object({
    title: Joi.string().optional().max(255),
    description: Joi.string().optional().allow('').max(2000),
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED').optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
    dueDate: Joi.date().iso().optional().allow(null),
  }),
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

const taskParamsSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

const querySchema = {
  query: Joi.object({
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED').optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
    search: Joi.string().optional().allow(''), // ADD THIS LINE
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'dueDate', 'title').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

// Get all tasks for user
router.get('/', validateRequest(querySchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, priority, search, page, limit, sortBy, sortOrder } = req.query as any;
    
    // Debug logging (can be removed in production)
    console.log('📋 Tasks API Request:', {
      userId: req.user!.id,
      search: search || 'none',
      filters: { status, priority }
    });
    
    // Convert string query params to numbers
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build where clause with proper AND/OR logic
    const baseFilters: any = {
      userId: req.user!.id,
    };

    // Add status and priority filters to base
    if (status) baseFilters.status = status;
    if (priority) baseFilters.priority = priority;

    let where: any;

    // Handle search with proper AND/OR structure
    if (search && search.trim()) {
      const searchTerm = search.trim();
      where = {
        AND: [
          baseFilters,
          {
            OR: [
              { title: { contains: searchTerm } },
              { description: { contains: searchTerm } }
            ]
          }
        ]
      };
      console.log('🔍 Search term:', searchTerm);
    } else {
      where = baseFilters;
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get tasks with pagination
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          files: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              size: true,
              createdAt: true,
            },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.task.count({ where }),
    ]);

    // Log search results for debugging
    if (search) {
      console.log('📊 Search results:', { foundTasks: tasks.length, total, searchTerm: search });
    }

    res.json({
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single task
router.get('/:id', validateRequest(taskParamsSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
      include: {
        files: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            size: true,
            createdAt: true,
          },
        },
      },
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create task
router.post('/', validateRequest(createTaskSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.user!.id,
      },
      include: {
        files: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            size: true,
            createdAt: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task
router.put('/:id', validateRequest(updateTaskSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate } = req.body;

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Update task
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
      include: {
        files: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            size: true,
            createdAt: true,
          },
        },
      },
    });

    res.json({
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete task
router.delete('/:id', validateRequest(taskParamsSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Delete task (files will be set to null due to cascade)
    await prisma.task.delete({
      where: { id },
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get task statistics
router.get('/stats/overview', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks
    ] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'PENDING' } }),
      prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.task.count({
        where: {
          userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { lt: new Date() }
        }
      })
    ]);

    res.json({
      stats: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        overdue: overdueTasks,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
