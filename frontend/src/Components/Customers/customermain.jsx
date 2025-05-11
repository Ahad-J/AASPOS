import React from 'react';
import SideBar from '../shared/SideBar';
import Customer from './customer';

const Customermain = () => {
  return (
    <div style={{ display: 'flex' }}>
      <SideBar />
      <div style={{ marginLeft: '18vw', padding: '2rem', width: '82vw' }}>
        <Customer />
      </div>
    </div>
  );
};

export default Customermain;