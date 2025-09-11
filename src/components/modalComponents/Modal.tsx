import React, { useState } from 'react';
import './modal.css';
import { gpBannerSize } from '../../main';

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  modalClassName: string;
  isShopOpened?: boolean;
};

const Modal: React.FC<ModalProps> = ({children, onClose, title,
   modalClassName, isShopOpened = false }) => {
  const [isClosing, setIsClosing] = useState(false);
  const closeModal = () => {
    setIsClosing(true);
    //Костыль для анимации параллельно с закрытием модалки
    let m = document.querySelector('.moneyCount');
    if(m && !isShopOpened){m.classList.add('moneyCount_small')}
    setTimeout(() => {
      onClose();
      if(m){m.classList.remove('moneyCount_small')}
    }, 350);
  }
  return <div className={`modal-bg ${modalClassName} ${isClosing ? 'modal_closing' : ''}`}>
  <div className="blackout" onClick={closeModal}></div>
  <div className={`modal ${gpBannerSize > 0 ? 'miniModal' : ''}`}>
  <div className="modal-title">
        <div className="modal-icon"></div>
        <span>{title}</span>
        <div className="modal-close" onClick={closeModal}></div>
    </div>
   <div className="modal-wrapper">
    {children}
    
   </div>
  </div>
</div>
}

export default Modal; 