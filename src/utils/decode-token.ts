import jwt from 'jsonwebtoken';
import { User } from '../controllers/expenses';

export const decodeToken = (token: string): User => jwt.verify(token, process.env.SECRET_KEY!) as User