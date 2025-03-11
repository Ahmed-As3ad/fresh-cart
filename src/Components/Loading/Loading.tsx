import { SyncLoader } from "react-spinners";
import { Box } from "@mui/material";

export default function Loading() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh" 
    >
      <SyncLoader color="#ff0000" />
    </Box>
  );
}
