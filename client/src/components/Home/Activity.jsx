import React from 'react';
import PropTypes from 'prop-types';

import Zoom from '@/utils/ImageZoom';
import { getObjectUrl } from '@/utils/file';

import Message from '@/components/Message';
import Username from '@/components/Username';
import Notice from '@/components/Notice';
import T from '@/components/T';

const FileDisplay = ({ activity: { fileType, encodedFile, fileName, username }, scrollToBottom }) => {
  const zoomableImage = React.useRef(null);

  const handleImageDisplay = () => {
    Zoom(zoomableImage.current);
    scrollToBottom();
  };

  if (fileType.match('image.*')) {
    return (
      <img
        ref={zoomableImage}
        className="image-transfer zoomable"
        src={`data:${fileType};base64,${encodedFile}`}
        alt={`${fileName} from ${username}`}
        onLoad={handleImageDisplay}
      />
    );
  }
  return null;
};

const Activity = ({ activity, scrollToBottom, currentUsername }) => {
  switch (activity.type) {
    case 'TEXT_MESSAGE':
      return (
        <Message
          sender={activity.username}
          message={activity.text}
          timestamp={activity.timestamp}
          isMine={activity.username === currentUsername}
        />
      );
    case 'USER_ENTER':
      return (
        <Notice level="info">
          <T
            data={{ username: <Username key={0} username={activity.username} /> }}
            path="userJoined"
          />
        </Notice>
      );
    case 'USER_EXIT':
      return (
        <Notice level="info">
          <T
            data={{ username: <Username key={0} username={activity.username} /> }}
            path="userLeft"
          />
        </Notice>
      );
    case 'TOGGLE_LOCK_ROOM':
      return (
        <Notice level="info">
          <T
            data={{ username: <Username key={0} username={activity.username} /> }}
            path={activity.locked ? 'lockedRoom' : 'unlockedRoom'}
          />
        </Notice>
      );
    case 'NOTICE':
      return (
        <Notice>
          {activity.message}
        </Notice>
      );
    case 'CHANGE_USERNAME':
      return (
        <Notice>
          <T
            data={{
              oldUsername: <Username key={0} username={activity.currentUsername} />,
              newUsername: <Username key={1} username={activity.newUsername} />,
            }}
            path="nameChange"
          />
        </Notice>
      );
    case 'USER_ACTION':
      return (
        <Notice>
          &#42; <Username username={activity.username} /> {activity.action}
        </Notice>
      );
    case 'RECEIVE_FILE': {
      const downloadUrl = getObjectUrl(activity.encodedFile, activity.fileType);
      return (
        <div>
          <T
            data={{ username: <Username key={0} username={activity.username} /> }}
            path="userSentFile"
          />
          &nbsp;
          <a target="_blank" href={downloadUrl} rel="noopener noreferrer" download={activity.fileName}>
            <T data={{ filename: activity.fileName }} path="downloadFile" />
          </a>
          <FileDisplay activity={activity} scrollToBottom={scrollToBottom} />
        </div>
      );
    }
    case 'SEND_FILE': {
      const url = getObjectUrl(activity.encodedFile, activity.fileType);
      return (
        <Notice>
          <T
            data={{
              filename: (
                <a key={0} target="_blank" href={url} rel="noopener noreferrer" download={activity.fileName}>
                  {activity.fileName}
                </a>
              ),
            }}
            path="sentFile"
          />
          &nbsp;
          <FileDisplay activity={activity} scrollToBottom={scrollToBottom} />
        </Notice>
      );
    }
    default:
      return false;
  }
};

Activity.propTypes = {
  activity: PropTypes.object.isRequired,
  scrollToBottom: PropTypes.func.isRequired,
  currentUsername: PropTypes.string,
};

export default Activity;
