import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './List.css';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Tooltip, Spin, message } from 'antd';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/i18n';
import { ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
// import { translateTitle } from './translationUtils';

interface Task {
  id: number;
  title: string;
  description: string;
  role: string;
  fromDate?: string;
  toDate?: string | null;
  repeatDays: string[];
  repeatType: string;
  status?: string;
  LsaHrs: number;
  LsaTime: string;
  date_stamp: string;
}

interface Schedule {
  id: number;
  dynamicId: number;
  task_id: number;
  title: string;
  status: string;
  date_stamp: string;
  lsaHrs: number;
  lsaTime: string;
  todo?: Task;
}

interface ListProps {
  todos: Schedule[];
  setTodos: React.Dispatch<React.SetStateAction<Schedule[]>>;
}

const List: React.FC<ListProps> = ({ todos, setTodos }) => {
  const { t } = useTranslation();
  const [translatedTitles, setTranslatedTitles] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        const response = await axios.get('http://localhost:3000/schedules');
        const data = response.data;

        // Assign IDs based on the index to ensure they are consecutive and start from 1
        const updatedTodos = data.map((task: Schedule, index: number) => ({
          ...task,
          id: index + 1, // Assigning IDs based on the index
        }));

        setTodos(updatedTodos);
      } catch (error) {
        console.error('Error fetching todos:', error);
        message.error(t('failedToLoadTasks'));
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchTodos();
  }, [setTodos]);

  const translateTodos = async () => {
    const translations: { [key: number]: string } = {};

    for (const schedule of todos) {
      const item = schedule.todo;
      // if (item && item.title) {
      //   const translatedTitle = await translateTitle(schedule.title, i18n.language); // Translate based on the selected language
      //   translations[schedule.id] = translatedTitle || item.title;
      // }
    }
    setTranslatedTitles(translations);
  };

  useEffect(() => {
    translateTodos(); 
  }, [i18n.language, todos]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await axios.patch(`http://localhost:3000/schedules/${id}`, { status: newStatus });

      setTodos((prev) =>
        prev.map((schedule) =>
          schedule.id === id
            ? {
                ...schedule,
                status: newStatus,
                todo: schedule.todo
                  ? { ...schedule.todo, status: newStatus }
                  : undefined,
              }
            : schedule
        )
      );

      translateTodos();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error(t('failedToUpdateStatus')); 
    }
  };

  const formatDate = (dateString: string) => {
    const date = dayjs(dateString);
    return date.format(" MMM DD, dddd");
  };

  const calculateDeadline = (
    LsaTime: string,
    LsaHrs: number,
    date_stamp: string
  ): { deadline: Date | null; exceedingTime: string | null } => {
    if (!date_stamp || !LsaTime) return { deadline: null, exceedingTime: null };

    const [year, month, day] = date_stamp.split('-').map(Number);
    const [hours, minutes] = LsaTime.split(':').map(Number);
    const deadline = new Date(year, month - 1, day, hours, minutes);

    deadline.setHours(deadline.getHours() + LsaHrs);

    const now = new Date();
    const timeDifference = now.getTime() - deadline.getTime();
    const isOverdue = timeDifference > 0;

    let exceedingTime: string | null = null;
    if (isOverdue) {
      const exceedingHours = (timeDifference / (1000 * 60 * 60)).toFixed(1);
      exceedingTime = `${exceedingHours} hours exceeded`;
    }

    return { deadline, exceedingTime };
  };

  if (loading) return <Spin tip="Loading tasks..." />; 

  return (
    <div className='list-main'>
      <div className="eachitem">
        {todos.length === 0 ? (
          <div className="empty-message">
            <div className="empty-section">{t('No tasks available')}</div>
          </div>
        ) : (
          todos.map((schedule, index) => {
            const item = schedule.todo;
            if (!item) return null;

            const translatedTitle = translatedTitles[schedule.id] || schedule.title;
            const { deadline, exceedingTime } = calculateDeadline(schedule.lsaTime, schedule.lsaHrs, schedule.date_stamp);
            const isOverdue = !!exceedingTime;

            let alertType: 'success' | 'info' | 'warning' | 'error' | undefined;
            let alertMessage = isOverdue ? exceedingTime : '';

            switch (schedule.status) {
              case 'Open':
                alertType = isOverdue ? 'error' : 'info';
                break;
              case 'In Progress':
                alertType = 'warning';
                break;
              case 'Completed':
                alertType = 'success';
                break;
              default:
                alertType = undefined;
                break;
            }

            return (
              <Card
                key={schedule.id}
                className={`todo-item ${schedule.status}`}
                style={{ margin: '10px 0' }}
              >
                <div className="list-top-section">
                  <div className="top-left-corner">
                    <div className="list-id-section">
                      <i className="fa-regular fa-pen-to-square"></i>
                      <h6>{schedule.dynamicId}</h6>
                    </div>
                    <div className="clock-box">
                      <Tooltip title={`Finish within ${schedule.lsaHrs} hours.`}>
                        <ClockCircleOutlined className="alarm-icon" />
                        <span className="lsa-time">{schedule.lsaTime}</span>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="top-right-corner">
                    {schedule.status === 'Open' && (
                      <>
                        {isOverdue && (
                          <Alert
                            type={alertType}
                            message={alertMessage}
                            showIcon
                            className='alert'
                          />
                        )}
                        <Tooltip title='Move to In Progress'>
                          <Button
                            type="primary"
                            shape="circle"
                            icon={<i className="fa-regular fa-hourglass-half list-top-icon"></i>}
                            onClick={() => handleStatusChange(schedule.id, 'In Progress')}
                          />
                        </Tooltip>
                      </>
                    )}
                    {schedule.status === 'In Progress' && (
                      <>
                        {isOverdue && (
                          <Alert
                            type={alertType}
                            message={alertMessage}
                            showIcon
                            className='alert'
                          />
                        )}
                        <Tooltip title='Move to Completed'>
                          <Button
                            type="primary"
                            shape="circle"
                            icon={<i className="fa-solid fa-check list-top-icon"></i>}
                            onClick={() => handleStatusChange(schedule.id, 'Completed')}
                          />
                        </Tooltip>
                      </>
                    )}
                  </div>
                </div>
                <div className="item" onClick={() => navigate(`/indiv/${schedule.id}`)}>
                  <div className="scheduletask-title">{translatedTitle}</div>
                  <div className="date-stamp">
                    <CalendarOutlined style={{ color: '#108ee9', marginRight: '5px' }} />
                    <Tooltip title={dayjs(schedule.date_stamp).format("YYYY-MM-DD ")}>
                      <span>{formatDate(schedule.date_stamp)}</span>
                    </Tooltip>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default List;
