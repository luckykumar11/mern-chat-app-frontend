import { Box } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/react";
import "./styles.css";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  const bgColor = useColorModeValue("white", "gray.800");

  return (
    <Box
      d={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      bg={bgColor}
      w={{ base: "100%", md: "calc(100% - 356px)" }} /* Sidebar width + margin */
      borderRadius="xl"
      boxShadow="sm"
      h="100%"
      overflow="hidden"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;
