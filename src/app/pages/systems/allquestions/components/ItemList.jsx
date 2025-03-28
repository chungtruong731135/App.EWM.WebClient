import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as actionsModal from "@/setup/redux/modal/Actions";

// import ItemsList from "./components/ItemsList";
import TDSelect from "@/app/components/TDSelect";
import { Image, Popconfirm, Drawer, Select} from "antd";
import { FILE_URL, requestPOST, requestDELETE} from "@/utils/baseAPI";
import { useNavigate, useParams, useLocation} from "react-router-dom";
import TableList from "@/app/components/TableList";
import BookQuestionModal from './ChiTietModal';
import clsx from "clsx";
import { orderBy, random } from "lodash";
import { toast } from 'react-toastify';
import { Content } from '@/_metronic/layout/components/content';
import { toAbsoluteUrl } from '@/_metronic/helpers';
import _ from 'lodash';

const questionTypeMap = {
    0: 'Nhóm câu hỏi', // Group
    1: 'Chọn một đáp án', // SingleChoice (radio)
    2: 'Chọn nhiều đáp án', // MultipleChoice (checkbox)
    3: 'Câu hỏi tự luận', // Essay
    4: 'Điền vào chỗ trống', // FillInBlank (fill_blank)
    5: 'Sắp xếp từ', // WordArrangement
    6: 'Ghép đôi', // Matching (math_col)
    7: 'Đúng / Sai / Không có', // TrueFalse (answer_t_f_no)
    8: 'Sắp xếp đoạn văn', // Arrangement
    9: 'Kéo thả đáp án', // DragAndDrop (down_answer)
    10: 'Chọn bảng', // TableChoice

    // Others:
    11: 'Điền vào hình ảnh', // FillInImage (fill_input_img)
    // 12: 'Đánh dấu X', // XMarkAnswer (x_mark_answer)
    12: 'Chọn một đáp án điền vào chỗ trống', // SelectAnswer (select)
    // 14: 'Khoanh tròn đáp án' // CircleAnswer (circle_answer)
};

const QUESTION_TYPES = [
    // { value: 0, label: 'Nhóm câu hỏi', icon: 'group', showMenu: true, typeKey: 'group' }, // no icon
    { value: 1, label: 'Chọn một đáp án', icon: 'radio', showMenu: true, typeKey: 1 },
    { value: 2, label: 'Chọn nhiều đáp án', icon: 'checkbox', showMenu: true, typeKey: 2 },
    { value: 3, label: 'Tự luận', icon: 'essay', showMenu: true, typeKey: 3 },
    { value: 4, label: 'Điền vào chỗ trống', icon: 'fill_blank', showMenu: true, typeKey: 4 },
    { value: 5, label: 'Sắp xếp từ', icon: 'down_answer', showMenu: true, typeKey: 5 },
    { value: 6, label: 'Ghép đôi', icon: 'math_col', showMenu: true, typeKey: 6 },
    { value: 7, label: 'Đúng / Sai / Không có', icon: 'true_false', showMenu: true, typeKey: 7 },
    { value: 8, label: 'Sắp xếp đoạn văn', icon: 'word_arrangement', showMenu: true, typeKey: 8 },
    { value: 9, label: 'Kéo thả đáp án', icon: 'select', showMenu: true, typeKey: 9 },
    { value: 10, label: 'Chọn bảng', icon: 'table_choice', showMenu: true, typeKey: 10 },
];

const BookQuestionsPage = (props) => {
    const dispatch = useDispatch();

    const { bookId } = useParams();
    const navigate = useNavigate()

    const location = useLocation();
    const bookItem = location.state?.item; 

    const drawerVisible = useSelector(state => state.modal.drawerData.drawerVisible);
    const drawerData = useSelector(state => state.modal.drawerData.drawerData);
    const { dataSearch } = props;

    const random = useSelector(state => state.modal.random);
    const modalVisible = useSelector((state) => state.modal.modalVisible);
    const [dataTables, setDataTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [size, setSize] = useState(20);
    const [offset, setOffset] = useState(1);
    const [count, setCount] = useState(0);
    const [keyword, setKeyword] = useState('');
    const [selectedQuestionType, setSelectedQuestionType] = useState(null);
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const res = await requestPOST(
                'api/v1/questions/search',
                _.assign(
                    {
                        pageNumber: offset,
                        pageSize: size,
                        orderBy: ["pageNo", "title", "sortOrder"],
                    },
                    dataSearch
                )
            );

            if (res) {
                setDataTables(res.data ?? [])
                setCount(res.totalCount)
            }
            setLoading(false)
        };
        fetchData()
        return () => {

        }
    }, [offset, size, random, keyword, dataSearch]);

    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            width: 80,
            render: (text, record, index) => (
                <div>{(offset - 1) * size + index + 1}</div>
            ),
        },
        {
            title: 'Nội dung câu hỏi',
            key: 'question',
            dataIndex: 'question',
            render: (text, record) => {
                const cleanContent = record.content ? record.content.replace(/<[^>]*>/g, "") : "Không có dữ liệu";
                const shortContent = cleanContent.length > 100 ? `${cleanContent.substring(0, 100)}...` : cleanContent;
                
                return (
                    <div>
                        <strong className="text-primary d-block mb-3">#{record.title}</strong>
                        <div>{shortContent}</div>
                    </div>
                );
            },
        },
        {
            title: 'Thuộc quyển sách',
            key: 'bookName',
            dataIndex: 'bookName',
        },
        {
            title: 'Thuộc trang',
            key: 'pageNo',
            dataIndex: 'pageNo',
            render: (text) => text ? `Trang ${text}` : '',
        },
        {
            title: 'Loại câu hỏi',
            key: 'typeEnum',
            dataIndex: 'typeEnum',
            render: (text) => {
                const isGroupQuestion = text === 0;
                return (
                    <span
                        style={{
                            backgroundColor: isGroupQuestion ? '#f0f0f0' : 'transparent', // Màu bạc nhạt
                            padding: '5px 10px',
                            borderRadius: '5px',
                            display: 'inline-block'
                        }}
                    >
                        {questionTypeMap[text] || 'Không xác định'}
                    </span>
                );
            }
        },
        {
            title: 'Độ khó',
            key: 'level',
            dataIndex: 'level',
            render: (text) => {
                const levelMap = {
                    easy: 'Dễ',
                    medium: 'Vừa phải',
                    hard: 'Khó'
                };
        
                const levelColorMap = {
                    easy: 'text-success', 
                    medium: 'text-warning',
                    hard: 'text-danger'
                };
        
                const levelText = levelMap[text] || 'Không xác định';
                const levelClass = levelColorMap[text] || 'text-muted';
        
                return <span className={levelClass}>{levelText}</span>;
            }
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

                        {record?.typeEnum == 0 && (
                        <>
                            <a
                                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
                                data-toggle="m-tooltip"
                                title="Thêm mới câu hỏi con"
                                onClick={() => {
                                    handleButton(`add-child`, record);
                                }}
                            >
                                <i className="fa fa-plus"></i>
                            </a>
                        </>
                        )}
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

    const handleButton = async (type, item) => {
        switch (type) {
            case "chi-tiet":
                dispatch(actionsModal.setDataModal(item));
                dispatch(actionsModal.setModalVisible(true));
                break;
            case "delete":
                var res = await requestDELETE(`api/v1/bookquestions/${item.id}`);
                if (res) {
                    toast.success("Thao tác thành công!");
                    dispatch(actionsModal.setRandom());
                } else {
                    toast.error("Thất bại, vui lòng thử lại!");
                }
                break;
            case 'children':
                dispatch(
                    actionsModal.setDataModal({
                        parent: item,
                        parentId: item?.id,
                        parentCode: item?.code,
                    })
                );
                break;
            case 'add-child':
                dispatch(actionsModal.setDrawerDataState({ drawerVisible: true, drawerData: { parentId: item?.id, parentCode: item?.code } }));
                dispatch(
                    actionsModal.setDataModal({
                        parent: item,
                        parentId: item?.id,
                        parentCode: item?.code,
                    })
                );
                break;
            default:
                break;
        }
    };

    const handleShowDrawer = () => {
        dispatch(actionsModal.setDrawerDataState({ drawerVisible: true, drawerData: null }));
    };

    const onClose = () => {
        dispatch(actionsModal.setDrawerDataState({ drawerVisible: false, drawerData: null }));
    };

    const handleAddQuestion = type => {
        setSelectedQuestionType(type); 
        dispatch(actionsModal.setModalVisible(true));
        onClose();
    };

    return (
        <>
            <Content>
                <div className="card card-xl-stretch mb-xl-3">
                    <div className="card-dashboard-body table-responsive p-3">
                        <TableList
                            dataTable={dataTables}
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
                {/* <Drawer size="large" title="Chọn loại câu hỏi" onClose={onClose} open={drawerVisible}>
                    <div className="row g-2">
                        {QUESTION_TYPES.filter(type => type.showMenu).map(type => (
                        <div key={type.value} className="col-4">
                            <span
                            className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3"
                            onClick={() => {
                                handleAddQuestion(type);
                            }}
                            >
                            <img src={toAbsoluteUrl(`media/icons/questions/${type.icon}.svg`)} className="w-100 h-100 mb-2" alt={type.label} />
                            <span className="fw-semibold">{type.label}</span>
                            </span>
                        </div>
                        ))}
                    </div>
                </Drawer> */}
                {/* {modalVisible ? <BookQuestionModal questionType={selectedQuestionType} /> : <></>} */}
            </Content>   
        </>
    );
};

export default BookQuestionsPage;
