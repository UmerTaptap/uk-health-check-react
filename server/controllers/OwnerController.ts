import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User, { UserRole } from '../models/User';
import Group from '../models/Group';
import Property from '../models/Property';

export const createManager = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const currentUser = (req as any).user;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already in use' });

        const hash = await bcrypt.hash(password, 10);

        const manager = await User.create({
            name,
            email,
            password: hash,
            role: UserRole.Manager,
            createdBy: currentUser._id, // Owner ID
        });

        res.status(201).json({ message: 'Manager created', manager });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

export const createGroup = async (req: Request, res: Response) => {
    const { name, managerId } = req.body;
    const currentUser = (req as any).user;

    try {
        if (!name) {
            return res.status(400).json({ message: 'Group name is required' });
        }

        const groupData: any = {
            name,
            owner: currentUser._id
        };

        if (managerId) {
            groupData.manager = managerId;
        }

        const group = await Group.create(groupData);

        res.status(201).json({ message: 'Group created', group });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

export const assignManagerToGroup = async (req: Request, res: Response) => {
    const { groupId, managerId } = req.body;
    const currentUser = (req as any).user;

    try {
        if (!groupId || !managerId) {
            return res.status(400).json({ message: 'Group Id and Manager Id are required' });
        }

        const group = await Group.findOne({ _id: groupId, owner: currentUser._id });
        if (!group) {
            return res.status(400).json({ message: 'Group not found or not owned by you' });
        }

        const manager = await User.findOne({ _id: managerId, role: UserRole.Manager });
        if (!manager) return res.status(400).json({ message: 'Manager not found' })

        group.manager = managerId;
        await group.save();

        res.status(200).json({ message: `Manager assigned to group - ` + group.name, group });
    }
    catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const listGroups = async (req: Request, res: Response) => {
    const user = (req as any).user;
    let groups: any[] = [];
    try {

        if (user.role === UserRole.Owner) {
            groups = await Group.find({ owner: user._id }).populate('owner', 'email name role').lean();
        }
        else
            if (user.role === UserRole.Manager) {
                groups = await Group.find({ manager: user._id }).populate('manager', 'email name role').lean();
            }

        const groupsWithProperties = await Promise.all(
            groups.map(async (group) => {
                const properties = await Property.find({ group: group._id });
                return { ...group, properties };
            })
        );

        res.json({ groups: groupsWithProperties });
    }
    catch (err: any) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

export const listManagers = async (req: Request, res: Response) => {
    const owner = (req as any).user;

    try {
        const managers = await User.find({
            role: UserRole.Manager,
            createdBy: owner._id,
        }).select('name email');

        res.json({ managers });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
