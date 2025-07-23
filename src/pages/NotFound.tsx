import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, BarChart2, PlusCircle, Frown } from "lucide-react";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Keep the console error for debugging purposes
    console.error(
      `404 Not Found: User tried to access a non-existent path: ${location.pathname}`
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="glass p-8 md:p-12 rounded-2xl shadow-xl max-w-2xl w-full animate-fade-in">
        <Frown className="mx-auto h-20 w-20 text-primary/50 mb-6" />
        <h1 className="text-5xl md:text-6xl font-bold text-primary mb-3">
          404 - Page Not Found
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Oops! It seems you've ventured into uncharted territory. The page at{" "}
          <code className="bg-muted text-muted-foreground/80 px-2 py-1 rounded-md text-sm">
            {location.pathname}
          </code>{" "}
          doesn't exist.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild variant="secondary" size="lg">
            <Link to="/">
              <Home className="w-5 h-5 mr-2" />
              Return to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/analytics">
              <BarChart2 className="w-5 h-5 mr-2" />
              View Analytics
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/test-entry">
              <PlusCircle className="w-5 h-5 mr-2" />
              Enter a New Test
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-10">
          If you believe this is an error, please{" "}
          <a
            href="https://github.com/a-r-a-v/amc-math-mastery-tracker/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            report an issue
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default NotFound;
