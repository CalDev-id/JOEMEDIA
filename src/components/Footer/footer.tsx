import { Link } from "lucide-react";
import Image from "next/image";

const footer = () => {
  return (
    <footer className="footer bg-base-300 p-10 text-base-content sm:footer-horizontal md:px-80">
      <div>
        <Link className="" href="/">
          <Image
            width={200}
            height={100}
            src={"/images/logo/logomedia.png"}
            alt="Logo"
            priority
          />
        </Link>
        <p>
          JoeMedia
          <br />
          Jujur • Objektif • Edukatif (JOE)
        </p>
      </div>
      <nav>
        <h6 className="footer-title">Services</h6>
        <a className="link link-hover">Branding</a>
        <a className="link link-hover">Design</a>
        <a className="link link-hover">Marketing</a>
        <a className="link link-hover">Advertisement</a>
      </nav>
      <nav>
        <h6 className="footer-title">Company</h6>
        <a className="link link-hover">About us</a>
        <a className="link link-hover">Contact</a>
        <a className="link link-hover">Jobs</a>
        <a className="link link-hover">Press kit</a>
      </nav>
      <nav>
        <h6 className="footer-title">Legal</h6>
        <a className="link link-hover">Terms of use</a>
        <a className="link link-hover">Privacy policy</a>
        <a className="link link-hover">Cookie policy</a>
      </nav>
    </footer>
  );
};

export default footer;
