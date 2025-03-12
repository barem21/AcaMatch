import Advertisement from "./Advertisement";

interface BannerLayoutProps {
  position: "left" | "right";
}

const BannerLayout = ({ position }: BannerLayoutProps) => {
  return (
    <div className="fixed right-[10px] top-[100px] p-4 pl-0 left-[auto] max-[1380px]:hidden max-[640px]:hidden">
      <div className={`flex space-y-4 justify-end items-center`}>
        <Advertisement id="1" />
      </div>
    </div>
  );
};

export default BannerLayout;
