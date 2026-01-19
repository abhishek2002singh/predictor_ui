import { useOutletContext } from "react-router-dom";
import UserDataManagement from "../common/UserDataManagement";

const AssistantUserData = () => {
  const { permissions } = useOutletContext() || {};

  return <UserDataManagement permissions={permissions} isAdmin={false} />;
};

export default AssistantUserData;
