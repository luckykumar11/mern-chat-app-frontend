import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { getAblyClient } from "../config/ablyClient";

const ChatContext = createContext();

const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return true;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64));
    if (!payload?.exp) return false;

    return payload.exp * 1000 <= Date.now();
  } catch (error) {
    return true;
  }
};

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();

  const history = useHistory();

  useEffect(() => {
    const rawUserInfo = localStorage.getItem("userInfo");
    const userInfo = rawUserInfo ? JSON.parse(rawUserInfo) : null;

    if (!userInfo || isTokenExpired(userInfo.token)) {
      if (userInfo?.token) {
        sessionStorage.setItem("sessionExpired", "true");
      }
      localStorage.removeItem("userInfo");
      setUser(undefined);
      setSelectedChat(undefined);
      setChats(undefined);
      setNotification([]);
      history.push("/");
      return;
    }

    setUser(userInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (!user?.token) return;

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get("/api/message/unread", config);
        setNotification(data || []);
      } catch (error) {
        // Keep notifications best-effort to avoid blocking chat UX.
      }
    };

    fetchUnreadNotifications();
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;

    const ablyClient = getAblyClient();
    if (!ablyClient) return;

    const channel = ablyClient.channels.get(`user-${user._id}`);
    const handleNotification = (msg) => {
      const newMessage = msg?.data;
      if (!newMessage?._id) return;

      if (selectedChat?._id && selectedChat._id === newMessage.chat?._id) {
        return;
      }

      setNotification((prev) => {
        const exists = prev.some((item) => item._id === newMessage._id);
        return exists ? prev : [newMessage, ...prev];
      });
    };

    channel.subscribe("notification", handleNotification);

    return () => {
      channel.unsubscribe("notification", handleNotification);
    };
  }, [user?._id, selectedChat?._id]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
