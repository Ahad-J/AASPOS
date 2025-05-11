import React from 'react';
import SideBar from '../shared/SideBar';
import Bill from './bill';

const Billmain = () => {
  return (
    <div style={{ display: 'flex' }}>
      <SideBar />
      <div style={{ marginLeft: '18vw', padding: '2rem', width: '82vw' }}>
        <Bill />
      </div>
    </div>
  );
};

export default Billmain;