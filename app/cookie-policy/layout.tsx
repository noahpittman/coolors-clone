"use client";

import { useEffect } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
	useEffect(() => {
		document.querySelector("body")?.classList.remove("overflow-hidden");
		document.querySelector("body")?.classList.add("overflow-auto");
	}, []);
	return <div className="p-4 py-8 max-w-prose mx-auto ">{children}</div>;
};

export default Layout;
