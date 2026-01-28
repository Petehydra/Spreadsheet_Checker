import hydraLogo from "@/assets/hydraspecma-logo.png";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-gray-100/50 dark:bg-gray-900/50 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <img 
          src={hydraLogo} 
          alt="HydraSpecma" 
          className="w-[150px] object-contain"
        />
      </div>
    </header>
  );
};

export default Header;
