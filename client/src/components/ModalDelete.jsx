function ModalDelete({ children, deleteAvatar, setDelConfirmation }) {
  const confirm = function () {
    deleteAvatar();
    setDelConfirmation(false);
  };
  const abort = function () {
    setDelConfirmation(false);
  };

  return (
    <div className="modal">
      <div className="modal__window">
        <h4>{children}</h4>
        <button onClick={confirm}>Ok</button>
        <button onClick={abort}>Cancel</button>
      </div>
    </div>
  );
}

export default ModalDelete;
