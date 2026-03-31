import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import { useColorModeValue, Menu, MenuButton, MenuList, MenuItem, IconButton, Image, Box, Text, Flex } from "@chakra-ui/react";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages, deleteMessageHandler, startEditingHandler }) => {
  const { user, selectedChat } = ChatState();

  const senderNamePalette = useColorModeValue(
    ["pink.600", "teal.600", "purple.600", "orange.600", "blue.600", "green.600"],
    ["pink.300", "teal.300", "purple.300", "orange.300", "blue.300", "green.300"]
  );

  const getSenderNameColor = (sender) => {
    const seed = sender?._id || sender?.name || "unknown";
    const hash = String(seed)
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return senderNamePalette[hash % senderNamePalette.length];
  };

  const formatExactTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatMessageTimeLabel = (timestamp) => {
    if (!timestamp) return "";

    const now = Date.now();
    const messageTime = new Date(timestamp).getTime();
    const diffSeconds = Math.max(0, Math.floor((now - messageTime) / 1000));

    // Show relative time only for very recent messages, else exact 12-hour time.
    if (diffSeconds < 60) return "just now";
    if (diffSeconds <= 600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return formatExactTime(timestamp);
  };

  const userBubbleBg = useColorModeValue("#BEE3F8", "blue.800");
  const otherBubbleBg = useColorModeValue("#B9F5D0", "green.800");
  const bubbleTextColor = useColorModeValue("black", "white");

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => {
          const isOwn = m.sender._id === user._id;

          return (
            <div
              style={{ display: "flex", alignItems: "center" }}
              key={m._id}
              className="message-row"
            >
              {/* Avatar for other people's messages */}
              {(isSameSender(messages, m, i, user._id) ||
                isLastMessage(messages, i, user._id)) && (
                  <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                    <Avatar
                      mt="7px"
                      mr={1}
                      size="sm"
                      cursor="pointer"
                      name={m.sender.name}
                      src={m.sender.pic}
                    />
                  </Tooltip>
                )}

              {/* Bubble + dots grouped together, pushed to right for own messages */}
              <Flex
                alignItems="center"
                ml={isOwn ? "auto" : isSameSenderMargin(messages, m, i, user._id)}
                mt={isSameUser(messages, m, i, user._id) ? "3px" : "10px"}
              >
                {/* Three-dot menu to the LEFT of own messages */}
                {isOwn && (
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="Message options"
                      icon={
                        <Text fontSize="16px" lineHeight="1" letterSpacing="1px">
                          •••
                        </Text>
                      }
                      size="xs"
                      variant="ghost"
                      className="msg-menu-btn"
                      color="gray.400"
                      _hover={{ color: "gray.100", bg: "whiteAlpha.200" }}
                      mr={1}
                    />
                    <MenuList minW="110px">
                      <MenuItem onClick={() => startEditingHandler(m)}>✏️ Edit</MenuItem>
                      <MenuItem onClick={() => deleteMessageHandler(m._id)} color="red.400">🗑️ Unsend</MenuItem>
                    </MenuList>
                  </Menu>
                )}

                {/* Message bubble */}
                <Box
                  style={{
                    backgroundColor: isOwn ? userBubbleBg : otherBubbleBg,
                    color: bubbleTextColor,
                    borderRadius: "20px",
                    padding: "8px 15px",
                    maxWidth: "75vw",
                  }}
                >
                  {selectedChat?.isGroupChat && !isOwn && (
                    <Text
                      fontSize="12px"
                      fontWeight="bold"
                      color={getSenderNameColor(m.sender)}
                      mb={1}
                      lineHeight="1"
                    >
                      {m.sender?.name || "Unknown"}
                    </Text>
                  )}
                  {m.attachment && m.attachment.data && (
                    <Box mb={m.content ? 2 : 0}>
                      {m.attachment.mimeType.startsWith('image/') ? (
                        <Image src={m.attachment.data} borderRadius="md" maxH="200px" objectFit="contain" />
                      ) : m.attachment.mimeType.startsWith('video/') ? (
                        <video src={m.attachment.data} controls style={{ borderRadius: '8px', maxHeight: '200px' }} />
                      ) : (
                        <audio src={m.attachment.data} controls style={{ width: '200px' }} />
                      )}
                    </Box>
                  )}
                  {m.content && <Text as="span">{m.content}</Text>}
                  <Flex justify="flex-end" align="center" mt={1} gap={1}>
                    {m.isEdited && (
                      <Text as="span" fontSize="10px" color="gray.500" fontStyle="italic">
                        edited
                      </Text>
                    )}
                    <Text as="span" fontSize="10px" color="gray.500" whiteSpace="nowrap">
                      {formatMessageTimeLabel(m.createdAt)}
                    </Text>
                  </Flex>
                </Box>
              </Flex>
            </div>
          );
        })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
