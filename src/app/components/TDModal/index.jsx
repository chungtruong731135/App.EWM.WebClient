import { Modal } from 'react-bootstrap';

const TDModal = props => {
  const { children, show, onExited, handleSubmit, handleCancel, fullscreen, size, title, footer, ...rest } = props;
  return (
    <Modal show={show} fullscreen={fullscreen || 'lg-down'} size={size || 'xl'} onExited={onExited} keyboard={true} scrollable={true} onEscapeKeyDown={onExited} {...rest}>
      <Modal.Header className="px-4 py-3">
        <Modal.Title className="">{title || 'Chi tiết'}</Modal.Title>
        <div className="btn btn-icon btn-sm btn-active-light-primary ms-2" onClick={onExited}>
          <i className="ki-duotone ki-cross fs-1">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
        </div>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {footer || (
          <div className="d-flex justify-content-center  align-items-center">
            <button type="button" className="btn btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel}>
              <i className="fa fa-times me-2"></i>Đóng
            </button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default TDModal;
