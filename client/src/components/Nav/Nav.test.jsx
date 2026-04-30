import { render, fireEvent } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import { act } from 'react-dom/test-utils';

import Nav from '.';

vi.mock('nanoid', () => {
  return {
    nanoid: () => 'fakeid',
  };
});

const mockTranslations = {
  newRoomButton: 'new room',
  settingsButton: 'settings',
  aboutButton: 'about',
};

vi.useFakeTimers();

test('Nav component is displaying', async () => {
  const { asFragment } = render(
    <Nav
      roomId={'testRoom'}
      roomLocked={false}
      toggleLockRoom={() => {}}
      openModal={() => {}}
      iAmOwner={true}
      translations={{}}
    />,
  );

  expect(asFragment()).toMatchSnapshot();
});

test('Nav component is displaying with another configuration and can rerender', async () => {
  const { asFragment, rerender } = render(
    <Nav
      roomId={'testRoom_2'}
      roomLocked={true}
      toggleLockRoom={() => {}}
      openModal={() => {}}
      iAmOwner={false}
      translations={{}}
    />,
  );

  expect(asFragment()).toMatchSnapshot();

  rerender(
    <Nav
      roomId={'testRoom_3'}
      roomLocked={true}
      toggleLockRoom={() => {}}
      openModal={() => {}}
      iAmOwner={false}
      translations={{}}
    />,
  );

  expect(asFragment()).toMatchSnapshot();
});

test('Can copy room url', async () => {
  const mockClipboardWriteTest = vi.fn();
  navigator.clipboard = { writeText: mockClipboardWriteTest };

  const toggleLockRoom = vi.fn();

  const { getByText, queryByText } = render(
    <Nav
      roomId={'testRoom'}
      roomLocked={true}
      toggleLockRoom={toggleLockRoom}
      openModal={() => {}}
      iAmOwner={false}
      translations={{ copyButtonTooltip: 'Copied' }}
    />,
  );

  await act(async () => {
    await fireEvent.click(getByText('/testRoom'));
  });

  expect(mockClipboardWriteTest).toHaveBeenLastCalledWith('http://localhost:3000/testRoom');

  await getByText('Copied');

  // Wait tooltip closing
  await act(() => vi.runAllTimers());

  expect(queryByText('Copied')).not.toBeInTheDocument();
});

test('Can lock/unlock room is room owner only', async () => {
  const toggleLockRoom = vi.fn();

  const { rerender, getByTestId, getByText, queryByText } = render(
    <Nav
      roomId={'testRoom'}
      roomLocked={true}
      toggleLockRoom={toggleLockRoom}
      openModal={() => {}}
      iAmOwner={true}
      translations={{}}
    />,
  );

  const toggleLockRoomButton = getByTestId('lock-room-button');

  await fireEvent.click(toggleLockRoomButton);

  expect(toggleLockRoom).toHaveBeenCalledWith();

  await fireEvent.click(toggleLockRoomButton);

  expect(toggleLockRoom).toHaveBeenCalledTimes(2);

  // We are not the room owner anymore
  rerender(
    <Nav
      roomId={'testRoom'}
      roomLocked={true}
      toggleLockRoom={toggleLockRoom}
      openModal={() => {}}
      iAmOwner={false}
      translations={{}}
    />,
  );

  await fireEvent.click(toggleLockRoomButton);

  expect(toggleLockRoom).toHaveBeenCalledTimes(2);

  await getByText('You must be the owner to lock or unlock the room');

  // Wait tooltip closing
  await act(() => vi.runAllTimers());

  expect(queryByText('You must be the owner to lock or unlock the room')).not.toBeInTheDocument();
});

test('Can open new room', async () => {
  window.open = vi.fn();

  const { getByText } = render(
    <Nav
      roomId={'testRoom'}
      roomLocked={false}
      toggleLockRoom={() => {}}
      openModal={() => {}}
      iAmOwner={true}
      translations={mockTranslations}
    />,
  );

  fireEvent.click(getByText(mockTranslations.newRoomButton));

  expect(window.open).toHaveBeenCalledTimes(1);
  expect(window.open).toHaveBeenCalledWith(expect.stringMatching(/^\/[a-zA-Z0-9_-]+$/));
});

test('Can open settings', async () => {
  const openModal = vi.fn();

  const { getByText } = render(
    <Nav
      roomId={'testRoom'}
      roomLocked={true}
      toggleLockRoom={() => {}}
      openModal={openModal}
      iAmOwner={true}
      translations={mockTranslations}
    />,
  );

  fireEvent.click(getByText(mockTranslations.settingsButton));

  expect(openModal).toHaveBeenLastCalledWith('Settings');
});

test('Can open About', async () => {
  const openModal = vi.fn();

  const { getByText } = render(
    <Nav
      roomId={'testRoom'}
      roomLocked={true}
      toggleLockRoom={() => {}}
      openModal={openModal}
      iAmOwner={true}
      translations={mockTranslations}
    />,
  );

  fireEvent.click(getByText(mockTranslations.aboutButton));

  expect(openModal).toHaveBeenLastCalledWith('About');
});
