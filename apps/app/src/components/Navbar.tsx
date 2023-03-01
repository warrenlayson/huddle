import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const links = [
    {
      link: "/creators",
      label: "The Creators",
    },
    {
      link: "/contact",
      label: "Contact Us",
    },
  ];
  return (
    <header className="">
      <nav className="mx-auto flex max-w-7xl flex-col items-center justify-between space-y-4 p-6 lg:flex-row lg:space-y-0 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href={"/web"}>
            <Image
              src="/images/logo.png"
              alt="Huddle Logo"
              width={162}
              height={40}
              priority
            />
          </Link>
        </div>
        <ul className="flex items-center space-x-8 text-huddle-red">
          {links.map((link, idx) => (
            <li key={idx}>
              <Link
                href={link.link}
                className={"text-sm font-semibold leading-6"}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
