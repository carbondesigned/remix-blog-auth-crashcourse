import { Link, useLoaderData } from 'remix';
import { PostType } from '~/types';
import { db } from '~/utils/db.server';
type Props = {};

export const loader = async () => {
  const data = {
    posts: await db.post.findMany(),
  };
  return data;
};

const PostItems = (props: Props) => {
  const { posts } = useLoaderData();
  console.log(posts);
  return (
    <div>
      <div className='page-header'>
        <h1>Posts</h1>
        <Link to='/posts/new' className='btn'>
          Create New Post
        </Link>
      </div>
      <ul className='posts-list'>
        {posts.map((post: PostType) => (
          <li key={post.id}>
            <p>{post?.user?.username}</p>
            <p>
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <Link to={`/posts/${post.id}`}>
              <h3>{post.title}</h3>
            </Link>
            <p>{post.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostItems;
