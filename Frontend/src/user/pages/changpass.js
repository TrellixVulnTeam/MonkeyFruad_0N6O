import React, { useEffect, useState } from "react";
import "./contractus.css";
import Chatbot from "../components/chatbot";
import NavbarPage from "../components/navnew";
const Changepass = () => {

  return (
    <div>
      <NavbarPage />
      <h1 className="h1-contractus">เปลี่ยนรหัสผ่าน</h1>
      <Chatbot/>
    </div>
  );
};

export default  Changepass;