import { JwtPayload } from 'jsonwebtoken';

export interface RequestUser extends JwtPayload {
  sub: string;
  status: string;
  email: string;
}
