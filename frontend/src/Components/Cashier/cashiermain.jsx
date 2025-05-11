import React from 'react';
import SideBar from '../shared/SideBar';
import Cashier from './cashier';
const CashierMain = () => {
  return (
    <div style={{ display: 'flex' }}>
      <SideBar />
      <div style={{ marginLeft: '18vw', padding: '2rem', width: '82vw' }}>
        <Cashier />
      </div>
    </div>
  );
};

export default CashierMain;