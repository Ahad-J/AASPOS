import React from 'react';
import SideBar from '../shared/SideBar';
import Employee from './employee';

const Employeemain = () => {
  return (
    <div style={{ display: 'flex' }}>
      <SideBar />
      <div style={{ marginLeft: '18vw', padding: '2rem', width: '82vw' }}>
        <Employee />
      </div>
    </div>
  );
};

export default Employeemain;