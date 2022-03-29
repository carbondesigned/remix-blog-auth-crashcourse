import { Outlet } from 'remix';

const posts = () => {
  return (
    <>
      {/* this takes children/routes from the folder. Component is a route???? */}
      <Outlet />
    </>
  );
};

export default posts;
