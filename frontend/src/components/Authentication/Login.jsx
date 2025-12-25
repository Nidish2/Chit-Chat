import React, { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import SocialLoginButtons from "./SocialLoginButtons";
import { ChatState } from "../../Context/ChatProvider"; // Import ChatState

function Login() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const history = useHistory();
  const { setUser } = ChatState(); // Get setUser from Context

  const handleClick = () => setShow(!show);

  const submitHandler = async () => {
    setLoading(true);

    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    const config = {
      headers: {
        "Content-type": "application/json",
      },
    };

    const payload = { email, password };

    try {
      const { data } = await axios.post("/api/user/login", payload, config);

      toast({
        title: "Login successful!",
        description: "You have successfully logged in.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data); // 🔥 FIX: Update Context State immediately
      setLoading(false);
      history.push("/chats");
    } catch (loginError) {
      // ... (Error handling logic stays the same) ...
      // For brevity, keeping your existing error logic mostly implies:
      const errMsg =
        loginError.response?.data?.message || "An error occurred during login.";

      toast({
        title: "Error Occurred!",
        description: errMsg,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <VStack spacing="5px" color="black">
      <FormControl id="login-email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>

      <FormControl id="login-password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Login
      </Button>

      <Button
        variant="solid"
        colorScheme="red"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("12345678");
        }}
      >
        Get Guest User Credentials
      </Button>

      <SocialLoginButtons />
    </VStack>
  );
}

export default Login;
