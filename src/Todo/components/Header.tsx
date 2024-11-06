import React from 'react';
import { Button } from 'antd';
import { MenuOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import 'antd/dist/reset.css';
import './Header.css';
import i18n from '../../i18n/i18n';



interface HeaderProps {
  setSideBar: React.Dispatch<React.SetStateAction<boolean>>;
  sideBar: boolean;
}

const Header: React.FC<HeaderProps> = ({ setSideBar, sideBar }) => {
  const { t } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();

  const handleLanguageChange = async (lang: string) => {
    await i18n.changeLanguage(lang);
   
  };

  return (
    <div className="header">
      <div className="header-top">
        <div className="left-header">
          <Button
            icon={<MenuOutlined />}
            shape="circle"
            onClick={() => setSideBar(!sideBar)}
            className="menu-btn"
          />
          <div className="main-item" onClick={() => navigate('/')}>
            <h5>{t('taskManagementTitle')}</h5>
            <EditOutlined className="edit-icon" />
          </div>
        </div>
      </div>

      <div className="header-bottom">
        <div className="language-list">
          <Button className="language-btn" onClick={() => handleLanguageChange('en')}>
            English
          </Button>
          <Button className="language-btn" onClick={() => handleLanguageChange('hi')}>
            हिंदी
          </Button>
          <Button className="language-btn" onClick={() => handleLanguageChange('te')}>
            తెలుగు
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
