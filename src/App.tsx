import React, {useState, useEffect} from "react";
import { Input } from "./components/Input";

interface FormData {
  time: string;
  title: string;
  description: string;
}
const form: FormData= {
  time: "",
  title: "",
  description: ""
}

const App: React.FC= () =>{
  const [formData, setFormData]= useState<FormData>(form);
  const [errors, setErrors]= useState<Partial<FormData>>({});
  const [showErrors, setShowErrors] = useState({ time: false, title: false, description: false });
  const [valid, setValid]= useState(false);
  const [reminders, setReminders]= useState<{time: string; title: string}[]>([]);
  const [sortType, setSortType]= useState<"time" | "title" | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAlarm, setCurrentAlarm] = useState<{ time: string; title: string } | null>(null);
  const [audio] = useState(new Audio("/alarm.mp3"));
  useEffect(() => {
    const storedReminders = localStorage.getItem("reminders");
    if (storedReminders) {
      setReminders(JSON.parse(storedReminders));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [reminders]);

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
    setValid(Object.values(newErrors).every((error)=> error=== undefined))
  }
  useEffect(() =>{
    validateInputs();
  }, [formData]);
  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value}= event.target;
    setFormData((prev) =>({...prev, [name]: value}))
    validateInputs();
  }
  const handleFocus = (field: any) => {
    setShowErrors((prev) => ({ ...prev, [field]: true }));
  };

  const submitHandler= (event: React.FormEvent) =>{
    event.preventDefault();
    if (valid){
      setReminders((prev) =>[...prev, {time: formData.time, title: formData.title}]);
      setFormData(form);
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
    })
    )
  }
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date().toLocaleTimeString([], { hour12: false }).slice(0, 5);
      reminders.forEach((reminder) => {
        if (reminder.time === now && !modalVisible) {
          setCurrentAlarm(reminder);
          setModalVisible(true);
          audio.play();
        }
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [reminders, modalVisible, audio]);
  const handleCloseModal = () => {
    audio.pause();
    audio.currentTime = 0;
    setModalVisible(false);
  };
  const handleExtendAlarm = () => {
    if (currentAlarm) {
      const extendedTime = new Date();
      extendedTime.setMinutes(extendedTime.getMinutes() + 1);
      const newReminder = { ...currentAlarm, time: extendedTime.toLocaleTimeString([], { hour12: false }).slice(0, 5) };
      setReminders((prev) => prev.map((r) => (r.title === currentAlarm.title ? newReminder : r)));
      handleCloseModal();
    }
  };
  const handleDeleteAlarm = () => {
    if (currentAlarm) {
      setReminders((prev) => prev.filter((r) => r.title !== currentAlarm.title));
      handleCloseModal();
    }
  };
  return(
    <div className="relative bg-gray-200 h-[100vh] pt-5">
      <form className="flex flex-col bg-white px-10 py-5 max-w-[600px] mx-auto" onSubmit={submitHandler}>
        <label>Alarm Time</label>
        <Input type="time" name="time" value={formData.time} onChange={changeHandler} onFocus={() => handleFocus("time")} error={showErrors.time && errors.time}/>
        <label>Alarm Title</label>
        <Input type="text" name="title" placeholder="Title" value={formData.title} onChange={changeHandler} onFocus={() => handleFocus("title")} error={showErrors.title &&errors.title}/>
        <label>Alarm Description</label>
        <Input type="text" name="description" placeholder="Description" value={formData.description} onChange={changeHandler} onFocus={() => handleFocus("description")} error={showErrors.description &&errors.description}/>
        <button type="submit" className={`${valid ? "bg-green-500" : "bg-gray-400"} text-white rounded`} disabled={!valid}>Submit</button>
      </form>
      <table className="bg-white px-10 py-5 w-[600px] mx-auto mt-5">
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
              <th className="text-red-500 border" onClick={() => handleDeleteAlarm()}><button>Delete</button></th>
            </tr>
          ))}
        </tbody>
      </table>
      {modalVisible && currentAlarm && (
        <div className="w-[100vw] h-[100vh] bg-[#848A97] fixed top-0 flex justify-center items-center">
          <div className="w-96 h-44 mx-auto bg-white rounded-lg flex flex-col justify-around items-center">
            <h3 className="text-3xl">Time: {currentAlarm.time}</h3>
            <span className="w-full flex justify-around flex-wrap">
              <button onClick={handleCloseModal} className="px-3 py-2 border-2 rounded-md">Close</button>
              <button onClick={handleExtendAlarm} className="px-3 py-2 border-2 rounded-md">Extend</button>
              <button onClick={handleDeleteAlarm} className="px-3 py-2 rounded-md bg-red-500 text-white">Delete</button>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
export default App;