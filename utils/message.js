import moment from "moment";

export const formatMessage = (username, txt) => {
  return {
    username,
    txt,
    time: moment().format("h:mm a"),
  };
};
