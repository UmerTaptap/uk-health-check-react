import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import Property from "../models/Property";
import User, { UserRole } from "../models/User";

export class PropertyController extends BaseController {
    public async getAllProperties(req: Request, res: Response): Promise<any> {
        // try {
        //     const properties = await Property.find().populate("propertyDetails.propertyManager");
        //     // res.status(200).json(properties);
        //     // return;
        //     if (properties.length === 0) {
        //         this.errorResponse(res, 404, "No properties found");
        //         return;
        //     }

        //     this.jsonResponse(res, 200, "Properties retrieved successfully", properties);
        // } catch (error) {
        //     this.errorResponse(res, 500, "Failed to retrieve properties", error);
        // }

        const user = (req as any).user;

        try {
            let properties;

            if (user.role === UserRole.Owner) {
                properties = await Property.find({ owner: user._id })
                    .populate('manager', 'email role')
                    .populate('group', 'name');
            } else if (user.role === UserRole.Manager) {
                properties = await Property.find({ manager: user._id })
                    .populate('owner', 'email role')
                    .populate('group', 'name');
            } else {
                return res.status(403).json({ message: 'Access denied' });
            }

            res.json({ properties });
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }

    public async getUserProperties(req: Request, res: Response): Promise<void> {
        try {
            // const userId = req.params.id;
            const properties = await Property.find({ "propertyDetails.propertyManager": (req as any).user._id })
                .populate("propertyDetails.propertyManager");

            if (!properties || properties.length === 0) {
                this.errorResponse(res, 404, "No properties found");
                return;
            }
            this.jsonResponse(res, 200, "Properties retrieved successfully", properties);
        } catch (error) {
            this.errorResponse(res, 500, "Failed to retrieve properties", error);
        }
    }

    public async deleteProperties(req: Request, res: Response): Promise<void> {
        try {
            const properties = await Property.deleteMany({});
            if (properties.deletedCount === 0) {
                this.errorResponse(res, 404, "No properties found to delete");
                return;
            }
            this.jsonResponse(res, 200, "Properties deleted successfully", properties);
        } catch (error) {
            this.errorResponse(res, 500, "Failed to delete properties", error);
        }
    }

    public async addProperty(req: Request, res: Response): Promise<any> {
        try {
            const { name, address, description, managerId, groupId, propertyDetails, compliance } = req.body;
            const currentUser = (req as any).user;

            const user = await User.findById(currentUser._id);
            if (!user) {
                this.errorResponse(res, 404, "User not found");
                return;
            }

            const newProperty = new Property({
                name,
                address,
                description,
                owner: currentUser.role === UserRole.Owner ? currentUser._id : currentUser.createdBy,
                manager: currentUser.role === UserRole.Manager ? currentUser._id : managerId,
                group: groupId || undefined,
                propertyDetails: {
                    ...propertyDetails,
                    propertyManager: user._id,
                },
                compliance: {
                    ...compliance,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            await newProperty.save();
            console.log("New Property: ", newProperty);
            res.status(200).json({ message: 'Property addedd successfully', newProperty, currentUser });
            // this.jsonResponse(res, 201, "Property added successfully", newProperty, currentUser);
        } catch (error) {
            this.errorResponse(res, 500, "Failed to add property", error);
        }
    }

    public async assginPropertyToGroup(req: Request, res: Response): Promise<any> {
        const { groupId, propertyId } = req.body;
        const currentUser = (req as any).user;

        if (currentUser.role === UserRole.Owner) {
            const property = await Property.find({owner: currentUser._id});
            res.status(200).json({mssage: 'This is owner', property});
        }

        else
        if (currentUser.role === UserRole.Manager) {
            const property = await Property.find({manager: currentUser._id});
            res.status(200).json({mssage: 'This is manager', property});
        }
    }
}


