interface AdvertisementProps {
  id: string;
  height?: number;
}

const Advertisement = ({ id, height = 300 }: AdvertisementProps) => {
  return (
    <div
      className="w-1/2 bg-gray-100 rounded-lg"
      style={{ height: `${height}px` }}
    >
      <div className="w-full h-full flex items-center justify-center">
        광고 {id}
      </div>
    </div>
  );
};

export default Advertisement;
