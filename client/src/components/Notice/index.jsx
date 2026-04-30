import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './styles.module.css';

export { styles as noticeStyles };

const Notice = ({ children, level, variant }) => (
  <div
    className={classNames({
      [styles.notice]: variant !== 'quote',
      [styles.quote]: variant === 'quote',
      [styles.info]: level === 'info',
      [styles.warning]: level === 'warning',
      [styles.danger]: level === 'danger',
      [styles.success]: level === 'success',
    })}
  >
    {children}
  </div>
);

Notice.defaultProps = {
  level: 'info',
  variant: 'line',
};

Notice.propTypes = {
  children: PropTypes.node.isRequired,
  level: PropTypes.string,
  variant: PropTypes.oneOf(['line', 'quote']),
};

export default Notice;
