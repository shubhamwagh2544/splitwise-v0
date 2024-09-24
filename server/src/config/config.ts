import dotenv from 'dotenv';

dotenv.config();

export const NODE_PORT = process.env.NODE_PORT;
export const JWT_SECRET = process.env.JWT_SECRET;

const CLIENT_URL = process.env.CLIENT_URL as string;
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'];

export const corsOptions = {
    origin: [CLIENT_URL],
    methods: HTTP_METHODS,
};
