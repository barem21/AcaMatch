import Advertisement from "./Advertisement";

interface BannerLayoutProps {
  position: "left" | "right";
}

const BannerLayout = ({ position }: BannerLayoutProps) => {
  return (
    <div className="hidden md:block w-[280px] h-[100%]">
      <div
        className={` ${position === "left" ? "sticky top-[100px] p-4  pr-0" : "pl-0"} space-y-4`}
      >
        <Advertisement id="1" />
      </div>
    </div>
  );
};

export default BannerLayout;
