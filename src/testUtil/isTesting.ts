const isTesting = () => process.env.CURSORLESS_TEST != null;

export default isTesting;
