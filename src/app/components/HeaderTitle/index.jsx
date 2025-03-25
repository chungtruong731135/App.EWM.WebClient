import React from 'react';

const HeaderTitle = ({title}) => {
  return (
    <div className='d-flex align-items-center mb-4'>
      <h3 className='m-form-headtitle me-1 mb-0 ms--10 text-primary'>{title}</h3>
      <span className={`bullet bullet-horizontal flex-grow-1 bg-secondary h-1px`}></span>
    </div>
  );
};

export default HeaderTitle;
