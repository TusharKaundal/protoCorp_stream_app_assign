export const getStreams = async () => {
  const response = await fetch("http://localhost:3000/api/streams");
  const data = await response.json();
  return data;
};
