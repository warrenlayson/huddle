import cls from "classnames";

type MessageProps = {
  message: {
    message?: string;
    username: string;
  };
};
const Message: React.FC<MessageProps> = ({ message }) => {
  return (
    <div
      className={cls(
        message.username === "pau"
          ? "ml-auto rounded-chat-right bg-blue-600 text-white"
          : "rounded-chat-left bg-white",
        "m-4 box-border min-h-[2.25rem] w-fit max-w-[66%]  py-2 px-4  shadow-chat",
      )}
    >
      {message.message ? message.message : <>Sent an image</>}
    </div>
  );
};

export default Message;
