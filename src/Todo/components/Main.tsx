import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Main.css';
import List from './List';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Schedule, Todo } from './types';

interface MainProps {
  sideBar: boolean;
  setSideBar: React.Dispatch<React.SetStateAction<boolean>>;
}

const Main: React.FC<MainProps> = ({ sideBar, setSideBar }) => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (sideBar) {
        setSideBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sideBar, setSideBar]);

  const fetchTodosAndSchedules = async () => {
    try {
      const schedulesResponse = await axios.get('http://localhost:3000/schedules');
      const schedulesData = Array.isArray(schedulesResponse.data) ? schedulesResponse.data : [];

      const schedulesWithTodos: Schedule[] = await Promise.all(
        schedulesData.map(async (schedule: Schedule, index: number) => {
          try {
            const todoResponse = await axios.get(`http://localhost:3000/todos/${schedule.task_id}`);
            const todoData: Todo = todoResponse.data;
            return { ...schedule, todo: todoData, dynamicId: index + 1 }; // Generate dynamicId here
          } catch (error) {
            console.error(`Error fetching todo for task_id ${schedule.task_id}`, error);
            return { ...schedule, todo: undefined, dynamicId: index + 1 };
          }
        })
      );

      setSchedules(schedulesWithTodos);
    } catch (error) {
      console.error(t('errorFetching'), error);
      setSchedules([]);
    }
  };

  useEffect(() => {
    fetchTodosAndSchedules();
    const intervalId = setInterval(fetchTodosAndSchedules, 30000);
    return () => clearInterval(intervalId);
  }, [t]);

  // Count tasks based on their status
  const openCount = schedules.filter(schedule => schedule.status?.trim() === 'Open').length;
  const inProgressCount = schedules.filter(schedule => schedule.status?.trim() === 'In Progress').length;


  return (
    <div className={`${sideBar ? 'list' : 'small'}`}>
      <div className="section">
        <div className="open-section todo-section">
          <div className="heading">
            {t('open')}
            <div className="count-badge">{openCount}</div>
            <Link to='/add'>
              <div className="add-icon">
                (<i className="fa-solid fa-plus"></i>)
              </div>
            </Link>
          </div>
          <div className="info">
            <List
              todos={schedules.filter(schedule => schedule.status?.trim() === 'Open')}
              setTodos={setSchedules}
            />
          </div>
        </div>
        <div className="inprogress-section todo-section">
          <div className="heading">
            {t('inProgress')}
            <div className="count-badge">{inProgressCount}</div>
          </div>
          <div className="info">
            <List
              todos={schedules.filter(schedule => schedule.status?.trim() === 'In Progress')}
              setTodos={setSchedules}
            />
          </div>
        </div>
        <div className="completed-section todo-section">
          <div className="heading">
            {t('completed')}
           
          </div>
          <div className="info">
            <List
              todos={schedules.filter(schedule => schedule.status?.trim() === 'Completed')}
              setTodos={setSchedules}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
