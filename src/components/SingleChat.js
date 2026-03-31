import { FormControl } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Box, Text, Flex, HStack } from "@chakra-ui/layout";
import { Avatar } from "@chakra-ui/avatar";
import "./styles.css";
import { IconButton, Spinner, useToast, useColorModeValue } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ArrowBackIcon, ArrowRightIcon, AttachmentIcon, DeleteIcon, SmallCloseIcon, EditIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
const ENDPOINT =
  process.env.REACT_APP_SOCKET_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";
var socket;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const hiddenFileInput = useRef(null);
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, setSelectedChat, user, setNotification } =
    ChatState();

  // Dynamic colors
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const headerTextColor = useColorModeValue("gray.800", "white");
  const bodyBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const inputHoverBg = useColorModeValue("gray.100", "gray.600");
  const inputFocusBg = useColorModeValue("white", "gray.800");
  const emptyTitleColor = useColorModeValue("gray.800", "white");
  const emptySubTextColor = useColorModeValue("gray.500", "gray.400");

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const markCurrentChatAsRead = async (chatId) => {
    if (!chatId || !user?.token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.put(`/api/message/read/${chatId}`, {}, config);
    } catch (error) {
      // Ignore read-sync failures to avoid blocking chat operations.
    }
  };

  const handleAttachmentUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 2MB.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setAttachmentPreview({
        data: reader.result,
        mimeType: file.type,
        fileName: file.name,
      });
    };
  };

  const deleteChatHandler = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.delete(`/api/chat/${selectedChat._id}`, config);
      setSelectedChat(null);
      setFetchAgain(!fetchAgain);
      toast({
        title: "Chat deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Error deleting chat",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const deleteMessageHandler = async (messageId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/message/${messageId}`, config);
      setMessages(messages.filter((m) => m._id !== messageId));
      toast({ title: "Message unsent", status: "success", duration: 3000, isClosable: true, position: "bottom" });
    } catch (error) {
      toast({ title: "Error unsending message", status: "error", duration: 3000, isClosable: true, position: "bottom" });
    }
  };

  const sendMessage = async (event) => {
    // Send either by Enter key or by clicking a submit button (if we add one later)
    if ((event.key === "Enter" || event.type === 'click') && (newMessage || attachmentPreview)) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        // If editing a message, send a PUT request instead
        if (editingMessage) {
          const { data } = await axios.put(`/api/message/${editingMessage._id}`, { content: newMessage }, config);
          setMessages(messages.map((m) => (m._id === data._id ? data : m)));
          setEditingMessage(null);
          setNewMessage("");
          return;
        }

        const payload = {
          content: newMessage,
          chatId: selectedChat,
          attachment: attachmentPreview,
        };

        setNewMessage(""); // Clear early for better UX
        setAttachmentPreview(null);

        const { data } = await axios.post("/api/message", payload, config);
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat?._id) return;

    // Mark messages as read for the currently opened chat.
    setNotification((prev) => prev.filter((n) => n.chat?._id !== selectedChat._id));
    markCurrentChatAsRead(selectedChat._id);
  }, [selectedChat, setNotification]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMessageRecieved) => {
      if (!selectedChat || selectedChat._id !== newMessageRecieved.chat._id) {
        setNotification((prev) => {
          const alreadyExists = prev.some((n) => n._id === newMessageRecieved._id);
          return alreadyExists ? prev : [newMessageRecieved, ...prev];
        });
        setFetchAgain((prev) => !prev);
      } else {
        setMessages((prev) => [...prev, newMessageRecieved]);
        markCurrentChatAsRead(newMessageRecieved.chat._id);
      }
    };

    socket.on("message recieved", handleMessageReceived);

    return () => {
      socket.off("message recieved", handleMessageReceived);
    };
  }, [selectedChat, setNotification, setFetchAgain]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <Flex direction="column" w="100%" h="100%">
          {/* Chat Header */}
          <Flex
            px={6}
            py={4}
            w="100%"
            borderBottom="1px solid"
            borderColor={borderColor}
            alignItems="center"
            justifyContent="space-between"
          >
            <HStack spacing={4}>
              <IconButton
                d={{ base: "flex", md: "none" }}
                icon={<ArrowBackIcon />}
                onClick={() => setSelectedChat("")}
                variant="ghost"
              />

              {!selectedChat.isGroupChat ? (
                <>
                  <Avatar
                    size="sm"
                    name={getSender(user, selectedChat.users)}
                    src={getSenderFull(user, selectedChat.users).pic}
                  />
                  <Text fontSize="lg" fontWeight="bold" color={headerTextColor}>
                    {getSender(user, selectedChat.users)}
                  </Text>
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  <Avatar size="sm" name={selectedChat.chatName} bg="orange.400" color="white" />
                  <Text fontSize="lg" fontWeight="bold" color={headerTextColor}>
                    {selectedChat.chatName.toUpperCase()}
                  </Text>
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              )}
            </HStack>

            <HStack>
              <IconButton
                icon={<DeleteIcon />}
                colorScheme="red"
                variant="ghost"
                onClick={deleteChatHandler}
                aria-label="Delete Chat"
              />
            </HStack>
          </Flex>
          <Box
            flex={1}
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={6}
            bg={bodyBg}
            w="100%"
            overflowY="hidden"
            overflowX="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={10}
                h={10}
                color="orange.500"
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages" style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none' }}>
                <ScrollableChat
                  messages={messages}
                  deleteMessageHandler={deleteMessageHandler}
                  startEditingHandler={(msg) => {
                    setEditingMessage(msg);
                    setNewMessage(msg.content);
                    setAttachmentPreview(null);
                  }}
                />
              </div>
            )}

            {/* Input Form */}
            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={4}
            >
              {editingMessage && (
                <Flex justify="space-between" align="center" bg="blue.500" color="white" p={2} borderRadius="md" mb={2}>
                  <Text fontSize="sm" fontWeight="bold">Editing message</Text>
                  <SmallCloseIcon cursor="pointer" onClick={() => { setEditingMessage(null); setNewMessage(""); }} />
                </Flex>
              )}
              {attachmentPreview && (
                <Box mb={3} p={2} bg={inputBg} borderRadius="md" w="fit-content" position="relative">
                  <IconButton
                    icon={<SmallCloseIcon />}
                    size="xs"
                    colorScheme="red"
                    position="absolute"
                    top="-2"
                    right="-2"
                    borderRadius="full"
                    onClick={() => setAttachmentPreview(null)}
                  />
                  {attachmentPreview.mimeType.startsWith('image/') ? (
                    <img src={attachmentPreview.data} alt="preview" style={{ maxHeight: '100px', borderRadius: '8px' }} />
                  ) : attachmentPreview.mimeType.startsWith('video/') ? (
                    <video src={attachmentPreview.data} style={{ maxHeight: '100px', borderRadius: '8px' }} />
                  ) : (
                    <Text fontSize="sm" fontWeight="bold">Audio attached</Text>
                  )}
                </Box>
              )}

              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}

              <input
                type="file"
                accept="image/*,video/*,audio/*"
                ref={hiddenFileInput}
                style={{ display: 'none' }}
                onChange={handleAttachmentUpload}
              />

              <InputGroup size="lg">
                <Box mr={2}>
                  <IconButton
                    h="100%"
                    w="3rem"
                    size="lg"
                    icon={<AttachmentIcon />}
                    variant="ghost"
                    color="gray.500"
                    onClick={() => hiddenFileInput.current.click()}
                    aria-label="Attach file"
                  />
                </Box>
                <Input
                  variant="filled"
                  bg={inputBg}
                  _hover={{ bg: inputHoverBg }}
                  _focus={{ bg: inputFocusBg, borderColor: "orange.300", boxShadow: "sm" }}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={typingHandler}
                  borderRadius="full"
                  fontSize="md"
                />
                <InputRightElement width="4.5rem">
                  <IconButton
                    h="1.75rem"
                    size="sm"
                    onClick={(e) => sendMessage(e)}
                    icon={<ArrowRightIcon />}
                    bg="orange.400"
                    color="white"
                    borderRadius="full"
                    _hover={{ bg: "orange.500" }}
                    aria-label="Send message"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </Box>
        </Flex>
      ) : (
        // Empty State matches reference image
        <Flex direction="column" alignItems="center" justify="center" h="100%" w="100%" bg={bodyBg}>
          {/* Aesthetic 3D-like speech bubble placeholder */}
          <Box position="relative" mb={6}>
            <Box bg="orange.300" w="60px" h="60px" borderRadius="full" />
            <Box position="absolute" top="20px" left="20px" bg="yellow.100" w="45px" h="45px" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
              <HStack spacing={1}>
                <Box w="4px" h="4px" bg="orange.400" borderRadius="full" />
                <Box w="4px" h="4px" bg="orange.400" borderRadius="full" />
                <Box w="4px" h="4px" bg="orange.400" borderRadius="full" />
              </HStack>
            </Box>
          </Box>
          <Text fontSize="2xl" fontWeight="bold" color={emptyTitleColor} mb={2}>
            No conversation selected
          </Text>
          <Text fontSize="md" color={emptySubTextColor}>
            You can view your conversation in the side bar
          </Text>
        </Flex>
      )}
    </>
  );
};

export default SingleChat;
