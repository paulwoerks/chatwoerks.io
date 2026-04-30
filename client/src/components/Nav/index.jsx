import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { customAlphabet } from 'nanoid';

const nanoidRoom = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);
import { Tooltip } from 'react-tooltip';
import { useSafeState } from '@react-hookz/web/esnext';

import Icon from '@/components/Icon';

const Nav = ({ roomId, roomLocked, toggleLockRoom, openModal, iAmOwner, translations }) => {
  const [showCopyTooltip, setShowCopyTooltip] = useSafeState(false);
  const [showLockedTooltip, setShowLockedTooltip] = useSafeState(false);
  const [showSidebar, setShowSidebar] = useSafeState(false);
  const roomUrl = `${window.location.origin}/${roomId}`;

  const lockColor = roomLocked ? 'var(--dracula-green)' : 'var(--dracula-pink)';

  useEffect(() => {
    document.body.classList.toggle('sidebar-left-open', showSidebar);
  }, [showSidebar]);

  useEffect(() => {
    return () => {
      document.body.classList.remove('sidebar-left-open');
    };
  }, []);

  const toggleLeftSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  const newRoom = () => {
    setShowSidebar(false);
    window.open(`/${nanoidRoom()}`);
  };

  const handleSettingsClick = () => {
    setShowSidebar(false);
    openModal('Settings');
  };

  const handleAboutClick = () => {
    setShowSidebar(false);
    openModal('About');
  };

  const handleToggleLock = () => {
    if (!iAmOwner) {
      setShowLockedTooltip(true);
      setTimeout(() => {
        setShowLockedTooltip(false);
      }, 2000);
    } else {
      toggleLockRoom();
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomUrl);
    setShowCopyTooltip(true);
    setTimeout(() => {
      setShowCopyTooltip(false);
    }, 2000);
  };

  return (
    <>
      <nav className="navbar navbar-dark">
        <div className="nav-left">
          <button
            className="btn btn-plain sidebar-toggle"
            onClick={toggleLeftSidebar}
            aria-label="Toggle menu"
          >
            <Icon name="menu" size="lg" />
          </button>
        </div>

        <div className={classNames('nav-center', { 'nav-center--locked': roomLocked })}>
          <button
            id="copy-room-url-button"
            className="btn btn-plain btn-link clipboard-trigger room-id ellipsis"
            onClick={handleCopy}
          >
            <span className="room-label">room</span>{`/${roomId}`}
          </button>
          <button
            className="btn btn-plain copy-btn"
            onClick={handleCopy}
            aria-label="Copy room link"
          >
            <Icon name="content_copy" size="sm" />
          </button>
          {showCopyTooltip && (
            <Tooltip
              anchorId="copy-room-url-button"
              content={translations.copyButtonTooltip}
              place="bottom"
              events={[]}
              isOpen={true}
            />
          )}
        </div>

        <div className="nav-right">
          <span className="lock-room-container">
            <button
              id="lock-room-button"
              data-testid="lock-room-button"
              onClick={handleToggleLock}
              className="lock-room btn btn-link btn-plain"
              style={{ color: lockColor }}
              aria-label={roomLocked ? 'Unlock room' : 'Lock room'}
            >
              <Icon name={roomLocked ? 'lock' : 'lock_open'} size="md" />
            </button>
            {showLockedTooltip && (
              <Tooltip
                anchorId="lock-room-button"
                content="You must be the owner to lock or unlock the room"
                place="bottom"
                events={[]}
                isOpen={true}
              />
            )}
          </span>
        </div>
      </nav>

      {createPortal(
        <div className={`sidebar sidebar-left ${showSidebar ? 'sidebar-open' : ''}`}>
          <div className="sidebar-header">
            <button
              className="btn btn-plain sidebar-close"
              onClick={() => setShowSidebar(false)}
              aria-label="Close menu"
            >
              <Icon name="close" size="md" />
            </button>
          </div>
          <ul className="sidebar-nav">
            <li>
              <button onClick={newRoom} className="btn btn-plain sidebar-link">
                <Icon name="add_circle" size="md" />
                <span>{translations.newRoomButton}</span>
              </button>
            </li>
            <li>
              <button onClick={handleSettingsClick} className="btn btn-plain sidebar-link">
                <Icon name="settings" size="md" />
                <span>{translations.settingsButton}</span>
              </button>
            </li>
            <li>
              <button onClick={handleAboutClick} className="btn btn-plain sidebar-link">
                <Icon name="info" size="md" />
                <span>{translations.aboutButton}</span>
              </button>
            </li>
          </ul>
        </div>,
        document.body
      )}
    </>
  );
};

Nav.propTypes = {
  roomId: PropTypes.string.isRequired,
  roomLocked: PropTypes.bool.isRequired,
  toggleLockRoom: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  iAmOwner: PropTypes.bool.isRequired,
  translations: PropTypes.object.isRequired,
};

export default Nav;
