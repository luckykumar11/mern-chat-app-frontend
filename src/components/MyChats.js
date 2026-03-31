import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text, Flex, HStack } from "@chakra-ui/layout";
import { Avatar } from "@chakra-ui/avatar";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Button, IconButton, Badge, useColorModeValue } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats, notification } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  // Dynamic colors
  const containerBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const headerTextColor = useColorModeValue("gray.800", "white");
  const iconHoverBg = useColorModeValue("gray.100", "gray.700");
  const chatSelectedBg = useColorModeValue("orange.50", "whiteAlpha.200");
  const chatHoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const chatSelectedHoverBg = useColorModeValue("orange.50", "whiteAlpha.300");
  const chatNameColor = useColorModeValue("gray.800", "white");
  const timeColor = useColorModeValue("gray.400", "gray.500");
  const msgColor = useColorModeValue("gray.500", "gray.400");
  const dotBorderColor = useColorModeValue("white", "gray.800");

  return (
    <Box
      d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      bg={containerBg}
      w={{ base: "100%", md: "340px" }}
      borderRadius="xl"
      boxShadow="sm"
      h="100%"
      mr={{ base: 0, md: 4 }}
      overflow="hidden"
    >
      {/* Sidebar Header */}
      <Box p={4} pb={2} borderBottom="1px solid" borderColor={borderColor} mb={2}>
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="bold" color={headerTextColor} letterSpacing="tight">
            Messages
          </Text>
          <GroupChatModal>
            <IconButton
              icon={<AddIcon />}
              size="sm"
              variant="ghost"
              color="gray.500"
              _hover={{ bg: iconHoverBg, color: "orange.500" }}
              aria-label="New Group Chat"
            />
          </GroupChatModal>
        </Flex>
      </Box>

      {/* Chat List */}
      <Box flex="1" overflowY="auto" px={2} pb={2}>
        {chats ? (
          <Stack spacing="2">
            {chats.map((chat, index) => {
              const chatName = !chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName;
              const chatUser = !chat.isGroupChat ? getSenderFull(loggedUser, chat.users) : null;
              const unreadCount =
                notification?.filter((n) => n.chat?._id === chat._id).length || 0;

              const isSelected = selectedChat === chat;

              return (
                <Box
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  bg={isSelected ? chatSelectedBg : "transparent"}
                  _hover={{ bg: isSelected ? chatSelectedHoverBg : chatHoverBg }}
                  p={3}
                  borderRadius="lg"
                  key={chat._id}
                  transition="background 0.2s"
                >
                  <Flex align="center">
                    <Box position="relative" mr={3}>
                      <Avatar
                        size="md"
                        name={chatName}
                        src={chatUser?.pic || ""}
                        bg="blue.400"
                        color="white"
                      />
                      {/* Mock active dot - kept for aesthetic since it's common */}
                      <Box
                        position="absolute"
                        bottom="0"
                        right="0"
                        w="12px"
                        h="12px"
                        bg="green.400"
                        border="2px solid"
                        borderColor={dotBorderColor}
                        borderRadius="full"
                      />
                    </Box>

                    <Box flex="1" overflow="hidden">
                      <Flex justify="space-between" align="center" mb={1}>
                        <Text fontWeight="semibold" color={chatNameColor} fontSize="sm" isTruncated>
                          {chatName}
                        </Text>
                        <HStack spacing={2}>
                          {unreadCount > 0 && (
                            <Badge
                              colorScheme="red"
                              borderRadius="full"
                              px={2}
                              py={0.5}
                              fontSize="0.65rem"
                            >
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </Badge>
                          )}
                          <Text fontSize="xs" color={timeColor}>
                            {chat.latestMessage ? new Date(chat.latestMessage.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                          </Text>
                        </HStack>
                      </Flex>
                      <Flex justify="space-between" align="center">
                        <Text
                          fontSize="xs"
                          color={msgColor}
                          isTruncated
                          mr={2}
                        >
                          {chat.latestMessage ? chat.latestMessage.content : "Tap to start chatting..."}
                        </Text>
                      </Flex>
                    </Box>
                  </Flex>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
