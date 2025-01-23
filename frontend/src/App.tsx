import { useEffect, useState } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { WelcomePage } from "./components/welcomePage"
import { Chats } from "./components/chat-interface"
import { SocketContextProvider } from "./globalContext/globalContext"
import { SessionContextProvider } from "./globalContext/sessionContext"

const router = createBrowserRouter([{
  path: "/",
  element: <WelcomePage/>
}, {
  path: "/chats/:chatroomId",
  element: <Chats/>
}])

function App() {

  return (
    <SessionContextProvider>
    <SocketContextProvider>
      <RouterProvider router={router}>

      </RouterProvider>

    </SocketContextProvider>
    </SessionContextProvider>
   
  )

}

export default App
