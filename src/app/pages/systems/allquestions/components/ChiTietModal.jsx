import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Select, Spin, Checkbox, Tabs, InputNumber, Radio, TreeSelect } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestGET, requestPOST_NEW, requestPUT_NEW, API_URL, FILE_URL } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';
// import MathType from "@wiris/mathtype-ckeditor5/src/plugin";
import { TDEditorNew, TDEditorButton, TDEditorInline } from '@/app/components';
import TDInputTag from '@/app/components/TDInputTag';
import FileUpload from '@/app/components/FileUpload';
import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import {
  RenderAnswerEssay,
  RenderAnswersChoice,
  RenderAnswersTrueFalse,
  RenderArrangementAnswers,
  RenderDragDropAnswers,
  RenderFillInBlank,
  RenderMatchingAnswers,
  RenderTableChoice,
  RenderWordArrangement,
  RenderFillInImage,
  RenderMultiSelect
} from './answercomponents';
import { create_UUID } from '@/utils/utils';

const QUESTION_TYPES = [
  { value: 0, label: 'Nhóm câu hỏi' }, // Group
  { value: 1, label: 'Chọn một đáp án' }, // SingleChoice (radio)
  { value: 2, label: 'Chọn nhiều đáp án' }, // MultipleChoice (checkbox)
  { value: 3, label: 'Câu hỏi tự luận' }, // Essay
  { value: 4, label: 'Điền vào chỗ trống' }, // FillInBlank (fill_blank)
  { value: 5, label: 'Sắp xếp từ' }, // WordArrangement
  { value: 6, label: 'Ghép đôi' }, // Matching (math_col)
  { value: 7, label: 'Đúng / Sai / Không có' }, // TrueFalse (answer_t_f_no)
  { value: 8, label: 'Sắp xếp đoạn văn' }, // Arrangement
  { value: 9, label: 'Kéo thả đáp án' }, // DragAndDrop (down_answer)
  { value: 10, label: 'Chọn bảng' }, // TableChoice
  { value: 11, label: 'Điền vào hình ảnh' }, // FillInImage (fill_input_img)
  // { value: 12, label: 'Đánh dấu X' }, // XMarkAnswer (x_mark_answer)
  { value: 12, label: 'Chọn một đáp án điền vào chỗ trống' }, // SelectAnswer (select)
  // { value: 14, label: 'Khoanh tròn đáp án' }, // CircleAnswer (circle_answer)
];

const QUESTION_LEVELS = [
  { value: 'easy', label: 'Dễ' },
  { value: 'medium', label: 'Vừa phải' },
  { value: 'hard', label: 'Khó' },
];
const { Option, OptGroup } = Select;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();

  const questionType = props?.questionType;
  const dataModal = useSelector(state => state.modal.dataModal);
  const modalVisible = useSelector(state => state.modal.modalVisible);

  const id = dataModal?.id ?? null;
  const parentItem = dataModal?.parent ?? null;
  const parentIdModal = dataModal?.parentId ?? null;
  const bookIdFromParent = dataModal?.parent?.bookId ?? null;

  const [form] = Form.useForm();

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [typeEnum, setTypeEnum] = useState(null);
  const [parentId, setParentId] = useState(parentIdModal ?? null);

  const [bookTables, setBookTables] = useState([]);
  const [bookTableDisabled, setBookTableDisabled] = useState(!!parentItem || !!parentId || bookTables?.length === 0);

  // console.log(props?.questionType?.typeKey);
  console.log('parent', parentItem);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      if (id) {
        const res = await requestGET(`api/v1/bookquestions/${id}`);
        const _data = res?.data ?? null;
        if (_data) {
          setTypeEnum(_data?.typeEnum);
          setParentId(_data?.parentId ? _data?.parentId : parentIdModal);

          if (_data?.typeEnum == 5) {
            _data.answerList = _data.wordArrangementAnswers;
          }
          if (_data?.typeEnum == 8 && _data?.arrangementAnswers?.length > 0) {
            _data.arrangementAnswers = _.orderBy(_data.arrangementAnswers, ['correctPosition'], 'asc');
          }
          if (_data?.typeEnum == 6 && _data?.matchingAnswers?.length > 0) {
            var matchingAnswers = _data?.matchingAnswers?.map(item => ({ ...item, ansId: create_UUID() }));
            _data.questColumn = matchingAnswers?.map(item => ({ id: item?.id, content: item?.leftContent, ansId: item?.ansId }));
            _data.answerColumn = matchingAnswers?.map(item => ({ id: item?.ansId, content: item?.rightContent }));
            // _data.answerColumn = matchingAnswers?.map((item) => ({ id: item?.ansId, content: item?.rightContent }))
          }
          if (_data?.typeEnum == 4 && _data?.fillInBlankAnswers?.length > 0) {
            var temp = [];
            _data?.fillInBlankAnswers?.map(item => {
              var child = [];
              try {
                child = JSON.parse(item?.alternativeAnswers ?? '[]');
              } catch (error) {}
              child = child?.map(i => ({ value: i }));
              temp.push({
                id: `${item?.blankIndex}`,
                number: item?.blankIndex,
                alternativeAnswers: [{ value: item?.answer }, ...child],
              });
            });
            _data.fillInBlankAnswers = temp;
          }
          if (_data?.typeEnum == 9 && _data?.dragDropAnswers?.length > 0) {
            var dragDropAnswers = [];

            var array = [];
            _data?.dragDropAnswers?.map((item, index) => {
              var temp = [];
              try {
                temp = JSON.parse(item?.positionCorrect ?? '[]');
                array = array.concat(temp);
              } catch (error) {}
              dragDropAnswers.push({
                id: item?.id,
                content: item?.content,
                number: item?.sortOrder,
                positionCorrect: temp,
              });
            });
            array = _.uniq(_.sortBy(array));
            _data.dragDropAnswers = dragDropAnswers;
            _data.blankList = array?.map(item => ({ label: `Ô trống ${item}`, value: item }));
          }
          if (_data?.typeEnum == 12 && _data?.singleSelectAnswers?.length > 0) {
            const groupedAnswers = _data.singleSelectAnswers.reduce((acc, item) => {
                const { blankIndex, answer, isCorrectAnswer } = item;
                if (!acc[blankIndex]) {
                    acc[blankIndex] = { blankIndex, listAnswers: [] };
                }
                acc[blankIndex].listAnswers.push({ value: answer, isCorrectAnswer });

                return acc;
            }, {});

            _data.singleSelectAnswers = Object.values(groupedAnswers).map(group => ({
                ...group,
                selectedAnswer: group.listAnswers.findIndex(ans => ans.isCorrectAnswer), // Tìm vị trí đáp án đúng
            }));
          }
          // console.log(_data);

          form.setFieldsValue({
            ..._data,
            bookName: parentItem ? parentItem?.bookName : _data?.bookName,
            bookTable: parentItem 
                ? `${parentItem?.bookTableName} (${parentItem?.bookTableParentName ?? ''})`
                : (_data?.bookTableName + (_data?.bookTableParentName ? ` (${_data?.bookTableParentName})` : '')),
            typeEnum: Number(_data?.typeEnum ?? props?.questionType?.typeKey),
          });
        }
      } else {
        form.setFieldsValue({
          bookName: parentItem ? parentItem?.bookName : null,
          bookTable: parentItem ? `${parentItem?.bookTableName} (${parentItem?.bookTableParentName ?? ''})` : null,
          typeEnum: Number(props?.questionType?.typeKey),
        });
      }

      setLoadding(false);
    };
    fetchData();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, props?.bookItem, form, questionType]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
    dispatch(actionsModal.setDataModal(null));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);

      const formData = {
        ...values,
        ...(id ? {} : { typeEnum: questionType?.typeKey }),
        parentId: parentId ?? null,
        bookTableId: parentItem?.bookTableId ?? values.bookTableId, // Gán bookTableId theo thằng bố nó nếu có parentItem
        bookId: parentItem?.bookId ?? values.bookId, // Gán bookId theo thằng bố nó nếu có parentItem
      };

      if (formData?.typeEnum == 5) {
        delete formData.answerList;
      }
      if (formData?.typeEnum == 8 && formData?.arrangementAnswers?.length > 0) {
        formData.arrangementAnswers = formData?.arrangementAnswers?.map((item, index) => ({
          ...item,
          correctPosition: index,
        }));
      }
      if (formData?.typeEnum == 6 && formData?.matches) {
        var temp = [];
        formData?.questColumn.map(item => {
          temp.push({
            leftContent: item?.content,
            rightContent: formData?.answerColumn?.find(answer => answer?.id === formData?.matches[item?.id])?.content,
          });
        });
        formData.matchingAnswers = temp;
        delete formData.questColumn;
        delete formData.answerColumn;
        delete formData.matches;
      }
      if (formData?.typeEnum == 10 && formData?.tableChoiceAnswers) {
        formData.tableChoiceAnswers = formData.tableChoiceAnswers?.map(item => ({
          ...item,
          optionId: formData.tableChoiceOptions?.findIndex(i => i.id == item?.optionId) > -1 ? item?.optionId : null,
        }));
      }
      if (formData?.typeEnum == 4 && formData?.fillInBlankAnswers?.length > 0) {
        var fillInBlankAnswers = [];
        formData?.fillInBlankAnswers?.map(item => {
          var child = item?.alternativeAnswers ?? [];
          fillInBlankAnswers.push({
            blankIndex: item?.number,
            answer: child[0]?.value,
            alternativeAnswers: JSON.stringify(child?.filter((i, ind) => ind > 0)?.map(i => i.value) ?? []),
            caseSensitive: true,
          });
        });
        formData.fillInBlankAnswers = fillInBlankAnswers;
      }
      if (formData?.typeEnum == 9 && formData?.dragDropAnswers?.length > 0) {
        var dragDropAnswers = [];
        formData?.dragDropAnswers?.map((item, index) => {
          dragDropAnswers.push({
            content: item?.content,
            sortOrder: index,
            positionCorrect: JSON.stringify(item?.positionCorrect),
          });
        });
        formData.dragDropAnswers = dragDropAnswers;
        delete formData.blankList;
      }

      if (formData?.typeEnum == 12 && formData?.singleSelectAnswers?.length > 0) {
        formData.singleSelectAnswers = formData.singleSelectAnswers.flatMap((item, index) =>
            item.listAnswers.map((answer, ansIndex) => ({
                blankIndex: index + 1,
                answer: answer.value,
                isCorrectAnswer: ansIndex === (values.singleSelectAnswers[index]?.selectedAnswer || 0), // Sử dụng values thay vì getFieldValue
            }))
        );
      }

      if (id) {
        formData.id = id;
      }

      const res = id ? await requestPUT_NEW(`api/v1/bookquestions/${id}`, formData) : await requestPOST_NEW(`api/v1/bookquestions`, formData);

      if (res.status === 200) {
        toast.success(id ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        dispatch(actionsModal.setRandom());
        handleCancel();
      } else {
        const errors = Object.values(res?.data?.errors ?? {});
        let final_arr = [];
        errors.forEach(item => {
          final_arr = _.concat(final_arr, item);
        });
        toast.error('Thất bại, vui lòng thử lại! ' + final_arr.join(' '));
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
      toast.error('Có lỗi xảy ra!');
    }
    setBtnLoading(false);
  };

  const onFinishFailed = error => {
    console.log(error);
  };

  const handleSubmit = () => {
    form.submit();
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');
    const spans = doc.querySelectorAll('.custom-placeholder');
    var temp = form.getFieldValue('fillInBlankAnswers') || [];
    const updatedPlaceholders = Array.from(spans).map((span, index) => ({
      id: span.getAttribute('data-index'),
      number: index + 1,
      alternativeAnswers: temp[index]?.alternativeAnswers ?? [],
    }));

    // updatedPlaceholders?.map((item) => {
    //   if (temp?.findIndex(i => i.number == item?.number) == -1) {
    //     temp.push(item)
    //   }
    // })
    form.setFieldValue('fillInBlankAnswers', updatedPlaceholders);
    // setPlaceholders(updatedPlaceholders);
  };

  const handleEditorDropChange = (event, editor) => {
    const data = editor.getData();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');
    const spans = doc.querySelectorAll('.custom-placeholder');
    const _data = form.getFieldValue('dragDropAnswers') || [];
    const updatedPlaceholders = Array.from(spans).map((span, index) => ({
      id: span.getAttribute('data-index'),
      number: index + 1,
      content: _data[index]?.content ?? '',
    }));
    var blankList = updatedPlaceholders?.map(item => ({ label: `Ô trống ${item?.number}`, value: item?.number }));
    var temp = updatedPlaceholders?.map((item, index) => ({
      ...item,
      positionCorrect: _data[index]?.positionCorrect?.filter(position => blankList?.findIndex(i => i.value == position) > -1),
    }));
    form.setFieldValue('dragDropAnswers', temp);
    form.setFieldValue('blankList', blankList);
    // setPlaceholders(updatedPlaceholders);
  };

  const handleEditorType12Change = (event, editor) => {
    const data = editor.getData();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');
    const spans = doc.querySelectorAll('.custom-placeholder');

    var temp = form.getFieldValue('singleSelectAnswers') || [];

    const updatedPlaceholders = Array.from(spans).map((span, index) => ({
        blankIndex: index + 1,
        listAnswers: temp[index]?.listAnswers ?? [],
        selectedAnswer: temp[index]?.selectedAnswer ?? undefined
    }));

    form.setFieldValue('singleSelectAnswers', updatedPlaceholders);
  };

  const fetchBookTables = async (bookId) => {
    console.log(bookId);
    if (bookId) {
      const res = await requestPOST(`api/v1/booktables/search`, {
        pageNumber: 1,
        pageSize: 1000,
        bookId: bookId,
      });
  
      if (res?.data) {
        const itemMap = new Map(res.data.map(item => [item.id, item]));
  
        const createTree = (items, parentId = null, parentNames = []) =>
          items
            .filter(item => item.parentId === parentId)
            .map(item => {
              const parentItem = itemMap.get(item.parentId);
              const newParentNames = parentItem
                ? [...parentNames, parentItem.name]
                : parentNames;
  
              const children = createTree(items, item.id, newParentNames);
  
              return {
                title: item.name,
                value: item.id,
                key: item.id,
                children: children.length > 0 ? children : undefined,
                disabled: children.length > 0,
                parentNames: newParentNames,
              };
            });
  
        const treeData = createTree(res.data);
  
        setBookTables(treeData);
        form.setFieldValue('bookTableId', null);
      }
    } else {
      setBookTables([]);
      form.setFieldValue('bookTableId', null);
    }
  };
  
  const handleChange = (value, label, extra) => {
    if (value) {
      const selectedNode = extra?.triggerNode;
  
      if (selectedNode) {
        const parentNames = selectedNode.props?.parentNames?.length > 0
          ? ` (${selectedNode.props.parentNames.join(', ')})`
          : '';
  
        const formattedLabel = `${selectedNode.props.title}${parentNames}`;
  
        form.setFieldsValue({
          bookTable: formattedLabel,
          bookTableId: value,
        });
      }
    } else {
      form.setFieldsValue({
        bookTable: null,
        bookTableId: null,
      });
    }
  };
  
  return (
    <Modal show={modalVisible} fullscreen={'lg-down'} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel} enforceFocus={false}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">{dataModal?.id ? 'Chi tiết' : 'Thêm mới'}</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loadding}>
          {!loadding && (
            <Form form={form} layout="vertical" autoComplete="off" onFinish={onFinish} onFinishFailed={onFinishFailed}>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Tiêu đề câu hỏi" name="title" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Thuộc sách" name="bookName" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      reload
                      showSearch
                      placeholder=""
                      fetchOptions={async keyword => {
                        const res = await requestPOST(`api/v1/books/search`, {
                          pageNumber: 1,
                          pageSize: 10000,
                          keyword: keyword,
                        });
                        return res?.data?.map(item => ({
                          ...item,
                          label: `${item.name}`,
                          value: item.id,
                        }));
                      }}
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                      disabled={!!bookIdFromParent || !!parentId}
                      onChange={(value, current) => {
                        console.log(value, current);
                        if (value) {
                          form.setFieldValue('bookId', current?.id);
                          form.setFieldValue('bookTable', null);
                        } else {
                          form.setFieldValue('bookId', null);
                          form.setFieldValue('bookTable', null);
                        }
                        fetchBookTables(current?.id);
                        setBookTableDisabled(false);
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item
                    label="Thuộc mục lục"
                    name="bookTable"
                    rules={[{ required: true, message: 'Không được để trống!' }]}
                  >
                    <TreeSelect
                      showSearch
                      style={{ width: '100%' }}
                      value={form.getFieldValue('bookTable')}
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                      placeholder="Vui lòng chọn sách trước"
                      allowClear
                      treeDefaultExpandAll
                      onChange={handleChange}
                      treeData={bookTables}
                      disabled={bookTableDisabled}
                      treeNodeLabelProp="title" 
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Loại câu hỏi" name="typeEnum" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Select style={{ width: '100%' }} options={QUESTION_TYPES} disabled />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Độ khó" name="level">
                    <Select style={{ width: '100%' }} options={QUESTION_LEVELS} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Thuộc trang" name="pageNo">
                    <InputNumber placeholder="" min={1} max={10000} style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Độ ưu tiên" name="sortOrder">
                    <InputNumber placeholder="" min={1} max={100} style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                {id && (
                  <div className="col-xl-3 col-lg-3">
                    <Form.Item label=" " name="isActive" valuePropName="checked">
                      <Checkbox>Hoạt động</Checkbox>
                    </Form.Item>
                  </div>
                )}

                <div className="col-xl-12 col-lg-12">
                  <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
                    {({ getFieldValue }) => {
                      const typeKey = questionType?.typeKey ?? typeEnum;

                      return (
                        <Form.Item label="Nội dung câu hỏi" rules={[{ required: true, message: 'Không được để trống!' }]}>
                          {typeKey == 4 || typeKey == 9 || typeKey == 12 ? (
                            <TDEditorButton
                              data={form.getFieldValue('content') ? form.getFieldValue('content') : ''}
                              // onChange={value => {
                              //   form.setFieldValue('content', value);
                              //   handleEditorChange()
                              // }}
                              onChange={(event, editor) => {
                                const data = editor.getData();
                                form.setFieldValue('content', data);
                                if (typeKey == 4) {
                                  handleEditorChange(event, editor);
                                } else if (typeKey == 12) {
                                  handleEditorType12Change(event, editor);
                                } else {
                                  handleEditorDropChange(event, editor);
                                }
                              }}
                            />
                          ) : (
                            <TDEditorNew data={form.getFieldValue('content') || ''} onChange={value => form.setFieldValue('content', value)} />
                          )}
                        </Form.Item>
                      );
                    }}
                  </Form.Item>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
                    {({ getFieldValue }) => {
                      const typeKey = questionType?.typeKey ?? typeEnum;

                      switch (typeKey) {
                        case 1:
                          return <RenderAnswersChoice form={form} isSingleChoice={true} />;
                        case 2:
                          return <RenderAnswersChoice form={form} />;
                        case 3:
                          return <RenderAnswerEssay form={form} />;
                        case 4:
                          return <RenderFillInBlank form={form} />;
                        case 5:
                          return <RenderWordArrangement form={form} />;
                        case 6:
                          return <RenderMatchingAnswers form={form} />;
                        case 7:
                          return <RenderAnswersTrueFalse form={form} />;
                        case 8:
                          return <RenderArrangementAnswers form={form} />;
                        case 9:
                          return <RenderDragDropAnswers form={form} />;
                        case 10:
                          return <RenderTableChoice form={form} />;
                        case 11:
                          return <RenderFillInImage form={form} />;
                        case 12:
                          return <RenderMultiSelect form={form} />;
                        default:
                          return <></>;
                      }
                    }}
                  </Form.Item>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Hướng dẫn giải">
                    <TDEditorInline
                      data={form.getFieldValue('answerDetail') ? form.getFieldValue('answerDetail') : ''}
                      onChange={value => {
                        form.setFieldValue('answerDetail', value);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2" onClick={handleSubmit} disabled={btnLoading}>
            <i className="fa fa-save me-2"></i>
            {id ? 'Lưu' : 'Tạo mới'}
          </Button>
        </div>
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel}>
            <i className="fa fa-times me-2"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalItem;
