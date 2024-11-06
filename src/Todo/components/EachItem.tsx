import axios from 'axios';
import './EachItem.css';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spin, Card, Descriptions, Divider, Button } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface ScheduleData {
  id: number;
  task_id: number;
  title: string;
  status: string;
  date_stamp: string;
}
interface TodoData {
  id: number;
  title: string;
  description: string;
  role: string;
  fromDate?: string;
  toDate?: string | null;
  repeatDays: string[];
  status?: string;
  daily?: any;
  date_stamp: string;
  monthly?: any;
  weekly?: any;
  repeatType: string;
  lsaEntries: { lsaTime: string | null, lsaHrs: number | null }[]
}
const EachItem: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [todoData, setTodoData] = useState<TodoData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate(); // Used for navigating back

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const scheduleResponse = await axios.get(`http://localhost:3000/schedules/${id}`);
        const schedule = scheduleResponse.data;
        setScheduleData(schedule);

        const todoResponse = await axios.get(`http://localhost:3000/todos/${schedule.task_id}`);
        const todo = todoResponse.data;
        setTodoData(todo);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleDone = () => {
    navigate(-1); // This will navigate back one step in the browser history
  };

  return (
    <div className='EachItem'>
      {loading ? (
        <Spin tip="Loading..." style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }} />
      ) : (
        <Card className='card'>
          {scheduleData && (
            <>
              <Title level={5} className="schedule-title">{t('title')}:{scheduleData.title}</Title>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={t('status')}>
                  <Text type={scheduleData.status === 'Completed' ? 'success' : 'warning'}>
                    {scheduleData.status}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('date')}>
                  {new Date(scheduleData.date_stamp).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}

          {todoData && (
            <>
              <Divider />
              <Title level={5}>Task Details</Title>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={t('fieldDescription')}>{todoData.description}</Descriptions.Item>
                <Descriptions.Item label={t('fieldAssignedTo')}>{todoData.role}</Descriptions.Item>
                <Descriptions.Item label={t('fieldRepeats')}>{todoData.repeatType}</Descriptions.Item>
                <Descriptions.Item label={t('fieldRepeatsOn')} className='eachItem-repeat'>
                  {todoData.repeatDays.map((day: string) => {
                    const dayLetter = day.charAt(0).toUpperCase();
                    return (
                      <div className="repeat-day-containers3">
                        <Button key={day} className="repeat-day-buttons4" size="small">
                        {dayLetter}
                      </Button>
                      </div>
                     
                    );
                  })}
                </Descriptions.Item>
                <Descriptions.Item label={t('fieldStartsOn')}>{todoData.fromDate}</Descriptions.Item>
                <Descriptions.Item label={t('fieldEndsOn')}>
                  {todoData?.repeatType === 'Daily' && todoData?.daily?.option === 'never'
                    ? 'Repeats Daily'
                    : todoData?.toDate || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('fieldRepeatsOn')} span={1}>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {todoData.lsaEntries.length > 0 ? (
                      todoData.lsaEntries.map((entry, index) => (
                        entry.lsaTime ? (
                          <div key={index} className='repeat-time-section' >
                            <ClockCircleOutlined style={{ marginRight: '5px' }} />
                            <span>{entry.lsaTime}</span>
                          </div>
                        ) : null
                      ))
                    ) : (
                      <span>{t('noLsaTimes')}</span>
                    )}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </>
          )}

          {/* Done Button */}
          <div style={{ textAlign: 'right', marginTop: '15px' }}>
            <Button type="primary" onClick={handleDone}>
            {t('done')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EachItem;
