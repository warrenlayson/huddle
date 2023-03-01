import Image from "next/image";

const Footer = () => {
  return (
    <footer className="flex justify-center p-6">
      <Image src={"/images/logo_heart.png"} alt="Logo" width={48} height={48} />
    </footer>
  );
};

export default Footer;
