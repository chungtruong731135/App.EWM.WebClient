import React, { useEffect, useState } from 'react';
import { Dropdown } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { FILE_URL } from '@/utils/baseAPI';

const TDTableColumnHoTen = ({ dataUser, index, showMenu }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const getLastName = (fullName) => {
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length <= 1) {
      return 'A';
    }
    const names = fullName.trim().split(/\s+/);
    return names[names.length - 1];
  };

  const lastName = getLastName(dataUser?.fullName);
  const firstChar = lastName.charAt(0);
  let arr = ['primary', 'success', 'danger', 'warning', 'info', 'muted'];
  const color = arr[index % arr.length];

  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    if (showMenu == true && dataUser?.type == 4) {
      setMenuItems([
        {
          key: 'thong-tin-tai-khoan',
          disabled: false,
          label: (
            <span
              className="text-dark"
              onClick={() => {
                dispatch(
                  actionsModal.setModalOrganizationUnit({
                    modalVisible: true,
                    type: 'suanhom',
                  })
                );
              }}
            >
              {'Thông tin tài khoản'}
            </span>
          ),
        },
        {
          key: 'khoa-hoc-da-ban',
          disabled: false,
          label: (
            <span
              className="text-dark"
              onClick={() => {
                dispatch(
                  actionsModal.setModalOrganizationUnit({
                    modalVisible: true,
                    type: 'suanhom',
                  })
                );
              }}
            >
              {'Khoá học đã bán'}
            </span>
          ),
        },
      ]);
    } else if (showMenu == true && dataUser?.type == 1) {
      setMenuItems([
        {
          key: 'thong-tin-tai-khoan',
          disabled: false,
          label: (
            <span
              className="text-dark"
              onClick={() => {
                if (dataUser?.userId) {
                  navigate({
                    pathname: `/system/account/${dataUser?.userId}/overview`,
                  });
                }
              }}
            >
              {'Thông tin tài khoản'}
            </span>
          ),
        },
        {
          key: 'khoa-hoc-da-ban',
          disabled: false,
          label: (
            <span
              className="text-dark"
              onClick={() => {
                if (dataUser?.userId) {
                  navigate({
                    pathname: `/system/account/${dataUser?.userId}/courses`,
                  });
                }
              }}
            >
              {'Danh sách khoá học'}
            </span>
          ),
        },
      ]);
    }

    return () => {};
  }, []);

  if (!dataUser?.fullName) {
    return <></>;
  }

  return (
    <>
      <Dropdown
        menu={{
          items: menuItems,
        }}
        trigger={['contextMenu']}
      >
        <div className="d-flex align-items-center ">
          {/* begin:: Avatar */}
          <div className="symbol symbol-circle symbol-50px overflow-hidden me-3">
            <div className="cursor-pointer">
              {dataUser.imageUrl ? (
                <div className="symbol-label">
                  <img
                    src={dataUser.imageUrl.includes('https://') || dataUser.imageUrl.includes('http://') ? dataUser.imageUrl : FILE_URL + `${dataUser.imageUrl.startsWith('/') ? dataUser.imageUrl.substring(1) : dataUser.imageUrl}`}
                    alt={dataUser.fullName}
                    className="w-100"
                  />
                </div>
              ) : (
                <div className={`symbol-label fs-3 bg-light-${color} text-${color}`}>{` ${firstChar.toUpperCase()} `}</div>
              )}
            </div>
          </div>
          <div className="d-flex flex-column cursor-pointer">
            <div className="text-gray-800 text-hover-primary mb-1 fw-bolder">{dataUser?.fullName}</div>
            <span>{dataUser?.userName}</span>
          </div>
        </div>
      </Dropdown>
    </>
  );
};

export default TDTableColumnHoTen;
