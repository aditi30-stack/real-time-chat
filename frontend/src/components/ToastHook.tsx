import { useCallback, useState } from "react"
import { ToastComponent } from "./ToastComponent";

export interface toastProps {
    type: string,
    timer: number,
    success: string
}

export const useToast =() =>{
    const [toastValues, setToastValues] = useState(null)

    let timer:number;

    
    const triggerToastComponent = useCallback((toastProps:toastProps) =>{
            clearTimeout(timer)
            setToastValues(toastProps)
    
            timer = setTimeout(()=>{
                setToastValues(null)
    
            }, toastProps.timer)

            
    
            }, [toastValues])

    

    const ShowToastComponent = toastValues ? (
        <ToastComponent {...toastValues}/>
    ): null

    return {
        ShowToastComponent,
        triggerToastComponent
    }

    

   

    
    
}