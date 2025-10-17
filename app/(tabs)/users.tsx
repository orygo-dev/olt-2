import UserManagementScreen from '../../screens/UserManagementScreen';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Redirect } from 'expo-router';

export default function Users() {
  const { user } = useSelector((state: RootState) => state.auth);

  if (user?.role !== 'super-admin') {
    return <Redirect href="/(tabs)/" />;
  }
  
  return <UserManagementScreen />;
}
