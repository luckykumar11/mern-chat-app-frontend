import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement, InputLeftElement } from "@chakra-ui/input";
import { VStack, Box, IconButton, Text, Divider, HStack } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";
import { ViewIcon, ViewOffIcon, EmailIcon, LockIcon } from "@chakra-ui/icons";

const Login = ({ prefillEmail = "" }) => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);

  const history = useHistory();
  const { setUser } = ChatState();

  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response?.data?.message || "Invalid Email or Password",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <VStack spacing="4" mt="2" align="stretch">
      <FormControl id="login-email" isRequired>
        <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" mb="2">Email address</FormLabel>
        <InputGroup size="lg">
          <InputLeftElement pointerEvents="none" color="gray.400">
            <EmailIcon />
          </InputLeftElement>
          <Input
            value={email || ""}
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            bg="white"
            color="gray.800"
            _placeholder={{ color: "gray.400" }}
            borderRadius="full"
            focusBorderColor="blue.500"
            _hover={{ borderColor: "gray.300" }}
            boxShadow="sm"
            fontSize="md"
          />
        </InputGroup>
      </FormControl>

      <FormControl id="login-password" isRequired>
        <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" mb="2">Password</FormLabel>
        <InputGroup size="lg">
          <InputLeftElement pointerEvents="none" color="gray.400">
            <LockIcon />
          </InputLeftElement>
          <Input
            value={password || ""}
            onChange={(e) => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            placeholder="Enter your password"
            bg="white"
            color="gray.800"
            _placeholder={{ color: "gray.400" }}
            borderRadius="full"
            focusBorderColor="blue.500"
            _hover={{ borderColor: "gray.300" }}
            boxShadow="sm"
            fontSize="md"
          />
          <InputRightElement width="3rem" mr={1}>
            <IconButton
              h="2rem"
              w="2rem"
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

      <Box pt="4">
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
          isLoading={loading}
          fontWeight="semibold"
          fontSize="md"
        >
          Continue
        </Button>
      </Box>

      <HStack>
        <Divider />
        <Text fontSize="sm" color="gray.400" minW="max-content" px={2}>
          OR
        </Text>
        <Divider />
      </HStack>

      <Box>
        <Button
          variant="outline"
          colorScheme="gray"
          color="gray.700"
          width="100%"
          size="lg"
          borderRadius="full"
          _hover={{
            bg: "gray.50",
            boxShadow: "sm"
          }}
          _active={{
            bg: "gray.100",
            transform: "scale(0.98)",
          }}
          transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
          onClick={() => {
            setEmail("guest@example.com");
            setPassword("123456");
          }}
          fontWeight="medium"
          fontSize="md"
        >
          Use Guest Account
        </Button>
      </Box>
    </VStack>
  );
};

export default Login;
