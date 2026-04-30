import PropTypes from 'prop-types';
import moment from 'moment';
import Linkify from 'react-linkify';

import Username from '@/components/Username';
import styles from './styles.module.css';

const Message = ({ message, timestamp, sender, isMine }) => {
  const msg = decodeURI(message);

  return (
    <div className={isMine ? styles.mine : styles.theirs}>
      <div className={`chat-meta ${isMine ? styles.metaMine : ''}`}>
        {!isMine && <Username username={sender} />}
        <span className="muted timestamp">{moment(timestamp).format('LT')}</span>
        {isMine && <Username username={sender} />}
      </div>
      <div className={`chat ${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleTheirs}`}>
        <Linkify properties={{ target: '_blank', rel: 'noopener noreferrer' }}>
          {msg}
        </Linkify>
      </div>
    </div>
  );
};

Message.propTypes = {
  sender: PropTypes.string.isRequired,
  timestamp: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
  isMine: PropTypes.bool,
};

Message.defaultProps = {
  isMine: false,
};

export default Message;
