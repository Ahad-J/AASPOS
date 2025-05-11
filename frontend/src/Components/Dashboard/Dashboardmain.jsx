
import React from 'react';
import SideBar from '../shared/SideBar';
import Dashboard from './Dashboard';

const Dashboardmain = () => {
  return (
    <div style={{ display: 'flex' }}>
      <SideBar />
      <div style={{ marginLeft: '18vw', padding: '2rem', width: '82vw' }}>
        <Dashboard />
      </div>
    </div>
  );
};

export default Dashboardmain;