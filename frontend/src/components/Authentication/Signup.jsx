import React, { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Text,
  Divider,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import SocialLoginButtons from "./SocialLoginButtons";
import { ChatState } from "../../Context/ChatProvider"; // Import ChatState

const Signup = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState("");
  const [loading, setLoading] = useState(false);

  const history = useHistory();
  const toast = useToast();
  const { setUser } = ChatState(); // Get setUser

  const handleClick = () => setShow(!show);

  const postDetails = (pics) => {
    // ... (Your existing Cloudinary logic remains exactly the same) ...
    setLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please upload a Profile Picture!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
    // ... Assume Cloudinary logic here is unchanged ...
    // NOTE: For brevity in this response, paste your Cloudinary fetch code here.
    // If you need it fully typed out again, let me know, but it was correct in your upload.
    setLoading(false); // Placeholder closing for logic
  };

  const submitHandler = async () => {
    setLoading(true);
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Please fill all fields!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
    try {
      const config = { headers: { "Content-type": "application/json" } };
      const { data } = await axios.post(
        "/api/user",
        { name, email, password, pic },
        config
      );

      toast({
        title: "Account created successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data); // 🔥 FIX: Update Context State immediately
      setLoading(false);
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Error occurred!",
        description: error.response?.data?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    // ... (Your JSX remains exactly the same) ...
    <VStack spacing="5px" color="black">
      {/* Paste your existing form JSX here */}
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter Your Name"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      <FormControl id="signup-email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          placeholder="Enter Your Email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="signup-password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Your Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="confirm-password" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="pic">
        <FormLabel>Upload your Picture</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>
      <Button
        colorScheme="green"
        width="100%"
        mt={4}
        onClick={submitHandler}
        isLoading={loading}
      >
        Sign Up
      </Button>
      <VStack width="100%" my={4}>
        <Divider />
        <Text fontSize="sm" color="gray.600">
          <b>Or sign up with</b>
        </Text>
      </VStack>
      <SocialLoginButtons />
    </VStack>
  );
};

export default Signup;
