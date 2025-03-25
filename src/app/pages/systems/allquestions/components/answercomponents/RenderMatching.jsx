import React, { useState, useEffect } from "react";
import {

    useDroppable,
    useDraggable,
    DragOverlay,
    closestCenter,
    DndContext,
} from "@dnd-kit/core";
import { Button, } from "antd";

const Droppable = ({ id, children }) => {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            style={{
                // padding: "8px",
                border: "1px dashed #ccc",
                borderRadius: 5
            }}
        >
            {children}
        </div>
    );
};

const Draggable = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
    const style = transform
        ? {
            transform: `translate(${transform.x}px, ${transform.y}px)`,
        }
        : undefined;

    return (
        <div ref={setNodeRef} style={{ ...style }} {...attributes} {...listeners}>
            {children}
        </div>
    );
};

const MatchingForm = (props) => {
    const { form, questions, answers } = props
    const [activeId, setActiveId] = useState(null);
    const [displayAnswers, setDisplayAnswers] = useState([]);
    const [matches, setMatches] = useState(() =>
        questions?.reduce((acc, question) => {
            acc[question?.id] = question?.ansId ?? null; // Ban đầu, không câu hỏi nào có ghép nối
            return acc;
        }, {})
    );

    useEffect(() => {
        setMatches((prevMatches) => {
            const updatedMatches = { ...prevMatches };

            Object.keys(updatedMatches).forEach((questionId) => {
                const answerId = updatedMatches[questionId];

                // Nếu câu hỏi bị xoá
                if (!questions.some((q) => q.id === questionId)) {
                    // Trả lại đáp án cho displayAnswers nếu có
                    if (answerId && !displayAnswers.some((a) => a.id === answerId)) {
                        setDisplayAnswers((prev) => [...prev, answers.find((a) => a.id === answerId)]);
                    }
                    // Huỷ kết nối
                    delete updatedMatches[questionId];
                }

                // Nếu đáp án bị xoá
                if (answerId && !answers.some((a) => a.id === answerId)) {
                    updatedMatches[questionId] = null; // Hủy kết nối
                }
            });

            return updatedMatches;
        });
        setDisplayAnswers((prevDisplayAnswers) => {
            // Lọc các đáp án trong displayAnswers mà vẫn còn tồn tại trong answers
            const validAnswers = prevDisplayAnswers?.filter((displayAnswer) =>
                answers.some((answer) => answer.id === displayAnswer.id)
            );

            // Kiểm tra matches trước khi lấy các giá trị
            const matchedAnswerIds = matches && typeof matches === "object"
                ? Object.values(matches).filter(Boolean)
                : [];

            // Tìm các đáp án mới từ answers mà chưa có trong displayAnswers và không được ghép nối
            const newAnswers = answers?.filter(
                (answer) =>
                    !validAnswers.some((validAnswer) => validAnswer.id === answer.id) &&
                    !matchedAnswerIds.includes(answer.id)
            ) || [];

            // Kết hợp danh sách các đáp án hợp lệ với đáp án mới
            return [...validAnswers, ...newAnswers];
        });

        // Khởi tạo lại matches nếu bị mất
        if (!matches) {
            setMatches(
                questions?.reduce((acc, question) => {
                    acc[question.id] = null; // Mỗi câu hỏi ban đầu không có đáp án ghép
                    return acc;
                }, {})
            );
        }
    }, [questions, answers]);

    useEffect(() => {
        form.setFieldValue('matches', matches)

        return () => { }
    }, [matches])


    const handleDragStart = ({ active }) => {
        setActiveId(active.id);
    };

    const handleDragEnd = ({ active, over }) => {
        if (!over) {
            setActiveId(null);
            return;
        }

        const targetId = over.id;
        if (targetId === "waiting-list") {
            // Thả vào danh sách chờ
            setDisplayAnswers((prevAnswers) => {
                const questionId = Object.keys(matches).find(
                    (key) => matches[key] === active.id
                );
                if (questionId) {
                    setMatches((prevMatches) => ({
                        ...prevMatches,
                        [questionId]: null,
                    }));
                }

                // Thêm lại đáp án vào danh sách chờ (nếu chưa có)
                if (!prevAnswers.some((answer) => answer.id === active.id)) {
                    return [
                        ...prevAnswers,
                        answers.find(i => i.id == active.id),
                    ];
                }

                return prevAnswers;
            });
        }
        else {
            // Thả đáp án vào một câu hỏi
            setMatches((prev) => {
                const updated = { ...prev };

                // Xác định câu hỏi cũ mà đáp án đang thuộc về (nếu có)
                const previousQuestionId = Object.keys(updated).find(
                    (key) => updated[key] === active.id
                );

                // Nếu đáp án đang thuộc về một câu hỏi, gỡ kết nối với câu hỏi cũ
                if (previousQuestionId) {
                    updated[previousQuestionId] = null;
                }

                // Nếu câu hỏi đích đã có đáp án, trả đáp án cũ về danh sách chờ
                const oldAnswerId = updated[targetId];
                if (oldAnswerId) {
                    setDisplayAnswers((prevAnswers) => [
                        ...prevAnswers,
                        answers.find(i => i.id == oldAnswerId),
                    ]);
                }

                // Gắn đáp án mới vào câu hỏi đích
                updated[targetId] = active.id;

                return updated;
            });

            // Loại đáp án mới khỏi danh sách chờ
            setDisplayAnswers((prevAnswers) =>
                prevAnswers.filter((answer) => answer.id !== active.id)
            );
        }

        setActiveId(null);
    };



    return (
        <div className="mt-5">

            <DndContext
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="col-xl-12">
                    {questions?.length > 0 && questions?.map((question) => (
                        <div className="d-flex align-items-center" key={question?.id} style={{ marginBottom: 8 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    padding: "8px",
                                    border: "1px solid #ccc",
                                    minHeight: "40px",
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: 5

                                }}
                                    dangerouslySetInnerHTML={{ __html: question?.content }}
                                >
                                    {/* {question?.content} */}

                                </div>
                            </div>
                            <div className="w-80px text-center">
                                <i className="fas fa-arrow-circle-right fs-3 text-primary" ></i>
                            </div>
                            <div style={{ flex: 1 }}>
                                <Droppable id={question?.id}>
                                    <div className="min-h-50px">

                                        {matches && matches[question?.id] ? (
                                            <Draggable id={matches[question?.id]}>
                                                <div
                                                    style={{
                                                        padding: "8px",
                                                        background: "#f0f0f0",
                                                        border: "1px solid #ccc",
                                                        backgroundColor: '#f0f0f0',
                                                        borderRadius: 5,

                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: answers.find((answer) => answer.id === matches[question?.id])?.content }}
                                                >
                                                    {/* {answers.find((answer) => answer.id === matches[question?.id])?.content} */}
                                                </div>
                                            </Draggable>
                                        ) : <></>}
                                    </div>
                                </Droppable>
                            </div>
                        </div>

                    ))
                    }
                </div>
                <div className="col-xl-12">
                    <div className="my-5 fw-bold">Kéo thả đáp án đúng vào khung</div>
                    <Droppable id="waiting-list">
                        {displayAnswers?.length > 0 ? (
                            <div className="row g-3 p-3">
                                {
                                    displayAnswers?.map((answer) => (
                                        <div className="col-xl-6">
                                            <Draggable key={answer.id} id={answer.id}>
                                                <div
                                                    style={{
                                                        padding: "8px",
                                                        border: "1px solid #ccc",
                                                        minHeight: "40px",
                                                        backgroundColor: '#f0f0f0',
                                                        borderRadius: 5
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: answers.find((i) => i.id === answer.id)?.content }}
                                                >
                                                    {/* {answers.find((i) => i.id === answer.id)?.content} */}
                                                </div>
                                            </Draggable>
                                        </div>
                                    ))
                                }
                            </div>
                        ) : (
                            <p className="p-3">Không còn đáp án trong danh sách chờ.</p>
                        )}

                    </Droppable>
                </div>
            </DndContext>
        </div>
    );
};

export default MatchingForm;
