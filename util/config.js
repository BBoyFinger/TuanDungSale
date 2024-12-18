import axios from "axios";

const instance = axios.create({
  baseURL: "https://tuandungsalebe.onrender.com/api/",
});

export default instance;
