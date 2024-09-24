import { Request, Response, NextFunction } from 'express';
import { isNil } from 'lodash';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config';

interface CustomRequest extends Request {
    user: string | JwtPayload;
}

async function authMiddleware(req: CustomRequest, res: Response, next: NextFunction) {
    try {
        const { authorization } = req.headers;

        // token do not exist
        if (isNil(authorization)) {
            return res.status(401).json({
                message: 'Unauthorized: Token not found',
            });
        }

        // token invalid or expired
        if (!authorization.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Unauthorized: Malformed Token',
            });
        }

        // token is expired
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET as string);

        // add user to request object
        req.user = decoded;

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: 'Unauthorized: Token has expired',
            });
        } else {
            return res.status(401).json({
                message: 'Unauthorized: Invalid Token',
            });
        }
    }
}

export default authMiddleware;
