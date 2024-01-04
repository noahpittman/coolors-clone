"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Home = () => {
	return (
		<div className="flex flex-col space-y-4 justify-center items-center min-h-screen text-center">
			<Button>
				<Link href={"/generate"}>Enter app</Link>
			</Button>
			<p>not yet suited for mobile</p>
		</div>
	);
};

export default Home;
