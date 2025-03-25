import { Popconfirm } from 'antd';
import _ from 'lodash';

const RenderItemQuestion = ({ item, index, handleDeleteQuest }) => {
  return (
    <div className="border mb-5 d-flex flex-column">
      <div className="flex-grow-1 p-3 border-bottom">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div className="d-flex align-items-center">
            <div className="">
              <span>Thứ tự:</span>
              <span className="ms-2 fw-semibold">{item?.order}</span>
            </div>
          </div>
          <div className="ms-2">
            <Popconfirm
              title="Xoá câu hỏi?"
              onConfirm={() => {
                handleDeleteQuest(item?.id);
              }}
              okText="Xoá"
              cancelText="Huỷ"
            >
              <a className="btn btn-danger btn-icon btn-sm me-2" data-toggle="m-tooltip" title="Xoá câu hỏi">
                <i className="fas fa-times p-0"></i>
              </a>
            </Popconfirm>
          </div>
        </div>
      </div>
      <div className="flex-grow-1 p-5 border-bottom">
        <div className="fw-semibold " />
        {item.content}
      </div>
    </div>
  );
};

export default RenderItemQuestion;
