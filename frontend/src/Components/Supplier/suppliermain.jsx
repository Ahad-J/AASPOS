import React from 'react';
import SideBar from '../shared/SideBar';
import Supplier from './supplier';

const Suppliermain = () => {
  return (
    <div style={{ display: 'flex' }}>
      <SideBar />
      <div style={{ marginLeft: '18vw', padding: '2rem', width: '82vw' }}>
        <Supplier />
      </div>
    </div>
  );
};

export default Suppliermain;