"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

const Home = () => {
	return redirect("/generate");
	// <div className="flex select-none flex-col space-y-4 justify-center items-center min-h-screen text-center">
	// 	<Button>
	// 		<Link prefetch href={"/generate"}>
	// 			Enter app
	// 		</Link>
	// 	</Button>
	// </div>
};

export default Home;
