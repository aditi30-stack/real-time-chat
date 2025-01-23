import { ChangeEvent, useEffect, useState, useContext, useRef } from "react";
import { useWebSocket } from "../globalContext/globalContext";
import { createSessionContext } from "../globalContext/sessionContext";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowUpLong } from "react-icons/fa6";

let globalId: number = 0;

// Interface for message
interface ChatMessage {
  id: string;
  name: string;
  message: string;
  upvotes: string[];
  chatId: string;
}

export const Chats = () => {
  const { ws, isReady } = useWebSocket();
  const navigate = useNavigate();
  const { session } = useContext(createSessionContext);
  const [chat, setChat] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (Array.isArray(location.state) && location.state.length > 0) {
      setMessages(location.state);
    }
  }, [location.state]);

  useEffect(() => {
    if (!session) {
      navigate("/");
      return;
    }

    if (isReady && ws?.readyState === WebSocket.OPEN) {
      ws.onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);

        const newMessage: ChatMessage = {
          id: (++globalId).toString(),
          name: data.payload.name,
          message: data.payload.message,
          upvotes: [],
          chatId: data.payload.chatId,
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);
      };

      ws.onerror = (e) => {
        console.error("WebSocket error:", e);
      };
    }

    return () => {
      if (ws) {
        ws.onmessage = null;
        ws.onerror = null;
      }
    };
  }, [ws, isReady, session, navigate]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const SendChat = () => {
    if (isReady && ws && ws.readyState === WebSocket.OPEN && chat.trim() !== "") {
      ws.send(
        JSON.stringify({
          type: "SEND_MESSAGE",
          payload: {
            sessionId: session,
            message: chat,
          },
        })
      );
      setChat("");
    }
  };

  const sendUpvote = (chatId: string) => {
    if (isReady && ws && ws.readyState === WebSocket.OPEN && session.trim() !== "" && chatId.trim() !== "") {
      ws.send(
        JSON.stringify({
          type: "UPVOTE_MESSAGE",
          payload: {
            sessionId: session,
            chatId: chatId,
          },
        })
      );
    }
  };

  // Separate messages for different priorities
  const lowPriorityChats = messages.filter((message) => message.upvotes.length < 2);
  const mediumPriorityChats = messages.filter((message) => message.upvotes.length >= 2 && message.upvotes.length <= 10);
  const highPriorityChats = messages.filter((message) => message.upvotes.length > 10);

  // Reusable component for rendering chat sections
  const renderChatSection = (
    title: string,
    chats: ChatMessage[],
    emptyMessage: string,
    showUpvote: boolean = true
  ) => (
    <div className="border-collapse flex-1">
      <h2 className="ml-1.5">{title}</h2>
      <div className="border-collapse pt-5 pb-5" style={{ maxHeight: "400px", overflowY: "scroll" }}>
        {chats.length > 0 ? (
          chats.map((message) => (
            <div
              className="flex font-semibold bg-slate-900 pt-1 pb-1 mb-2.5 px-4 justify-between rounded-md"
              key={message.id}
            >
              <div className="flex gap-2">
                <div className="text-slate-200">{message.name}:</div>
                <div className="text-slate-200">{message.message}</div>
              </div>
              <div className="flex items-center gap-2.5">
                {showUpvote && (
                  <div
                    onClick={() => sendUpvote(message.chatId)}
                    className="text-white font-bold cursor-pointer border rounded-full p-1"
                  >
                    <FaArrowUpLong />
                  </div>
                )}
                <div>{message.upvotes.length}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-slate-200">{emptyMessage}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-slate-400 min-h-screen">
      <div className="max-w-screen-md mx-auto p-10 relative top-20 flex flex-col bg-slate-600 text-white rounded-md">
        <h1 className="text-center">Chat</h1>
        <div className="flex border border-white justify-between p-2 rounded-md mt-2 gap-4">
          {/* All Chat Sections */}
          {renderChatSection("Low Priority Chats", lowPriorityChats, "No low-priority messages")}
          {renderChatSection("Medium Priority Chats", mediumPriorityChats, "No medium-priority messages")}
          {renderChatSection("High Priority Chats", highPriorityChats, "No high-priority messages", false)}
        </div>

        {/* Input Section */}
        <div className="flex mt-4 gap-2">
          <input
            className="bg-slate-800 p-1.5 mr-1.5 rounded-md outline-none flex-1"
            type="text"
            placeholder="Enter your chat"
            value={chat}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setChat(e.target.value)}
          />
          <button onClick={SendChat} className="bg-slate-800 rounded-md p-1.5">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};