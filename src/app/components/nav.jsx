import Link from "next/link";
import './nav.css';
function Nav() {
  return (
    <nav className={"navbar"}>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Nav;
