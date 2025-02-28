import { IoMdClose } from "react-icons/io";

const Popup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-[400px] h-[400px] rounded-lg shadow-lg relative flex justify-center items-center">
        <button
          className="absolute top-3 right-3 text-xl text-gray-600 hover:text-black"
          onClick={onClose}
        >
          <IoMdClose />
        </button>
        <p className="text-lg font-bold">팝업 창 내용</p>
      </div>
    </div>
  );
};

export default Popup;
