import React from 'react';
import './modal.css';

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  modalClassName: string;
};

const Modal: React.FC<ModalProps> = ({children, onClose, title, modalClassName }) => (
  <div className={`modal-bg ${modalClassName}`}>
    <div className="blackout" onClick={onClose}></div>
    <div className="modal">
    <div className="modal-title">
          <div className="modal-icon"></div>
          <span>{title}</span>
          <div className="modal-close" onClick={onClose}></div>
      </div>
     <div className="modal-wrapper">
      {children}
      
     </div>
    </div>
  </div>
);

export default Modal; 