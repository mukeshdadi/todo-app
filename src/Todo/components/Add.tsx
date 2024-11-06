import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './Add.css';
import axios from 'axios';
import {  message, TimePicker, InputNumber, Radio, Button,Select, RadioChangeEvent, Checkbox, Input, Tooltip} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
interface Todo {
  id: number;
  title: string;
  description: string;
  role: string;
  fromDate?: string;
  toDate?: string | null;
  repeatDays: string[],
  status?: string  ;
  daily?:any;
  monthly?:any;
  weekly?:any;
  repeatType:string,
  lsaEntries: { LsaTime: string | null, LsaHrs: number | null }[]
}

interface Dialog {
  task_id?:number;
  title:string;
  fromDate:string;
  toDate:string;
  option?:string;
  repeatDays: string[];
  allDates?:string[];
  week?:number | undefined;
  no_of_months?:number| null;
  months?:number |null;
   TimeFrequency:  Array<{ lsaHrs: number; lsaTime: string }>;
}

const rolesOptions = ['Trainee', 'SDE -1', 'SDE -2', 'Intern'];
const todosOptions = [
  'Update Your Learning Technologies Status',
  'Perform tasks based on Javascript',
  'Complete Tasks on React and NestJs',
  'Update Your Work Status',
];
const dateOptions = [
  'Daily',
  'Monthly',
  'By Weekly Days',
  

]

const Add: React.FC = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0]; 
  };


  const initial: Omit<Todo, 'id'>= {
    title: '',
    description: '',
    role: '',
    fromDate: '',
    toDate:'',
    repeatType: '',
    daily:'',
    monthly:'',
    weekly:'',
    repeatDays: weekdays,

    lsaEntries: [{ LsaTime: "10:00", LsaHrs: 1 }]

  };
  const DialogInitial : Dialog = {
    task_id:0,
    title:'',
    fromDate:getTodayDate(),
    option:'',
    toDate:'',
    repeatDays: weekdays,
    allDates:[],
    week:undefined,
    months:null,
    no_of_months:null,
    TimeFrequency:[],
    }
  const [formData, setFormData] = useState<Omit<Todo, 'id'>>(initial);
  const [DialogData, setDialogData] = useState<Dialog> (DialogInitial);
  const [errors, setErrors] = useState<{ [key: string]: string }>({
    title: '',
    description: '',
    date: '',
    role: '',
    lsa: ''
  });
  const [showTextInput, setShowTextInput] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isMultipleSelect, setIsMultipleSelect] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [endsOption, setEndsOption] = useState<string>('never');
  const [taskExists, setTaskExists] = useState(false); 
  const { Option } = Select;
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState<number >(currentMonth);

  const location = useLocation();
  const { title } = location.state || { title: '' }; 
  
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    
    if (name === 'title') {
        if (value === '+') {
            setShowTextInput(true);
            setFormData((prev) => ({ ...prev, title: '' })); 
            return;
        }

       
        setFormData((prev) => ({ ...prev, title: value }));

        
        if (value) {
            const taskExists = await checkTaskExists(value);
            setTaskExists(taskExists);
        } else {
            setTaskExists(false);
        }
    } 
    
    else if (name === 'role') {
        setFormData((prev) => ({
            ...prev,
            role: value === 'All' ? 'All' : value,
        }));
        setIsMultipleSelect(value === 'Multiple');
        setErrors((prev) => ({
            ...prev,
            role: value ? '' : 'Select the Role first',
        }));
    } 
    
    else {
        
        setFormData((prev) => ({ ...prev, [name]: value }));
        
        
        setErrors((prev) => ({
            ...prev,
            [name]: value.length > 0 ? '' : prev[name as keyof typeof prev],
        }));
    }
};


const handleTitleChange = async (selectedTitle: string) => {
  if (selectedTitle === '+') {

    setShowTextInput(true);
    setFormData((prevState) => ({ ...prevState, title: '' }));
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 0);
    return;
  }


  setFormData((prevState) => ({ ...prevState, title: selectedTitle }));
  try {

    const taskData = await checkTaskExists(selectedTitle);
    console.log('Task data from todos table:', taskData);

    if (!taskData) {
      return;
    }

    const scheduleResponse = await axios.get(
      `http://localhost:3000/schedules/byTitle?title=${selectedTitle}`
    );
    const scheduleData = scheduleResponse.data;
    let allCompleted = true;
    
    if (Array.isArray(scheduleData)) {
      scheduleData.forEach((task) => {
        if (task.status.toLowerCase() !== 'completed') {
          allCompleted = false; // Mark as not all completed
        }
      });
    } else {
      if (scheduleData.status.toLowerCase() !== 'completed') {
        allCompleted = false;
      }
    }

    
    if (!allCompleted) {
      message.error(t('completeAllTasksBeforeProceeding'));
      setFormData((prevState) => ({ ...prevState, title: '' }));
      return;
    }

    
    fillFormData(taskData, selectedTitle);
  } catch (error) {
    console.error('Error handling title change:', error);
    message.error(t('processingError'));
  }
};

const checkTaskExists = async (title: string) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/todos/byTitle?title=${title}`
    );
    
    if (response.data) {
      console.log('Task exists in todos table:', response.data);
      setTaskExists(true);
      return response.data;
    } else {
      console.log('No task found with this title.');
      setTaskExists(false);
      return null;
    }
  } catch (error) {
    console.error('Error checking task existence', error);
   
    setTaskExists(false);
    return null;
  }
};


const fillFormData = (data: any, title: string) => {
  const { role, description, repeatType, fromDate, toDate, repeatDays, daily, weekly, monthly } = data;

  const roleArray = role ? role.split(',').map((role: string) => role.trim()) : [];

  setFormData((prev) => ({
    ...prev,
    description: description || prev.description || '',
    role: roleArray.join(',') || prev.role || '',
    repeatType: repeatType || prev.repeatType,
    title: title,
  }));

  setSelectedRoles(roleArray);
  setIsMultipleSelect(true);

  let dialogData: Dialog = {
    title: title,
    fromDate: fromDate || '',
    toDate: toDate || '',
    repeatDays: repeatDays || [],
    TimeFrequency: [],  
  };

  if (repeatType === "Daily" && daily?.TimeFrequency) {
    setFormData((prev) => ({
      ...prev,
      lsaEntries: daily.TimeFrequency.map((entry: { LsaTime: string; LsaHrs: number }) => ({
        LsaTime: entry.LsaTime,
        LsaHrs: entry.LsaHrs,
      })),
    }));
    dialogData = {
      ...dialogData,
      option: daily.option || 'never',
      repeatDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      TimeFrequency: daily.TimeFrequency, 
    };
  } else if (repeatType === "By Weekly Days" && weekly?.TimeFrequency) {
    setFormData((prev) => ({
      ...prev,
      lsaEntries: weekly.TimeFrequency.map((entry: { LsaTime: string; LsaHrs: number }) => ({
        LsaTime: entry.LsaTime,
        LsaHrs: entry.LsaHrs,
      })),
    }));
    dialogData = {
      ...dialogData,
      week: weekly.week || 2,    
      no_of_months: weekly.no_of_months || 1,
      TimeFrequency: weekly.TimeFrequency, 
    };
  } else if (repeatType === "Monthly" && monthly?.TimeFrequency) {
    setFormData((prev) => ({
      ...prev,
      lsaEntries: monthly.TimeFrequency.map((entry: { LsaTime: string; LsaHrs: number }) => ({
        LsaTime: entry.LsaTime,
        LsaHrs: entry.LsaHrs,
      })),
    }));
    dialogData = {
      ...dialogData,
      months: monthly.months || 2,
      TimeFrequency: monthly.TimeFrequency,
    };
  }

  setDialogData(dialogData);

  console.log('DialogData after autofill:', dialogData);
};

const handleGo = async () => {
  const selectedTitle = formData.title;  
  if (!selectedTitle) {
    message.error(t('selectValidTitle'));
    return;
  }

  try {
    const taskData = await checkTaskExists(selectedTitle);
    
    if (!taskData) {
      message.error(t('taskNotExist'));
      return;  
    }

    const scheduleResponse = await axios.get(
      `http://localhost:3000/schedules/byTitle?title=${selectedTitle}`
    );
    const scheduleData = scheduleResponse.data;
    
    console.log('Fetched schedule data:', scheduleData);


    let canProceed = false;

    if (Array.isArray(scheduleData) && scheduleData.length > 0) {
      const allCompleted = scheduleData.every(task => task.status.toLowerCase() === 'completed');
      if (allCompleted) {
        canProceed = true;
      } else {
        message.error(t('completeAllTasksBeforeProceeding'));
        setFormData((prevState) => ({ ...prevState, title: '' }));
        return;
      }
    } else {
      canProceed = true;
    }

    if (canProceed) {
      fillFormData(taskData, selectedTitle);
    }

  } catch (error) {
   
  }
};

useEffect(() => {
  if (title) {
    setFormData((prevData) => ({ ...prevData, title }));
    setShowTextInput(true); 
    checkTaskExists(title)
    if (titleInputRef.current) {
      titleInputRef.current.focus(); 
    }
  }
}, [title]);

const validate = () => {
  const newErrors = {
    title: formData.title.length > 0 ? '' : t('enterTask'),
    description: formData.description.length > 0 ? '' : t('enterDescription'),
    
    role: formData.role ? '' : t('selectRole'),
    repeatType:formData.repeatType ? '' : t('chooseRepeatOption')
    
  };
  setErrors(newErrors);
  return Object.values(newErrors).every((error) => error === '');
};



const handleSubmitDialog = (): boolean => {
  let validationPassed = true;

  
  if (!validate()) {
    validationPassed = false;
  }

  
  if (formData.repeatType === 'Daily' && endsOption !== 'never') {
    if (endsOption === 'on' && (!DialogData.fromDate || !DialogData.toDate)) {
      message.error(t('fromDateToDateRequired'));
      validationPassed = false;
    }
  }

  if ((formData.repeatType === 'By Weekly Days' || formData.repeatType === 'Monthly') && endsOption !== 'never') {
    if (!DialogData.fromDate || !DialogData.toDate) {
      message.error(t('fromDateToDateRequired'));
      validationPassed = false;
    }
  }

  if (DialogData.fromDate && DialogData.toDate && new Date(DialogData.toDate) < new Date(DialogData.fromDate)) {
    message.error(t('toDateAfterFromDate'));
    validationPassed = false;
  }

  
  if ((formData.repeatType === 'By Weekly Days' || formData.repeatType === 'Monthly') && DialogData.repeatDays.length === 0) {
    message.error(t('selectWeekday'));
    validationPassed = false;
  }

  
  if (formData.repeatType === 'By Weekly Days') {
    if (!DialogData.week) {
      message.error(t('selectWeek'));
      validationPassed = false;
    }
    if (!DialogData.no_of_months || DialogData.no_of_months <= 0) {
      message.error(t('specifyMonths'));
      validationPassed = false;
    }
  }

  
  if (formData.lsaEntries.length === 0) {
    message.error(t('lsaEntryRequired'));
    validationPassed = false;
  } else {
    formData.lsaEntries.forEach((entry, index) => {
      if (!entry.LsaTime || entry.LsaHrs === null || entry.LsaHrs <= 0) {
        message.error(t('lsaEntryIncomplete', {index:index +1}));
        validationPassed = false;
      }
    });
  }

  const timeEntries = formData.lsaEntries.map(entry => entry.LsaTime);
  const hasDuplicates = timeEntries.some((time, index) => timeEntries.indexOf(time) !== index);

  if (hasDuplicates) {
    message.error(t('duplicateTimezones'));
    validationPassed = false;
  }

 
  if (!validationPassed) return false ;


  const newDialogData = {
    ...DialogData,
    fromDate: DialogData.fromDate,
    toDate: DialogData.toDate,
    repeatDays: DialogData.repeatDays,
  };

  setShowDialog(false);
  console.log(newDialogData);

  return true;
};

const generateWeeklyDates = (
  fromDate: string,
  toDate: string,
  week: number,
  repeatDays: string[],
  no_of_months: number
): string[] => {
  const startDate = new Date(fromDate);
  const endDate = new Date(toDate);
  const generatedDates: string[] = [];

  
  const dayMap: Record<string, number> = {
      "Sunday": 0,
      "Monday": 1,
      "Tuesday": 2,
      "Wednesday": 3,
      "Thursday": 4,
      "Friday": 5,
      "Saturday": 6,
  };
  

  const repeatDayNumbers = repeatDays.map(day => dayMap[day as keyof typeof dayMap]);

 
  for (let monthOffset = 0; monthOffset < no_of_months; monthOffset++) {
      const currentMonth = new Date(startDate);
      currentMonth.setMonth(currentMonth.getMonth() + monthOffset);

      // Calculate the start of the specified week
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const firstDayOfWeek = firstDayOfMonth.getDay();
      const offsetToStartOfWeek = (week - 1) * 7 + (firstDayOfWeek > 0 ? 7 - firstDayOfWeek : 0);

      const specifiedWeekStartDate = new Date(currentMonth);
      specifiedWeekStartDate.setDate(1 + offsetToStartOfWeek);

     
      for (let i = 0; i < 7; i++) {
          const currentDate = new Date(specifiedWeekStartDate);
          currentDate.setDate(specifiedWeekStartDate.getDate() + i);

          
          if (
              repeatDayNumbers.includes(currentDate.getDay()) &&
              currentDate >= startDate &&
              currentDate <= endDate
          ) {
              generatedDates.push(currentDate.toISOString().split('T')[0]);
          }
      }
  }

  return generatedDates;
};


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

  
    const dialogValidationPassed = handleSubmitDialog();
    if (!dialogValidationPassed) {
        message.error(t('enterRepetitionDetails' , {repeatType:formData.repeatType}) );
        return; 
    }

    if (!validate()) {
        message.error(t('taskAddFailed'));
        return;
    }

    const fromDate = new Date(DialogData.fromDate);
    if (isNaN(fromDate.getTime())) {
        message.error(t('invalidFromDate'));
        return;
    }

    let toDate = new Date(DialogData.toDate);
    if (isNaN(toDate.getTime())) {
        if (formData.repeatType === 'Daily' && endsOption === 'never') {
            const futureDate = new Date(fromDate);
            futureDate.setFullYear(futureDate.getFullYear() + 2);
            toDate = futureDate;
        } else {
            message.error(t('invalidToDate'));
            return;
        }
    }

    const formattedFromDate = fromDate.toISOString().split('T')[0];
    const formattedToDate = toDate.toISOString().split('T')[0];

    try {
        
        const response = await axios.get(`http://localhost:3000/todos/byTitle?title=${formData.title}`);
        const existingTask = response.data;

        if (existingTask && existingTask.id) {
            await axios.delete(`http://localhost:3000/todos/${existingTask.id}`);
            const deletePromises = [];

            if (existingTask.daily && existingTask.daily.id) {
                deletePromises.push(axios.delete(`http://localhost:3000/daily/${existingTask.daily.id}`));
            }
            if (existingTask.weekly && existingTask.weekly.id) {
                deletePromises.push(axios.delete(`http://localhost:3000/weekly/${existingTask.weekly.id}`));
            }
            if (existingTask.monthly && existingTask.monthly.id) {
                deletePromises.push(axios.delete(`http://localhost:3000/monthly/${existingTask.monthly.id}`));
            }

            await Promise.all(deletePromises);
        }

        
        const todoResponse = await axios.post('http://localhost:3000/todos', {
            ...formData,
            role: formData.role === 'All' ? rolesOptions.join(', ') : formData.role,
            status: "Open",
            fromDate: formattedFromDate,
            toDate: formattedToDate,
            repeatDays: DialogData.repeatDays,
            lsaEntries: formData.lsaEntries.map(entry => ({
              lsaHrs: entry.LsaHrs || 0, 
              lsaTime: entry.LsaTime || '00:00:00' 
            })),
            repeatType: formData.repeatType,
            daily: formData.repeatType === 'Daily' ? {
                title: formData.title,
                fromDate: formattedFromDate,
                toDate: formattedToDate,
                repeatDays: weekdays,
                option: endsOption,
                TimeFrequency: formData.lsaEntries 
            } : null,
            weekly: formData.repeatType === 'By Weekly Days' ? {
                title: formData.title,
                fromDate: DialogData.fromDate,
                toDate: DialogData.toDate,
                repeatDays: DialogData.repeatDays,
                week: DialogData.week,
                no_of_months: DialogData.no_of_months ?? 0,
                TimeFrequency: formData.lsaEntries 
            } : null,
            monthly: formData.repeatType === 'Monthly' ? {
                title: formData.title,
                fromDate: formattedFromDate,
                toDate: formattedToDate,
                months: DialogData.months,
                repeatDays: DialogData.repeatDays,
                TimeFrequency: formData.lsaEntries 
            } : null,
        });

        const newTaskId = todoResponse.data.id;
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];

        switch (formData.repeatType) {
            case 'Daily':
                await axios.post('http://localhost:3000/daily', {
                    task_id: newTaskId,
                    title: formData.title,
                    fromDate: formattedFromDate,
                    toDate: formattedToDate,
                    repeatDays: weekdays,
                    option: endsOption,
                    TimeFrequency: formData.lsaEntries
                });

                if (DialogData.fromDate === formattedToday) {
                  for (const time of formData.lsaEntries) {
                    await axios.post('http://localhost:3000/schedules/create', {
                        task_id: newTaskId,
                        title: formData.title,
                        status: 'Open',
                        date_stamp: formattedToday,
                        lsaHrs: time.LsaHrs,
                        lsaTime: time.LsaTime,
                    });
                }}
                break;

            case 'Monthly':
                await axios.post('http://localhost:3000/monthly', {
                    task_id: newTaskId,
                    title: formData.title,
                    fromDate: formattedFromDate,
                    toDate: formattedToDate,
                    repeatDays: DialogData.repeatDays,
                    months: DialogData.months,
                    TimeFrequency: formData.lsaEntries
                });

                if (DialogData.fromDate === formattedToday) {
                  for (const time of formData.lsaEntries) {
                    await axios.post('http://localhost:3000/schedules/create', {
                        task_id: newTaskId,
                        title: formData.title,
                        status: 'Open',
                        date_stamp: formattedToday,
                        lsaHrs: time.LsaHrs,
                        lsaTime: time.LsaTime,
                    });
                }}
                break;

            case 'By Weekly Days':
                await axios.post('http://localhost:3000/weekly', {
                    task_id: newTaskId,
                    title: formData.title,
                    fromDate: DialogData.fromDate,
                    toDate: DialogData.toDate,
                    repeatDays: DialogData.repeatDays,
                    week: DialogData.week,
                    no_of_months: DialogData.no_of_months ?? 0,
                    TimeFrequency: formData.lsaEntries
                });

                const generatedWeeklyDates = generateWeeklyDates(
                    formattedFromDate,
                    formattedToDate,
                    DialogData.week !== undefined ? DialogData.week : 0,
                    DialogData.repeatDays,
                    DialogData.no_of_months ?? 0
                );

                if (generatedWeeklyDates.includes(formattedToday)) {
                  for (const time of formData.lsaEntries) {
                    await axios.post('http://localhost:3000/schedules/create', {
                        task_id: newTaskId,
                        title: formData.title,
                        status: 'Open',
                        date_stamp: formattedToday,
                        lsaHrs: time.LsaHrs,
                        lsaTime: time.LsaTime,
                    });
                }}
                break;

            default:
                throw new Error('Invalid repeat option selected');
        }

        setFormData(initial);
        setDialogData(DialogInitial);
        setShowDialog(false);
        message.success(t('submitTaskSuccess'));
        navigate('/');

    } catch (error) {
        console.error(t('submitTaskFailed'), error);
        message.error(t('submitTaskFailed'));
    }
};

const handleSelectedRole = (role: string) => {

  setSelectedRoles((prevRoles) => {
    if (!Array.isArray(prevRoles)) {
      console.error("Previous roles are not an array:", prevRoles);
      return [role];
    }

    return prevRoles.includes(role) 
      ? prevRoles.filter((r) => r !== role) 
      : [...prevRoles, role];
  });

  const updatedRoles = [...new Set([...formData.role.split(', ').filter(Boolean), role])].join(', ');
  setFormData((prev) => ({
    ...prev,
    role: updatedRoles === 'All' ? rolesOptions.join(', ') : updatedRoles
  }));
};

const handleOpenDialog = (e:React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  setDialogData({
    fromDate: DialogData.fromDate || getTodayDate(),
    toDate: DialogData.toDate || '',
    repeatDays: DialogData.repeatDays ? DialogData.repeatDays : weekdays,
    title:DialogData.title,
    no_of_months:DialogData.no_of_months,
    week:DialogData.week,
    option:DialogData.option,
    months:DialogData.months,
    TimeFrequency:DialogData.TimeFrequency
  });
  
  if(formData.repeatType) {
    setShowDialog(true); // Open the dialog box
  }
  
};
  
  
  const handleEndsChange = (e: RadioChangeEvent) => {
    const selectedOption = e.target.value;
    setEndsOption(selectedOption);
  
    if (selectedOption === 'never') {
      setDialogData((prev) => ({
        ...prev,
        toDate: '', 
      }));
    } else if (selectedOption === 'on') {
      setDialogData((prev) => ({
        ...prev,
        toDate: '', 
      }));
    }
  }
  

  const closeDialog =  () => {
    setShowDialog(false);
    setDialogData(DialogInitial)
  };

    const handleMonthChange = (value: number ) => {
      if (value !== null && DialogData.fromDate) {
        const from = new Date (DialogData.fromDate);
        from.setMonth(from.getMonth() + value)
        const formattedDate = from.toISOString().split('T')[0]
        setDialogData((prev) => ({
          ...prev,
          toDate: formattedDate,
          months:value,
        }))
      }
      // setInputMonths(value);
  };

  
  const handleWeekChange = (value: number  ) => {
   
      // setSelectedWeek(value);
      setDialogData((prev) => ({
        ...prev,
        week:value,
      }))
    
    
  };
  
  const handleLsaHoursChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
  
    // Check for empty input
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        lsaEntries: prev.lsaEntries.map((entry, i) =>
          i === index ? { ...entry, LsaHrs: null } : entry
        ),
      }));
      return;
    }

    const numberValue = Number(value);
  
    if (isNaN(numberValue) || numberValue < 1 || numberValue > 12) {
      message.error(t('taskDeadlineOutOfRange'));
      return;
    }
  
 
    setFormData(prev => ({
      ...prev,
      lsaEntries: prev.lsaEntries.map((entry, i) =>
        i === index ? { ...entry, LsaHrs: Math.max(1, numberValue) } : entry
      ),
    }));
  };
  

  const addMoreLsaEntry = () => {
    setFormData(prev => ({
      ...prev,
      lsaEntries: [...prev.lsaEntries, { LsaTime: '10:00', LsaHrs: 2 }],
    }));
  };
  const handleDeleteLsaEntry = (index:number) => {
    setFormData(prev => ({
      ...prev,
      lsaEntries: prev.lsaEntries.filter((_, i) => i !== index),
    }));
  };


const handleLsaTimeChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
  const newTime = e.target.value;
  setFormData(prev => ({
    ...prev,
    lsaEntries: prev.lsaEntries.map((entry, i) =>
      i === index ? { ...entry, LsaTime: newTime } : entry
    ),
  }));
};

  const updateDialogData = (updatedFields: Partial<Dialog>) => {
    setDialogData(prev => ({
      ...prev,
      ...updatedFields
    }));
  };
  const handleDateChange = (dateType: string, dateValue: string) => {
    if (dateType === 'fromDate') {
      updateDialogData({ fromDate: dateValue });
    } else if (dateType === 'toDate') {
      if (new Date(dateValue) < new Date(DialogData.fromDate)) {
        message.error(t('toDateEarlierThanFromDate'));
        return;
      }
      updateDialogData({ toDate: dateValue });
    }
  };
  
const handleDaySelection = (day: string) => {
  setDialogData((prev) => ({
    ...prev,
    repeatDays:
       prev.repeatDays.includes(day)
        ? prev.repeatDays.filter((d) => d !== day)
        : [...prev.repeatDays, day]
      , 
  }));
};


const handleMonthChangeWeekly = (numMonths: number | null) => {
  if (numMonths === null || numMonths <= 0) return;


  if (DialogData.fromDate) {
    const fromDate = new Date(DialogData.fromDate);
    const endDate = new Date(fromDate.setMonth(fromDate.getMonth() + numMonths, 0)).toISOString().split('T')[0]; // 
    setDialogData((prev) => ({
      ...prev,
      toDate: endDate,
      no_of_months:numMonths 
    }));
  }
};

  return (

    <>
    <div className={`addMain ${showDialog ? 'blur-background' : ''}`}>
    <div className='add-section'>
        <form onSubmit={handleSubmit}>
        <Button className='closing-icon' type="text" shape="circle" 
        icon={<CloseOutlined />}
         onClick={() => navigate('/')}>
        </Button>

          <h5 className="text-center">{t('addTodo')}</h5>
          <div className="form-group">

            <h6>{t('title')}:</h6>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder={t('selectOrEnterTitle')}
              value={formData.title}
              onChange={handleTitleChange}
              className='add-title-select'
            >
              {todosOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
              <Option value="+">{t('addNew')}</Option>
            </Select>
            {showTextInput && (
              <div className="openInput ">
              <input
                type="text"
                name="title"
                value={formData.title}
                ref={titleInputRef}
                onChange={handleChange}
                placeholder="Enter title"
                className="form-control "
              />
              <Button
                  type="primary"
                   className="get-button"
               onClick={handleGo} 
              style={{ display: formData.title ? 'block' : 'none', backgroundColor: taskExists ? 'blue' : 'gray', cursor: taskExists ? 'pointer' : 'not-allowed' }}
              disabled={!taskExists}
              >Go</Button>
              </div>
             
            )}
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <h6>{t('description')}:</h6>
            <TextArea
              id="description"
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder={t('enterDescription')}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <h6>
            <label htmlFor="role">{t('taskAllotedTo')}</label>
              </h6>
            <Select
              id='role'
              showSearch
              style={{ width: '100%' }}
              placeholder={t('selectRole')}
              value={isMultipleSelect ? 'Multiple' : formData.role}
              onChange={(value) => handleChange({ target: { name: 'role', value } } as React.ChangeEvent<HTMLSelectElement>)}
              
            >
              
              <Option value="All">{t('all')}</Option>
              {rolesOptions.map((role) => (
                <Option key={role} value={role}>
                  {role}
                </Option>
              ))}
              <Option value="Multiple">{t('multiple')}</Option>
            </Select>
            {isMultipleSelect && (
             <div className="role-checkboxes">
             {rolesOptions.map((role) => (
               <Checkbox
                 key={role}
                 checked={selectedRoles.includes(role)}
                 onChange={() => handleSelectedRole(role)}
               >
                 {role}
               </Checkbox>
             ))}
           </div>
            )}
            
            {errors.role && <span className="error-message">{errors.role}</span>}
          </div>

          <div className="form-group ">
            <h6>
            <label>{t('repeatOn')}</label>
            </h6>
            <div className='select-section'>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder={t('selectDateOption')}
              value={formData.repeatType}
              onChange={(value) => handleChange({ target: { name: 'repeatType', value } } as React.ChangeEvent<HTMLSelectElement>)}
                           
            >
             {dateOptions.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>            
              <Button type="primary" onClick={handleOpenDialog} className='open-button'>
                {t('open')}
              </Button>
            </div>           
            {errors.repeatType && <span className="error-message">{errors.repeatType}</span>}
            
          </div>
          
         

          
          <div className="down-button-section">
          <Button type='primary' danger onClick={() => setFormData(initial)}>{t('clearAll')}</Button>
          <button className='btn btn-success success-button' type="submit" style={{ backgroundColor: '#28a745', border:'none'  }} >
            {t('submit')}
        </button>
          </div>
                 
        </form>
      </div>
    </div>
    {formData.repeatType === 'Daily' &&showDialog &&  (
              <>
              {showDialog && (
                <div className="dialog-overlay">
              <div className="dialog-box">
                <div className="box">    
                <center style={{marginBottom:'10px'}}><strong>({t('task')} </strong> {formData.title}<strong> )</strong>
                </center>            
                  <div className="from-section">
                  <h6> {t('from')}</h6>
                  <div className="DatePicker">
                  <input type='date' placeholder='select dates' className="form-control date-picker" 
                     value={DialogData.fromDate}             
                     onChange={(e) => handleDateChange('fromDate', e.target.value)}               
                  />
                  </div>
                  </div>                 
                  
                <div className="ends-section">
                  <h6>{t('ends')}</h6>
                  <Radio.Group onChange={handleEndsChange} value={endsOption}>
                    <div className="eachoption">
                      <Radio value="never" id="never">
                        <span className="radio-label">{t('never')}</span>
                      </Radio>
                    </div>
                    <div className="eachoption2">
                      <Radio value="on" id="on" >
                        <span className="radio-label">{t('on')}</span>
                      </Radio>
                      <div className="each-option-date">
                        <input type='date' className="form-control date-picker" 
                        disabled={endsOption !== 'on'}
                        value={ DialogData.toDate || ''}                 
                        onChange={(e) => handleDateChange('toDate', e.target.value )}
                        />
                      </div>
                    </div>
                  </Radio.Group>
                </div>
                <div className="lsa-section-monthly">
              <h6>{t('timezone')} </h6>
              {formData.lsaEntries.map((entry, index) => (
                <div className="lsa-input-section" key={index}>
                  <div className="lsa-sections">
                    <div className='lsa-info'>{t('startsAt')}</div>
                    <input
                      type="time"
                      className=' date-picker'
                      value={entry.LsaTime || ''}
                      onChange={(e) => handleLsaTimeChange(index, e)}
                    />
                  </div>
                  <div className="lsa-sections2 hrs-input">
                    <div className='lsa-info'>{t('upon')}</div>
                    <Input
                      type="number"
                      value={entry.LsaHrs !== null ? entry.LsaHrs : ''}
                      onChange={(e) => handleLsaHoursChange(index, e)}
                      min={1}
                      max={12}
                      className="daily-input-number"
                    />
                    <div>{t('hours')}</div>
                  </div>
                  <div className="lsa-delete-icon" onClick={() => handleDeleteLsaEntry(index)}>
                  <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} />
                </div>
                      </div>
                    ))}
                    <div className="add-more-button">
                    <Tooltip title={t('addMoreTimezones')}>
                    <Button type='primary'  className='add-mores' onClick={addMoreLsaEntry}>+</Button>
                    </Tooltip>
                    </div>
                    
                  </div>
  
                  <div className="bottom-button-section " style={{marginTop:'20px' , marginRight:'10px'}}>
                  <div onClick={closeDialog} className="close-button">
                {t('cancel')}
              </div>
              <div className='done-button text-primary' onClick={handleSubmitDialog}>{t('done')}</div>
                  </div>                 
                </div>
              </div>
              </div>
              )}             
              </>
            )}
    {formData.repeatType === 'Monthly' &&  showDialog && (
      <>
       {showDialog && (
                <div className="dialog-overlay">
              <div className="dialog-box">
                <div className="box monthly-box">
                <center style={{marginBottom:'10px'}}><strong>(Task :
                  
                  </strong> {formData.title} <strong>)</strong></center>
                 <div className="from-section-monthly">
                  <h6>{t('fromDate')}</h6>
                  <div className="DatePicker">
                  <input type='date' placeholder='select dates' className="form-control date-picker" 
                     value={DialogData.fromDate}             
                     onChange={(e) => handleDateChange('fromDate', e.target.value)}               
                  />
                  </div>
                 
                  </div>
                  <div className="months-section-monthly">
                    <h6> {t('repeat')} :</h6>
                  <div className='months-repeat'> {t('upto')} </div>
                        
                        <InputNumber className="input-number-monthly" min={1} value={DialogData.months} onChange={(value : any) => handleMonthChange(value)}/>                      
                        <div>
                        {DialogData.months === 1 ? t('month') : t('months')}

                      </div>
                  </div>
                  <div className="days-selection-section" >
                    <h6>{t('repeat_on')} :</h6>
                    <div className="select-days">                 
                   
                    {[ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <Button
                      key={day}
                      className={`day-button ${Array.isArray(DialogData.repeatDays) && DialogData.repeatDays.includes(day) ? 'selected' : ''}`}
                      onClick={() => handleDaySelection(day)}
                    >
                      {day.charAt(0)}
                    </Button>
                  ))}                 
                  </div>
                  </div>
                  <div className="end-date-section-monthly">
                    <h6>{t('endDate')}</h6>
                    <input type='date' className="form-control  monthly-date-picker" 
                       
                        value={DialogData.toDate}                 
                        onChange={(e) => handleDateChange('toDate', e.target.value )}
                        />
                  </div>
                  <div className="lsa-section-monthly">
              <h6>{t('timezone')}</h6>
              {formData.lsaEntries.map((entry, index) => (
                <div className="lsa-input-section" key={index}>
                  <div className="lsa-sections">
                    <div className='lsa-info'>{t('startsAt')}</div>
                    <input
                      type="time"
                      className='daily-time-picker date-picker'
                      value={entry.LsaTime || ''}
                      onChange={(e) => handleLsaTimeChange(index, e)}
                    />
                  </div>
                  <div className="lsa-sections2 hrs-input">
                    <div className='lsa-info'>{t('upon')}</div>
                    <Input
                      type="number"
                      value={entry.LsaHrs !== null ? entry.LsaHrs : ''}
                      onChange={(e) => handleLsaHoursChange(index, e)}
                      min={1}
                      max={12}
                      className="daily-input-number"
                    />
                    <div>{t('hours')}</div>
                  </div>
                  <div className="lsa-delete-icon" onClick={() => handleDeleteLsaEntry(index)}>
                  <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} />
                </div>
                      </div>
                    ))}
                    <div className="add-more-button">
                    <Tooltip title={t('addMoreTimezones')}>
                      <Button type='primary'  className='add-mores' onClick={addMoreLsaEntry}>+</Button>
                      
                      </Tooltip>
                    </div>
                    
                  </div>
                  
                <div className="bottom-button-section" style={{marginTop:'20px'}}>
                  <div onClick={closeDialog} className="close-button">
                {t('cancel')}
              </div>
              <div className='done-button text-primary'  onClick={handleSubmitDialog}>{t('done')}</div>
                  </div>                 
                </div>
              </div>
              </div>
              )}             
              </>
    ) }
    {formData.repeatType === 'By Weekly Days' && showDialog && (
  <>

    {showDialog && (
      <div className="dialog-overlay ">
        <div className="dialog-box weekly-box">
          <div className="box ">
            <center style={{ marginBottom: '10px' }}>
              <strong>({t('task')} </strong>{formData.title}<strong>)</strong>
            </center>
            <div className="from-section-weekly">
              <h6>{t('from_date')}</h6>
              <div className="DatePicker">
                <input
                  type="date"
                  placeholder={t('select_date')}
                  className="form-control date-picker"
                  value={DialogData.fromDate || ''}  // Autofill from DialogData
                  onChange={(e) => handleDateChange('fromDate', e.target.value)}
                />
              </div>
            </div>

            <div className="months-section-monthly">
              <h6>{t('repeat')} :</h6>
              <div className="weekly-selection">
                <div className="weekly-enddate-top-section">
                  <div className="months-repeat">{t('on')}</div>
                  <Select
                  key={`week-${DialogData.week}`}
                    className="week-select-dropdown"
                    value={DialogData.week } // Autofill week value
                    onChange={handleWeekChange}
                    placeholder="Select week"
                  >
                    <Option value={1}>1st</Option>
                    <Option value={2}>2nd</Option>
                    <Option value={3}>3rd</Option>
                    <Option value={4}>4th</Option>
                    <Option value={5}>5th</Option>
                  </Select>
                  <div>{t('week')}</div>
                </div>
                <div className="weekly-enddate-bottom-section">
                  <div className="months-repeat">{t('upto')}</div>
                  <InputNumber
                   key={`no_of_months-${DialogData.no_of_months}`} 
                    className="input-number-monthly"
                    min={1}
                    value={DialogData.no_of_months }  // Autofill no_of_months
                    onChange={handleMonthChangeWeekly}
                  />
                  <div>{DialogData.no_of_months === 1 ? t('month') : t('months')}</div>
                </div>
              </div>
            </div>

            <div className="days-selection-section-weekly">
              <h6>{t('repeat_on')} :</h6>
              <div className="select-days-weekly">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <Button
                    key={day}
                    className={`day-button ${Array.isArray(DialogData.repeatDays) && DialogData.repeatDays.includes(day) ? 'selected' : ''}`}
                    onClick={() => handleDaySelection(day)}
                  >
                    {day.charAt(0)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="lsa-section-monthly">
              <h6>{t('timezone')}</h6>
              {formData.lsaEntries.map((entry, index) => (
                <div className="lsa-input-section" key={index}>
                  <div className="lsa-sections">
                    <div className='lsa-info'>{t('starts_at')}</div>
                    <input
                      type="time"
                      className='daily-time-picker date-picker'
                      value={entry.LsaTime || ''}
                      onChange={(e) => handleLsaTimeChange(index, e)}
                    />
                  </div>
                  <div className="lsa-sections2 hrs-input">
                    <div className='lsa-info'>{t('upon')}</div>
                    <Input
                      type="number"
                      value={entry.LsaHrs !== null ? entry.LsaHrs : ''}
                      onChange={(e) => handleLsaHoursChange(index, e)}
                      min={1}
                      max={12}
                      className="daily-input-number"
                    />
                    <div>{t('hrs')}</div>
                  </div>
                  <div className="lsa-delete-icon" onClick={() => handleDeleteLsaEntry(index)}>
                  <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} />
                </div>
                      </div>
                    ))}
                    <div className="add-more-button">
                      <Tooltip title={t('add_more_timezones')}>
                      <Button type='primary'  className='add-mores' onClick={addMoreLsaEntry}>+</Button>
                      
                      </Tooltip>
                    
                    </div>
                    
                  </div>

            <div className="bottom-button-section">
              <div onClick={closeDialog} className="close-button">{t('cancel')}</div>
              <div className="done-button text-primary" onClick={handleSubmitDialog}>{t('done')}</div>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
)}


    </>
  );
};

export default Add;







