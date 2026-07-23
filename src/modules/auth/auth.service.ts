import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middlewares/errorHandler';
import { RegisterInput, LoginInput } from './auth.schema';

const SALT_ROUNDS = 12;

function generateToken(userId: string): string {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, 'Un compte existe déjà avec cet email');
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name,
    },
  });

  const token = generateToken(user.id);
  return { token, user: { id: user.id, email: user.email, name: user.name } };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError(401, 'Email ou mot de passe incorrect');
  }

  const isValid = await bcrypt.compare(input.password, user.password);
  if (!isValid) {
    throw new AppError(401, 'Email ou mot de passe incorrect');
  }

  const token = generateToken(user.id);
  return { token, user: { id: user.id, email: user.email, name: user.name } };
}
