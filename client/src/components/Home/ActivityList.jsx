import React from 'react';
import PropTypes from 'prop-types';
import { defer } from 'lodash';
import { Copy } from 'react-feather';
import { Tooltip } from 'react-tooltip';
import { useSafeState, useEventListener } from '@react-hookz/web/esnext';

import ChatInput from '@/components/Chat';
import Notice from '@/components/Notice';
import Username from '@/components/Username';

import Activity from './Activity';
import styles from './styles.module.scss';

const ActivityList = ({ activities, members, userId, currentUsername, roomId, roomLocked, translations }) => {
  const [focusChat, setFocusChat] = React.useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useSafeState(true);
  const [showCopyTooltip, setShowCopyTooltip] = useSafeState(false);
  const messageStream = React.useRef(null);
  const activitiesList = React.useRef(null);
  const chatRef = React.useRef(null);

  const roomUrl = `${window.location.origin}/${roomId}`;

  useEventListener(messageStream, 'scroll', () => {
    const messageStreamHeight = messageStream.current.clientHeight;
    const activitiesListHeight = activitiesList.current.clientHeight;

    const bodyRect = document.body.getBoundingClientRect();
    const elemRect = activitiesList.current.getBoundingClientRect();
    const offset = elemRect.top - bodyRect.top;
    const activitiesListYPos = offset;

    const newScrolledToBottom = activitiesListHeight + (activitiesListYPos - 60) <= messageStreamHeight;
    if (newScrolledToBottom) {
      if (!scrolledToBottom) {
        setScrolledToBottom(true);
      }
    } else if (scrolledToBottom) {
      setScrolledToBottom(false);
    }
  });

  const scrollToBottomIfShould = React.useCallback(() => {
    if (scrolledToBottom) {
      messageStream.current.scrollTop = messageStream.current.scrollHeight;
    }
  }, [scrolledToBottom]);

  React.useEffect(() => {
    scrollToBottomIfShould();
  }, [scrollToBottomIfShould, activities]);

  const scrollToBottom = React.useCallback(() => {
    messageStream.current.scrollTop = messageStream.current.scrollHeight;
    setScrolledToBottom(true);
  }, [setScrolledToBottom]);

  const handleChatClick = () => {
    setFocusChat(true);
    defer(() => setFocusChat(false));
  };

  const handleMention = memberUsername => {
    chatRef.current?.insertMention(memberUsername);
  };

  const handleCopyInvite = async () => {
    await navigator.clipboard.writeText(roomUrl);
    setShowCopyTooltip(true);
    setTimeout(() => {
      setShowCopyTooltip(false);
    }, 2000);
  };

  return (
    <div className="main-chat">
      <div onClick={handleChatClick} className="message-stream h-100" ref={messageStream} data-testid="main-div">
        <ul className="plain" ref={activitiesList}>
          <li>
            <Notice level="info" variant="quote">
              <div>
                <div>{translations.anonymousEncryptedNotice}</div>
                <div className={styles.inviteRow}>
                  <span>{translations.inviteLinkNotice}</span>
                  <button
                    id="invite-link-button"
                    className={styles.inviteLink}
                    onClick={handleCopyInvite}
                    type="button"
                  >
                    {roomUrl}
                  </button>
                  <button
                    type="button"
                    className={styles.inviteCopy}
                    onClick={handleCopyInvite}
                    aria-label="Copy invitation link"
                  >
                    <Copy size={14} />
                  </button>
                  {showCopyTooltip && (
                    <Tooltip
                      anchorId="invite-link-button"
                      content={translations.copyButtonTooltip}
                      place="bottom"
                      events={[]}
                      isOpen={true}
                    />
                  )}
                </div>
              </div>
            </Notice>
          </li>
          {activities.map((activity, index) => (
            <li key={index} className={`activity-item ${activity.type}`}>
              <Activity
                activity={activity}
                scrollToBottom={scrollToBottomIfShould}
                currentUsername={currentUsername}
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-container">
        <div className={`presence-bar${roomLocked ? ' presence-bar--locked' : ''}`}>
          <span className="presence-count">
            <span className={`live-dot${roomLocked ? ' live-dot--locked' : ''}`} />
            <span className="member-count">{members.length}</span>
          </span>
          <ul className="presence-users">
            {members.map(member => (
              <li key={member.id}>
                <button
                  type="button"
                  className="btn btn-plain presence-user"
                  onClick={() => handleMention(member.username)}
                  title={`@${member.username}`}
                >
                  <Username username={member.username} />
                  {member.id === userId && <span className="presence-me">(me)</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <ChatInput ref={chatRef} scrollToBottom={scrollToBottom} focusChat={focusChat} />
      </div>
    </div>
  );
};

ActivityList.propTypes = {
  activities: PropTypes.array.isRequired,
  members: PropTypes.array.isRequired,
  userId: PropTypes.string.isRequired,
  currentUsername: PropTypes.string.isRequired,
  roomId: PropTypes.string.isRequired,
  roomLocked: PropTypes.bool.isRequired,
  translations: PropTypes.object.isRequired,
};

export default ActivityList;
