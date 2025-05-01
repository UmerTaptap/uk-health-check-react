import { Router } from 'express';
import { createManager, createGroup, assignManagerToGroup, listGroups, listManagers } from '../controllers/OwnerController';
import authMiddleware, { authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.post('/create-manager', authMiddleware, authorizeRoles('OWNER'), createManager);
router.post('/create-group', authMiddleware, authorizeRoles('OWNER'), createGroup);
router.post('/assign-group-manager', authMiddleware, authorizeRoles('OWNER'), assignManagerToGroup);

router.get('/groups', authMiddleware, authorizeRoles('OWNER', 'MANAGER'), listGroups);
router.get('/managers', authMiddleware, authorizeRoles('OWNER'), listManagers);

export default router;
