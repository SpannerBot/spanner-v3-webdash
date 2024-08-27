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
      <div>
        <span>⚠️ This is pre-release software!</span>
      </div>
    </nav>
  );
}

export default Nav;
