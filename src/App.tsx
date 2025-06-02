import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import Header from "./pages/components/Header";
import Home from "./pages/Home";
import FormTesting from "./pages/FormTesting";
import TableTesting from "./pages/TableTesting";

function App() {
  const router = createBrowserRouter([
    {
      element: (
        <>
          <Header />
          <Outlet />
        </>
      ),
      children: [
        { element: <Home />, path: "/" },
        { element: <FormTesting />, path: "form_testing" },
        { element: <TableTesting />, path: "table_testing" },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
