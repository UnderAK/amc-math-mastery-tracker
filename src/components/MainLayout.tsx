import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="p-4 sm:p-6 flex-grow">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
      <footer className="py-4 px-6 text-center text-xs text-muted-foreground border-t">
        <p>
          © {new Date().getFullYear()} AMC Math Mastery Tracker. This project is open source under the AGPLv3 license.
        </p>
        <p>
          <a
            href="https://github.com/UnderAK/amc-math-mastery-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            View Source on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
};
