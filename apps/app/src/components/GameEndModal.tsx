import React from "react";

type GameEndModalProps = {
  text: string;
  onClick: () => void;
};
const GameEndModal: React.FC<GameEndModalProps> = ({ text, onClick }) => {
  return (
    <div className="absolute inset-0 z-50 flex h-full w-full flex-col items-center justify-center  space-y-10 text-white">
      <h2 className="whitespace-pre-line text-center text-4xl font-bold">
        {text}
      </h2>
      <button
        className="rounded-md bg-red-800 py-2 px-4 text-2xl font-semibold"
        onClick={onClick}
      >
        Play again
      </button>
    </div>
  );
};

export default GameEndModal;
