import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    Button, FormControl, FormLabel, Input, InputGroup, InputRightElement,
    Avatar, VStack, HStack, Text, Box, useDisclosure, useToast, Divider,
    IconButton, useColorModeValue,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, EditIcon } from "@chakra-ui/icons";
import { useState, useRef } from "react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";

const EditProfileModal = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user, setUser } = ChatState();
    const toast = useToast();

    const [name, setName] = useState(user?.name || "");
    const [pic, setPic] = useState(user?.pic || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [picLoading, setPicLoading] = useState(false);
    const fileInput = useRef(null);

    const bg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const labelColor = useColorModeValue("gray.600", "gray.400");

    const handlePicChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast({ title: "Image must be under 2MB", status: "warning", duration: 3000, isClosable: true, position: "bottom" });
            return;
        }
        setPicLoading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setPic(reader.result);
            setPicLoading(false);
        };
    };

    const handleSave = async () => {
        if (newPassword && newPassword !== confirmPassword) {
            toast({ title: "New passwords do not match", status: "warning", duration: 3000, isClosable: true, position: "bottom" });
            return;
        }

        setLoading(true);
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const payload = { name };
            if (pic !== user.pic) payload.pic = pic;
            if (newPassword) {
                payload.currentPassword = currentPassword;
                payload.newPassword = newPassword;
            }

            const { data } = await axios.put("/api/user/profile", payload, config);

            // Persist updated user info
            const updatedUser = { ...data, token: data.token || user.token };
            localStorage.setItem("userInfo", JSON.stringify(updatedUser));
            setUser(updatedUser);

            toast({ title: "Profile updated!", status: "success", duration: 3000, isClosable: true, position: "bottom" });
            setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
            onClose();
        } catch (error) {
            toast({
                title: "Update failed",
                description: error.response?.data?.message || "Something went wrong",
                status: "error", duration: 4000, isClosable: true, position: "bottom",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent bg={bg} borderRadius="2xl" boxShadow="2xl" maxH="92vh">
                    <ModalHeader borderBottom="1px solid" borderColor={borderColor} pb={4}>
                        My Profile
                    </ModalHeader>
                    <ModalCloseButton />

                    <ModalBody py={3} overflowY="hidden">
                        <VStack spacing={3} align="stretch">
                            {/* Avatar Section */}
                            <HStack spacing={4} justify="center" mb={1}>
                                <Box position="relative">
                                    <Avatar size="lg" name={name} src={pic} />
                                    <IconButton
                                        icon={<EditIcon />}
                                        size="xs"
                                        colorScheme="orange"
                                        borderRadius="full"
                                        position="absolute"
                                        bottom="0"
                                        right="0"
                                        isLoading={picLoading}
                                        onClick={() => fileInput.current.click()}
                                        aria-label="Change photo"
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInput}
                                        style={{ display: "none" }}
                                        onChange={handlePicChange}
                                    />
                                </Box>
                            </HStack>

                            {/* Name */}
                            <FormControl>
                                <FormLabel fontSize="sm" color={labelColor}>Display Name</FormLabel>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    color="gray.800"
                                    bg="white"
                                    borderRadius="lg"
                                    focusBorderColor="orange.400"
                                />
                            </FormControl>

                            {/* Email — read only */}
                            <FormControl>
                                <FormLabel fontSize="sm" color={labelColor}>Email address</FormLabel>
                                <Input
                                    value={user?.email}
                                    isReadOnly
                                    bg={useColorModeValue("gray.100", "gray.700")}
                                    color={useColorModeValue("gray.500", "gray.400")}
                                    borderRadius="lg"
                                    cursor="not-allowed"
                                />
                            </FormControl>

                            <Divider />

                            <Text fontWeight="semibold" fontSize="sm" color={labelColor}>Change Password</Text>

                            {/* Current Password */}
                            <FormControl>
                                <FormLabel fontSize="sm" color={labelColor}>Current Password</FormLabel>
                                <InputGroup>
                                    <Input
                                        type={showCurrent ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        color="gray.800"
                                        bg="white"
                                        borderRadius="lg"
                                        focusBorderColor="orange.400"
                                    />
                                    <InputRightElement>
                                        <IconButton size="sm" variant="ghost" onClick={() => setShowCurrent(!showCurrent)}
                                            icon={showCurrent ? <ViewOffIcon /> : <ViewIcon />} aria-label="toggle" />
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>

                            {/* New Password */}
                            <FormControl>
                                <FormLabel fontSize="sm" color={labelColor}>New Password</FormLabel>
                                <InputGroup>
                                    <Input
                                        type={showNew ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        color="gray.800"
                                        bg="white"
                                        borderRadius="lg"
                                        focusBorderColor="orange.400"
                                    />
                                    <InputRightElement>
                                        <IconButton size="sm" variant="ghost" onClick={() => setShowNew(!showNew)}
                                            icon={showNew ? <ViewOffIcon /> : <ViewIcon />} aria-label="toggle" />
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>

                            {/* Confirm Password */}
                            <FormControl>
                                <FormLabel fontSize="sm" color={labelColor}>Confirm New Password</FormLabel>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    color="gray.800"
                                    bg="white"
                                    borderRadius="lg"
                                    focusBorderColor="orange.400"
                                />
                            </FormControl>

                            <Button
                                onClick={handleSave}
                                isLoading={loading}
                                bg="orange.400"
                                color="white"
                                _hover={{ bg: "orange.500" }}
                                borderRadius="full"
                                size="lg"
                                w="100%"
                            >
                                Save Changes
                            </Button>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default EditProfileModal;
