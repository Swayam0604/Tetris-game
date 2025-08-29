import React from "react";
import Header from "../ui/Header";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Header />
      <main className="p-4">{children}</main>
    </div>
  );
};

export default Layout;
