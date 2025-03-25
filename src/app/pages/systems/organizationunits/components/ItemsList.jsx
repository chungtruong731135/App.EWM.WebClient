/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { Popconfirm } from "antd";
import { toast } from "react-toastify";
import clsx from "clsx";

import * as actionsModal from "@/setup/redux/modal/Actions";
import { requestPOST, requestDELETE } from "@/utils/baseAPI";
import { KTSVG, toAbsoluteUrl } from "@/_metronic/helpers";

import TableList from "@/app/components/TableList";
import ModalItem from "./ChiTietModal";
import PageHeader from "./PageHeader";

const UsersList = (props) => {
  const dispatch = useDispatch();
  const modalVisible = useSelector((state) => state.modal.modalVisible);
  const random = useSelector((state) => state.modal.random);
  const modalOrganizationUnit = useSelector(
    (state) => state.modal.modalOrganizationUnit
  );
  const dataModal = useSelector((state) => state.modal.currentOrganizationUnit);
  const id = dataModal?.id ?? null;

  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [dataSearch, setDataSearch] = useState(null);

  useEffect(() => {
    dispatch(actionsModal.setRandom());
    setDataTable([]);
    setOffset(1);
    setSize(10);
    return () => {};
  }, [dataSearch, dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/organizationunits/search`,
          _.assign(
            {
              advancedSearch: {
                fields: ["name", "code"],
                keyword: dataSearch?.keyword ?? null,
              },
              pageNumber: offset,
              pageSize: size,
              orderBy: ["name"],
              parentId: id,
            },
            dataSearch
          )
        );
        setDataTable(res?.data ?? []);
        setCount(res?.totalCount ?? 0);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }

    return () => {};
  }, [offset, size, random, id, dataSearch]);

  const handleButton = async (type, item) => {
    switch (type) {
      case "chi-tiet":
        dispatch(actionsModal.setDataModal(item));
        dispatch(
          actionsModal.setModalOrganizationUnit({
            modalVisible: true,
            type: "chitiet",
          })
        );
        break;

      case "delete":
        var res = await requestDELETE(`api/v1/organizationunits/${item.id}`);
        if (res) {
          toast.success("Thao tác thành công!");
          dispatch(actionsModal.setRandom());
        } else {
          toast.error("Thất bại, vui lòng thử lại!");
        }
        break;
      case "XoaVanBan":
        //handleXoaVanBan(item);
        break;

      default:
        break;
    }
  };

  const columns = [
    {
      title: "Tên đơn vị",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mã đơn vị",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Tên tắt",
      dataIndex: "shortcutName",
      key: "shortcutName",
    },
    {
      title: "Cấp tổ chức",
      dataIndex: "organizationUnitTypeName",
      key: "organizationUnitTypeName",
    },
    {
      title: "Chức năng nhiệm vụ",
      dataIndex: "mainTask",
      key: "mainTask",
    },
    {
      title: "Thao tác",
      dataIndex: "",
      key: "",
      width: "10%",
      render: (text, record) => {
        return (
          <div>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xem chi tiết/Sửa"
              onClick={() => {
                handleButton(`chi-tiet`, record);
              }}
            >
              <i className="fa fa-eye"></i>
            </a>

            <Popconfirm
              title="Bạn có chắc chắn muốn xoá?"
              onConfirm={() => {
                handleButton(`delete`, record);
              }}
              okText="Xoá"
              cancelText="Huỷ"
            >
              <a
                className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1"
                data-toggle="m-tooltip"
                title="Xoá"
              >
                <i className="fa fa-trash"></i>
              </a>
            </Popconfirm>
          </div>
        );
      },
    },
  ];
  return (
    <>
      <div className="card-dashboard-body table-responsive">
        <div className="card-header cursor-pointer p-0">
          <div className="card-title m-0">
            <h3 className="fw-bolder m-0">Danh sách đơn vị trực thuộc</h3>
          </div>

          {/* <span className='btn btn-primary align-self-center'>Edit Profile</span> */}
        </div>

        <div className="card-body p-0">
          <TableList
            dataTable={dataTable}
            columns={columns}
            isPagination={true}
            size={size}
            count={count}
            offset={offset}
            setOffset={setOffset}
            setSize={setSize}
            loading={loading}
          />
        </div>
      </div>
      {modalOrganizationUnit?.modalVisible ? <ModalItem /> : <></>}
    </>
  );
};

export default UsersList;
