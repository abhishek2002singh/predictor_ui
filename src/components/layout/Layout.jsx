import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import useOnlineStatus from "../../hooks/useOnlineStatus";

const Layout = () => {
  const isOnline = useOnlineStatus()
  return (
    <div className="min-h-screen flex flex-col bg-white">
       {!isOnline && (
        <div className="bg-red-500 text-white text-center py-2 text-sm">
          ⚠️ You are offline. Please check your internet connection.
        </div>
      )}
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
