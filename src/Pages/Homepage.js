import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Flex,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

function Homepage() {
  const history = useHistory();
  const [tabIndex, setTabIndex] = useState(0);
  const [prefillEmail, setPrefillEmail] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) history.push("/chats");
  }, [history]);

  return (
    <Flex minH="100vh" w="100%" direction={{ base: "column", md: "row" }} bg="white">
      {/* Left Side: Brand & Visuals */}
      <Flex
        flex={1}
        bgImage="url('/bg-chat.png')"
        bgPos="center"
        bgSize="cover"
        display={{ base: "none", md: "flex" }}
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          bg="blue.900"
          opacity={0.3}
          pointerEvents="none"
        />
        <VStack
          zIndex={1}
          bg="rgba(255, 255, 255, 0.15)"
          backdropFilter="blur(20px)"
          p={10}
          borderRadius="2xl"
          border="1px solid rgba(255, 255, 255, 0.3)"
          boxShadow="2xl"
          spacing={6}
          textAlign="center"
          maxW="md"
        >
          <Text
            fontSize="5xl"
            fontFamily="Work sans"
            fontWeight="extrabold"
            color="white"
            letterSpacing="tight"
          >
            Talk-A-Tive
          </Text>
          <Text fontSize="lg" color="whiteAlpha.900" fontWeight="medium">
            Connect with friends, colleagues, and loved ones instantly using our modern chat platform.
          </Text>
        </VStack>
      </Flex>

      {/* Right Side: Authentication Forms */}
      <Flex
        flex={1}
        alignItems="center"
        justifyContent="center"
        bg="white"
        p={{ base: 4, md: 8 }}
      >
        <Box w="100%" maxW="md">
          <VStack spacing={8} align="stretch" mb={8} display={{ base: "flex", md: "none" }}>
            <Text
              fontSize="4xl"
              fontFamily="Work sans"
              fontWeight="extrabold"
              textAlign="center"
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
            >
              Talk-A-Tive
            </Text>
          </VStack>

          <VStack spacing={2} align="center" mb={8}>
            <Text
              fontSize="4xl"
              fontWeight="bold"
              fontFamily="Work sans"
              letterSpacing="tight"
              color="gray.800"
              textAlign="center"
            >
              Get started
            </Text>
            <Text fontSize="md" color="gray.500" textAlign="center">
              Login or create a new account to continue.
            </Text>
          </VStack>

          <Tabs
            isFitted
            variant="unstyled"
            colorScheme="blue"
            index={tabIndex}
            onChange={(index) => setTabIndex(index)}
          >
            <TabList mb="2em" bg="gray.100" p={1} borderRadius="full">
              <Tab
                _selected={{ color: "white", bg: "blue.500", boxShadow: "md" }}
                borderRadius="full"
                fontWeight="semibold"
                transition="all 0.3s"
                color="gray.500"
              >
                Login
              </Tab>
              <Tab
                _selected={{ color: "white", bg: "blue.500", boxShadow: "md" }}
                borderRadius="full"
                fontWeight="semibold"
                transition="all 0.3s"
                color="gray.500"
              >
                Sign Up
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0} pt={0}>
                <Login prefillEmail={prefillEmail} />
              </TabPanel>
              <TabPanel px={0} pt={0}>
                <Signup
                  onSignupSuccess={(signedUpEmail) => {
                    setPrefillEmail(signedUpEmail || "");
                    setTabIndex(0);
                  }}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Flex>
  );
}

export default Homepage;
