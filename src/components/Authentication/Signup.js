import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement, InputLeftElement } from "@chakra-ui/input";
import { VStack, Box, IconButton } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useState } from "react";
import { ViewIcon, ViewOffIcon, EmailIcon, LockIcon, InfoOutlineIcon } from "@chakra-ui/icons";

const Signup = ({ onSignupSuccess }) => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();

  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [confirmpassword, setConfirmpassword] = useState();
  const [password, setPassword] = useState();
  const [pic, setPic] = useState();
  const [picLoading, setPicLoading] = useState(false);

  const submitHandler = async () => {
    setPicLoading(true);
    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    if (password !== confirmpassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      await axios.post(
        "/api/user",
        {
          name,
          email,
          password,
          pic,
        },
        config
      );
      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setName("");
      setEmail("");
      setPassword("");
      setConfirmpassword("");
      setPic("");
      setPicLoading(false);
      if (onSignupSuccess) {
        onSignupSuccess(email);
      }
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
    }
  };

  const postDetails = (pics) => {
    setPicLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(pics.type)) {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "piyushproj");
      fetch("https://api.cloudinary.com/v1_1/piyushproj/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setPicLoading(false);
        })
        .catch(() => {
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
  };

  return (
    <VStack spacing="3" mt="0" align="stretch">
      <FormControl id="first-name" isRequired>
        <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" mb="1">Name</FormLabel>
        <InputGroup size="md">
          <InputLeftElement pointerEvents="none" color="gray.400">
            <InfoOutlineIcon />
          </InputLeftElement>
          <Input
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
            bg="white"
            color="gray.800"
            _placeholder={{ color: "gray.400" }}
            borderRadius="full"
            focusBorderColor="green.500"
            _hover={{ borderColor: "gray.300" }}
            boxShadow="sm"
            fontSize="md"
          />
        </InputGroup>
      </FormControl>

      <FormControl id="signup-email" isRequired>
        <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" mb="1">Email Address</FormLabel>
        <InputGroup size="md">
          <InputLeftElement pointerEvents="none" color="gray.400">
            <EmailIcon />
          </InputLeftElement>
          <Input
            type="email"
            placeholder="Enter your email address"
            onChange={(e) => setEmail(e.target.value)}
            bg="white"
            color="gray.800"
            _placeholder={{ color: "gray.400" }}
            borderRadius="full"
            focusBorderColor="green.500"
            _hover={{ borderColor: "gray.300" }}
            boxShadow="sm"
            fontSize="md"
          />
        </InputGroup>
      </FormControl>

      <FormControl id="signup-password" isRequired>
        <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" mb="1">Password</FormLabel>
        <InputGroup size="md">
          <InputLeftElement pointerEvents="none" color="gray.400">
            <LockIcon />
          </InputLeftElement>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter password"
            onChange={(e) => setPassword(e.target.value)}
            bg="white"
            color="gray.800"
            _placeholder={{ color: "gray.400" }}
            borderRadius="full"
            focusBorderColor="green.500"
            _hover={{ borderColor: "gray.300" }}
            boxShadow="sm"
            fontSize="md"
          />
          <InputRightElement width="3rem" mr={1}>
            <IconButton
              h="1.75rem"
              w="1.75rem"
              size="sm"
              variant="ghost"
              color="gray.500"
              onClick={handleClick}
              icon={show ? <ViewOffIcon /> : <ViewIcon />}
              aria-label={show ? "Hide password" : "Show password"}
              borderRadius="full"
            />
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="signup-confirmpassword" isRequired>
        <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" mb="1">Confirm Password</FormLabel>
        <InputGroup size="md">
          <InputLeftElement pointerEvents="none" color="gray.400">
            <LockIcon />
          </InputLeftElement>
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm password"
            onChange={(e) => setConfirmpassword(e.target.value)}
            bg="white"
            color="gray.800"
            _placeholder={{ color: "gray.400" }}
            borderRadius="full"
            focusBorderColor="green.500"
            _hover={{ borderColor: "gray.300" }}
            boxShadow="sm"
            fontSize="md"
          />
          <InputRightElement width="3rem" mr={1}>
            <IconButton
              h="1.75rem"
              w="1.75rem"
              size="sm"
              variant="ghost"
              color="gray.500"
              onClick={handleClick}
              icon={show ? <ViewOffIcon /> : <ViewIcon />}
              aria-label={show ? "Hide password" : "Show password"}
              borderRadius="full"
            />
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="pic">
        <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" mb="1">Upload your Picture</FormLabel>
        <Input
          type="file"
          p={1}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
          bg="white"
          borderRadius="full"
          focusBorderColor="green.500"
          _hover={{ borderColor: "gray.300" }}
          sx={{
            '::file-selector-button': {
              height: '100%',
              padding: '0 1rem',
              mr: '1rem',
              border: 'none',
              background: 'gray.100',
              color: 'gray.700',
              fontWeight: 'medium',
              borderRadius: 'full',
              cursor: 'pointer',
              transition: 'background .2s',
            },
            '::file-selector-button:hover': {
              background: 'gray.200',
            }
          }}
        />
      </FormControl>

      <Box pt="2">
        <Button
          bg="black"
          color="white"
          width="100%"
          size="lg"
          borderRadius="full"
          _hover={{
            bg: "gray.800",
            boxShadow: "lg",
          }}
          _active={{
            bg: "gray.900",
            transform: "scale(0.98)",
          }}
          transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
          onClick={submitHandler}
          isLoading={picLoading}
          fontWeight="semibold"
          fontSize="md"
        >
          Sign Up
        </Button>
      </Box>
    </VStack>
  );
};

export default Signup;
