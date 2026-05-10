const ENV = {
  dev: location.hostname === "localhost",
  prod: location.hostname !== "localhost",
};

export default ENV;
