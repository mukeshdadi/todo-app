import React, { useEffect } from 'react';
import './SideBar.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchOutlined, UserOutlined, ExclamationCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

interface SideBarProps {
  sideBar: boolean;
  setSideBar: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideBar: React.FC<SideBarProps> = ({ sideBar, setSideBar }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNavigate = (route: string) => {
    navigate(route);
    setSideBar(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (sideBar) {
        setSideBar(false);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sideBar, setSideBar]);

  return (
    <div className={`sidebar ${sideBar ? 'big-container' : 'small-container'}`}>
      <div className="elements">
        <Tooltip title={t('searchTask')} placement="right">
          <div className="each-element" onClick={() => handleNavigate('/todo/search')}>
            <SearchOutlined />
            {sideBar && <div className="element-text">{t('searchTask')}</div>}
          </div>
        </Tooltip>

        <Tooltip title={t('fetchByRole')} placement="right">
          <div className="each-element" onClick={() => handleNavigate('/todo/fetch')}>
            <UserOutlined />
            {sideBar && <div className="element-text">{t('fetchByRole')}</div>}
          </div>
        </Tooltip>

        <Tooltip title={t("futureTasks")} placement="right">
          <div className="each-element" onClick={() => handleNavigate('/futureTasks')}>
            <CalendarOutlined />
            {sideBar && <div className="element-text">{t("futureTasks")}</div>}
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default SideBar;
