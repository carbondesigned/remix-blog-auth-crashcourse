import { Link, redirect, useLoaderData } from 'remix';
import { db } from '~/utils/db.server';
import { getLoggedInUser } from '~/utils/session.server';
type Props = {};

export const loader = async ({ params, request }: any) => {
  const user = await getLoggedInUser(request);

  const post = await db.post.findUnique({
    where: {
      id: params.postId,
    },
  });
  if (!post) throw new Error('Post not found');
  return { post, user };
};

export const action = async ({ request, params }: any) => {
  const form = await request.formData();
  const user = await getLoggedInUser(request);
  if (form.get('_method') === 'delete') {
    const post = await db.post.findUnique({
      where: {
        id: params.postId,
      },
    });
    if (!post) throw new Error('Post not found');
    if (post.userId !== user?.id) throw new Error('Not authorized');
    else {
      await db.post.delete({ where: { id: params.postId } });
    }
    return redirect(`/posts`);
  }
};

const Post = (props: Props) => {
  const { post, user } = useLoaderData();
  return (
    <div>
      <div className='page-header'>
        <div>
          <p>{post?.user?.username}</p>
          <p>
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <h1>{post.title}</h1>
        </div>
        <Link to='/posts' className='btn btn-reverse'>
          Back
        </Link>
      </div>
      <div className='page-content'>
        <p>{post.body}</p>
      </div>
      <div className='page-footer'>
        <form method='POST'>
          <input type='hidden' name='_method' value='delete' />
          {user.id === post.userId && (
            <button type='submit' className='btn btn-delete'>
              Delete
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Post;
