function Modal({ children, closeModal }) {
  function cleanErrorMessage(str) {
    return str
      .replace(/[{}]/g, "") // usuwa nawiasy klamrowe
      .replace(/"message":\s*/g, "") // usuwa "message":
      .replace(/Unexpected Multer error:\s*/g, "") // usuwa "Unexpected Multer error:"
      .replace(/Multer error:\s*/g, "") // usuwa "Multer error:"
      .trim(); // usuwa spacje z końców
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

export default Modal;
