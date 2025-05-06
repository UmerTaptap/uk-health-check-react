import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import Property from "../models/Property";
import User, { UserRole } from "../models/User";
import Group from "../models/Group";

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

    public async assginPropertiesToGroup(req: Request, res: Response): Promise<any> {
        const { groupId, propertyIds } = req.body;
        const currentUser = (req as any).user;

        try {
            if (!groupId || !Array.isArray(propertyIds)) {
                return res.status(400).json({ message: 'groupId and propertyIds[] are required' });
            }


            if (currentUser.role === UserRole.Owner) {
                const group = await Group.findOne({ _id: groupId, owner: currentUser._id });
                if (!group) return res.status(400).json({ message: 'Group not found or not owned by you!' });

                await Property.updateMany({
                    _id: { $in: propertyIds }
                },
                    {
                        $set: { group: groupId }
                    }
                );

                // group.properties = propertyIds.length === 1 ? [propertyIds[0]] : [null as any];
                group.properties = propertyIds as any;
                await group.save();
                res.status(200).json({ message: 'Properties assigned to group', group });
            }

            if (currentUser.role === UserRole.Manager) {
                const group = await Group.findOne({ _id: groupId, manager: currentUser._id });
                if (!group) return res.status(400).json({ message: 'Group not found or not owned by you!' });

                await Property.updateMany({
                    _id: { $in: propertyIds }
                },
                    {
                        $set: { group: groupId }
                    }
                );

                // group.properties = propertyIds.length === 1 ? [propertyIds[0]] : [null as any];
                group.properties = propertyIds as any;
                await group.save();
                res.status(200).json({ message: 'Properties assigned to group', group });
            }
        }
        catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }

    public async getGroupProperties(req: Request, res: Response): Promise<any> {
        const { groupId } = req.params;
        const currentUser = (req as any).user;

        try {

            if (currentUser.role === UserRole.Owner) {
                const group = await Group.findOne({ _id: groupId, owner: currentUser._id }).populate({
                    path: 'properties',
                    populate: { path: 'manager', select: 'email role' },
                });

                if (!group) return res.status(404).json({ message: 'Group not found' });

                res.status(200).json({ properties: group.properties });
            }

            if (currentUser.role === UserRole.Manager) {

                const group = await Group.findOne({ _id: groupId, manager: currentUser._id }).populate({
                    path: 'properties',
                    populate: { path: 'owner', select: 'email role' },
                });

                if (!group) return res.status(404).json({ message: 'Group not found' });
                
                res.status(200).json({ properties: group.properties });
            }

        } catch (err: any) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    };

}



