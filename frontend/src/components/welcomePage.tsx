import { useContext, useEffect, useState } from "react";
import { ToastComponent } from "./ToastComponent";
import { useToast } from "./ToastHook";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../globalContext/globalContext";
import { createSessionContext } from "../globalContext/sessionContext";

export const WelcomePage = () => {
  const [roomId, setRoomId] = useState<undefined | string>("");
  const [name, setName] = useState<undefined | string>("");
  const [event, setEvent] = useState<undefined | string>("");
  const { ShowToastComponent, triggerToastComponent } = useToast();
  const navigate = useNavigate();
  const { ws, isReady } = useWebSocket();
  const { session, setSession } = useContext(createSessionContext);

  useEffect(() => {
    if (isReady) {
        ws.onmessage = (event: MessageEvent) => {
          console.log("here")
          console.log(ws)
            let data = JSON.parse(event.data);
            console.log("data", data);
            if (data.payload && data.payload.sessionId) {
              setSession(data.payload.sessionId);  
            }
      
            
            if (data.payload && data.payload.roomId) {
              console.log("Navigating to room", data.payload.roomId);
              navigate(`/chats/${data.payload.roomId}`, {
                state: data.payload.chatHistory || []
              });
              
            } else {
              console.log("Room ID is missing or invalid");
            }
          };

      ws.onerror = (event: MessageEvent) => {
        setEvent("Error connecting the server!");
        triggerToastComponent({
          type: "Error connecting...",
          timer: 3000,
          success: "false",
        });
      };
    }

    return () => {
      if (ws) {
        ws.onmessage = null;
        ws.onerror = null
      }
    };
  }, [ws, isReady, session, navigate]);

  const JoinRoom = () => {
    console.log(roomId)
    if (ws && ws.readyState === WebSocket.OPEN) {
      if (
        roomId.trim() === "" ||
        name.trim() === "" ||
        isNaN(Number(roomId)) ||
        Number(roomId) <= 0
      ) {
        alert("Please enter correct roomid and name");
        return;
      }

      
      ws.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          payload: {
            roomId: roomId,
            name: name,
          },
        })
      );

      setName("");
      setRoomId("");
    } else {
      triggerToastComponent({
        type: "Error connecting...",
        timer: 3000,
        success: "false",
      });
    }
  };

  return (
    <div className="border mx-auto max-w-screen bg-slate-400 p-10 min-h-screen overflow-hidden">
      <div className="mx-auto max-w-screen-sm rounded-lg bg-slate-600 p-10 text-white my-10 flex flex-col items-center space-y-4">
        <h1>Welcome!</h1>

        <input
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setName(e.target.value);
          }}
          value={name}
          className="bg-slate-800 border border-slate-100 outline-none rounded-md p-1.5 w-1/2"
          type="text"
          placeholder="Enter your name!"
        ></input>
        <input
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setRoomId(e.target.value);
          }}
          value={roomId}
          className="bg-slate-800 border border-slate-100 outline-none rounded-md p-1.5 w-1/2"
          type="text"
          placeholder="Enter roomId to Join!"
        ></input>
        <button
          onClick={JoinRoom}
          disabled={!ws ? true : false}
          className="border p-1.5 rounded-md w-1/2 bg-slate-800"
        >
          Submit!
        </button>
      </div>

      {ShowToastComponent}
    </div>
  );
};
