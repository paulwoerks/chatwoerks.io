import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, it, expect, vi } from 'vitest';
import { act } from 'react-dom/test-utils';

import configureStore from '@/store';

import ActivityList from './ActivityList';

const store = configureStore();

vi.useFakeTimers();

const baseProps = {
  members: [{ id: 'me', username: 'alice', publicKey: 'k' }],
  userId: 'me',
  currentUsername: 'alice',
  roomId: 'testRoom',
  roomLocked: false,
  translations: {
    anonymousEncryptedNotice: 'This chat room is 100% anonymous and encrypted.',
    inviteLinkNotice: 'Invitation link for this chat room:',
    copyButtonTooltip: 'Copied',
  },
};

describe('ActivityList component', () => {
  it('should display', () => {
    const { asFragment } = render(
      <Provider store={store}>
        <ActivityList {...baseProps} activities={[]} />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should display with activities', () => {
    const activities = [
      {
        type: 'TEXT_MESSAGE',
        username: 'alice',
        timestamp: new Date('2020-03-14T11:01:58.135Z').valueOf(),
        text: 'Hi!',
      },
      {
        type: 'USER_ENTER',
        username: 'alice',
      },
      {
        type: 'CHANGE_USERNAME',
        currentUsername: 'alice',
        newUsername: 'alicette',
      },
    ];
    const { asFragment } = render(
      <Provider store={store}>
        <ActivityList {...baseProps} activities={activities} />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should copy invitation link', async () => {
    const mockClipboardWriteText = vi.fn();
    navigator.clipboard = { writeText: mockClipboardWriteText };

    const { getByText } = render(
      <Provider store={store}>
        <ActivityList {...baseProps} activities={[]} />
      </Provider>,
    );

    await act(async () => {
      await fireEvent.click(getByText(`http://localhost:3000/${baseProps.roomId}`));
    });

    expect(mockClipboardWriteText).toHaveBeenLastCalledWith(`http://localhost:3000/${baseProps.roomId}`);
    await act(() => vi.runAllTimers());
  });

  it('should focus chat', async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ActivityList {...baseProps} activities={[]} />
      </Provider>,
    );

    await fireEvent.click(getByTestId('main-div'));

    await act(() => vi.runAllTimers());
  });

  it('should scroll to bottom on new message if not scrolled', () => {
    vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValueOnce(400).mockReturnValueOnce(200);

    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValueOnce({ top: 0 }).mockReturnValueOnce({ top: 261 });

    vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(42);
    const mockScrollTop = vi.spyOn(Element.prototype, 'scrollTop', 'set');

    const { rerender, getByTestId } = render(
      <Provider store={store}>
        <ActivityList {...baseProps} activities={[]} />
      </Provider>,
    );

    rerender(
      <Provider store={store}>
        <ActivityList
          {...baseProps}
          activities={[
            {
              type: 'TEXT_MESSAGE',
              username: 'alice',
              timestamp: new Date('2020-03-14T11:01:58.135Z').valueOf(),
              text: 'Hi!',
            },
          ]}
        />
      </Provider>,
    );

    vi.runAllTimers();

    expect(mockScrollTop).toHaveBeenCalledTimes(2);
    expect(mockScrollTop).toHaveBeenLastCalledWith(42);

    fireEvent.scroll(getByTestId('main-div'));

    rerender(
      <Provider store={store}>
        <ActivityList
          {...baseProps}
          activities={[
            {
              type: 'TEXT_MESSAGE',
              username: 'alice',
              timestamp: new Date('2020-03-14T11:01:58.135Z').valueOf(),
              text: 'Hi!',
            },
            {
              type: 'TEXT_MESSAGE',
              username: 'alice',
              timestamp: new Date('2020-03-14T11:01:59.135Z').valueOf(),
              text: 'Hi! every body',
            },
          ]}
        />
      </Provider>,
    );

    expect(mockScrollTop).toHaveBeenCalledTimes(2);
  });
});
