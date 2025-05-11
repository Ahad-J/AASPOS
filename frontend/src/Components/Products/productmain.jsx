import React from 'react';
import SideBar from '../shared/SideBar';
import Product from './product';

const Productmain = () => {
  return (
    <div style={{ display: 'flex' }}>
      <SideBar />
      <div style={{ marginLeft: '18vw', padding: '2rem', width: '82vw' }}>
        <Product />
      </div>
    </div>
  );
};

export default Productmain;