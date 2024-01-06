"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Home = () => {
	return (
		<div className="flex select-none flex-col space-y-4 justify-center items-center min-h-screen text-center">
			<Button>
				<Link prefetch href={"/generate"}>
					Enter app
				</Link>
			</Button>
		</div>
	);
};

export default Home;
