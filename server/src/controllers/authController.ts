import { Request, Response } from 'express';
import { isNil } from 'lodash';

import errorHandler from '../middlewares/errorHandler';
import AuthService from '../services/authService';

const authService = AuthService.getInstance();

class AuthController {
    private static instance: AuthController;

    private constructor() {}

    public static getInstance() {
        if (isNil(AuthController.instance)) {
            AuthController.instance = new AuthController();
        }
        return AuthController.instance;
    }

    async signUp(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const user = await authService.signUp(email, password);
            return res.status(201).json(user);
        } catch (error) {
            // await DbConfig.disconnectDatabase();
            return errorHandler(error, req, res);
        }
    }

    async signIn(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const user = await authService.signIn(email, password);
            return res.status(200).json(user);
        } catch (error) {
            // await DbConfig.disconnectDatabase();
            return errorHandler(error, req, res);
        }
    }
}

export default AuthController;
