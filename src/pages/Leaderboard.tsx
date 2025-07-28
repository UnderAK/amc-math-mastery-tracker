import { Button } from "@/components/ui/button";
import { ArrowLeft, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

const Leaderboard = () => {
  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] animate-fade-in">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <Rocket className="mx-auto h-16 w-16 text-primary animate-float" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl mb-4">Coming Soon!</h1>
        <p className="text-lg text-muted-foreground mb-8">
          We're building an awesome leaderboard to track top performers. Stay tuned!
        </p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </main>
  );
};

export default Leaderboard;
