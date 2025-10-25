
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-transparent text-white py-4 px-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold">
          <Link to="/">DotNation</Link>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
