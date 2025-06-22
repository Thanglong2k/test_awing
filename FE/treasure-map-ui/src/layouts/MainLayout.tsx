import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Treasure Hunt App</Typography>
        </Toolbar>
      </AppBar>

      <Box component="main" flexGrow={1} p={3}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;