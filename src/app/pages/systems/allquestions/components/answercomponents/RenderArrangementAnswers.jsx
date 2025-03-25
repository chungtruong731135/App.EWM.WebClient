import React, { useEffect, useState } from "react";
import { Form, Input, Button, Space } from "antd";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TDEditorInline } from "@/app/components";
import { create_UUID } from "@/utils/utils";
import _ from "lodash";

const DATA_CHAR = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']


const SortableItem = ({ id, children, index }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginBottom: 15,
        // background: "#f6f6f6",
        // border: "1px solid #d9d9d9",
        // borderRadius: 4,
    };
    const handlePointerDown = (event) => {
        if (event.target.tagName === "INPUT") {
            event.stopPropagation();
        }
    };
    return (
        <div className='d-flex flex-row align-items-center' ref={setNodeRef} style={style} {...attributes} onPointerDown={handlePointerDown}>
            <Button
                type="text"
                icon={<i className='fas fa-bars fs-3' />}
                style={{
                    cursor: 'move',
                }}
                ref={setNodeRef}
                {...listeners}
            />
            <span className="fs-3 fw-bold px-4">{DATA_CHAR[index]}</span>
            <div className="flex-grow-1">
                {children}
            </div>

        </div>
    );
};

const DraggableFormList = (props) => {
    const { form } = props
    const [itemShuffles, setItemShuffles] = useState([]);
    const answersList = Form.useWatch('arrangementAnswers', form);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );
    useEffect(() => {
        var temp = _.orderBy(answersList, ['displayPosition'], ['asc'])
        temp = temp?.map((item, index) => ({
            ...item,
            displayPosition: index
        }))
        setItemShuffles(temp)

        return () => { }
    }, [answersList])

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            var data = form.getFieldValue('arrangementAnswers')
            const oldIndex = data.findIndex((item) => item.id === active.id);
            const newIndex = data.findIndex((item) => item.id === over.id);
            const reorderedItems = arrayMove(data, oldIndex, newIndex)
            form.setFieldValue('arrangementAnswers', reorderedItems)
            // setItems(data);
        }
    };
    const handleDragEndView = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            var data = form.getFieldValue('arrangementAnswers')
            data = _.orderBy(data, ['displayPosition'], ['asc'])
            const oldIndex = data.findIndex((item) => item.id === active.id);
            const newIndex = data.findIndex((item) => item.id === over.id);
            const reorderedItems = arrayMove(data, oldIndex, newIndex)

            data = form.getFieldValue('arrangementAnswers').map((item, index) => ({
                ...item,
                displayPosition: reorderedItems?.findIndex(i => i.id == item?.id), // Gán lại displayPosition theo thứ tự mới
            }));
            form.setFieldValue('arrangementAnswers', data)
            // setItems(data);
        }
    };
    const getDataSort = () => {
        var data = form.getFieldValue('arrangementAnswers')
        if (data?.length > 0) {
            return _.orderBy(data, ['displayPosition'], ['asc'])
        }
    }
    return (
        <>
            <div className="col-cl=12">

                <Form.Item label="Thứ tự đáp án đúng" >
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <Form.List name="arrangementAnswers">
                            {(fields, { add, remove }) => (
                                <>
                                    <SortableContext items={form.getFieldValue('arrangementAnswers') || []} strategy={verticalListSortingStrategy}>
                                        {fields.map((field, index) => (
                                            <SortableItem
                                                key={form.getFieldValue('arrangementAnswers')[index]?.id || `field-${field.key}`}
                                                id={form.getFieldValue('arrangementAnswers')[index]?.id || `field-${field.key}`}
                                                field={field}
                                                remove={remove}
                                                index={index}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <div className="flex-grow-1">
                                                        <Form.Item {...field} name={[field.name, 'content']} noStyle >
                                                            <TDEditorInline
                                                                data={form.getFieldValue(['arrangementAnswers', field.name, 'content']) ? form.getFieldValue(['arrangementAnswers', field.name, 'content']) : ''}
                                                                onChange={value => {
                                                                    form.setFieldValue(['arrangementAnswers', field.name, 'content'], value);
                                                                }}
                                                            />
                                                        </Form.Item>
                                                    </div>
                                                    <button className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger" onClick={() => remove(field.name)}>
                                                        <i className="fas fa-minus-circle fs-3"></i>
                                                    </button>
                                                </div>
                                            </SortableItem>
                                        ))}
                                        <button type="button" className="border-dashed btn btn-sm btn-outline btn-flex btn-color-muted btn-active-color-primary overflow-hidden" data-kt-stepper-action="next" onClick={() => {
                                            const newTag = {
                                                id: create_UUID(),
                                                content: '',
                                                displayPosition: fields?.length,
                                            };
                                            add(newTag)
                                        }}>
                                            Thêm đáp án
                                            <i className="ki-duotone ki-plus fs-3 ms-1 me-0">
                                                <span className="path1" />
                                                <span className="path2" />
                                            </i>{' '}
                                        </button>
                                    </SortableContext>
                                </>
                            )}
                        </Form.List>
                    </DndContext>
                </Form.Item>
            </div>
            <div className="col-cl=12">

                <Form.Item label="Trộn đáp án" >
                    <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.arrangementAnswers !== currentValues.arrangementAnswers}>
                        {({ getFieldValue }) =>
                            getFieldValue('arrangementAnswers')?.length > 0 ? (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEndView}
                                >
                                    <SortableContext items={itemShuffles} strategy={verticalListSortingStrategy} >
                                        {itemShuffles.map((field, index) => (
                                            <SortableItem
                                                key={itemShuffles[index]?.id}
                                                id={itemShuffles[index]?.id}
                                                field={field}
                                                index={getFieldValue('arrangementAnswers').findIndex(i => i.id == itemShuffles[index]?.id)}
                                            >
                                                <div className="border border-gray rounded p-2 pb-0 bg-secondary align-items-center" dangerouslySetInnerHTML={{ __html: field?.content }} />

                                            </SortableItem>
                                        ))}

                                    </SortableContext>
                                </DndContext>

                            ) : <></>
                        }
                    </Form.Item>

                </Form.Item>
            </div>
        </>
    );
};

export default DraggableFormList;
