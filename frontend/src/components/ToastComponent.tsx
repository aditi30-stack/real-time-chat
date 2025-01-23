
import { toastProps } from "./ToastHook"

export const ToastComponent = ({type, success}: toastProps) =>{
    
    
    return(
        
        <div className="w-1/2">
            <div className={`w-1/2 p-2 ${success === "false" ? "bg-red-500": "bg-green-500"} rounded-md text-white font-bold ml-10`}>
           {type}

            </div>

        </div>
        
    )
}