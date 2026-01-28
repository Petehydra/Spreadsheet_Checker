import spreadsheetImage from "@/assets/Spreadsheet_image.png";

const IllustrationCard = () => {
  return (
    <div className="rounded-3xl overflow-hidden flex">
      <img 
        src={spreadsheetImage} 
        alt="Excel spreadsheet illustration" 
        className="w-full h-auto object-contain"
      />
    </div>
  );
};

export default IllustrationCard;
