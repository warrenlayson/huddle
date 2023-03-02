import React from "react";
import Image from "next/image";
import useViews from "@/hooks/useViews";

const ViewCounter = () => {
  const [snapshot] = useViews();

  return snapshot && snapshot > 0 ? (
    <div className={"flex items-center space-x-4"}>
      <Image src={"/images/eye.gif"} alt={"eye"} height={24} width={24} />
      <span className={"text-white"}>{snapshot}</span>
    </div>
  ) : (
    <></>
  );
};

export default ViewCounter;
