import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DatePicker, Button, Modal, Table, Spin, notification } from 'antd';
import moment, { Moment } from 'moment';
import './Futuretasks.css';
import { useNavigate } from 'react-router-dom';
import { ClockCircleOutlined } from '@ant-design/icons';
import { formatDate } from '../../App';
import { useTranslation } from 'react-i18next';

interface Schedule {
  id: number;
  task_id: number;
  title: string;
  status: string;
  date_stamp: string;
}

interface TodoDetails {
  id: number;
  title: string;
  description: string;
  role: string;
  fromDate: string;
  toDate: string;
  repeatDays: string[];
  repeatType: string;
  status: string;
  lsaEntries: { lsaTime: string | null, lsaHrs: number | null }[];
  daily?: any;
}

const FutureTasks: React.FC = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(moment().format('YYYY-MM-DD'));
  const [selectedTask, setSelectedTask] = useState<Schedule | null>(null);
  const [taskDetails, setTaskDetails] = useState<TodoDetails | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    handleGoClick(); // Fetch today's tasks by default on component mount
  }, []);

  const handleDateChange = (date: Moment | null) => {
    setSelectedDate(date ? date.format('YYYY-MM-DD') : null); // Set to formatted string or null
  };

  const handleGoClick = async () => {
    if (selectedDate) {
      setLoading(true);
      try {
        const response = await axios.get<Schedule[]>(`http://localhost:3000/scheduleTasks/tasks?date=${selectedDate}`);
        setTasks(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        notification.error({ message:t('errorFetchingTasks') });
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTaskClick = async (task: Schedule) => {
    setSelectedTask(task);
    setLoading(true);
    try {
      const response = await axios.get<TodoDetails>(`http://localhost:3000/todos/${task.task_id}`);
      setTaskDetails(response.data);
    } catch (error) {
      console.error('Error fetching task details:', error);
      notification.error({ message: t('errorFetchingTaskDetails') });
      setTaskDetails(null);
    } finally {
      setLoading(false);
      setModalVisible(true);
    }
  };

  const handleEditClick = (task: Schedule) => {
    navigate('/add', { state: { title: task.title } }); // Pass title to the Add component
  };

  const handleDone = () => {
    setModalVisible(false);
  };

  const columns = [
    {
      title: t('field'),
      dataIndex: 'field',
      key: 'field',
      width:'35%',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: t('details'),
      dataIndex: 'detail',
      key: 'detail',
      width:'65%',
      ellipsis: true, // Enable ellipsis for wrapping
      render: (text: string) => <div style={{ whiteSpace: 'normal' }}>{text}</div>
    },
  ];

  const dataSource = taskDetails
    ? [
        { key: '1',  field: t('fieldTitle'), detail: taskDetails.title },
        { key: '2', field: t('fieldDescription'), detail: taskDetails.description },
        { key: '3', field: t('fieldAssignedTo'), detail: taskDetails.role },
        { key: '4', field:  t('fieldRepeats'),detail: taskDetails.repeatType },
        { key: '5', field:  t('fieldStartsOn'), detail: formatDate( taskDetails.fromDate )},
        {
          key: '6',
          field:  t('fieldEndsOn'),
          detail: taskDetails.repeatType === 'Daily' && taskDetails.daily?.option === 'never'
            ? 'Repeats Daily'
            : formatDate(taskDetails.toDate) || 'N/A',
        },
        {
          key: '7',
          field:t('fieldRepeatsOn'),
          detail: (
            <div className="repeat-day-container">
              {taskDetails.repeatDays.map((day) => (
                <button key={day} className="repeat-day-button">
                  {day.charAt(0)}
                </button>
              ))}
            </div>
          ),
        },
        {
          key: '8',
          field:  t('fieldRepeatsAt'),
          detail: (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {taskDetails.lsaEntries.length > 0 ? (
                taskDetails.lsaEntries.map((entry, index) =>
                  entry.lsaTime ? (
                    <div key={index} className="repeat-time-section">
                      <ClockCircleOutlined style={{ marginRight: '5px' }} />
                      <span>{entry.lsaTime}</span>
                    </div>
                  ) : null
                )
              ) : (
                <span>{t('noLsaTimes')}</span>
              )}
            </div>
          ),
        },
      ]
    : [];

  return (
    <div className="future-tasks-container">
      <div className="date-picker-container">
        <DatePicker 
          onChange={handleDateChange} 
          value={selectedDate ? moment(selectedDate, 'YYYY-MM-DD') : null} 
          format="DD-MM-YYYY" // Display format for user
        />
        <Button type="primary" onClick={handleGoClick} className="go-button" disabled={loading}>
          {loading ? <Spin size="small" /> : 'Go'}
        </Button>
      </div>

      <div className="tasks-list">
        {loading ? (
          <Spin />
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="task-item">
              <h3 className="task-title">{task.title}</h3>
              <div className="task-actions">
                <Button type="default" onClick={() => handleTaskClick(task)}>{t('view')}</Button>
                <Button type="default" onClick={() => handleEditClick(task)}>{t('edit')}</Button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-tasks-message">{t('No tasks for the selected date')}</div>
        )}
      </div>

      <Modal
        title={<h3>{taskDetails?.title || 'Task Details'}</h3>}
        visible={modalVisible}
        onCancel={handleDone}
        footer={<Button onClick={handleDone}>{t('close')}</Button>}
        className="advanced-modal"
        bodyStyle={{ background: '#f5f5f5', padding: '20px' }}
      >
        {loading ? (
          <Spin />
        ) : taskDetails ? (
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            rowKey="key"
            bordered
            style={{ background: '#fff', borderRadius: '8px' }}
          />
        ) : (
          <p>{t('loadingTaskDetails')}</p>
        )}
      </Modal>
    </div>
  );
};

export default FutureTasks;
