/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import * as actionsModal from '@/setup/redux/modal/Actions';

import PageHeader from './components/PageHeader';
import OrganizationUnitDetails from './components/OrganizationUnitDetails';
import TreeView from './components/OrganizationUnitTreeView';

const UsersPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actionsModal.resetData());

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className='card card-xl-stretch '>
        <PageHeader title='Cơ cấu tổ chức' />
      </div>
      <div className='row mt-2'>
        <div className='col-xl-3 pe-0'>
          <div className='card card-flush h-md-100'>
            <TreeView />
          </div>
        </div>
        <div className='col-xl-9'>
          <div className='card card-xl-stretch '>
            <OrganizationUnitDetails />
          </div>
        </div>
      </div>
    </>
  );
};

export default UsersPage;
