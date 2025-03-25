import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Space, Form, Button, Input } from 'antd';
import { TDEditor, TDEditorInline} from '@/app/components';
import './index.scss'

const RenderFillInBlank = (props) => {
    const { form } = props
    const editorRef = useRef(null);


    return (
        <>

            <div className="col-xl-12">
                <Form.Item label="Đáp án">
                    <Form.List name="fillInBlankAnswers">
                        {(fields, { add, remove }) => (
                            <div className='row g-5'>
                                {
                                    fields.map(({ key, name, fieldKey }, index) => (
                                        <div className='col-xl-4'>
                                            <Form.Item label={`Đáp án ô số ${index + 1}`}>
                                                <Form.List name={[name, 'alternativeAnswers']}>
                                                    {(subFields, subOpt) => (
                                                        <Space direction="vertical" style={{ width: "100%" }}>
                                                            {subFields.map((subField, subInd) => (
                                                                <div key={subField.key} className='d-flex flex-row align-items-center'>
                                                                    <Form.Item style={{ width: '100%' }} name={[subField.name, 'value']} rules={[{ required: true, message: 'Không được để trống!' }]}>
                                                                        <TDEditorInline
                                                                            data={form.getFieldValue(['fillInBlankAnswers', name, 'alternativeAnswers', subField.name, 'value']) || ''}
                                                                            onChange={value => {
                                                                                form.setFieldValue(['fillInBlankAnswers', name, 'alternativeAnswers', subField.name, 'value'], value);
                                                                            }}
                                                                            placeholder={subInd > 0 ? `Nhập đáp án thay thế ô số ${index + 1}` : `Nhập đáp án ô số ${index + 1}`}
                                                                        />
                                                                    </Form.Item>

                                                                    <button className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger" onClick={() => subOpt.remove(subField.name)}>
                                                                        <i className="fas fa-minus-circle fs-3"></i>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <Form.Item noStyle>
                                                                <button type="button" className="border-dashed btn btn-sm btn-outline btn-flex btn-color-muted btn-active-color-primary overflow-hidden" data-kt-stepper-action="next" onClick={() => subOpt.add()}>
                                                                    {subFields?.length >= 1 ? 'Thêm đáp án thay thế' : ' Thêm đáp án'}
                                                                    <i className="ki-duotone ki-plus fs-3 ms-1 me-0">
                                                                        <span className="path1" />
                                                                        <span className="path2" />
                                                                    </i>{' '}
                                                                </button>
                                                            </Form.Item>
                                                        </Space>
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

export default RenderFillInBlank