import PropTypes from 'prop-types';

const DRACULA_USER_COLORS = [
  '#ff79c6', // Pink
  '#bd93f9', // Purple
  '#8be9fd', // Cyan
  '#50fa7b', // Green
  '#ffb86c', // Orange
  '#ff5555', // Red
  '#f1fa8c', // Yellow
];

const getUserColor = username => {
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DRACULA_USER_COLORS[hash % DRACULA_USER_COLORS.length];
};

const Username = ({ username }) => {
  return (
    <span className="username" style={{ color: getUserColor(username) }}>
      {username}
    </span>
  );
};

Username.propTypes = {
  username: PropTypes.string.isRequired,
};

export default Username;
