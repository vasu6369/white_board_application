export const getRoomFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('room') || '';
};

export const createRoomId = () => crypto.randomUUID().slice(0, 8);
