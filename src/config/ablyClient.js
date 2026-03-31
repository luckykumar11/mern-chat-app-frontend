import * as Ably from "ably";

let ablyInstance = null;

export const getAblyClient = () => {
  const ablyKey = process.env.REACT_APP_ABLY_KEY;
  if (!ablyKey) return null;

  if (!ablyInstance) {
    ablyInstance = new Ably.Realtime({
      key: ablyKey,
      clientId: "talk-a-tive-client",
    });
  }

  return ablyInstance;
};
