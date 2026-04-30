import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { Info, Settings, User, Lock, Unlock, Star, Menu, X, PlusCircle, Copy } from 'react-feather';
import { Tooltip } from 'react-tooltip';
import { useSafeState } from '@react-hookz/web/esnext';

import Username from '@/components/Username';

const Nav = ({ members, roomId, userId, roomLocked, toggleLockRoom, openModal, iAmOwner, translations }) => {
  const [showCopyTooltip, setShowCopyTooltip] = useSafeState(false);
  const [showLockedTooltip, setShowLockedTooltip] = useSafeState(false);
  const [showSidebar, setShowSidebar] = useSafeState(false);
  const [showUsersSidebar, setShowUsersSidebar] = useSafeState(false);
  const roomUrl = `${window.location.origin}/${roomId}`;

  const liveColor = roomLocked ? '#dc3545' : '#28a745';

  useEffect(() => {
    document.body.classList.toggle('sidebar-left-open', showSidebar);
  }, [showSidebar]);

  useEffect(() => {
    document.body.classList.toggle('sidebar-right-open', showUsersSidebar);
  }, [showUsersSidebar]);

  useEffect(() => {
    return () => {
      document.body.classList.remove('sidebar-left-open', 'sidebar-right-open');
    };
  }, []);

  const toggleLeftSidebar = () => {
    setShowSidebar(prev => {
      if (!prev) setShowUsersSidebar(false);
      return !prev;
    });
  };

  const toggleRightSidebar = () => {
    setShowUsersSidebar(prev => {
      if (!prev) setShowSidebar(false);
      return !prev;
    });
  };

  const newRoom = () => {
    setShowSidebar(false);
    window.open(`/${nanoid()}`);
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
            <Menu />
          </button>
        </div>

        <div className="nav-center">
          <span className="lock-room-container">
            <button
              id="lock-room-button"
              data-testid="lock-room-button"
              onClick={handleToggleLock}
              className="lock-room btn btn-link btn-plain"
            >
              {roomLocked && <Lock />}
              {!roomLocked && <Unlock className="muted" />}
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
          <span className="room-label">room</span>
          <button
            id="copy-room-url-button"
            className="btn btn-plain btn-link clipboard-trigger room-id ellipsis"
            onClick={handleCopy}
          >
            {`/${roomId}`}
          </button>
          <button
            className="btn btn-plain copy-btn"
            onClick={handleCopy}
            aria-label="Copy room link"
          >
            <Copy />
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
          <button
            className="btn btn-link btn-plain live-indicator"
            title="Users"
            onClick={toggleRightSidebar}
          >
            <span className={`live-dot${roomLocked ? ' live-dot--locked' : ''}`} />
            <span className="member-count" style={{ color: liveColor }}>
              {members.length} online
            </span>
          </button>
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
              <X />
            </button>
          </div>
          <ul className="sidebar-nav">
            <li>
              <button onClick={newRoom} className="btn btn-plain sidebar-link">
                <PlusCircle /> <span>{translations.newRoomButton}</span>
              </button>
            </li>
            <li>
              <button onClick={handleSettingsClick} className="btn btn-plain sidebar-link">
                <Settings /> <span>{translations.settingsButton}</span>
              </button>
            </li>
            <li>
              <button onClick={handleAboutClick} className="btn btn-plain sidebar-link">
                <Info /> <span>{translations.aboutButton}</span>
              </button>
            </li>
          </ul>
        </div>,
        document.body
      )}

      {createPortal(
        <div className={`sidebar sidebar-right ${showUsersSidebar ? 'sidebar-open' : ''}`}>
          <div className="sidebar-header">
            <span className="sidebar-title">Online</span>
            <button
              className="btn btn-plain sidebar-close"
              onClick={() => setShowUsersSidebar(false)}
              aria-label="Close users"
            >
              <X />
            </button>
          </div>
          <ul className="sidebar-users">
            {members.map((member, index) => (
              <li key={`user-${index}`}>
                <Username username={member.username} />
                <span className="icon-container">
                  {member.id === userId && (
                    <span className="me-icon-wrap" title="Me">
                      <User className="me-icon" />
                    </span>
                  )}
                  {member.isOwner && (
                    <span className="owner-icon-wrap">
                      <Star className="owner-icon" title="Owner" />
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>,
        document.body
      )}
    </>
  );
};

Nav.propTypes = {
  members: PropTypes.array.isRequired,
  roomId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  roomLocked: PropTypes.bool.isRequired,
  toggleLockRoom: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  iAmOwner: PropTypes.bool.isRequired,
  translations: PropTypes.object.isRequired,
};

export default Nav;
