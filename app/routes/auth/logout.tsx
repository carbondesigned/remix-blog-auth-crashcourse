import { redirect } from 'remix';
import { logout } from '~/utils/session.server';
type Props = {};

export const action = async ({ request }: any) => {
  return logout(request);
};

export const loader = async ({ params }: any) => {
  return redirect('/');
};

const Logout = (props: Props) => {
  return <div>Logout</div>;
};

export default Logout;
