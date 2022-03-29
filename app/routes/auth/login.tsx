import { useActionData, json, redirect } from 'remix';
import { db } from '~/utils/db.server';
import { login, createUserSession, registerUser } from '~/utils/session.server';

type Props = {};

function validateUsername(username: string) {
  if (typeof username !== 'string' || username.length < 3) {
    return 'Username must be at least 3 characters';
  }
}

function validatePassword(password: string) {
  if (typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters';
  }
}

function badRequest(data: any) {
  return json(data, { status: 400 });
}

export const action = async ({ request }: any) => {
  const form = await request.formData();
  const loginType = form.get('loginType');
  const username = form.get('username');
  const password = form.get('password');

  const fields = { loginType, username, password };

  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  switch (loginType) {
    case 'login': {
      // find user
      const user = await login({ username, password });
      // check user
      if (!user) {
        return badRequest({
          fieldErrors: {
            username: 'Username or password is incorrect',
          },
          fields,
        });
      }
      // create user session
      return createUserSession(user.id, '/posts');
    }

    case 'register': {
      // check if user exists
      const userExists = await db.user.findFirst({
        where: {
          username,
        },
      });
      if (userExists) {
        return badRequest({
          fieldErrors: {
            username: `Username ${username} already exists`,
          },
          fields,
        });
      }
      // create user
      const user = await registerUser({ username, password });
      if (!user) {
        return badRequest({
          fieldErrors: {
            username: 'Username or password is incorrect',
          },
          fields,
        });
      }

      // create user session
      return createUserSession(user.id, '/posts');
    }
    default: {
      return badRequest({ fieldErrors, fields });
    }
  }
};

const Login = (props: Props) => {
  const actionData = useActionData();
  return (
    <div className='auth-container'>
      <div className='page-header'>
        <h1>Login</h1>
      </div>
      <div className='page-content'>
        <form method='POST'>
          <fieldset>
            <legend>Login or Register</legend>
            <label>
              <input
                type='radio'
                name='loginType'
                value='login'
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === 'login'
                }
              />{' '}
              Login
            </label>

            <label>
              <input
                type='radio'
                name='loginType'
                value='register'
                defaultChecked={actionData?.fields?.loginType === 'register'}
              />{' '}
              Register
            </label>
          </fieldset>
          <div className='form-control'>
            <div className='error'>
              {actionData?.fieldErrors?.username ? (
                <p
                  className='form-validation-error'
                  role='alert'
                  id='username-error'
                >
                  {actionData.fieldErrors.username}
                </p>
              ) : null}
            </div>
            <label htmlFor='username'>Username</label>
            <input
              type='text'
              name='username'
              id='username'
              defaultValue={actionData?.fields?.username}
            />
          </div>

          <div className='form-control'>
            <div className='error'>
              {actionData?.fieldErrors?.password ? (
                <p
                  className='form-validation-error'
                  role='alert'
                  id='password-error'
                >
                  {actionData.fieldErrors.password}
                </p>
              ) : null}
            </div>
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              name='password'
              id='password'
              defaultValue={actionData?.fields?.password}
            />
          </div>

          <button className='btn btn-block' type='submit'>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
