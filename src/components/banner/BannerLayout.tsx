import Advertisement from "./Advertisement";

interface BannerLayoutProps {
  position: "left" | "right";
}

const BannerLayout = ({ position }: BannerLayoutProps) => {
  return (
    <div className="w-[280px] h-[100%] max-[640px]:hidden">
      <div
        className={`flex ${position === "right" ? "sticky top-[100px] p-4 pl-0" : "pr-0 "} space-y-4 justify-end items-center`}
      >
        <Advertisement id="1" />
      </div>
    </div>
  );
};

export default BannerLayout;
