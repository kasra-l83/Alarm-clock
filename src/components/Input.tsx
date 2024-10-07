import {classNames} from "../utils/classNames";
interface IInputProps
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement>{
  error?: string | boolean;
}
export const Input: React.FC<IInputProps>= ({
  error,
  className,
  ...inputProps
}) =>{
  return(
    <div className="w-full space-y-1 mb-3">
      <input className= {classNames(className || "rounded border-2 w-full pl-2")} {...inputProps}/>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  )
}
export default Input;