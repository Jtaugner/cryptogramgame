import React from 'react';
import './statistics.css';
import { UserDataProps } from '../../App';
import Modal from './Modal';
import { formatTime } from '../../levels';
import { useTranslation } from 'react-i18next';
type StatisticsProps = {
  userData: UserDataProps,
  onClose: () => void;
};

const Statistics: React.FC<StatisticsProps> = ({userData, onClose }) => {
  const { t } = useTranslation();
  return <Modal
   title={t('statistics')}
   modalClassName="modal-statistics"
   onClose={onClose}>
      <div className="modal-section statistics-section-main">
        <div className="modal-section-title">{t('parameters')}</div>
        <div className="statistics-row"><span className="statistics-icon statistics-icon_iq"></span> {t('score')} IQ <span className="statistics-value">{userData.statistics.iq}</span></div>
        <div className="statistics-row"><span className="statistics-icon statistics-icon_levels"></span> {t('levels')} <span className="statistics-value">{userData.statistics.levels}</span></div>
        <div className="statistics-row"><span className="statistics-icon statistics-icon_letters"></span> {t('letters')} <span className="statistics-value">{userData.statistics.letters}</span></div>
        <div className="statistics-row"><span className="statistics-icon statistics-icon_words"></span> {t('words')} <span className="statistics-value">{userData.statistics.words}</span></div>
        <div className="statistics-row"><span className="statistics-icon statistics-icon_noMistakes"></span> {t('perfectLevels')} <span className="statistics-value">{userData.statistics.perfectLevels}</span></div>
        <div className="statistics-row"><span className="statistics-icon statistics-icon_mistakes"></span> {t('mistakes')} <span className="statistics-value">{userData.statistics.errors}</span></div>
      </div>
      <div className="modal-section statistics-section-time">
        <div className="modal-section-title">{t('time')}</div>
        <div className="statistics-row"><span className="statistics-icon statistics-icon_time"></span> {t('avgTime')} <span className="statistics-value">{formatTime(userData.statistics.avgTime)}</span></div>
        <div className="statistics-row"><span className="statistics-icon statistics-icon_time"></span> {t('bestTime')} <span className="statistics-value">{formatTime(userData.statistics.bestTime)}</span></div>
      </div>
  </Modal>
};

export default Statistics; 