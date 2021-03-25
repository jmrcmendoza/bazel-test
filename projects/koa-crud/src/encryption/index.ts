import bcrypt from 'bcrypt';

const saltRounds = 10;

export async function createHash(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export async function compareHash(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
