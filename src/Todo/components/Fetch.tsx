import React, { useState, useEffect } from 'react';
import './Fetch.css';
import axios from 'axios';
import { Button, Card, Modal, Select, Table, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ClockCircleOutlined } from '@ant-design/icons';
import { formatDate } from '../../App';

interface Todo {
  id: number;
  title: string;
  description: string;
  role: string;
  fromDate: string;
  toDate: string ;
  repeatDays: string[];
  status: string;
  lsaEntries: { lsaTime: string | null, lsaHrs: number | null }[];
  repeatType: string;
}

const Fetch: React.FC = () => {
  const { t } = useTranslation();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get<Todo[]>('http://localhost:3000/todos')
      .then((response) => {
        setTodos(response.data);
      })
      .catch((error) => {
        console.error('Error fetching todos:', error);
      });
  }, []);

  const roleChangeHandler = (value: string) => {
    setSelectedRole(value);
  };
  const handleDone = () => {
    setIsModalVisible(false);
  };

  const handleCardClick = async (id: number) => {
    try {
      const todoResponse = await axios.get(`http://localhost:3000/todos/${id}`);
      const todoData = todoResponse.data;
      if (todoData) {
        setSelectedTodo(todoData); // Store the fetched todo in the state
        setIsModalVisible(true); // Show the modal dialog
      } else {
        console.error(`Todo not found for id: ${id}`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      notification.error({ message: t('errorFetchingTaskDetails') });
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false); 
    setSelectedTodo(null); 
  };

  const filteredTodos = selectedRole === 'All'
    ? todos
    : todos.filter((todo) => {
        const roles = todo.role.split(',').map(role => role.trim().toLowerCase());
        return roles.includes(selectedRole.toLowerCase());
      });

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
      ellipsis:true,
      render: (text: string) => <div style={{ whiteSpace: 'normal' }}>{text}</div>,
    },
  ];

  const dataSource = selectedTodo
    ? [
        { key: '1', field: t('fieldTitle'), detail: selectedTodo.title },
        { key: '2', field: t('fieldDescription'), detail: selectedTodo.description },
        { key: '3', field: t('fieldAssignedTo'), detail: selectedTodo.role },
        { key: '4', field: t('fieldRepeats'), detail: selectedTodo.repeatType },
        { key: '5', field: t('fieldStartsOn'), detail: formatDate( selectedTodo.fromDate)},
        {
          key: '6',
          field: t('fieldEndsOn'),
          detail: selectedTodo.repeatType === 'Daily' && selectedTodo.lsaEntries.length === 0
            ? t('repeatsDaily')
            : formatDate(selectedTodo.toDate) || 'N/A',
        },
        {
          key: '7',
          field:t('fieldRepeatsOn'),
          detail: (
            <div style={{ display: 'flex', gap: '10px' }}>
              {selectedTodo.repeatDays.map((day) => (
                <Button key={day} className="repeat-day-button">
                  {day.charAt(0)}
                </Button>
              ))}
            </div>
          ),
        },
        {
          key: '8',
          field: t('fieldRepeatsAt'),
          detail: (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {selectedTodo.lsaEntries.length > 0 ? (
                selectedTodo.lsaEntries.map((entry, index) => (
                  entry.lsaTime ? (
                    <div key={index} className='repeat-time-section'>
                      <ClockCircleOutlined style={{ marginRight: '5px' }} />
                      <span>{entry.lsaTime}</span>
                    </div>
                  ) : null
                ))
              ) : (
                <span>{t('noLsaTimes')}</span>
              )}
            </div>
          ),
        },
      ]
    : [];

  return (
    <div className='initial'>
      <div className="wrapper">
        <Select
          className="byrole"
          value={selectedRole}
          onChange={roleChangeHandler}
          style={{ width: 250 }}
          placeholder={t('allRoles')}
        >
          <Select.Option value="All">{t('allRoles')}</Select.Option>
          <Select.Option value="Trainee">{t('trainee')}</Select.Option>
          <Select.Option value="SDE -1">{t('sde1')}</Select.Option>
          <Select.Option value="SDE -2">{t('sde2')}</Select.Option>
          <Select.Option value="Intern">{t('intern')}</Select.Option>
        </Select>

        {filteredTodos.length > 0 ? (
          <div className="filteredFinalList">
            {filteredTodos.map((todo) => (
              
                  <div className='task-item' key={todo.id} onClick={() => handleCardClick(todo.id)}>
                   
                    <h6 className="task-title-fetch"> {todo.title}</h6>
                  </div>
                
              
            ))}
          </div>
        ) : (
          <div className='alter'>
            <div className='msg'>{t('noTodos', { role: selectedRole })}</div>
          </div>
        )}
      </div>

      <Modal
         title={<h6>{selectedTodo?.title || 'Task Details'}</h6>}
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={<Button onClick={handleDone}>{t('close')}</Button>}
        
        
        className="advanced-modal"
      >
        {selectedTodo && (
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            bordered
          />
        )}
      </Modal>
    </div>
  );
};

export default Fetch;
