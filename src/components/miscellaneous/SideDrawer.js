import { Button } from "@chakra-ui/button";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/input";
import { Box, Text, Flex, HStack } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import { BellIcon, SearchIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useHistory } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useToast, IconButton, useColorMode, useColorModeValue, Spinner } from "@chakra-ui/react";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";
import EditProfileModal from "./EditProfileModal";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const toast = useToast();
  const history = useHistory();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const { colorMode, toggleColorMode } = useColorMode();
  const unreadCount = notification?.length || 0;

  // Dynamic color values
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const inputHoverBg = useColorModeValue("gray.100", "gray.600");
  const inputFocusBg = useColorModeValue("white", "gray.900");
  const iconColor = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const dropdownBg = useColorModeValue("white", "gray.800");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (value) => {
    setSearch(value);
    if (!value.trim()) {
      setSearchResult([]);
      setShowDropdown(false);
      return;
    }

    try {
      setLoading(true);
      setShowDropdown(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(`/api/user?search=${value}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      setShowDropdown(false);
      setSearch("");
      setSearchResult([]);
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const openNotificationChat = async (notif) => {
    setSelectedChat(notif.chat);
    setNotification((prev) => prev.filter((n) => n.chat?._id !== notif.chat?._id));

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.put(`/api/message/read/${notif.chat?._id}`, {}, config);
    } catch (error) {
      // Ignore read-sync failures to keep UX responsive.
    }
  };

  return (
    <>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        bg={bgColor}
        w="100%"
        px={6}
        py={3}
        borderRadius="xl"
        boxShadow="sm"
      >
        {/* Logo Area */}
        <HStack spacing={3}>
          <Box
            bgGradient="linear(to-br, orange.400, orange.600)"
            color="white"
            w="36px"
            h="36px"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontWeight="bold"
            fontSize="sm"
            boxShadow="sm"
            letterSpacing="0.5px"
          >
            TA
          </Box>
          <Text fontSize="xl" fontWeight="bold" color={textColor} letterSpacing="tight">
            Talk-A-Tive
          </Text>
        </HStack>

        {/* Inline Search Bar with Dropdown */}
        <Box
          flex="1"
          maxW="400px"
          mx={8}
          display={{ base: "none", md: "block" }}
          position="relative"
          ref={searchRef}
        >
          <InputGroup>
            <InputLeftElement pointerEvents="none" color={iconColor}>
              {loading ? <Spinner size="xs" color="orange.400" /> : <SearchIcon />}
            </InputLeftElement>
            <Input
              placeholder="Search users..."
              variant="filled"
              bg={inputBg}
              borderRadius="full"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => search && setShowDropdown(true)}
              _hover={{ bg: inputHoverBg }}
              _focus={{ bg: inputFocusBg, borderColor: borderColor, boxShadow: "sm" }}
              color={textColor}
            />
          </InputGroup>

          {/* Dropdown Results */}
          {showDropdown && (
            <Box
              position="absolute"
              top="110%"
              left={0}
              right={0}
              bg={dropdownBg}
              borderRadius="xl"
              boxShadow="2xl"
              border="1px solid"
              borderColor={borderColor}
              zIndex={9999}
              maxH="280px"
              overflowY="auto"
            >
              {loadingChat && (
                <Flex justify="center" py={3}>
                  <Spinner size="sm" color="orange.400" />
                </Flex>
              )}
              {!loading && searchResult.length === 0 && search && (
                <Text px={4} py={3} color="gray.500" fontSize="sm">
                  No users found
                </Text>
              )}
              {searchResult.map((u) => (
                <UserListItem
                  key={u._id}
                  user={u}
                  handleFunction={() => accessChat(u._id)}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Right Action Icons Group */}
        <HStack spacing={4}>
          <IconButton
            icon={<SearchIcon />}
            display={{ base: "flex", md: "none" }}
            variant="ghost"
            color={iconColor}
            borderRadius="full"
            aria-label="Search users"
          />

          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              p={0}
              minW="auto"
              borderRadius="full"
              aria-label="Notifications"
              position="relative"
            >
              <BellIcon fontSize="22px" color={iconColor} />
              {unreadCount > 0 && (
                <Box
                  position="absolute"
                  top="-6px"
                  right="-8px"
                  bg="red.500"
                  color="white"
                  fontSize="10px"
                  fontWeight="bold"
                  lineHeight="1"
                  minW="18px"
                  h="18px"
                  px="4px"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Box>
              )}
            </MenuButton>
            <MenuList>
              {!notification || notification.length === 0 ? (
                <MenuItem isDisabled>No new messages</MenuItem>
              ) : (
                notification.map((notif) => (
                  <MenuItem key={notif._id} onClick={() => openNotificationChat(notif)}>
                    {notif.chat?.isGroupChat
                      ? `${notif.sender?.name || "Someone"} messaged in ${notif.chat?.chatName || "group"}`
                      : `${notif.sender?.name || "Someone"} messaged you`}
                  </MenuItem>
                ))
              )}
            </MenuList>
          </Menu>

          <IconButton
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            variant="ghost"
            onClick={toggleColorMode}
            color={iconColor}
            borderRadius="full"
            aria-label="Toggle Dark Mode"
          />

          <Menu>
            <MenuButton as={Button} bg="transparent" p={0} _hover={{ bg: "transparent" }} _active={{ bg: "transparent" }}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
                border="2px solid transparent"
                _hover={{ borderColor: "orange.400" }}
                transition="all 0.2s"
              />
            </MenuButton>
            <MenuList>
              <EditProfileModal>
                <MenuItem>My Profile</MenuItem>{" "}
              </EditProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler} color="red.500" fontWeight="medium">Logout</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </>
  );
}

export default SideDrawer;
