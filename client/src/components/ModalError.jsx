function ModalError({ children, closeModal }) {
  function cleanErrorMessage(str) {
    return str
      .replace(/[{}]/g, "")
      .replace(/"message":\s*/g, "")
      .replace(/Unexpected Multer error:\s*/g, "")
      .replace(/Multer error:\s*/g, "")
      .trim();
  }

  return (
    <div className="modal">
      <div className="modal__window">
        <h4>{cleanErrorMessage(children)}</h4>
        <button onClick={closeModal}>ok</button>
      </div>
    </div>
  );
}

export default ModalError;
