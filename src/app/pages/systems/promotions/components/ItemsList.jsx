/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { Popconfirm } from "antd";
import { toast } from "react-toastify";
import * as actionsModal from "@/setup/redux/modal/Actions";
import { requestPOST, requestDELETE } from "@/utils/baseAPI";

import TableList from "@/app/components/TableList";
import ModalItem from "./ChiTietModal";
import dayjs from "dayjs";
import CopyToClipboard from "react-copy-to-clipboard";

const UsersList = (props) => {
  const dispatch = useDispatch();
  const modalVisible = useSelector((state) => state.modal.modalVisible);
  const { dataSearch } = props;
  const random = useSelector((state) => state.modal.random);

  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/promotions/search`,
          _.assign(
            {
              pageNumber: offset,
              pageSize: size,
              orderBy: ["createdOn DESC"],
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

    if (refreshing) {
      fetchData();
      setRefreshing(false);
    }
    return () => {};
  }, [refreshing]);
  useEffect(() => {
    if (!refreshing) {
      setRefreshing(true);
    }
    return () => {};
  }, [offset, size, dataSearch, random]);
  useEffect(() => {
    setOffset(1);
    return () => {};
  }, [dataSearch]);

  const handleButton = async (type, item) => {
    switch (type) {
      case "chi-tiet":
        dispatch(actionsModal.setDataModal(item));
        dispatch(actionsModal.setModalVisible(true));

        break;

      case "delete":
        var res = await requestDELETE(`api/v1/promotions/${item.id}`);
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
      title: "Mã kích hoạt",
      dataIndex: "promotionCode",
      key: "promotionCode",
      render: (text) => (
        <CopyToClipboard
          text={text}
          onCopy={() => {
            toast.info(`Đã sao chép: ${text}`);
          }}
        >
          <div className="d-flex align-items-center justify-content-between btn p-0">
            <div className="txt-bold">{text}</div>
            <i className="fas fa-copy" />
          </div>
        </CopyToClipboard>
      ),
    },

    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },

    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
    },
    {
      title: "Hình thức ",
      dataIndex: "type",
      key: "type",
      render: (text, record) => {
        return <div>{text == 0 ? "Từ theo %" : "Trừ trực tiếp giá"}</div>;
      },
    },
    {
      title: "Lượt sử dụng",
      dataIndex: "numberOfUses",
      key: "numberOfUses",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (text, record) => {
        return (
          <div>
            {record?.startDate
              ? dayjs(record?.startDate).format("DD/MM/YYYY")
              : ""}
          </div>
        );
      },
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (text, record) => {
        return (
          <div>
            {record?.endDate ? dayjs(record?.endDate).format("DD/MM/YYYY") : ""}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (text, record) => {
        return (
          <div>{record?.isActive == 1 ? "Đang sử dụng" : "Dừng sử dụng"}</div>
        );
      },
    },
    {
      title: "Thao tác",
      dataIndex: "",
      key: "",
      width: 150,
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
              title="Xoá?"
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
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
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
      {modalVisible ? <ModalItem /> : <></>}
    </>
  );
};

export default UsersList;
