import React, {useState, useEffect} from "react";
import { Input } from "./components/Input";

interface FormData {
  time: string
  title: string
  description: string
}
const form: FormData= {
  time: "",
  title: "",
  description: ""
}

const App: React.FC= () =>{
  const [formData, setFormData]= useState<FormData>(form);
  const [errors, setErrors]= useState<Partial<FormData>>({});
  const [showErrors, setShowErrors]= useState({ time: false, title: false, description: false });
  const [valid, setValid]= useState<boolean>(false);
  const [reminders, setReminders]= useState<Omit<FormData, "description">[]>(() =>{
    const savedReminders= localStorage.getItem('reminders');
    return savedReminders ? JSON.parse(savedReminders) : [];
  })
  const [sortType, setSortType]= useState<"time" | "title" | null>(null);
  const [modal, setModal] = useState<boolean>(false);
  const [currentAlarm, setCurrentAlarm] = useState<Omit<FormData, "description"> | null>(null);
  const [audio] = useState(new Audio("/alarm.mp3"));

  useEffect(() =>{
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [reminders])

  const validateInputs= () =>{
    const newErrors: Partial<FormData>= {};
    if(!formData.time){
      newErrors.time= "Time is required"
    }
    if (!formData.title){
      newErrors.title= "Title is required";
    }else if (formData.title.length< 5){
      newErrors.title= "Title should be at least 5 characters";
    }
    if (!formData.description){
      newErrors.description= "Description is required";
    }else if (formData.description.length< 10){
      newErrors.description= "Description should be at least 10 characters";
    }
    setErrors(newErrors);
    setValid(Object.values(newErrors).every((error)=> error=== ""))
  }
  useEffect(() =>{
    validateInputs();
  }, [formData])

  const changeHandler= (event: React.ChangeEvent<HTMLInputElement>) =>{
    const {name, value}= event.target;
    setFormData((prev) =>({...prev, [name]: value}))
    validateInputs();
  }
  const focusHandler = (field: any) => {
    setShowErrors((prev) => ({ ...prev, [field]: true }));
  }
  const submitHandler= (event: React.FormEvent) =>{
    event.preventDefault();
    if (valid){
      setReminders((prev) =>[...prev, {time: formData.time, title: formData.title}]);
      setFormData(form);
      setShowErrors({time: false, title: false, description: false});
      setValid(false);
    }
  }
  const sort= (type: "time" | "title") =>{
    setSortType(type);
    setReminders((prev) =>[...prev].sort((a, b) =>{
      if (type === "time"){
        return a.time.localeCompare(b.time);
      } else{
        return a.title.localeCompare(b.title);
      }
    }))
  }
  useEffect(() =>{
    const intervalId= setInterval(() =>{
      const now= new Date().toLocaleTimeString([], { hour12: false }).slice(0, 5);
      reminders.forEach((reminder) => {
        if (reminder.time=== now && !modal){
          setCurrentAlarm(reminder);
          setModal(true);
          audio.play();
        }
      })
    }, 1000)
    return () => clearInterval(intervalId);
  }, [reminders, modal, audio]);

  const closeHandler= () =>{
    audio.pause();
    setModal(false);
  }
  const extendHandler= () =>{
    if (currentAlarm){
      const extend= new Date();
      extend.setMinutes(extend.getMinutes()+ 5);
      const newReminder = { ...currentAlarm, time: extend.toLocaleTimeString([], {hour12: false}).slice(0, 5)};
      setReminders((prev) => prev.map((event) =>(event.title=== currentAlarm.title ? newReminder : event)));
      closeHandler();
    }
  }
  const deleteHandler= () =>{
    if (currentAlarm){
      setReminders((prev) => prev.filter((event) => event.title !== currentAlarm.title));
      closeHandler();
    }
  }
  return(
    <div className="relative bg-gray-200 h-[100vh] pt-5">
      <form className="flex flex-col bg-white px-10 py-5 max-w-[600px] mx-auto rounded" onSubmit={submitHandler}>
        <label>Alarm Time</label>
        <Input type="time" name="time" value={formData.time} onChange={changeHandler} onFocus={() => focusHandler("time")} error={showErrors.time && errors.time}/>
        <label>Alarm Title</label>
        <Input type="text" name="title" placeholder="Title" value={formData.title} onChange={changeHandler} onFocus={() => focusHandler("title")} error={showErrors.title &&errors.title}/>
        <label>Alarm Description</label>
        <Input type="text" name="description" placeholder="Description" value={formData.description} onChange={changeHandler} onFocus={() => focusHandler("description")} error={showErrors.description &&errors.description}/>
        <button type="submit" className={`${valid ? "bg-green-500" : "bg-gray-400"} text-white rounded`} disabled={!valid}>Submit</button>
      </form>
      <table className="bg-white px-10 py-5 sm:w-[600px] mx-auto mt-5 rounded">
        <thead>
          <tr className="border">
            <th colSpan={2}><button onClick={() => sort("time")}>Time</button></th>
            <th colSpan={2}><button onClick={() => sort("title")}>Title</button></th>
          </tr>
        </thead>
        <tbody>
          {reminders.map((reminder, index) =>(
            <tr key={index} className="border">
              <th className="border">{reminder.time}</th>
              <th className="border">{reminder.title}</th>
              <th className="border"><button>Edit</button></th>
              <th className="text-red-500 border"><button>Delete</button></th>
            </tr>
          ))}
        </tbody>
      </table>
      {modal && currentAlarm && (
        <div className="w-[100vw] h-[100vh] bg-[#848A97] fixed top-0 flex justify-center items-center">
          <div className="w-96 h-44 mx-auto bg-white rounded-lg flex flex-col justify-around items-center">
            <h3 className="text-3xl">Time: {currentAlarm.time}</h3>
            <span className="w-full flex justify-around items-center flex-wrap space-y-2">
              <button onClick={closeHandler} className="px-3 py-2 border-2 rounded-md mt-2">Close</button>
              <button onClick={extendHandler} className="px-3 py-2 border-2 rounded-md">Extend</button>
              <button onClick={deleteHandler} className="px-3 py-2 rounded-md bg-red-500 text-white">Delete</button>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
export default App;