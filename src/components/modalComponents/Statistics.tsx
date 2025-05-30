import React from 'react';
import './statistics.css';
import { UserDataProps } from '../../App';
import Modal from './Modal';
import { formatTime } from '../../levels';

type StatisticsProps = {
  userData: UserDataProps,
  onClose: () => void;
};

const Statistics: React.FC<StatisticsProps> = ({userData, onClose }) => (
  <Modal
   title="СТАТИСТИКА"
   modalClassName="modal-statistics"
   onClose={onClose}>
      <div className="modal-section statistics-section-main">
        <div className="modal-section-title">Параметры</div>
        <div className="statistics-row"><span className="statistics-icon statistics-icon_iq"></span> Очки IQ <span className="statistics-value">{userData.statistics.iq}</span></div>
        <div className="statistics-row"><span className="statistics-icon statistics-icon_levels"></span> Пройдено уровней <span className="statistics-value">{userData.statistics.levels}</span></div>
        <div className="statistics-row"><span className="statistics-icon statistics-icon_letters"></span> Отгадано букв <span className="statistics-value">{userData.statistics.letters}</span></div>
        <div className="statistics-row"><span className="statistics-icon statistics-icon_words"></span> Отгадано слов <span className="statistics-value">{userData.statistics.words}</span></div>
        <div className="statistics-row"><span className="statistics-icon statistics-icon_noMistakes"></span> Уровни без ошибок <span className="statistics-value">{userData.statistics.perfectLevels}</span></div>
        <div className="statistics-row"><span className="statistics-icon statistics-icon_mistakes"></span> Ошибок <span className="statistics-value">{userData.statistics.errors}</span></div>
      </div>
      <div className="modal-section statistics-section-time">
        <div className="modal-section-title">Время</div>
        <div className="statistics-row"><span className="statistics-icon statistics-icon_time"></span> Среднее время на уровень <span className="statistics-value">{formatTime(userData.statistics.avgTime)}</span></div>
        <div className="statistics-row"><span className="statistics-icon statistics-icon_time"></span> Лучшее время на уровне <span className="statistics-value">{formatTime(userData.statistics.bestTime)}</span></div>
      </div>
  </Modal>
);

export default Statistics; 