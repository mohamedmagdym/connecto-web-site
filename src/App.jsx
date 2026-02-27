import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Login/Login";
import Layout from "./Layout/Layout";
import SignUp from "./Signup/SignUp";
import Profile from "./Profile/Profile";
import Home from "./Home/Home";
import PostDetails from "./Home/PostDetails";
import { Toaster } from "react-hot-toast";
import NotFound from "./NotFound/NotFound";
import ChangePassword from "./changePassword/ChangePassword";
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute";
import ChangeProfilePhoto from "./ChangeProfilePhoto/ChangeProfilePhoto";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      { path: "/login", element: <Login /> },
      { path: "signup", element: <SignUp /> },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "post/:id",
        element: (
          <ProtectedRoute>
            <PostDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "changepassword",
        element: (
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        ),
      },
      {
        path: "changeprofilephoto",
        element: (
          <ProtectedRoute>
            <ChangeProfilePhoto />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
function App() {
  return (
    <>
      <Toaster />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
