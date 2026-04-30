import PropTypes from 'prop-types';
import classNames from 'classnames';

const SIZE_MAP = {
  sm: 'icon--sm',
  md: 'icon--md',
  lg: 'icon--lg',
  xl: 'icon--xl',
};

const Icon = ({ name, size, className, fill, ...rest }) => {
  return (
    <span
      aria-hidden="true"
      className={classNames(
        'material-symbols-rounded',
        'mi',
        SIZE_MAP[size] || SIZE_MAP.md,
        { 'mi--filled': fill },
        className,
      )}
      {...rest}
    >
      {name}
    </span>
  );
};

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  fill: PropTypes.bool,
};

Icon.defaultProps = {
  size: 'md',
  className: '',
  fill: false,
};

export default Icon;
