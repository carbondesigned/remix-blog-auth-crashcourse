import bcrypt from 'bcrypt';
import { db } from './db.server';
import { createCookieSessionStorage, redirect } from 'remix';

export async function login({ username, password }: any) {
  const user = await db.user.findUnique({
    where: {
      username,
    },
  });
  if (!user) return null;

  // check password
  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isCorrectPassword) return null;
  else return user;
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET is not defined');
}

// create session storage
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'remixblog_session',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
});

// create session
export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set('userId', userId);
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}

// Get user session
export function getUserSession(request: Request) {
  return sessionStorage.getSession(request.headers.get('cookie'));
}

// get logged in user
export async function getLoggedInUser(request: Request) {
  const session = await getUserSession(request);
  if (!session) return null;
  const userId = session.get('userId');

  if (!userId || typeof userId !== 'string') return null;
  try {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });
    return user;
  } catch (error) {
    return null;
  }
}

// Register a new user
export async function registerUser({ username, password }: any) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      username,
      passwordHash,
    },
  });
  return user;
}

// logout user and destroy session
export async function logout(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get('cookie')
  );
  if (!session) return null;
  return redirect(request.url, {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}
