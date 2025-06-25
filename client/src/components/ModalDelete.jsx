function ModalDelete({ children, deleteAvatar, setDelConfirmation }) {
  const confirm = function () {
    deleteAvatar();
    setDelConfirmation(false);
  };
  const cancel = function () {
    setDelConfirmation(false);
  };

  return (
    <div className="modal">
      <div className="modal__window">
        <h4>{children}</h4>
        <button onClick={confirm}>Ok</button>
        <button onClick={cancel}>Cancel</button>
      </div>
    </div>
  );
}

export default ModalDelete;
