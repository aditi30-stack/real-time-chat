import {createContext, useState } from "react";


export const createSessionContext = createContext(null)

export const SessionContextProvider = ({children}: {children:React.ReactNode}) =>{

    const [session, setSession] = useState <string>("")
    return (
        <createSessionContext.Provider value={{session, setSession}}>
            {children}
        </createSessionContext.Provider>
    )
}


