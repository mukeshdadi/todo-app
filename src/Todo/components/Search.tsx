import axios from 'axios';
import React, { useState, useEffect, ReactNode } from 'react';
import { Table, Input, Modal, Button, message } from 'antd';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './Search.css';
import { ColumnsType } from 'antd/es/table';
import { formatDate } from '../../App';

interface Todo {
  id: number;
  title: string;
  description: string;
  role: string;
  fromDate?: string;
  toDate?: string | null;
  repeatDays: string[];
  status?: string;
  LsaHrs: number | null;
  daily?: any;
  monthly?: any;
  weekly?: any;
  repeatType: string;
  LsaTime: string;
}

const Search = () => {
  const { t } = useTranslation();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  useEffect(() => {
    axios
      .get<Todo[]>('http://localhost:3000/todos')
      .then((response) => {
        setTodos(response.data);
      })
      .catch((error) => {
        console.error(t('errorFetchingTodos'), error);
      });
  }, [t]);

  const handleDelete = async (todo: Todo) => {
    try {
      const scheduleResponse = await axios.get(
        `http://localhost:3000/schedules/byTitle?title=${todo.title}`
      );
      const scheduleData = scheduleResponse.data;
      let allCompleted = true;

      if (Array.isArray(scheduleData)) {
        scheduleData.forEach((task) => {
          if (task.status.toLowerCase() !== 'completed') {
            allCompleted = false;
          }
        });
      } else if (scheduleData.status.toLowerCase() !== 'completed') {
        allCompleted = false;
      }

      if (!allCompleted) {
        message.error(t('Be sure that all the tasks with this title have to complete before proceeding.'));
        return;
      }

      // If all tasks are completed, open the delete confirmation dialog
      setSelectedTodo(todo);
      setDialogOpen(true);
    } catch (error) {
      console.error(t('errorCheckingSchedules'), error);
      message.error(t('errorCheckingSchedules'));
    }
  };

  const confirmDelete = () => {
    if (selectedTodo) {
      axios
        .delete(`http://localhost:3000/todos/${selectedTodo.id}`)
        .then(() => {
          setTodos(todos.filter((todo) => todo.id !== selectedTodo.id));
        })
        .catch((error) => {
          console.error(t('errorDeletingTodo'), error);
        });
    }
    setDialogOpen(false);
    setSelectedTodo(null);
  };

  const filteredTodos = searchTerm
    ? todos.filter((todo) =>
        todo.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : todos;

  const columns: ColumnsType<Todo> = [
    {
      title: t('Tasks'),
      dataIndex: 'title',
      className: 'search-title',
      key: 'title',
      align: 'start',
      render: (text: string): ReactNode => <span>{text}</span>,
    },
    {
      title: t('fieldRepeats'),
      dataIndex: 'repeatType',
      key: 'repeatType',
      align: 'center',
    },
    {
      title: t('fieldEndsOn'),
      key: 'toDate',
      align: 'center',
      render: (record: Todo): ReactNode => {
        const formattedDate = record.toDate ? formatDate(record.toDate) : 'N/A';
        if (record.repeatType === 'Daily') {
          if (record.daily && record.daily.option === 'never') {
            return <span>{t('repeatsDaily')}</span>;
          }
          return <span>{formattedDate}</span>;
        }
        return <span>{formattedDate || 'N/A'}</span>;
      },
    },
    {
      title: '',
      key: 'action',
      align: 'center',
      render: (record: Todo): ReactNode => (
        <Button
          type="text"
          style={{ backgroundColor: 'white' }}
          icon={<DeleteOutlined />}
          danger
          onClick={() => handleDelete(record)}
        />
      ),
    },
  ];

  return (
    <div className="search-container">
      <div className="search">
        <div className="input-section">
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredTodos}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          className="todo-table"
        />

        <Modal
          title={t('Delete Task')}
          visible={dialogOpen}
          onOk={confirmDelete}
          onCancel={() => setDialogOpen(false)}
          okText={t('Delete')}
          cancelText={t('Cancel')}
        >
          <p>{t('Are you sure you want to delete this task? It will be deleted on all repeating days.')}</p>
        </Modal>
      </div>
    </div>
  );
};

export default Search;
