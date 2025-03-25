/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import PageHeader from './components/PageHeader';
import ItemsList from './components/ItemsList';

const UsersPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className='card card-xl-stretch mb-xl-9'>
        <PageHeader title='Cấp cơ cấu tổ chức' />
        <ItemsList />
      </div>
    </>
  );
};

export default UsersPage;
