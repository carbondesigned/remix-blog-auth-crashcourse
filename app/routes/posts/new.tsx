import { Link, redirect, useActionData, json } from 'remix';
import { db } from '~/utils/db.server';
import { getLoggedInUser } from '~/utils/session.server';

type Props = {};

function validateTitle(title: string) {
  if (title.length < 3) {
    return 'Title must be at least 3 characters long';
  }
  return null;
}

function validateBody(body: string) {
  if (body.length < 10) {
    return 'Body must be at least 10 characters long';
  }
  return null;
}

function badRequest(data: any) {
  return json(data, { status: 400 });
}

export const action = async ({ request }: any) => {
  const form = await request.formData();
  const title = form.get('title');
  const body = form.get('body');
  const user = await getLoggedInUser(request);

  const fields = { title, body };

  const fieldErrors = {
    title: validateTitle(title),
    body: validateBody(body),
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    console.log(fieldErrors);
    return badRequest({ fieldErrors, fields });
  }

  // @ts-ignore
  const post = await db.post.create({ data: { ...fields, userId: user?.id } });

  return redirect(`/posts/${post.id}`);
};

const NewPost = (props: Props) => {
  const actionData = useActionData();
  return (
    <>
      <div className='page-header'>
        <h1>New Post</h1>
        <Link to='/posts' className='btn btn-reverse'>
          Back
        </Link>
      </div>
      <div className='page-content'>
        <form method='POST'>
          <div className='form-control'>
            <div className='error'>
              {actionData?.fieldErrors?.title ? (
                <p
                  className='form-validation-error'
                  role='alert'
                  id='title-error'
                >
                  {actionData.fieldErrors.title}
                </p>
              ) : null}
            </div>
            <label htmlFor='title'>Post Title</label>
            <input
              type='text'
              name='title'
              id='title'
              defaultValue={actionData?.fields?.title}
            />
          </div>
          <div className='form-control'>
            <div className='error'>
              {actionData?.fieldErrors?.body ? (
                <p
                  className='form-validation-error'
                  role='alert'
                  id='body-error'
                >
                  {actionData.fieldErrors.body}
                </p>
              ) : null}
            </div>
            <label htmlFor='body'>Post Body</label>
            <textarea
              name='body'
              id='body'
              defaultValue={actionData?.fields?.body}
            />
          </div>
          <button className='btn btn-block' type='submit'>
            Add Post
          </button>
        </form>
      </div>
    </>
  );
};

export default NewPost;
