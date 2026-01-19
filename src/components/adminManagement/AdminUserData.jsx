import UserDataManagement from "../common/UserDataManagement";
import AssistanceProfile from "./AssistanceProfile";

const AdminUserData = () => {
  return <UserDataManagement isAdmin={true} />;
  return <AssistanceProfile isAdmin={true} />
};

export default AdminUserData;
