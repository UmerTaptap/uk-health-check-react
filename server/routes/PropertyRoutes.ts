import authMiddleware, { authorizeRoles } from 'server/middleware/authMiddleware';
import { PropertyController } from '../controllers/PropertyController';
import { BaseRoute } from './BaseRoute';

export class PropertyRoutes extends BaseRoute<PropertyController> {
    constructor(controller: PropertyController) {
        // Mandatory super() call with controller
        super(controller);
    }

    protected registerRoutes(): void {
        // Properly initialized router available here
        this.router.get('/properties/list', authMiddleware, authorizeRoles('OWNER', 'MANAGER'), (req, res) =>
            this.controller.getAllProperties(req, res)
        );

        this.router.get('/properties/user', authMiddleware, (req, res) =>
            this.controller.getUserProperties(req, res)
        );

        this.router.post('/properties/delete', authMiddleware, (req, res) =>
            this.controller.deleteProperties(req, res)
        );

        this.router.post('/properties/add', authMiddleware, authorizeRoles('OWNER', 'MANAGER'), (req, res) =>
            this.controller.addProperty(req, res)
        );

        this.router.put('/assign-group-properties/', authMiddleware, authorizeRoles('OWNER', 'MANAGER'), (req, res) =>
            this.controller.assginPropertiesToGroup(req, res)
        );

        this.router.get('/group-properties/:groupId', authMiddleware, authorizeRoles('OWNER', 'MANAGER'), (req, res) =>
            this.controller.getGroupProperties(req, res)
        );

        // this.router.post('/properties/create', (req, res) =>
        //   this.controller.createProperty(req, res)
        // );

        // this.router.get('/properties/:id', (req, res) =>
        //   this.controller.getPropertyById(req, res)
        // );

        // this.router.post('/properties/delete/:id', (req, res) =>
        //   this.controller.deletePropertyById(req, res)
        // );
    }
}