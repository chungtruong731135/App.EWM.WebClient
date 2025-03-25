/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import _ from 'lodash';
import {Modal, Table} from 'antd';
import {toast} from 'react-toastify';

import {Tree} from 'antd';
import {Dropdown, Menu} from 'antd';

import * as actionsModal from '@/setup/redux/modal/Actions';
import {requestGET, requestDELETE, requestPOST} from '@/utils/baseAPI';

import ModalItem from './ChiTietModal';

const UsersList = () => {
  const dispatch = useDispatch();
  const modalVisible = useSelector((state) => state.modal.modalOrganizationUnit);

  const random = useSelector((state) => state.modal.random);

  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState([]);

  const XoaNhom = async (idXoa) => {
    Modal.confirm({
      title: 'Xoá nhóm',
      content: 'Bạn có chắc chắn muốn xoá nhóm này?',
      okText: 'Đồng ý',
      cancelText: 'Huỷ',
      onOk: async () => {
        var res = await requestDELETE(`api/v1/organizationunits/${idXoa}`);
        if (res) {
          toast.success('Thao tác thành công!');
          //dispatch(actionsModal.setCurrentOrganizationUnit(null));

          dispatch(actionsModal.setRandom());
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
      },
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(`api/v1/organizationunits/search`, {
          advancedSearch: {
            fields: ['name', 'code'],
            keyword: null,
          },
          pageNumber: 1,
          pageSize: 100000,
          orderBy: ['name'],
        });

        let tmpz = (res?.data ?? []).find((x) => x.parentId == null);

        dispatch(actionsModal.setCurrentOrganizationUnit(tmpz));

        const nest = (items, id = null, link = 'parentId') =>
          items
            .filter((item) => item[link] === id)
            .map((item) => ({
              ...item,
              title: (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'sua-nhom',
                        disabled: false,
                        label: (
                          <span
                            className='e-1 p-2 text-dark'
                            onClick={() => {
                              dispatch(
                                actionsModal.setModalOrganizationUnit({
                                  modalVisible: true,
                                  type: 'suanhom',
                                })
                              );
                            }}
                          >
                            <i className={`fa fa-edit me-2`}></i>
                            {'Sửa đơn vị'}
                          </span>
                        ),
                      },
                      {
                        key: 'them-nhom-con',
                        disabled: false,
                        label: (
                          <span
                            className='e-1 p-2 text-dark'
                            onClick={() => {
                              dispatch(
                                actionsModal.setModalOrganizationUnit({
                                  modalVisible: true,
                                  type: 'themnhomcon',
                                })
                              );
                            }}
                          >
                            <i className={`fa fa-plus me-2`}></i>
                            {'Thêm đơn vị'}
                          </span>
                        ),
                      },
                      {
                        key: 'xoa-don-vi',
                        disabled: false,
                        label: (
                          <span
                            className='e-1 p-2 text-dark'
                            onClick={() => {
                              dispatch(
                                actionsModal.setModalOrganizationUnit({
                                  modalVisible: true,
                                  type: 'themnhomcon',
                                })
                              );
                            }}
                          >
                            <i className={`fa fa-trash me-2`}></i>
                            {'Xoá đơn vị'}
                          </span>
                        ),
                      },
                    ],
                  }}
                  trigger={['contextMenu']}
                >
                  <div className='site-dropdown-context-menu'>{item.name}</div>
                </Dropdown>
              ),
              key: item.code,
              children: nest(items, item.id),
            }));
        let tmp = nest(res?.data ?? []);
        setTreeData(tmp);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();

    return () => {};
  }, [random]);

  const handleButton = async (type, item) => {
    switch (type) {
      case 'chi-tiet':
        dispatch(actionsModal.setDataModal(item));
        dispatch(actionsModal.setModalVisible(true));

        break;
      case 'chi-tiet-quyen':
        dispatch(actionsModal.setDataModal(item));
        dispatch(actionsModal.setModalPermissionVisible(true));

        break;

      case 'delete':
        if (item.name === 'Basic' || item.name === 'Admin') {
          toast.error('Thất bại, đây là nhóm mặc định của hệ thống bạn không có quyền xoá');
          return;
        }

        var res = await requestDELETE(`api/roles/${item.id}`);

        if (res) {
          toast.success('Thao tác thành công!');
          dispatch(actionsModal.setRandom());
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
        break;
      case 'XoaVanBan':
        //handleXoaVanBan(item);
        break;

      default:
        break;
    }
  };

  const onSelect = (selectedKeys, info) => {
    dispatch(actionsModal.setCurrentOrganizationUnit({id: info?.node?.id, name: info?.node?.name}));
  };

  return (
    <>
      <div className='card-body card-dashboard px-3 py-3'>
        <div className='card-dashboard-body'>
          {/* <Table dataSource={dataTable} columns={columns} loading={loading} rowKey={Math.random().toString(32)} /> */}
          <Tree onSelect={onSelect} treeData={treeData} showLine={{showLeafIcon: false}} />
        </div>
      </div>
      {modalVisible?.modalVisible ? <ModalItem /> : <></>}
    </>
  );
};

export default UsersList;
