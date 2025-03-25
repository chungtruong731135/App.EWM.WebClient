import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Space, Form, Button, Input, Radio} from 'antd';
import { TDEditor, TDEditorInline } from '@/app/components';
import './index.scss'

const RenderMultiSelect = (props) => {
    const { form } = props
    const editorRef = useRef(null);

    return (
        <>
            <div className="col-xl-12">
                <Form.Item label="Đáp án (Chọn 1 đáp án đúng)">
                    <Form.List name="singleSelectAnswers">
                        {(fields, { add, remove }) => (
                            <div className='row g-5'>
                                {
                                    fields.map(({ key, name, fieldKey }, index) => (
                                        <div className='col-xl-4'>
                                            <Form.Item label={`Đáp án ô số ${index + 1}`}>
                                                <Form.List name={[name, 'listAnswers']}>
                                                    {(subFields, subOpt) => (
                                                        <Form.Item noStyle shouldUpdate>
                                                            {({ getFieldValue, setFieldValue }) => {
                                                                const selectedAnswer = getFieldValue(['singleSelectAnswers', name, 'selectedAnswer']);

                                                                return (
                                                                    <Radio.Group 
                                                                        onChange={(e) => setFieldValue(['singleSelectAnswers', name, 'selectedAnswer'], e.target.value)}
                                                                        value={selectedAnswer !== undefined ? selectedAnswer : null}
                                                                        style={{ width: "100%" }}
                                                                    >
                                                                        <Space direction="vertical" style={{ width: "100%" }}>
                                                                            {subFields.map((subField, subInd) => (
                                                                                <div key={subField.key} className='d-flex flex-row align-items-center'>
                                                                                    {/* Radio button chọn đáp án đúng */}
                                                                                    <Radio value={subField.name} />
                                                                                    
                                                                                    {/* nhập đáp án */}
                                                                                    <Form.Item style={{ width: '100%' }} name={[subField.name, 'value']} rules={[{ required: true, message: 'Không được để trống!' }]}>
                                                                                        <TDEditorInline
                                                                                            data={form.getFieldValue(['singleSelectAnswers', name, 'listAnswers', subField.name, 'value']) || ''}
                                                                                            onChange={value => {
                                                                                                form.setFieldValue(['singleSelectAnswers', name, 'listAnswers', subField.name, 'value'], value);
                                                                                            }}
                                                                                            placeholder={subInd > 0 ? `Nhập đáp án bổ sung ô số ${index + 1}` : `Nhập đáp án ô số ${index + 1}`}
                                                                                        />
                                                                                    </Form.Item>

                                                                                    {/* xóa đáp án */}
                                                                                    <button 
                                                                                        className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger" 
                                                                                        onClick={() => subOpt.remove(subField.name)}
                                                                                    >
                                                                                        <i className="fas fa-minus-circle fs-3"></i>
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                        </Space>

                                                                        {/* thêm đáp án */}
                                                                        <Form.Item style={{ marginLeft: 25, marginTop: 10 }}>
                                                                            <button 
                                                                                type="button" 
                                                                                className="border-dashed btn btn-sm btn-outline btn-flex btn-color-muted btn-active-color-primary overflow-hidden" 
                                                                                data-kt-stepper-action="next" 
                                                                                onClick={() => subOpt.add()}
                                                                            >
                                                                                {subFields?.length > 1 ? 'Thêm đáp án bổ sung' : ' Thêm đáp án'}
                                                                                <i className="ki-duotone ki-plus fs-3 ms-1 me-0">
                                                                                    <span className="path1" />
                                                                                    <span className="path2" />
                                                                                </i>
                                                                            </button>
                                                                        </Form.Item>
                                                                    </Radio.Group>
                                                                );
                                                            }}
                                                        </Form.Item>
                                                    )}
                                                </Form.List>
                                            </Form.Item>
                                        </div>
                                    ))
                                }

                            </div>
                        )}
                    </Form.List>
                </Form.Item>
            </div>
        </>
    )
}

export default RenderMultiSelect