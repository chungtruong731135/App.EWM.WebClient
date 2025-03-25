/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { Dropdown } from "antd";
import * as actionsModal from "@/setup/redux/modal/Actions";
import { requestPOST } from "@/utils/baseAPI";

import TableList from "@/app/components/TableList";
import ModalItem from "./ChiTietModal";
import { useNavigate } from "react-router-dom";
import ActiveCourseModal from "./ActiveCourseModal";
import ModalRequestCode from "./ModalRequestCode";

const UsersList = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const modalVisible = useSelector((state) => state.modal.modalVisible);
  const { dataSearch } = props;
  const random = useSelector((state) => state.modal.random);
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(50);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [modalActiveVisible, setModalActiveVisible] = useState(false);
  const [modalRequestVisible, setModalRequestVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(
          `api/v1/sales/courses/search`,
          _.assign(
            {
              advancedSearch: {
                fields: ["title", "code"],
                keyword: dataSearch?.keyword ?? null,
              },
              pageNumber: offset,
              pageSize: size,
              orderBy: ["createdOn DESC"],
              isActive: true,
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
      case "yeu-cau-ma":
        dispatch(actionsModal.setDataModal(item));
        setModalRequestVisible(true);
        break;
      case "kich-hoat":
        dispatch(actionsModal.setDataModal(item));
        setModalActiveVisible(true);
        break;

      default:
        break;
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => (
        <div>{(offset - 1) * size + index + 1}</div>
      ),
    },
    {
      title: "Tên ",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Giáo viên",
      dataIndex: "teacherName",
      key: "teacherName",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 150,
      render: (text, record) => {
        return (
          <div>
            <div
              className={`me-2 badge badge-light-${
                record?.isActive ? "success" : "danger"
              }`}
            >
              {`${record?.isActive ? "Sử dụng" : "Không sử dụng"}`}
            </div>
            {record?.isPublic ? (
              <div
                className={`badge badge-light-${
                  record?.isPublic ? "success" : "danger"
                }`}
              >
                {`${record?.isPublic ? "Phát hành" : "Không phát hành"}`}
              </div>
            ) : (
              <></>
            )}
          </div>
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Số lượng mã đã kích hoạt",
      dataIndex: "countActived",
      key: "countActived",
      render: (text) => <div className="text-center">{text || 0}</div>,
    },
    {
      title: "Số lượng mã chưa kích hoạt/hết hạn",
      dataIndex: "countDeactived",
      key: "countDeactived",
      render: (text) => <div className="text-center">{text || 0}</div>,
    },
    {
      title: "Thao tác",
      dataIndex: "",
      key: "",
      width: 100,
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
            <Dropdown
              trigger={"click"}
              menu={{
                items: [
                  {
                    key: "yeu-cau-ma",
                    disabled: false,
                    label: (
                      <a
                        className="e-1 p-2 text-dark"
                        onClick={() => {
                          handleButton(`yeu-cau-ma`, record);
                        }}
                      >
                        <i className={`fa fa-reply me-2`}></i>
                        {`Yêu cầu thêm mã kích hoạt`}
                      </a>
                    ),
                  },
                  {
                    key: "kich-hoat",
                    disabled: false,
                    label: (
                      <a
                        className="e-1 p-2 text-dark"
                        onClick={() => {
                          handleButton(`kich-hoat`, record);
                        }}
                      >
                        <i className={`fas fa-paper-plane me-2`}></i>
                        {`Kích hoạt khoá học`}
                      </a>
                    ),
                  },
                ],
              }}
            >
              <a
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                title="Thao tác nhanh"
              >
                <i className="fa fa-ellipsis-h"></i>
              </a>
            </Dropdown>
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
      {modalActiveVisible ? (
        <ActiveCourseModal
          modalVisible={modalActiveVisible}
          setModalVisible={setModalActiveVisible}
        />
      ) : (
        <></>
      )}
      {modalRequestVisible ? (
        <ModalRequestCode
          modalVisible={modalRequestVisible}
          setModalVisible={setModalRequestVisible}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default UsersList;
