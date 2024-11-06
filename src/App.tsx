import React, { useState, useEffect } from 'react';
import './App.css';
import 'antd/dist/reset.css';
import Add from './Todo/components/Add';
import Header from './Todo/components/Header';
import Main from './Todo/components/Main';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Fetch from './Todo/components/Fetch';
import SideBar from './Todo/components/SideBar';
import Search from './Todo/components/Search';
import './i18n/i18n';
import axios from 'axios';
import EachItem from './Todo/components/EachItem';
import FutureTasks from './Todo/components/FutureTasks';

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};



interface Todo {
  id: number;
  title: string;
  description: string;
  role: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  lsa: string;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [sideBar, setSideBar] = useState<boolean>(false);
 

 

  return (
    <div className="app">
    <BrowserRouter>
      <Header setSideBar={setSideBar} sideBar={sideBar} />

      <SideBar sideBar={sideBar} setSideBar={setSideBar} />

      <div className="main-content">
        <Routes>

          <Route
            path='/'
            element={<Main sideBar={sideBar} setSideBar={setSideBar} />}
          />

          <Route path="/add" element={<Add />} />

          <Route path="/todo/fetch" element={<Fetch />} />

          <Route path="/todo/search" element={<Search />} />
          <Route  path='/indiv/:id' element={<EachItem />}/>
          <Route path='/futureTasks' element={<FutureTasks/>} />
        </Routes>
      </div>
    </BrowserRouter>
  </div>
);
};
 

export default App;
