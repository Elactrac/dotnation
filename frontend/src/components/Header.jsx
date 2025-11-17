
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-transparent text-white py-4 px-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold">
          <Link to="/" aria-label="DotNation home page">DotNation</Link>
        </div>
        <nav aria-label="Main navigation">
          <ul className="flex space-x-4">
            <li>
              <Link to="/about" aria-label="About DotNation">About</Link>
            </li>
            <li>
              <Link to="/contact" aria-label="Contact us">Contact</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
