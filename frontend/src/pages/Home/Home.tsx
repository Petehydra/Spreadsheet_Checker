import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import UploadedFilesList from "@/components/UploadedFilesList";
import { useFileUpload } from "@/hooks/useFileUpload";

const Home = () => {
  const { files, addFiles, removeFile } = useFileUpload();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection onFilesSelected={addFiles} />
      <UploadedFilesList files={files} onRemoveFile={removeFile} />
    </div>
  );
};

export default Home;
