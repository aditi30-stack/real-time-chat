import { createContext, useContext, useEffect, useState } from "react";


const socketContext = createContext(null)


export const SocketContextProvider = ({children}: {children: React.ReactNode}) =>{

    const [ws, setWs] = useState <WebSocket | null>(null)
    const [isReady, setIsReady] = useState <Boolean>(false)

    useEffect(()=>{
        const socket = new WebSocket("ws://localhost:8080")

        socket.onopen = () =>{
            console.log("connected")
            setIsReady(true)

        }
        

        socket.onerror = (error) =>{
            console.log(error)
        }

        socket.onclose = () =>{
            setIsReady(false)
        }

        setWs(socket)

        return () =>{
            socket.close()
        }

        

    }, [])

    return (
        <socketContext.Provider value={{ws, isReady}}>
            {children}
        </socketContext.Provider>
    )


}

export const useWebSocket = () =>{
    const ws = useContext(socketContext)
    
    if(!ws) {
        throw new Error("Websocket is not available")
    }

    return ws
    
}



