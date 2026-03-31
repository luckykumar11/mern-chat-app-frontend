import { Box } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  const bgColor = useColorModeValue("#f3f4f6", "gray.900");

  return (
    <Box bg={bgColor} minH="100vh" w="100%" p={{ base: 2, md: 4 }}>
      {/* Top Navbar Area */}
      {user && <SideDrawer />}

      {/* Main Content Area */}
      <Box
        d="flex"
        justifyContent="space-between"
        w="100%"
        h="calc(100vh - 100px)" /* Leave room for nav and padding */
        pt={4}
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </Box>
  );
};

export default Chatpage;
