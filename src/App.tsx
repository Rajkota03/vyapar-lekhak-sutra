
import { AuthProvider } from "@/context/AuthContext";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export default App;
