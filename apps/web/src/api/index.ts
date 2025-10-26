import axios from "./axios";


const getHello = async () => {
  const response = await axios.get(``);
  return response.data;
};

export const api = {
  getHello
};