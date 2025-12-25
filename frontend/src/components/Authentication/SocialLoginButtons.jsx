import React from "react";
import { BsGoogle, BsGithub } from "react-icons/bs";
import { Button, ButtonGroup, useToast } from "@chakra-ui/react";
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { firebaseAuth } from "../../config/FirebaseConfig";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";

export default function SocialLoginButtons() {
  const history = useHistory();
  const toast = useToast();
  const { setUser } = ChatState();

  const providers = {
    google: new GoogleAuthProvider(),
    github: new GithubAuthProvider(),
  };

  const firebaseLogin = async (loginType) => {
    try {
      const provider = providers[loginType];
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;

      const config = { headers: { "Content-type": "application/json" } };

      const { data } = await axios.post(
        "/api/user/social-login",
        { name: user.displayName, email: user.email, pic: user.photoURL },
        config
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);

      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      history.push("/chats");
    } catch (err) {
      console.error("Auth Error:", err);
      toast({
        title: "Error Occurred!",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    // Added display='flex' so buttons stretch to fill the empty space
    <ButtonGroup
      spacing={4}
      width="100%"
      display="flex"
      style={{ marginTop: 15 }}
    >
      <Button
        variant="solid"
        colorScheme="blue"
        width="100%"
        leftIcon={<BsGoogle />}
        onClick={() => firebaseLogin("google")}
      >
        Google
      </Button>

      <Button
        variant="solid"
        colorScheme="gray"
        width="100%"
        leftIcon={<BsGithub />}
        onClick={() => firebaseLogin("github")}
      >
        Github
      </Button>
    </ButtonGroup>
  );
}
