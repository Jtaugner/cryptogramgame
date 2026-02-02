import React, { useState, useEffect, useRef } from 'react';
import './modal.css';
import { gpBannerSize } from '../../main';
import { prohibitSwipeToRefresh } from '../../prohibitZoomAndScroll';

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
  const isScrollerAdded = useRef<boolean>(false);
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


  useEffect(() => {
    if(isScrollerAdded.current) return;
    isScrollerAdded.current = true;
    prohibitSwipeToRefresh('.modal-wrapper');
  }, []);
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