import React from "react";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <div className={`${className} max-[768px]:pb-[80px] max-[768px]:pt-[20px]`}>
      <span className="text-center text-[12px] max-[768px]:max-w-[330px]">
        Copyright © 2025 [AcaMatch]. 완벽한 아카데미를 찾는 신뢰할 수 있는
        파트너.
      </span>
    </div>
  );
};

export default Footer;
