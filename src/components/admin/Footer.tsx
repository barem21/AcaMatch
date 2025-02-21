interface FooterProps {
  className?: string;
}
const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <div>
      <div
        className={`${className}  flex justify-between text-[14px] items-center`}
      >
        <span className="text-[13px]">© 2025 AcaMatch</span>
        <span className="text-[13px]">
          Copyright by Acamatch. All Rights Reserved.
        </span>
      </div>
    </div>
  );
};
export default Footer;
