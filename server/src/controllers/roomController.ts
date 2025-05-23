import { Request, Response } from 'express';
import { isNil } from 'lodash';

import errorHandler from '../middlewares/errorHandler';
import RoomService from '../services/roomService';
import logger from '../utils/logger';
import { buildLogMeta } from '../utils/loggerWrapper';

const roomService = RoomService.getInstance();

class RoomController {
    private static instance: RoomController;

    private constructor() {}

    public static getInstance() {
        if (isNil(RoomController.instance)) {
            RoomController.instance = new RoomController();
        }
        return RoomController.instance;
    }

    async createRoom(req: Request, res: Response) {
        try {
            const { userId, name } = req.body;
            const room = await roomService.createRoom(parseInt(userId), name);
            return res.status(201).json(room);
        } catch (error) {
            // await DbConfig.disconnectDatabase();
            return errorHandler(error, req, res);
        }
    }

    async getRooms(req: Request, res: Response) {
        try {
            const rooms = await roomService.getRooms();
            return res.status(200).json(rooms);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async getRoomsByUserId(req: Request, res: Response) {
        const meta = buildLogMeta(req, 'getRoomsByUserId');
        logger.info(`Fetching rooms for userId: ${meta.userId}`, meta);
        try {
            const { userId } = req.params;
            const rooms = await roomService.getRoomsByUserId(parseInt(userId), meta);
            return res.status(200).json(rooms);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async getRoomById(req: Request, res: Response) {
        try {
            const { roomId } = req.params;
            const room = await roomService.getRoomById(parseInt(roomId));
            return res.status(200).json(room);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async getUsersByRoomId(req: Request, res: Response) {
        try {
            const { roomId } = req.params;
            const users = await roomService.getUsersByRoomId(parseInt(roomId));
            return res.status(200).json(users);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async addUsersToRoom(req: Request, res: Response) {
        try {
            const { roomId } = req.params;
            const { userIds } = req.body;
            await roomService.addUsersToRoom(parseInt(roomId), userIds);
            return res.status(200).json({ message: 'Users added to room' });
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }

    async deleteRoom(req: Request, res: Response) {
        try {
            const { roomId } = req.params;
            const success = await roomService.deleteRoom(parseInt(roomId));
            return res.status(200).json(success);
        } catch (error) {
            return errorHandler(error, req, res);
        }
    }
}

export default RoomController;
