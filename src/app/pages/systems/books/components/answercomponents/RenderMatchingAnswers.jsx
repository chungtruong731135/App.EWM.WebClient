import { useState } from 'react';
import { Form } from 'antd';
import RenderMatching from './RenderMatching';
import { create_UUID } from '@/utils/utils';
import { TDEditorInline } from '@/app/components';

const MatchingForm = props => {
  const { form } = props;
  const [numQuest, setNumQuest] = useState(1);
  const [numAns, setNumAns] = useState(1);
  return (
    <div>
      <div className="row gx-10 mb-5">
        <div className="col-xl-6">
          <h5>Cột trái</h5>
          <Form.List name="questColumn">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <div key={key} className="d-flex flex-row">
                    {/* <span className="w-50px fw-bold text-center pt-5">{index + 1}</span> */}
                    <Form.Item key={key} name={[name, 'content']} style={{ width: '100%' }}>
                      <TDEditorInline
                        data={form.getFieldValue(['questColumn', name, 'content']) ? form.getFieldValue(['questColumn', name, 'content']) : ''}
                        onChange={value => {
                          form.setFieldValue(['questColumn', name, 'content'], value);
                        }}
                      />
                    </Form.Item>
                    <button className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger" onClick={() => remove(name)}>
                      <i className="fas fa-minus-circle fs-3"></i>
                    </button>
                  </div>
                ))}
                <Form.Item noStyle>
                  <button
                    type="button"
                    className="border-dashed btn btn-sm btn-outline btn-flex btn-color-muted btn-active-color-primary overflow-hidden"
                    data-kt-stepper-action="next"
                    onClick={() => {
                      add({ id: create_UUID(), content: '' });
                      setNumQuest(numQuest + 1);
                    }}
                  >
                    Thêm đáp án
                    <i className="ki-duotone ki-plus fs-3 ms-1 me-0">
                      <span className="path1" />
                      <span className="path2" />
                    </i>{' '}
                  </button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </div>
        <div className="col-xl-6">
          <h5>Cột phải</h5>
          <Form.List name="answerColumn">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <div key={key} className="d-flex flex-row">
                    {/* <span className="w-50px fw-bold text-center pt-5">{DATA_CHAR[index]}</span> */}
                    <Form.Item key={key} name={[name, 'content']} style={{ width: '100%' }}>
                      <TDEditorInline
                        data={form.getFieldValue(['answerColumn', name, 'content']) ? form.getFieldValue(['answerColumn', name, 'content']) : ''}
                        onChange={value => {
                          form.setFieldValue(['answerColumn', name, 'content'], value);
                        }}
                      />
                    </Form.Item>
                    <button
                      className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger"
                      onClick={() => {
                        remove(name);
                      }}
                    >
                      <i className="fas fa-minus-circle fs-3"></i>
                    </button>
                  </div>
                ))}
                <Form.Item noStyle>
                  <button
                    type="button"
                    className="border-dashed btn btn-sm btn-outline btn-flex btn-color-muted btn-active-color-primary overflow-hidden"
                    data-kt-stepper-action="next"
                    onClick={() => {
                      add({ id: create_UUID(), content: '' });
                      setNumAns(numAns + 1);
                    }}
                  >
                    Thêm đáp án
                    <i className="ki-duotone ki-plus fs-3 ms-1 me-0">
                      <span className="path1" />
                      <span className="path2" />
                    </i>{' '}
                  </button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </div>
      </div>

      <h5 className="mt-5">Đáp án đúng</h5>

      <div className="col-xl-12">
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.questColumn !== currentValues.questColumn || prevValues.answerColumn !== currentValues.answerColumn
          }
        >
          {({ getFieldValue }) => <RenderMatching form={form} questions={getFieldValue('questColumn')} answers={getFieldValue('answerColumn')} />}
        </Form.Item>
      </div>
    </div>
  );
};

export default MatchingForm;
