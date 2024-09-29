import React from "react";

export default function Logo() {
  return (
    <div
      className="w-[278px] h-[96px] p-4 gap-4 flex items-center  box-border rounded-2xl  bg-cover bg-no-repeat bg-center border-4 border-black-500"
      style={{ backgroundImage: "url('/woodBackground.png')" }}
    >
      <div
        className="w-[64px] h-[64px] bg-center bg-no-repeat bg-cover"
        style={{ backgroundImage: "url('logo.png')" }} // Иконка внутри логотипа
      ></div>
      <div className="text-black-500 text-[45px] font-pirate  leading-tight hidden md:block">
        Pirate Bay
      </div>
    </div>
  );
}
